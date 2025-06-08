/**
 * 📡 WEBSOCKET TRANSPORT
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * WebSocket транспорт для real-time двусторонней связи с MCP серверами.
 * Реализует полный lifecycle управления WebSocket соединениями.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Event-driven Communication - все события через EventEmitter
 * 2. Auto-reconnection - intelligent переподключение с backoff
 * 3. Heartbeat/Ping-Pong - мониторинг состояния соединения
 * 4. Message Queuing - буферизация сообщений при разрыве связи
 * 5. Error Recovery - graceful обработка network failures
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import type { 
  Transport, 
  TransportEvents, 
  TransportStatus, 
  WebSocketConfig,
  TransportStats 
} from '../types/transport';
import type { McpMessage } from '../types/client';
import { McpClientError } from '../utils/errors';

/**
 * 📡 WebSocket Transport Implementation
 * 
 * 🚀 ВОЗМОЖНОСТИ:
 * - Полная поддержка WebSocket протокола
 * - Автоматическое переподключение с exponential backoff
 * - Ping/Pong мониторинг для detection отключений
 * - Message buffering при временных сбоях
 * - Детальная статистика соединения
 */
export class WebSocketTransport extends EventEmitter implements Transport {
  // 📊 ПУБЛИЧНЫЕ СВОЙСТВА
  public readonly type = 'websocket' as const;
  public readonly id: string;
  public readonly config: WebSocketConfig;
  
  // 📊 ПРИВАТНЫЕ ПОЛЯ
  private _status: TransportStatus = 'idle';
  private _ws: WebSocket | null = null;
  private _stats: TransportStats;
  private _messageQueue: McpMessage[] = [];
  private _pingInterval: NodeJS.Timeout | null = null;
  private _pongTimeout: NodeJS.Timeout | null = null;
  private _reconnectTimeout: NodeJS.Timeout | null = null;
  private _reconnectAttempt = 0;
  private _maxReconnectAttempts = 5;
  private _reconnectDelay = 1000;
  
  // 🏗️ КОНСТРУКТОР
  constructor(config: WebSocketConfig) {
    super();
    
    this.id = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.config = {
      timeout: 30000,
      autoReconnect: true,
      pingInterval: 30000,
      pongTimeout: 5000,
      maxMessageSize: 1024 * 1024, // 1MB
      ...config,
    };
    
    // 📊 Инициализируем статистику
    this._stats = {
      connectedAt: null,
      bytesSent: 0,
      bytesReceived: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      reconnections: 0,
      averageRTT: 0,
      lastPing: null,
    };
    
    console.log('📡 WebSocket Transport создан:', this.id);
  }
  
  // 📊 ГЕТТЕРЫ
  get status(): TransportStatus {
    return this._status;
  }
  
  get stats(): TransportStats {
    return { ...this._stats };
  }
  
  // 🔗 ПОДКЛЮЧЕНИЕ
  async connect(): Promise<void> {
    if (this._status === 'connected' || this._status === 'connecting') {
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        this._setStatus('connecting');
        
        // 🌐 Создаем WebSocket соединение
        this._ws = new WebSocket(this.config.url, {
          timeout: this.config.timeout,
          headers: this.config.headers,
          ...(this.config.wsOptions || {}),
        });
        
        // ⏱️ Таймаут подключения
        const connectTimeout = setTimeout(() => {
          if (this._ws) {
            this._ws.terminate();
          }
          reject(new McpClientError('WebSocket connection timeout', 'TIMEOUT'));
        }, this.config.timeout);
        
        // ✅ Успешное подключение
        this._ws.on('open', () => {
          clearTimeout(connectTimeout);
          this._setStatus('connected');
          this._stats.connectedAt = new Date();
          this._reconnectAttempt = 0;
          
          // 💓 Запускаем ping/pong monitoring
          this._startPingPong();
          
          // 📤 Отправляем буферизованные сообщения
          this._flushMessageQueue();
          
          // 🎯 Эмитируем событие подключения
          this.emit('connected', { timestamp: new Date() });
          
          console.log('✅ WebSocket подключен:', this.config.url);
          resolve();
        });
        
        // 💔 Закрытие соединения
        this._ws.on('close', (code, reason) => {
          clearTimeout(connectTimeout);
          this._cleanup();
          
          const reasonStr = reason?.toString() || 'Unknown reason';
          console.log('💔 WebSocket закрыт:', code, reasonStr);
          
          this.emit('disconnected', {
            code,
            reason: reasonStr,
            timestamp: new Date(),
          });
          
          // 🔄 Автоматическое переподключение
          if (this.config.autoReconnect && this._status !== 'closed') {
            this._scheduleReconnect();
          }
        });
        
        // 📨 Получение сообщений
        this._ws.on('message', (data) => {
          try {
            this._handleMessage(data);
          } catch (error) {
            this._emitError(error, 'message_handling');
          }
        });
        
        // ❌ Ошибки WebSocket
        this._ws.on('error', (error) => {
          clearTimeout(connectTimeout);
          this._emitError(error, 'websocket');
          
          if (this._status === 'connecting') {
            reject(error);
          }
        });
        
        // 🏓 Pong ответы
        this._ws.on('pong', () => {
          if (this._pongTimeout) {
            clearTimeout(this._pongTimeout);
            this._pongTimeout = null;
          }
          
          // 📊 Вычисляем RTT
          if (this._stats.lastPing) {
            const rtt = Date.now() - this._stats.lastPing;
            this._updateAverageRTT(rtt);
          }
        });
        
      } catch (error) {
        this._setStatus('error');
        reject(error);
      }
    });
  }
  
  // 💔 ОТКЛЮЧЕНИЕ
  async disconnect(): Promise<void> {
    if (this._status === 'disconnected') {
      return;
    }
    
    this._setStatus('disconnected');
    this._cleanup();
    
    if (this._ws) {
      // 🤝 Graceful close
      if (this._ws.readyState === WebSocket.OPEN) {
        this._ws.close(1000, 'Client disconnect');
      } else {
        this._ws.terminate();
      }
      this._ws = null;
    }
    
    console.log('💔 WebSocket отключен');
  }
  
  // 📤 ОТПРАВКА СООБЩЕНИЯ
  async send(message: McpMessage): Promise<void> {
    if (this._status !== 'connected' || !this._ws) {
      // 📦 Буферизуем сообщение если автоматическое переподключение включено
      if (this.config.autoReconnect) {
        this._messageQueue.push(message);
        console.log('📦 Сообщение добавлено в очередь');
        return;
      }
      
      throw new McpClientError('WebSocket not connected', 'NOT_CONNECTED');
    }
    
    try {
      const data = JSON.stringify(message);
      
      // 📏 Проверяем размер сообщения
      if (data.length > (this.config.maxMessageSize || 1024 * 1024)) {
        throw new McpClientError('Message too large', 'MESSAGE_TOO_LARGE');
      }
      
      this._ws.send(data);
      
      // 📊 Обновляем статистику
      this._stats.messagesSent++;
      this._stats.bytesSent += data.length;
      
    } catch (error) {
      this._emitError(error, 'send');
      throw error;
    }
  }
  
  // 🗑️ УНИЧТОЖЕНИЕ
  async destroy(): Promise<void> {
    await this.disconnect();
    this.removeAllListeners();
    console.log('🗑️ WebSocket Transport уничтожен:', this.id);
  }
  
  // 🔧 ПРИВАТНЫЕ МЕТОДЫ
  
  /**
   * 📨 Обработка входящих сообщений
   */
  private _handleMessage(data: WebSocket.Data): void {
    try {
      const text = data.toString();
      
      // 📊 Обновляем статистику
      this._stats.messagesReceived++;
      this._stats.bytesReceived += text.length;
      
      // 📋 Парсим JSON
      const message = JSON.parse(text) as McpMessage;
      
      // 🎯 Эмитируем событие сообщения
      this.emit('message', {
        data: message,
        timestamp: new Date(),
      });
      
    } catch (error) {
      this._emitError(error, 'message_parsing');
    }
  }
  
  /**
   * 📊 Изменение статуса
   */
  private _setStatus(newStatus: TransportStatus): void {
    const oldStatus = this._status;
    this._status = newStatus;
    
    if (oldStatus !== newStatus) {
      this.emit('statusChange', {
        oldStatus,
        newStatus,
        timestamp: new Date(),
      });
    }
  }
  
  /**
   * ❌ Эмитирование ошибки
   */
  private _emitError(error: Error, context?: string): void {
    this._stats.errors++;
    
    this.emit('error', {
      error: error instanceof Error ? error : new Error(String(error)),
      context,
      timestamp: new Date(),
    });
  }
  
  /**
   * 💓 Запуск ping/pong мониторинга
   */
  private _startPingPong(): void {
    if (!this.config.pingInterval) {
      return;
    }
    
    this._pingInterval = setInterval(() => {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        // 📡 Отправляем ping
        this._stats.lastPing = Date.now();
        this._ws.ping();
        
        // ⏱️ Устанавливаем таймаут для pong
        this._pongTimeout = setTimeout(() => {
          console.log('⚠️ Pong timeout - переподключение');
          if (this._ws) {
            this._ws.terminate();
          }
        }, this.config.pongTimeout);
      }
    }, this.config.pingInterval);
  }
  
  /**
   * 💓 Остановка ping/pong мониторинга
   */
  private _stopPingPong(): void {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    
    if (this._pongTimeout) {
      clearTimeout(this._pongTimeout);
      this._pongTimeout = null;
    }
  }
  
  /**
   * 🔄 Планирование переподключения
   */
  private _scheduleReconnect(): void {
    if (this._reconnectTimeout || this._status === 'closed') {
      return;
    }
    
    if (this._reconnectAttempt >= this._maxReconnectAttempts) {
      this._setStatus('error');
      this._emitError(new McpClientError('Max reconnection attempts reached', 'MAX_RETRIES'));
      return;
    }
    
    // 📊 Exponential backoff с jitter
    const delay = Math.min(
      this._reconnectDelay * Math.pow(2, this._reconnectAttempt) + Math.random() * 1000,
      30000 // Максимум 30 секунд
    );
    
    this._reconnectAttempt++;
    this._stats.reconnections++;
    
    console.log(`🔄 Переподключение через ${Math.round(delay)}ms (попытка ${this._reconnectAttempt})`);
    
    // 🎯 Эмитируем событие переподключения
    this.emit('reconnecting', {
      attempt: this._reconnectAttempt,
      delay,
      timestamp: new Date(),
    });
    
    this._reconnectTimeout = setTimeout(async () => {
      this._reconnectTimeout = null;
      
      try {
        await this.connect();
      } catch (error) {
        // 🔄 Следующая попытка будет запланирована автоматически при закрытии
      }
    }, delay);
  }
  
  /**
   * 📤 Отправка буферизованных сообщений
   */
  private _flushMessageQueue(): void {
    if (this._messageQueue.length === 0) {
      return;
    }
    
    console.log(`📤 Отправка ${this._messageQueue.length} буферизованных сообщений`);
    
    const messages = [...this._messageQueue];
    this._messageQueue = [];
    
    for (const message of messages) {
      this.send(message).catch(error => {
        // 📦 Возвращаем в очередь при ошибке
        this._messageQueue.unshift(message);
        this._emitError(error, 'queue_flush');
      });
    }
  }
  
  /**
   * 🧹 Очистка ресурсов
   */
  private _cleanup(): void {
    this._setStatus('disconnected');
    this._stats.connectedAt = null;
    
    this._stopPingPong();
    
    if (this._reconnectTimeout) {
      clearTimeout(this._reconnectTimeout);
      this._reconnectTimeout = null;
    }
  }
  
  /**
   * 📊 Обновление среднего RTT
   */
  private _updateAverageRTT(rtt: number): void {
    const count = this._stats.messagesSent;
    if (count === 0) {
      this._stats.averageRTT = rtt;
    } else {
      this._stats.averageRTT = (this._stats.averageRTT * (count - 1) + rtt) / count;
    }
  }
}

// 🎯 ЭКСПОРТ
export default WebSocketTransport;

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 WEBSOCKET LIFECYCLE:
 * 
 * 🔄 **Connection States**:
 * - CONNECTING (0) - соединение устанавливается
 * - OPEN (1) - соединение установлено, можно отправлять данные
 * - CLOSING (2) - соединение закрывается
 * - CLOSED (3) - соединение закрыто
 * 
 * 🎯 **Event Handling**:
 * - 'open' - соединение установлено
 * - 'message' - получено сообщение
 * - 'close' - соединение закрыто
 * - 'error' - произошла ошибка
 * - 'ping'/'pong' - heartbeat для мониторинга
 */

/**
 * 🔄 RECONNECTION STRATEGIES:
 * 
 * 📈 **Exponential Backoff with Jitter**:
 * ```
 * delay = baseDelay * (2 ^ attempt) + random(0, 1000ms)
 * ```
 * 
 * ✅ **Преимущества**:
 * - Предотвращает "thundering herd" эффект
 * - Снижает нагрузку на сервер при массовых отключениях
 * - Jitter добавляет случайность для распределения нагрузки
 * 
 * ⚠️ **Ограничения**:
 * - Максимальная задержка (cap)
 * - Максимальное количество попыток
 * - Circuit breaker при повторяющихся ошибках
 */

/**
 * 💓 HEARTBEAT MECHANISM:
 * 
 * 🏓 **Ping/Pong Protocol**:
 * 1. Клиент отправляет ping каждые N секунд
 * 2. Сервер должен ответить pong в течение timeout
 * 3. Если pong не получен - соединение считается разорванным
 * 
 * 🎯 **Цели**:
 * - Обнаружение "silent" разрывов соединения
 * - Измерение latency (RTT)
 * - Поддержание соединения через NAT/proxy
 */

// 🔧 СЛЕДУЮЩИЕ ШАГИ:
// TODO: Добавить поддержку WebSocket extensions (compression)
// TODO: Реализовать circuit breaker pattern
// TODO: Добавить метрики для monitoring (Prometheus)
// TODO: Поддержка WebSocket subprotocols
// FIXME: Улучшить error recovery для specific error codes
// HACK: Временно используем простую очередь, нужна persistent storage для critical messages