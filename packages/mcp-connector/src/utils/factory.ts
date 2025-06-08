/**
 * 🏭 MCP CLIENT FACTORY
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Фабричные функции для удобного создания MCP клиентов с различными транспортами.
 * Обеспечивают type safety и предустановленные конфигурации для типичных сценариев.
 * 
 * 🎯 DESIGN PATTERN: Factory Pattern
 * Инкапсулирует логику создания объектов и предоставляет простой API для пользователей.
 */

import { McpClient } from '../client/McpClient';
import { WebSocketTransport } from '../transports/WebSocketTransport';
import type {
  McpClientConfig,
  IMcpClient,
} from '../types/client';
import type {
  WebSocketConfig,
  SSEConfig,
  LocalConfig,
} from '../types/transport';
import {
  DEFAULT_CLIENT_CONFIG,
  DEFAULT_WEBSOCKET_CONFIG,
  DEFAULT_SSE_CONFIG,
} from '../constants';

// 🏭 MAIN FACTORY FUNCTION
/**
 * 🔧 Создать MCP клиент с заданной конфигурацией
 * 
 * 🎯 УНИВЕРСАЛЬНАЯ ФУНКЦИЯ:
 * Принимает полную конфигурацию и создает клиент с любым транспортом
 */
export function createMcpClient(config: McpClientConfig): IMcpClient {
  return new McpClient(config);
}

// 📡 WEBSOCKET FACTORY
/**
 * 🌐 Создать MCP клиент с WebSocket транспортом
 * 
 * 🚀 ИСПОЛЬЗОВАНИЕ:
 * ```typescript
 * const client = createWebSocketClient({
 *   url: 'ws://localhost:3000/mcp',
 *   autoReconnect: true,
 * });
 * ```
 */
export function createWebSocketClient(
  wsConfig: Partial<WebSocketConfig> & { url: string },
  clientConfig?: Partial<Omit<McpClientConfig, 'transport'>>
): IMcpClient {
  // 🔧 Объединяем конфигурации
  const transport = new WebSocketTransport({
    ...DEFAULT_WEBSOCKET_CONFIG,
    ...wsConfig,
  });
  
  const fullConfig: McpClientConfig = {
    ...DEFAULT_CLIENT_CONFIG,
    ...clientConfig,
    transport,
  };
  
  return new McpClient(fullConfig);
}

// 🌊 SSE FACTORY (когда реализуем)
/**
 * 📡 Создать MCP клиент с SSE транспортом
 * 
 * 📝 TODO: Реализовать SSETransport
 */
export function createSSEClient(
  sseConfig: Partial<SSEConfig> & { url: string },
  clientConfig?: Partial<Omit<McpClientConfig, 'transport'>>
): IMcpClient {
  // TODO: Реализовать SSETransport
  throw new Error('SSE transport not implemented yet');
}

// 🏠 LOCAL FACTORY (для тестирования)
/**
 * 🖥️ Создать MCP клиент с локальным транспортом (для тестов)
 * 
 * 📝 TODO: Реализовать LocalTransport
 */
export function createLocalClient(
  localConfig: Partial<LocalConfig> & { serverName: string },
  clientConfig?: Partial<Omit<McpClientConfig, 'transport'>>
): IMcpClient {
  // TODO: Реализовать LocalTransport
  throw new Error('Local transport not implemented yet');
}

// 🎛️ PRESET CONFIGURATIONS
/**
 * 📋 Предустановленные конфигурации для типичных сценариев
 */

/**
 * 🚀 Быстрая настройка для разработки
 */
export function createDevelopmentClient(url: string): IMcpClient {
  return createWebSocketClient({
    url,
    autoReconnect: true,
    pingInterval: 10000, // 🔄 Частый ping для быстрого обнаружения разрывов
  }, {
    enableLogging: true,
    retryStrategy: {
      maxAttempts: 10,
      initialDelay: 500,
      maxDelay: 5000,
      backoffFactor: 1.5,
    },
  });
}

/**
 * 🏭 Настройка для production среды
 */
export function createProductionClient(url: string): IMcpClient {
  return createWebSocketClient({
    url,
    autoReconnect: true,
    pingInterval: 30000,
    pongTimeout: 10000,
  }, {
    enableLogging: false,
    retryStrategy: {
      maxAttempts: 5,
      initialDelay: 2000,
      maxDelay: 30000,
      backoffFactor: 2,
    },
    heartbeatInterval: 60000,
  });
}

/**
 * 🧪 Настройка для тестирования
 */
export function createTestClient(url: string): IMcpClient {
  return createWebSocketClient({
    url,
    autoReconnect: false, // 🚫 Не переподключаемся в тестах
    pingInterval: undefined, // 🚫 Отключаем ping в тестах
  }, {
    enableLogging: false,
    connectionTimeout: 5000, // ⏱️ Быстрый таймаут для тестов
  });
}

/**
 * 🔒 Настройка для secure окружения
 */
export function createSecureClient(
  url: string, 
  authToken: string
): IMcpClient {
  return createWebSocketClient({
    url,
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    autoReconnect: true,
    // 🛡️ SSL настройки будут добавлены когда реализуем
  }, {
    enableLogging: false,
  });
}

// 🎯 SPECIALIZED FACTORIES
/**
 * 🎨 Специализированные фабрики для конкретных use cases
 */

/**
 * 💬 Создать клиент для чат приложения
 */
export function createChatClient(url: string): IMcpClient {
  return createWebSocketClient({
    url,
    autoReconnect: true,
    pingInterval: 15000, // 💓 Частый heartbeat для real-time чата
    maxMessageSize: 50 * 1024, // 📝 Ограничение для чат сообщений
  }, {
    enableLogging: true,
    retryStrategy: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
    },
  });
}

/**
 * 📊 Создать клиент для аналитики/monitoring
 */
export function createAnalyticsClient(url: string): IMcpClient {
  return createWebSocketClient({
    url,
    autoReconnect: true,
    pingInterval: 60000, // 💓 Редкий heartbeat для аналитики
  }, {
    enableLogging: false,
    retryStrategy: {
      maxAttempts: 10, // 🔄 Много попыток для критически важных данных
      initialDelay: 5000,
      maxDelay: 60000,
      backoffFactor: 1.5,
    },
  });
}

/**
 * 🏃 Создать клиент для краткосрочных операций
 */
export function createEphemeralClient(url: string): IMcpClient {
  return createWebSocketClient({
    url,
    autoReconnect: false, // 🚫 Не переподключаемся
    pingInterval: undefined, // 🚫 Не нужен heartbeat
  }, {
    connectionTimeout: 10000,
    enableLogging: false,
  });
}

// 🔧 CONFIGURATION HELPERS
/**
 * 🛠️ Вспомогательные функции для конфигурации
 */

/**
 * 🌐 Определить тип URL и создать соответствующий клиент
 */
export function createClientFromUrl(
  url: string,
  options?: {
    type?: 'websocket' | 'sse' | 'auto';
    config?: Partial<McpClientConfig>;
  }
): IMcpClient {
  const type = options?.type || 'auto';
  
  if (type === 'auto') {
    // 🔍 Автоматическое определение по URL
    if (url.startsWith('ws://') || url.startsWith('wss://')) {
      return createWebSocketClient({ url }, options?.config);
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // TODO: Создать SSE клиент когда реализуем
      throw new Error('SSE client not implemented yet');
    } else {
      throw new Error(`Unsupported URL scheme: ${url}`);
    }
  }
  
  switch (type) {
    case 'websocket':
      return createWebSocketClient({ url }, options?.config);
    case 'sse':
      throw new Error('SSE client not implemented yet');
    default:
      throw new Error(`Unknown client type: ${type}`);
  }
}

/**
 * 📋 Создать клиент из JSON конфигурации
 */
export function createClientFromConfig(
  configJson: string | object
): IMcpClient {
  const config = typeof configJson === 'string' 
    ? JSON.parse(configJson) 
    : configJson;
  
  // 📝 TODO: Добавить валидацию конфигурации
  // 📝 TODO: Создать Transport из конфигурации
  
  throw new Error('createClientFromConfig not implemented yet');
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 FACTORY PATTERN BENEFITS:
 * 
 * ✅ **Упрощение создания объектов**:
 * - Инкапсулирует сложную логику инициализации
 * - Предоставляет простой API для типичных сценариев
 * - Скрывает детали реализации от пользователей
 * 
 * ✅ **Type Safety**:
 * - Compile-time проверка параметров
 * - Автокомплит в IDE
 * - Предотвращение ошибок конфигурации
 * 
 * ✅ **Повторное использование**:
 * - Стандартные конфигурации для разных environment
 * - Consistent настройки across приложения
 * - Easy testing с предустановленными моками
 */

/**
 * 🎯 USAGE PATTERNS:
 * 
 * 📋 **Simple Usage**:
 * ```typescript
 * const client = createWebSocketClient({ url: 'ws://localhost:3000' });
 * ```
 * 
 * 🎛️ **Advanced Configuration**:
 * ```typescript
 * const client = createWebSocketClient({
 *   url: 'wss://api.example.com/mcp',
 *   headers: { 'Authorization': 'Bearer token' }
 * }, {
 *   retryStrategy: RETRY_STRATEGIES.aggressive
 * });
 * ```
 * 
 * 🚀 **Environment-specific**:
 * ```typescript
 * const client = process.env.NODE_ENV === 'production'
 *   ? createProductionClient(url)
 *   : createDevelopmentClient(url);
 * ```
 */

/**
 * 🔄 EXTENSION PATTERNS:
 * 
 * 🏭 **Custom Factories**:
 * Можно создавать специализированные фабрики для конкретных доменов:
 * 
 * ```typescript
 * export function createGameClient(url: string) {
 *   return createWebSocketClient({
 *     url,
 *     pingInterval: 1000, // Высокая частота для игр
 *   }, {
 *     retryStrategy: RETRY_STRATEGIES.aggressive
 *   });
 * }
 * ```
 * 
 * 🎨 **Plugin System**:
 * В будущем можно добавить plugin архитектуру:
 * 
 * ```typescript
 * const client = createWebSocketClient(config)
 *   .use(loggingPlugin)
 *   .use(metricsPlugin)
 *   .use(authPlugin);
 * ```
 */

export default {
  createMcpClient,
  createWebSocketClient,
  createSSEClient,
  createLocalClient,
  createDevelopmentClient,
  createProductionClient,
  createTestClient,
  createSecureClient,
  createChatClient,
  createAnalyticsClient,
  createEphemeralClient,
  createClientFromUrl,
  createClientFromConfig,
};