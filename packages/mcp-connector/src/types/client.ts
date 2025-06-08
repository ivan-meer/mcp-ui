/**
 * 📝 MCP CLIENT TYPES
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Типы для MCP клиента, обеспечивающие type safety и автокомплит.
 * Основаны на официальной спецификации Model Context Protocol.
 * 
 * 🔗 Ссылка: https://modelcontextprotocol.io/specification
 */

import type { z } from 'zod';
import type { McpServer, McpTool, McpResource } from './server';
import type { Transport } from './transport';

// 📊 CONNECTION STATUS
/**
 * 📶 Состояние подключения MCP клиента
 */
export type McpConnectionStatus = 
  | 'disconnected'   // ⚫ Нет подключения
  | 'connecting'     // 🟡 Попытка подключения  
  | 'connected'      // 🟢 Успешно подключен
  | 'reconnecting'   // 🔄 Переподключение
  | 'error'          // 🔴 Ошибка подключения
  | 'closed';        // ⭕ Подключение закрыто

// 🎛️ CLIENT CONFIGURATION
/**
 * ⚙️ Конфигурация MCP клиента
 */
export interface McpClientConfig {
  /** 🚀 Транспорт для подключения */
  transport: Transport;
  
  /** 🔄 Автоматическое переподключение */
  autoReconnect?: boolean;
  
  /** ⏱️ Таймаут подключения (мс) */
  connectionTimeout?: number;
  
  /** 🔁 Стратегия повторных попыток */
  retryStrategy?: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
  };
  
  /** 💓 Heartbeat интервал (мс) */
  heartbeatInterval?: number;
  
  /** 📊 Включить логирование */
  enableLogging?: boolean;
  
  /** 🎯 Пользовательские хедеры */
  headers?: Record<string, string>;
}

// 📨 MCP MESSAGES
/**
 * 📬 Базовый тип MCP сообщения
 */
export interface McpMessage {
  /** 🆔 Уникальный идентификатор */
  id?: string | number;
  
  /** 📝 Версия протокола */
  jsonrpc: '2.0';
  
  /** ⏰ Время создания */
  timestamp?: Date;
}

/**
 * 📤 MCP запрос
 */
export interface McpRequest extends McpMessage {
  /** 🎯 Метод для вызова */
  method: string;
  
  /** 📋 Параметры запроса */
  params?: Record<string, unknown>;
}

/**
 * 📥 MCP ответ
 */
export interface McpResponse extends McpMessage {
  /** ✅ Результат (при успехе) */
  result?: unknown;
  
  /** ❌ Ошибка (при неудаче) */
  error?: McpError;
}

/**
 * 📡 MCP уведомление (без ответа)
 */
export interface McpNotification extends Omit<McpMessage, 'id'> {
  /** 🎯 Метод уведомления */
  method: string;
  
  /** 📋 Параметры */
  params?: Record<string, unknown>;
}

/**
 * ❌ MCP ошибка
 */
export interface McpError {
  /** 🔢 Код ошибки */
  code: number;
  
  /** 📝 Сообщение об ошибке */
  message: string;
  
  /** 📊 Дополнительные данные */
  data?: unknown;
}

// 🎯 CLIENT EVENTS
/**
 * 📡 События MCP клиента
 */
export interface McpClientEvents {
  /** 🔗 Событие подключения */
  connected: {
    server: McpServer;
    timestamp: Date;
  };
  
  /** 💔 Событие отключения */
  disconnected: {
    reason?: string;
    code?: number;
    timestamp: Date;
  };
  
  /** 📨 Получено сообщение */
  message: {
    message: McpMessage;
    timestamp: Date;
  };
  
  /** ❌ Ошибка */
  error: {
    error: Error | McpError;
    context?: string;
    timestamp: Date;
  };
  
  /** 📊 Изменение статуса */
  statusChange: {
    oldStatus: McpConnectionStatus;
    newStatus: McpConnectionStatus;
    timestamp: Date;
  };
  
  /** 🔄 Переподключение */
  reconnecting: {
    attempt: number;
    maxAttempts: number;
    delay: number;
    timestamp: Date;
  };
  
  /** 🛠️ Обновление доступных инструментов */
  toolsUpdated: {
    tools: McpTool[];
    timestamp: Date;
  };
  
  /** 📁 Обновление доступных ресурсов */
  resourcesUpdated: {
    resources: McpResource[];
    timestamp: Date;
  };
}

// 🎯 CLIENT METHODS
/**
 * 🔧 Интерфейс MCP клиента
 */
export interface IMcpClient {
  /** 📊 Текущий статус подключения */
  readonly status: McpConnectionStatus;
  
  /** 🏷️ Информация о подключенном сервере */
  readonly server: McpServer | null;
  
  /** 🛠️ Доступные инструменты */
  readonly tools: McpTool[];
  
  /** 📁 Доступные ресурсы */
  readonly resources: McpResource[];
  
  /** 🔗 Подключиться к серверу */
  connect(): Promise<void>;
  
  /** 💔 Отключиться от сервера */
  disconnect(): Promise<void>;
  
  /** 📤 Отправить запрос */
  send<T = unknown>(request: McpRequest): Promise<T>;
  
  /** 📡 Отправить уведомление */
  notify(notification: McpNotification): Promise<void>;
  
  /** 🛠️ Вызвать инструмент */
  callTool(name: string, arguments?: Record<string, unknown>): Promise<unknown>;
  
  /** 📁 Получить ресурс */
  getResource(uri: string): Promise<unknown>;
  
  /** 📝 Получить список доступных инструментов */
  listTools(): Promise<McpTool[]>;
  
  /** 📋 Получить список доступных ресурсов */
  listResources(): Promise<McpResource[]>;
  
  /** 👂 Подписаться на события */
  on<K extends keyof McpClientEvents>(
    event: K, 
    listener: (data: McpClientEvents[K]) => void
  ): void;
  
  /** 👂❌ Отписаться от событий */
  off<K extends keyof McpClientEvents>(
    event: K, 
    listener?: (data: McpClientEvents[K]) => void
  ): void;
  
  /** 🧹 Очистить все слушатели */
  removeAllListeners(): void;
}

// 📊 ADVANCED TYPES
/**
 * 🎯 Опции для вызова инструмента
 */
export interface CallToolOptions {
  /** ⏱️ Таймаут (мс) */
  timeout?: number;
  
  /** 🔄 Количество попыток */
  retries?: number;
  
  /** 📊 Контекст выполнения */
  context?: Record<string, unknown>;
}

/**
 * 📁 Опции для получения ресурса
 */
export interface GetResourceOptions {
  /** ⏱️ Таймаут (мс) */
  timeout?: number;
  
  /** 📊 Дополнительные параметры */
  params?: Record<string, unknown>;
}

/**
 * 📊 Статистика клиента
 */
export interface McpClientStats {
  /** 🔗 Время подключения */
  connectedAt: Date | null;
  
  /** 📤 Количество отправленных сообщений */
  messagesSent: number;
  
  /** 📥 Количество полученных сообщений */
  messagesReceived: number;
  
  /** ❌ Количество ошибок */
  errors: number;
  
  /** 🔄 Количество переподключений */
  reconnections: number;
  
  /** ⏱️ Средняя задержка (мс) */
  averageLatency: number;
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 MCP PROTOCOL OVERVIEW:
 * 
 * Model Context Protocol (MCP) - это JSON-RPC протокол для взаимодействия
 * AI моделей с внешними инструментами и ресурсами.
 * 
 * 🔄 ОСНОВНЫЕ КОНЦЕПЦИИ:
 * - **Tools** - функции, которые может вызывать AI
 * - **Resources** - данные, к которым может получить доступ AI  
 * - **Prompts** - шаблоны для генерации промптов
 * 
 * 📡 ТРАНСПОРТЫ:
 * - **WebSocket** - для real-time двусторонней связи
 * - **SSE** - для server-sent events (односторонняя)
 * - **HTTP** - для простых request/response взаимодействий
 */

/**
 * 🚨 COMMON PITFALLS & SOLUTIONS:
 * 
 * ❌ ПРОБЛЕМА: Забывать обрабатывать переподключения
 * ✅ РЕШЕНИЕ: Используем autoReconnect и правильную retry стратегию
 * 
 * ❌ ПРОБЛЕМА: Блокирующие операции в event handlers
 * ✅ РЕШЕНИЕ: Используем async/await и non-blocking обработку
 * 
 * ❌ ПРОБЛЕМА: Memory leaks от неочищенных listeners
 * ✅ РЕШЕНИЕ: Всегда вызываем removeAllListeners() при unmount
 * 
 * ❌ ПРОБЛЕМА: Race conditions при множественных запросах
 * ✅ РЕШЕНИЕ: Proper request ID handling и Promise-based API
 */

export default McpClientEvents;