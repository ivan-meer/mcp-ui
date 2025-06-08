/**
 * 🎛️ MCP CONNECTOR CONSTANTS
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Центральные константы для всего пакета. Собраны в одном месте для легкого изменения
 * и предотвращения magic numbers в коде.
 * 
 * 🎯 ПРИНЦИПЫ:
 * 1. Single Source of Truth - все константы в одном месте
 * 2. Semantic Naming - имена отражают назначение
 * 3. Grouping - логическая группировка по функциональности
 * 4. Documentation - каждая группа имеет объяснение
 */

import type { McpClientConfig } from './types/client';
import type { TransportConfig } from './types/transport';

// 📋 PROTOCOL VERSION
/**
 * 🏷️ Версия MCP протокола
 * 
 * 📚 ВАЖНО: Должна соответствовать официальной спецификации MCP
 * @see https://modelcontextprotocol.io/specification
 */
export const MCP_PROTOCOL_VERSION = '2024-11-05';

// ⏱️ CONNECTION TIMEOUTS
/**
 * ⏰ Таймауты для различных операций (в миллисекундах)
 * 
 * 🎯 НАСТРОЙКИ:
 * - CONNECTION: время на установку соединения
 * - REQUEST: время ожидания ответа на запрос
 * - HEARTBEAT: интервал между heartbeat сообщениями
 * - AUTO_SCROLL_DELAY: задержка для автоматической прокрутки
 */
export const CONNECTION_TIMEOUTS = {
  /** 🔗 Таймаут подключения (30 секунд) */
  CONNECTION: 30_000,
  
  /** 📤 Таймаут запроса (60 секунд) */
  REQUEST: 60_000,
  
  /** 💓 Интервал heartbeat (30 секунд) */
  HEARTBEAT: 30_000,
  
  /** 🔄 Задержка автоматической прокрутки (100ms) */
  AUTO_SCROLL_DELAY: 100,
  
  /** ⏱️ Таймаут pong ответа (5 секунд) */
  PONG_TIMEOUT: 5_000,
  
  /** 🔄 Начальная задержка переподключения (1 секунда) */
  INITIAL_RECONNECT_DELAY: 1_000,
  
  /** 🔄 Максимальная задержка переподключения (30 секунд) */
  MAX_RECONNECT_DELAY: 30_000,
} as const;

// 🔄 RETRY STRATEGIES
/**
 * 🎯 Стратегии повторных попыток для различных сценариев
 * 
 * 📊 ТИПЫ СТРАТЕГИЙ:
 * - exponential: экспоненциальная задержка (рекомендуется)
 * - linear: линейная задержка
 * - fixed: фиксированная задержка
 */
export const RETRY_STRATEGIES = {
  /** 📈 Экспоненциальная стратегия (по умолчанию) */
  exponential: {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
  },
  
  /** 📏 Линейная стратегия */
  linear: {
    maxAttempts: 3,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffFactor: 1,
  },
  
  /** 🔒 Фиксированная стратегия */
  fixed: {
    maxAttempts: 3,
    initialDelay: 5000,
    maxDelay: 5000,
    backoffFactor: 1,
  },
  
  /** ⚡ Агрессивная стратегия для критически важных соединений */
  aggressive: {
    maxAttempts: 10,
    initialDelay: 500,
    maxDelay: 5000,
    backoffFactor: 1.5,
  },
} as const;

// 📏 MESSAGE LIMITS
/**
 * 📊 Ограничения на размеры сообщений и данных
 * 
 * 🛡️ БЕЗОПАСНОСТЬ: Предотвращает DoS атаки через большие сообщения
 */
export const MESSAGE_LIMITS = {
  /** 📦 Максимальный размер сообщения (1MB) */
  MAX_MESSAGE_SIZE: 1024 * 1024,
  
  /** 📝 Максимальная длина текста в сообщении (50KB) */
  MAX_TEXT_LENGTH: 50 * 1024,
  
  /** 🏷️ Максимальная длина имени инструмента */
  MAX_TOOL_NAME_LENGTH: 100,
  
  /** 📄 Максимальная длина описания */
  MAX_DESCRIPTION_LENGTH: 1000,
  
  /** 🔗 Максимальная длина URI */
  MAX_URI_LENGTH: 2000,
  
  /** 📋 Максимальное количество инструментов */
  MAX_TOOLS_COUNT: 1000,
  
  /** 📁 Максимальное количество ресурсов */
  MAX_RESOURCES_COUNT: 10000,
  
  /** 📦 Максимальный размер очереди сообщений */
  MAX_QUEUE_SIZE: 100,
} as const;

// 🎛️ DEFAULT CLIENT CONFIG
/**
 * ⚙️ Конфигурация MCP клиента по умолчанию
 * 
 * 🎯 ПРИНЦИПЫ:
 * - Безопасные значения по умолчанию
 * - Производительность vs надежность
 * - Подходит для большинства use cases
 */
export const DEFAULT_CLIENT_CONFIG: Partial<McpClientConfig> = {
  autoReconnect: true,
  connectionTimeout: CONNECTION_TIMEOUTS.CONNECTION,
  retryStrategy: RETRY_STRATEGIES.exponential,
  heartbeatInterval: CONNECTION_TIMEOUTS.HEARTBEAT,
  enableLogging: process.env.NODE_ENV !== 'production',
  headers: {
    'User-Agent': '@mcp-ui/mcp-connector/1.0.0',
    'Content-Type': 'application/json',
  },
};

// 🚀 DEFAULT TRANSPORT CONFIG
/**
 * 🔌 Конфигурация транспорта по умолчанию
 */
export const DEFAULT_TRANSPORT_CONFIG: Partial<TransportConfig> = {
  timeout: CONNECTION_TIMEOUTS.CONNECTION,
  headers: {
    'User-Agent': '@mcp-ui/mcp-connector/1.0.0',
  },
};

// 🎨 WEBSOCKET CONFIG DEFAULTS
/**
 * 📡 Дефолтные настройки для WebSocket транспорта
 */
export const DEFAULT_WEBSOCKET_CONFIG = {
  autoReconnect: true,
  pingInterval: CONNECTION_TIMEOUTS.HEARTBEAT,
  pongTimeout: CONNECTION_TIMEOUTS.PONG_TIMEOUT,
  maxMessageSize: MESSAGE_LIMITS.MAX_MESSAGE_SIZE,
  wsOptions: {
    protocols: ['mcp'],
    perMessageDeflate: true, // 🗜️ Сжатие сообщений
  },
};

// 🌊 SSE CONFIG DEFAULTS
/**
 * 📡 Дефолтные настройки для SSE транспорта
 */
export const DEFAULT_SSE_CONFIG = {
  autoReconnect: true,
  reconnectInterval: CONNECTION_TIMEOUTS.INITIAL_RECONNECT_DELAY,
  sseOptions: {
    withCredentials: false,
  },
};

// 📊 ERROR CODES
/**
 * 🚨 Стандартные коды ошибок MCP
 * 
 * 📋 КАТЕГОРИИ:
 * - 1xxx: Transport errors
 * - 2xxx: Protocol errors  
 * - 3xxx: Application errors
 * - 4xxx: Client errors
 * - 5xxx: Server errors
 */
export const MCP_ERROR_CODES = {
  // 🔌 Transport Errors (1xxx)
  TRANSPORT_ERROR: 1000,
  CONNECTION_FAILED: 1001,
  CONNECTION_TIMEOUT: 1002,
  CONNECTION_LOST: 1003,
  RECONNECTION_FAILED: 1004,
  
  // 📡 Protocol Errors (2xxx)
  PROTOCOL_ERROR: 2000,
  INVALID_MESSAGE: 2001,
  UNSUPPORTED_VERSION: 2002,
  MALFORMED_REQUEST: 2003,
  
  // 🎯 Application Errors (3xxx)
  APPLICATION_ERROR: 3000,
  TOOL_NOT_FOUND: 3001,
  TOOL_EXECUTION_FAILED: 3002,
  RESOURCE_NOT_FOUND: 3003,
  RESOURCE_ACCESS_DENIED: 3004,
  
  // 👤 Client Errors (4xxx)
  CLIENT_ERROR: 4000,
  INVALID_REQUEST: 4001,
  AUTHENTICATION_FAILED: 4002,
  RATE_LIMIT_EXCEEDED: 4003,
  
  // 🖥️ Server Errors (5xxx)
  SERVER_ERROR: 5000,
  INTERNAL_SERVER_ERROR: 5001,
  SERVICE_UNAVAILABLE: 5002,
  MAINTENANCE_MODE: 5003,
} as const;

// 🏷️ MESSAGE TYPES
/**
 * 📨 Типы MCP сообщений
 */
export const MESSAGE_TYPES = {
  REQUEST: 'request',
  RESPONSE: 'response',
  NOTIFICATION: 'notification',
  ERROR: 'error',
} as const;

// 🛠️ TOOL CATEGORIES
/**
 * 🔧 Стандартные категории инструментов
 */
export const TOOL_CATEGORIES = {
  FILE_SYSTEM: 'filesystem',
  DATABASE: 'database',
  API: 'api',
  COMPUTATION: 'computation',
  VISUALIZATION: 'visualization',
  COMMUNICATION: 'communication',
  UTILITY: 'utility',
  CUSTOM: 'custom',
} as const;

// 📁 RESOURCE TYPES
/**
 * 📄 Типы ресурсов по MIME
 */
export const RESOURCE_TYPES = {
  TEXT: 'text/plain',
  JSON: 'application/json',
  MARKDOWN: 'text/markdown',
  HTML: 'text/html',
  CSV: 'text/csv',
  XML: 'application/xml',
  PDF: 'application/pdf',
  IMAGE: 'image/*',
  BINARY: 'application/octet-stream',
} as const;

// 📊 LOG LEVELS
/**
 * 📝 Уровни логирования
 */
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  NOTICE: 'notice',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
  ALERT: 'alert',
  EMERGENCY: 'emergency',
} as const;

// 🎯 EVENT NAMES
/**
 * 📡 Имена событий для type safety
 */
export const EVENT_NAMES = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  MESSAGE: 'message',
  ERROR: 'error',
  STATUS_CHANGE: 'statusChange',
  RECONNECTING: 'reconnecting',
  TOOLS_UPDATED: 'toolsUpdated',
  RESOURCES_UPDATED: 'resourcesUpdated',
} as const;

// 🔧 DEVELOPMENT FLAGS
/**
 * 🛠️ Флаги для разработки и отладки
 */
export const DEV_FLAGS = {
  /** 📝 Подробное логирование в development */
  VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
  
  /** 🧪 Включить экспериментальные функции */
  ENABLE_EXPERIMENTAL: process.env.MCP_ENABLE_EXPERIMENTAL === 'true',
  
  /** 📊 Собирать детальную статистику */
  DETAILED_STATS: process.env.MCP_DETAILED_STATS === 'true',
  
  /** 🔍 Debug режим для WebSocket */
  DEBUG_WEBSOCKET: process.env.DEBUG?.includes('websocket'),
  
  /** 🎯 Simulate network delays (for testing) */
  SIMULATE_LATENCY: parseInt(process.env.MCP_SIMULATE_LATENCY || '0'),
} as const;

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 CONFIGURATION BEST PRACTICES:
 * 
 * ✅ **Разумные дефолты**: Работают для 80% случаев
 * ✅ **Настраиваемость**: Можно переопределить любой параметр
 * ✅ **Environment-aware**: Разные настройки для dev/prod
 * ✅ **Type Safety**: Все константы типизированы
 * ✅ **Documentation**: Каждая группа объяснена
 * 
 * 🎯 **Timeout Guidelines**:
 * - Connection: 30s (достаточно для медленных сетей)
 * - Request: 60s (для long-running операций)
 * - Heartbeat: 30s (баланс между нагрузкой и обнаружением разрыва)
 * - Pong: 5s (быстрое обнаружение dead connections)
 */

/**
 * 🔄 RETRY STRATEGY CHOICE:
 * 
 * 📈 **Exponential Backoff**:
 * - Используется по умолчанию
 * - Быстро восстанавливается от временных сбоев
 * - Не перегружает сервер при длительных проблемах
 * 
 * 📏 **Linear Backoff**:
 * - Более предсказуемые интервалы
 * - Подходит для debug и тестирования
 * 
 * 🔒 **Fixed Backoff**:
 * - Простейшая стратегия
 * - Подходит для stable environments
 */

/**
 * 📊 ERROR CODE DESIGN:
 * 
 * 🎯 **Hierarchical Structure**:
 * - 1xxx: Инфраструктурные проблемы
 * - 2xxx: Проблемы протокола
 * - 3xxx: Бизнес-логика приложения
 * - 4xxx: Ошибки клиента
 * - 5xxx: Ошибки сервера
 * 
 * ✅ **Benefits**:
 * - Легко категоризировать ошибки
 * - Можно создавать разные стратегии обработки
 * - Совместимо с HTTP status codes (4xx, 5xx)
 */

export default {
  MCP_PROTOCOL_VERSION,
  CONNECTION_TIMEOUTS,
  RETRY_STRATEGIES,
  MESSAGE_LIMITS,
  DEFAULT_CLIENT_CONFIG,
  DEFAULT_TRANSPORT_CONFIG,
  MCP_ERROR_CODES,
  MESSAGE_TYPES,
  TOOL_CATEGORIES,
  RESOURCE_TYPES,
  LOG_LEVELS,
  EVENT_NAMES,
  DEV_FLAGS,
};