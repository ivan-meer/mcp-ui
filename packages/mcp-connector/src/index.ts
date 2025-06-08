/**
 * 🔌 MCP CONNECTOR PACKAGE
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Этот пакет предоставляет клиент для подключения к MCP серверам через различные транспорты.
 * Поддерживает WebSocket и SSE для real-time коммуникации.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Transport Abstraction - единый интерфейс для разных типов подключений
 * 2. Event-driven Communication - Observable pattern для real-time событий
 * 3. Type Safety - строгая типизация для всех MCP операций
 * 4. Error Recovery - автоматическое переподключение и обработка ошибок
 */

// 📦 CORE EXPORTS
export { McpClient } from './client/McpClient';
export { WebSocketTransport, WebSocketConfig } from './transports/WebSocketTransport'; // Assuming WebSocketConfig is also desired here if following pattern
export { LocalTransport, LocalTransportConfig } from './transports/LocalTransport';
export { SSETransport, SSETransportConfig } from './transports/SSETransport';

// 🎯 TYPE EXPORTS
export type {
  McpClientConfig,
  McpClientEvents,
  McpConnectionStatus,
  McpMessage,
  McpRequest,
  McpResponse,
  McpNotification,
  McpError,
} from './types/client';

export type {
  TransportConfig,
  Transport,
  TransportEvents,
  TransportStatus,
  WebSocketConfig,
  SSEConfig,
  LocalConfig,
} from './types/transport';

export type {
  McpServer,
  McpServerConfig,
  McpTool,
  McpResource,
  McpPrompt,
} from './types/server';

// 🛠️ UTILITY EXPORTS
export { createMcpClient } from './utils/factory';
export { validateMcpMessage } from './utils/validation';
export { McpClientError } from './utils/errors';

// 🎨 CONSTANT EXPORTS
export {
  MCP_PROTOCOL_VERSION,
  DEFAULT_CLIENT_CONFIG,
  DEFAULT_TRANSPORT_CONFIG,
  CONNECTION_TIMEOUTS,
  RETRY_STRATEGIES,
} from './constants';

/**
 * 🎓 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА - BARREL EXPORTS:
 * 
 * Этот файл служит единой точкой входа в пакет. Преимущества:
 * 
 * ✅ Чистый API - пользователи импортируют из одного места
 * ✅ Гибкость - можем менять внутреннюю структуру без breaking changes
 * ✅ Tree-shaking - современные бандлеры оптимизируют неиспользуемые импорты
 * ✅ Инкапсуляция - скрываем внутренние детали реализации
 * 
 * 📝 USAGE EXAMPLE:
 * ```typescript
 * import { McpClient, WebSocketTransport, createMcpClient } from '@mcp-ui/mcp-connector';
 * 
 * const client = createMcpClient({
 *   transport: new WebSocketTransport({ url: 'ws://localhost:3000' }),
 *   autoReconnect: true,
 * });
 * ```
 */

// 🔧 СЛЕДУЮЩИЕ ШАГИ:
// TODO: Добавить support для HTTP transport
// TODO: Реализовать connection pooling для множественных серверов
// TODO: Добавить middleware система для pre/post processing
// FIXME: Улучшить error recovery механизмы
// HACK: Временная реализация retry logic, нужна более sophisticated стратегия