/**
 * 🚀 TRANSPORT TYPES
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Типы для различных транспортных слоев MCP клиента.
 * Обеспечивают абстракцию над WebSocket, SSE и другими протоколами.
 * 
 * 🎯 DESIGN PATTERN: Strategy Pattern
 * Позволяет переключаться между разными транспортами без изменения клиента.
 */

import type { McpMessage } from './client';

// 📊 TRANSPORT STATUS
/**
 * 📡 Состояние транспорта
 */
export type TransportStatus = 
  | 'idle'        // 💤 Не инициализован
  | 'connecting'  // 🔄 Подключение
  | 'connected'   // ✅ Подключен
  | 'disconnected' // ❌ Отключен
  | 'error'       // 🚨 Ошибка
  | 'closed';     // 🔒 Закрыт

// 🎛️ BASE TRANSPORT CONFIG
/**
 * ⚙️ Базовая конфигурация транспорта
 */
export interface TransportConfig {
  /** 🔗 URL для подключения */
  url: string;
  
  /** ⏱️ Таймаут подключения (мс) */
  timeout?: number;
  
  /** 🎯 Дополнительные заголовки */
  headers?: Record<string, string>;
  
  /** 🔐 Протокол аутентификации */
  auth?: {
    type: 'bearer' | 'basic' | 'custom';
    token?: string;
    username?: string;
    password?: string;
    custom?: Record<string, string>;
  };
  
  /** 🛡️ SSL настройки */
  ssl?: {
    rejectUnauthorized?: boolean;
    cert?: string;
    key?: string;
    ca?: string;
  };
}

// 🔌 WEBSOCKET CONFIG
/**
 * 📡 Конфигурация WebSocket транспорта
 */
export interface WebSocketConfig extends TransportConfig {
  /** 🔄 Автоматическое переподключение */
  autoReconnect?: boolean;
  
  /** 💓 Ping/Pong интервал (мс) */
  pingInterval?: number;
  
  /** ⏱️ Pong таймаут (мс) */
  pongTimeout?: number;
  
  /** 📦 Максимальный размер сообщения */
  maxMessageSize?: number;
  
  /** 🎛️ WebSocket специфичные опции */
  wsOptions?: {
    protocols?: string | string[];
    origin?: string;
    perMessageDeflate?: boolean;
  };
}

// 📡 SSE CONFIG  
/**
 * 🌊 Конфигурация Server-Sent Events транспорта
 */
export interface SSEConfig extends TransportConfig {
  /** 🔄 Автоматическое переподключение */
  autoReconnect?: boolean;
  
  /** ⏱️ Интервал переподключения (мс) */
  reconnectInterval?: number;
  
  /** 🆔 Last Event ID для возобновления */
  lastEventId?: string;
  
  /** 🎛️ EventSource специфичные опции */
  sseOptions?: {
    withCredentials?: boolean;
  };
}

// 🏠 LOCAL CONFIG
/**
 * 🖥️ Конфигурация локального транспорта (для тестирования)
 */
export interface LocalConfig extends Omit<TransportConfig, 'url'> {
  /** 🎯 Имя локального сервера */
  serverName: string;
  
  /** 📁 Путь к серверу (опционально) */
  serverPath?: string;
  
  /** 🎛️ Конфигурация сервера */
  serverConfig?: Record<string, unknown>;
  
  /** ⏱️ Задержка симуляции (мс) */
  simulatedDelay?: number;
}

// 📡 TRANSPORT EVENTS
/**
 * 🎯 События транспортного слоя
 */
export interface TransportEvents {
  /** 🔗 Подключение установлено */
  connected: {
    timestamp: Date;
  };
  
  /** 💔 Подключение разорвано */
  disconnected: {
    code?: number;
    reason?: string;
    timestamp: Date;
  };
  
  /** 📨 Получено сообщение */
  message: {
    data: McpMessage;
    timestamp: Date;
  };
  
  /** ❌ Ошибка транспорта */
  error: {
    error: Error;
    context?: string;
    timestamp: Date;
  };
  
  /** 📊 Изменение статуса */
  statusChange: {
    oldStatus: TransportStatus;
    newStatus: TransportStatus;
    timestamp: Date;
  };
  
  /** 🔄 Попытка переподключения */
  reconnecting: {
    attempt: number;
    delay: number;
    timestamp: Date;
  };
}

// 🚀 TRANSPORT INTERFACE
/**
 * 🔌 Базовый интерфейс транспорта
 */
export interface Transport {
  /** 📊 Текущий статус */
  readonly status: TransportStatus;
  
  /** 🆔 Уникальный идентификатор */
  readonly id: string;
  
  /** 🏷️ Тип транспорта */
  readonly type: 'websocket' | 'sse' | 'local' | 'http';
  
  /** ⚙️ Конфигурация */
  readonly config: TransportConfig;
  
  /** 🔗 Подключиться */
  connect(): Promise<void>;
  
  /** 💔 Отключиться */
  disconnect(): Promise<void>;
  
  /** 📤 Отправить сообщение */
  send(message: McpMessage): Promise<void>;
  
  /** 👂 Подписаться на событие */
  on<K extends keyof TransportEvents>(
    event: K,
    listener: (data: TransportEvents[K]) => void
  ): void;
  
  /** 👂❌ Отписаться от события */
  off<K extends keyof TransportEvents>(
    event: K,
    listener?: (data: TransportEvents[K]) => void
  ): void;
  
  /** 🧹 Очистить все слушатели */
  removeAllListeners(): void;
  
  /** 🗑️ Уничтожить транспорт */
  destroy(): Promise<void>;
}

// 📊 TRANSPORT STATS
/**
 * 📈 Статистика транспорта
 */
export interface TransportStats {
  /** 🔗 Время подключения */
  connectedAt: Date | null;
  
  /** 📤 Байт отправлено */
  bytesSent: number;
  
  /** 📥 Байт получено */
  bytesReceived: number;
  
  /** 📨 Сообщений отправлено */
  messagesSent: number;
  
  /** 📬 Сообщений получено */
  messagesReceived: number;
  
  /** ❌ Количество ошибок */
  errors: number;
  
  /** 🔄 Количество переподключений */
  reconnections: number;
  
  /** ⏱️ Средний RTT (мс) */
  averageRTT: number;
  
  /** 💓 Последний ping (мс) */
  lastPing: number | null;
}

// 🏭 TRANSPORT FACTORY
/**
 * 🔧 Фабрика для создания транспортов
 */
export interface TransportFactory {
  /** 🏭 Создать WebSocket транспорт */
  createWebSocket(config: WebSocketConfig): Transport;
  
  /** 🏭 Создать SSE транспорт */  
  createSSE(config: SSEConfig): Transport;
  
  /** 🏭 Создать локальный транспорт */
  createLocal(config: LocalConfig): Transport;
  
  /** ❓ Проверить поддержку типа */
  supports(type: string): boolean;
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 TRANSPORT ABSTRACTION BENEFITS:
 * 
 * 🎯 **Гибкость**: Легко добавлять новые протоколы
 * 🔄 **Переключение**: Можно менять транспорт во время выполнения
 * 🧪 **Тестирование**: LocalTransport для unit тестов
 * 🛡️ **Надежность**: Unified error handling и reconnect logic
 * 
 * 📚 PATTERN: Strategy Pattern
 * Позволяет выбирать алгоритм (транспорт) во время выполнения
 */

/**
 * 🚀 WEBSOCKET vs SSE vs HTTP:
 * 
 * 📡 **WebSocket**:
 * ✅ Двусторонняя связь
 * ✅ Низкая задержка  
 * ✅ Efficient для real-time
 * ❌ Сложнее в настройке
 * ❌ Проблемы с proxy/firewall
 * 
 * 🌊 **SSE (Server-Sent Events)**:
 * ✅ Простота реализации
 * ✅ Автоматическое переподключение
 * ✅ Работает через HTTP
 * ❌ Только server → client
 * ❌ Ограничения браузера на количество соединений
 * 
 * 🌐 **HTTP**:
 * ✅ Универсальная поддержка
 * ✅ Хорошо кэшируется
 * ✅ Простота debugging
 * ❌ Не подходит для real-time
 * ❌ Higher latency
 */

/**
 * 🔄 RECONNECTION STRATEGIES:
 * 
 * 📈 **Exponential Backoff**:
 * delay = initialDelay * (backoffFactor ^ attempt)
 * Предотвращает "thundering herd" проблему
 * 
 * 🎯 **Linear Backoff**:
 * delay = initialDelay + (linearIncrement * attempt)  
 * Более предсказуемый, но может быть агрессивным
 * 
 * 🔀 **Jittered Backoff**:
 * delay = baseDelay + random(0, jitter)
 * Добавляет случайность для распределения нагрузки
 */

export default Transport;