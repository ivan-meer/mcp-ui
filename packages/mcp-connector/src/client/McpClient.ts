/**
 * 🔌 MCP CLIENT IMPLEMENTATION
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Основной класс для взаимодействия с MCP серверами.
 * Реализует полный MCP протокол с поддержкой различных транспортов.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Event-driven Architecture - все операции через события
 * 2. Promise-based API - async/await для всех асинхронных операций  
 * 3. Transport Abstraction - поддержка WebSocket, SSE, HTTP
 * 4. Error Recovery - автоматическое переподключение и retry logic
 * 5. Type Safety - полная типизация всех операций
 */

import { EventEmitter } from 'events';
import type {
  IMcpClient,
  McpClientConfig,
  McpClientEvents,
  McpConnectionStatus,
  McpMessage,
  McpRequest,
  McpResponse,
  McpNotification,
  McpError,
  McpClientStats,
  CallToolOptions,
  GetResourceOptions,
} from '../types/client';
import type { Transport, TransportEvents } from '../types/transport';
import type { McpServer, McpTool, McpResource } from '../types/server';
import { McpClientError } from '../utils/errors';
import { validateMcpMessage } from '../utils/validation';
import { 
  DEFAULT_CLIENT_CONFIG, 
  CONNECTION_TIMEOUTS,
  RETRY_STRATEGIES 
} from '../constants';

/**
 * 🔌 MCP Client Implementation
 * 
 * 🚀 ВОЗМОЖНОСТИ:
 * - Подключение к MCP серверам через различные транспорты
 * - Автоматическое переподключение при сбоях
 * - Type-safe вызов инструментов и получение ресурсов
 * - Event-driven уведомления о состоянии
 * - Встроенная статистика и мониторинг
 */
export class McpClient extends EventEmitter implements IMcpClient {
  // 📊 ПРИВАТНЫЕ ПОЛЯ
  private _config: McpClientConfig;
  private _transport: Transport;
  private _status: McpConnectionStatus = 'disconnected';
  private _server: McpServer | null = null;
  private _tools: McpTool[] = [];
  private _resources: McpResource[] = [];
  private _stats: McpClientStats;
  private _requestId = 0;
  private _pendingRequests = new Map<string | number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
    timestamp: Date;
  }>();
  private _retryAttempt = 0;
  private _retryTimeout: NodeJS.Timeout | null = null;
  private _heartbeatInterval: NodeJS.Timeout | null = null;
  
  // 🏗️ КОНСТРУКТОР
  constructor(config: McpClientConfig) {
    super();
    
    // 📋 Объединяем пользовательскую конфигурацию с дефолтной
    this._config = { ...DEFAULT_CLIENT_CONFIG, ...config };
    this._transport = config.transport;
    
    // 📊 Инициализируем статистику
    this._stats = {
      connectedAt: null,
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      reconnections: 0,
      averageLatency: 0,
    };
    
    // 🔗 Настраиваем обработчики транспорта
    this._setupTransportHandlers();
    
    // 📝 Логируем создание клиента
    if (this._config.enableLogging) {
      console.log('🔌 MCP Client создан:', {
        transport: this._transport.type,
        autoReconnect: this._config.autoReconnect,
      });
    }
  }
  
  // 📊 ПУБЛИЧНЫЕ СВОЙСТВА
  get status(): McpConnectionStatus {
    return this._status;
  }
  
  get server(): McpServer | null {
    return this._server;
  }
  
  get tools(): McpTool[] {
    return [...this._tools]; // 🛡️ Возвращаем копию для безопасности
  }
  
  get resources(): McpResource[] {
    return [...this._resources]; // 🛡️ Возвращаем копию для безопасности
  }
  
  get stats(): McpClientStats {
    return { ...this._stats }; // 🛡️ Возвращаем копию для безопасности
  }
  
  // 🔗 ПОДКЛЮЧЕНИЕ
  async connect(): Promise<void> {
    if (this._status === 'connected' || this._status === 'connecting') {
      return; // 🚫 Уже подключены или подключаемся
    }
    
    try {
      this._setStatus('connecting');
      
      // ⏱️ Таймаут подключения
      const connectPromise = this._transport.connect();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new McpClientError('Connection timeout', 'TIMEOUT'));
        }, this._config.connectionTimeout);
      });
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      // ✅ Подключение успешно
      this._setStatus('connected');
      this._stats.connectedAt = new Date();
      this._retryAttempt = 0;
      
      // 💓 Запускаем heartbeat если настроен
      if (this._config.heartbeatInterval) {
        this._startHeartbeat();
      }
      
      // 📋 Получаем информацию о сервере
      await this._initializeServer();
      
      // 📝 Логируем успешное подключение
      if (this._config.enableLogging) {
        console.log('✅ Подключено к MCP серверу:', this._server?.name);
      }
      
    } catch (error) {
      this._setStatus('error');
      this._stats.errors++;
      
      const mcpError = error instanceof McpClientError 
        ? error 
        : new McpClientError(`Connection failed: ${error}`, 'CONNECTION_FAILED');
      
      this._emitError(mcpError, 'connect');
      
      // 🔄 Попытка переподключения если включено
      if (this._config.autoReconnect) {
        this._scheduleReconnect();
      }
      
      throw mcpError;
    }
  }
  
  // 💔 ОТКЛЮЧЕНИЕ
  async disconnect(): Promise<void> {
    if (this._status === 'disconnected') {
      return; // 🚫 Уже отключены
    }
    
    try {
      // 🛑 Останавливаем heartbeat и retry
      this._stopHeartbeat();
      this._cancelRetry();
      
      // 🚫 Отменяем все pending запросы
      this._cancelPendingRequests('Client disconnecting');
      
      // 💔 Отключаемся от транспорта
      await this._transport.disconnect();
      
      this._setStatus('disconnected');
      this._stats.connectedAt = null;
      
      if (this._config.enableLogging) {
        console.log('💔 Отключено от MCP сервера');
      }
      
    } catch (error) {
      this._emitError(error, 'disconnect');
      throw error;
    }
  }
  
  // 📤 ОТПРАВКА ЗАПРОСА
  async send<T = unknown>(request: McpRequest): Promise<T> {
    if (this._status !== 'connected') {
      throw new McpClientError('Not connected to server', 'NOT_CONNECTED');
    }
    
    // 🆔 Генерируем ID если не указан
    if (!request.id) {
      request.id = this._generateRequestId();
    }
    
    // ⏰ Добавляем timestamp
    request.timestamp = new Date();
    
    // ✅ Валидируем сообщение
    const validationResult = validateMcpMessage(request);
    if (!validationResult.success) {
      throw new McpClientError(
        `Invalid request: ${validationResult.error}`, 
        'INVALID_REQUEST'
      );
    }
    
    return new Promise<T>((resolve, reject) => {
      // ⏱️ Настраиваем таймаут
      const timeout = setTimeout(() => {
        this._pendingRequests.delete(request.id!);
        reject(new McpClientError('Request timeout', 'TIMEOUT'));
      }, CONNECTION_TIMEOUTS.REQUEST);
      
      // 💾 Сохраняем запрос
      this._pendingRequests.set(request.id!, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
        timestamp: new Date(),
      });
      
      // 📤 Отправляем запрос
      this._transport.send(request).catch(error => {
        this._pendingRequests.delete(request.id!);
        clearTimeout(timeout);
        reject(error);
      });
      
      // 📊 Обновляем статистику
      this._stats.messagesSent++;
    });
  }
  
  // 📡 ОТПРАВКА УВЕДОМЛЕНИЯ
  async notify(notification: McpNotification): Promise<void> {
    if (this._status !== 'connected') {
      throw new McpClientError('Not connected to server', 'NOT_CONNECTED');
    }
    
    // ⏰ Добавляем timestamp
    notification.timestamp = new Date();
    
    // ✅ Валидируем сообщение
    const validationResult = validateMcpMessage(notification);
    if (!validationResult.success) {
      throw new McpClientError(
        `Invalid notification: ${validationResult.error}`, 
        'INVALID_NOTIFICATION'
      );
    }
    
    await this._transport.send(notification);
    this._stats.messagesSent++;
  }
  
  // 🛠️ ВЫЗОВ ИНСТРУМЕНТА
  async callTool(
    name: string, 
    args: Record<string, unknown> = {},
    options: CallToolOptions = {}
  ): Promise<unknown> {
    // 🔍 Проверяем существование инструмента
    const tool = this._tools.find(t => t.name === name);
    if (!tool) {
      throw new McpClientError(`Tool '${name}' not found`, 'TOOL_NOT_FOUND');
    }
    
    // 📝 Логируем вызов инструмента
    if (this._config.enableLogging) {
      console.log(`🛠️ Вызов инструмента: ${name}`, args);
    }
    
    // 📤 Отправляем запрос
    const response = await this.send<{ result?: unknown; error?: McpError }>({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
    });
    
    // ❌ Проверяем на ошибки
    if (response.error) {
      throw new McpClientError(
        `Tool execution failed: ${response.error.message}`,
        'TOOL_EXECUTION_FAILED',
        { toolName: name, originalError: response.error }
      );
    }
    
    return response.result;
  }
  
  // 📁 ПОЛУЧЕНИЕ РЕСУРСА
  async getResource(uri: string, options: GetResourceOptions = {}): Promise<unknown> {
    // 🔍 Проверяем существование ресурса
    const resource = this._resources.find(r => r.uri === uri);
    if (!resource) {
      throw new McpClientError(`Resource '${uri}' not found`, 'RESOURCE_NOT_FOUND');
    }
    
    // 📝 Логируем получение ресурса
    if (this._config.enableLogging) {
      console.log(`📁 Получение ресурса: ${uri}`);
    }
    
    // 📤 Отправляем запрос
    const response = await this.send<{ contents?: unknown; error?: McpError }>({
      jsonrpc: '2.0',
      method: 'resources/read',
      params: {
        uri,
        ...options.params,
      },
    });
    
    // ❌ Проверяем на ошибки
    if (response.error) {
      throw new McpClientError(
        `Resource access failed: ${response.error.message}`,
        'RESOURCE_ACCESS_FAILED',
        { resourceUri: uri, originalError: response.error }
      );
    }
    
    return response.contents;
  }
  
  // 📋 ПОЛУЧЕНИЕ СПИСКА ИНСТРУМЕНТОВ
  async listTools(): Promise<McpTool[]> {
    const response = await this.send<{ tools: McpTool[] }>({
      jsonrpc: '2.0',
      method: 'tools/list',
    });
    
    this._tools = response.tools || [];
    this.emit('toolsUpdated', { tools: this._tools, timestamp: new Date() });
    
    return this._tools;
  }
  
  // 📋 ПОЛУЧЕНИЕ СПИСКА РЕСУРСОВ
  async listResources(): Promise<McpResource[]> {
    const response = await this.send<{ resources: McpResource[] }>({
      jsonrpc: '2.0',
      method: 'resources/list',
    });
    
    this._resources = response.resources || [];
    this.emit('resourcesUpdated', { resources: this._resources, timestamp: new Date() });
    
    return this._resources;
  }
  
  // 🧹 ОЧИСТКА РЕСУРСОВ
  async destroy(): Promise<void> {
    // 💔 Отключаемся если подключены
    if (this._status !== 'disconnected') {
      await this.disconnect();
    }
    
    // 🗑️ Уничтожаем транспорт
    await this._transport.destroy();
    
    // 🧹 Очищаем все слушатели
    this.removeAllListeners();
    
    if (this._config.enableLogging) {
      console.log('🗑️ MCP Client уничтожен');
    }
  }
  
  // 🔧 ПРИВАТНЫЕ МЕТОДЫ
  
  /**
   * 🎯 Настройка обработчиков транспорта
   */
  private _setupTransportHandlers(): void {
    this._transport.on('connected', (data) => {
      if (this._config.enableLogging) {
        console.log('🔗 Транспорт подключен:', data);
      }
    });
    
    this._transport.on('disconnected', (data) => {
      this._setStatus('disconnected');
      this._stats.connectedAt = null;
      
      this.emit('disconnected', {
        reason: data.reason,
        code: data.code,
        timestamp: data.timestamp,
      });
      
      // 🔄 Автоматическое переподключение
      if (this._config.autoReconnect && this._status !== 'closed') {
        this._scheduleReconnect();
      }
    });
    
    this._transport.on('message', (data) => {
      this._handleMessage(data.data);
      this._stats.messagesReceived++;
    });
    
    this._transport.on('error', (data) => {
      this._emitError(data.error, data.context);
    });
  }
  
  /**
   * 📨 Обработка входящих сообщений
   */
  private _handleMessage(message: McpMessage): void {
    // 📊 Обновляем статистику
    this._stats.messagesReceived++;
    
    // 🎯 Emit события сообщения
    this.emit('message', { message, timestamp: new Date() });
    
    // 📥 Обрабатываем ответы на запросы
    if ('id' in message && message.id !== undefined) {
      const pending = this._pendingRequests.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this._pendingRequests.delete(message.id);
        
        // 📊 Обновляем latency статистику
        const latency = Date.now() - pending.timestamp.getTime();
        this._updateAverageLatency(latency);
        
        const response = message as McpResponse;
        if (response.error) {
          pending.reject(new McpClientError(
            response.error.message,
            'SERVER_ERROR',
            { code: response.error.code, data: response.error.data }
          ));
        } else {
          pending.resolve(response.result);
        }
      }
    }
    
    // 📡 Обрабатываем уведомления
    if ('method' in message && !('id' in message)) {
      this._handleNotification(message as McpNotification);
    }
  }
  
  /**
   * 📡 Обработка уведомлений от сервера
   */
  private _handleNotification(notification: McpNotification): void {
    switch (notification.method) {
      case 'notifications/tools/list_changed':
        // 🛠️ Обновляем список инструментов
        this.listTools().catch(error => {
          this._emitError(error, 'listTools');
        });
        break;
        
      case 'notifications/resources/list_changed':
        // 📁 Обновляем список ресурсов
        this.listResources().catch(error => {
          this._emitError(error, 'listResources');
        });
        break;
        
      default:
        // 📝 Логируем неизвестные уведомления
        if (this._config.enableLogging) {
          console.log('📡 Неизвестное уведомление:', notification.method);
        }
    }
  }
  
  /**
   * 🚀 Инициализация сервера после подключения
   */
  private async _initializeServer(): Promise<void> {
    try {
      // 📋 Получаем capabilities сервера
      const initResponse = await this.send<{ 
        protocolVersion: string;
        capabilities: any;
        serverInfo: { name: string; version: string; };
      }>({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            roots: { listChanged: true },
            sampling: {},
          },
          clientInfo: {
            name: '@mcp-ui/mcp-connector',
            version: '1.0.0',
          },
        },
      });
      
      // 🏷️ Создаем объект сервера
      this._server = {
        id: `server-${Date.now()}`,
        name: initResponse.serverInfo.name,
        version: initResponse.serverInfo.version,
        status: 'online',
        capabilities: initResponse.capabilities,
        transport: {
          type: this._transport.type,
          config: this._transport.config,
        },
        lastConnected: new Date(),
      };
      
      // 📋 Получаем списки инструментов и ресурсов
      await Promise.all([
        this.listTools().catch(() => []), // 🛡️ Игнорируем ошибки
        this.listResources().catch(() => []), // 🛡️ Игнорируем ошибки
      ]);
      
      // 🎯 Уведомляем о подключении
      this.emit('connected', {
        server: this._server,
        timestamp: new Date(),
      });
      
    } catch (error) {
      throw new McpClientError(`Server initialization failed: ${error}`, 'INIT_FAILED');
    }
  }
  
  /**
   * 📊 Изменение статуса
   */
  private _setStatus(newStatus: McpConnectionStatus): void {
    const oldStatus = this._status;
    this._status = newStatus;
    
    if (oldStatus !== newStatus) {
      this.emit('statusChange', {
        oldStatus,
        newStatus,
        timestamp: new Date(),
      });
      
      if (this._config.enableLogging) {
        console.log(`📊 Статус изменен: ${oldStatus} → ${newStatus}`);
      }
    }
  }
  
  /**
   * ❌ Эмитирование ошибки
   */
  private _emitError(error: Error, context?: string): void {
    this._stats.errors++;
    
    this.emit('error', {
      error,
      context,
      timestamp: new Date(),
    });
    
    if (this._config.enableLogging) {
      console.error('❌ MCP Client ошибка:', error.message, context);
    }
  }
  
  /**
   * 🔄 Планирование переподключения
   */
  private _scheduleReconnect(): void {
    if (!this._config.autoReconnect || this._retryTimeout) {
      return;
    }
    
    const strategy = this._config.retryStrategy || RETRY_STRATEGIES.exponential;
    
    if (this._retryAttempt >= strategy.maxAttempts) {
      this._emitError(new McpClientError('Max reconnection attempts reached', 'MAX_RETRIES'));
      return;
    }
    
    // 📊 Вычисляем задержку
    const delay = Math.min(
      strategy.initialDelay * Math.pow(strategy.backoffFactor, this._retryAttempt),
      strategy.maxDelay
    );
    
    this._retryAttempt++;
    
    // 🔄 Эмитируем событие попытки переподключения
    this.emit('reconnecting', {
      attempt: this._retryAttempt,
      maxAttempts: strategy.maxAttempts,
      delay,
      timestamp: new Date(),
    });
    
    // ⏱️ Планируем переподключение
    this._retryTimeout = setTimeout(async () => {
      this._retryTimeout = null;
      this._setStatus('reconnecting');
      this._stats.reconnections++;
      
      try {
        await this.connect();
      } catch (error) {
        // 🔄 Следующая попытка будет запланирована автоматически
      }
    }, delay);
  }
  
  /**
   * 🛑 Отмена переподключения
   */
  private _cancelRetry(): void {
    if (this._retryTimeout) {
      clearTimeout(this._retryTimeout);
      this._retryTimeout = null;
    }
  }
  
  /**
   * 💓 Запуск heartbeat
   */
  private _startHeartbeat(): void {
    if (this._heartbeatInterval) {
      return;
    }
    
    this._heartbeatInterval = setInterval(() => {
      if (this._status === 'connected') {
        this.notify({
          jsonrpc: '2.0',
          method: 'notifications/heartbeat',
        }).catch(error => {
          this._emitError(error, 'heartbeat');
        });
      }
    }, this._config.heartbeatInterval!);
  }
  
  /**
   * 💓 Остановка heartbeat
   */
  private _stopHeartbeat(): void {
    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }
  }
  
  /**
   * 🚫 Отмена всех pending запросов
   */
  private _cancelPendingRequests(reason: string): void {
    for (const [id, pending] of this._pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new McpClientError(reason, 'CANCELLED'));
    }
    this._pendingRequests.clear();
  }
  
  /**
   * 🆔 Генерация ID запроса
   */
  private _generateRequestId(): number {
    return ++this._requestId;
  }
  
  /**
   * 📊 Обновление средней задержки
   */
  private _updateAverageLatency(latency: number): void {
    const count = this._stats.messagesSent;
    this._stats.averageLatency = (this._stats.averageLatency * (count - 1) + latency) / count;
  }
}

// 🎯 ЭКСПОРТ
export default McpClient;

// 🔧 СЛЕДУЮЩИЕ ШАГИ:
// TODO: Добавить поддержку middleware для pre/post обработки
// TODO: Реализовать connection pooling для множественных серверов
// TODO: Добавить метрики производительности (performance.now())
// TODO: Реализовать circuit breaker pattern для fault tolerance
// FIXME: Улучшить error recovery для network failures
// HACK: Временно используем простой heartbeat, нужна более умная стратегия