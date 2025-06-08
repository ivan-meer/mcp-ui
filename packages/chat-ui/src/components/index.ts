/**
 * 📦 CHAT UI COMPONENTS BARREL EXPORT
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Barrel export позволяет импортировать все компоненты из одного места.
 * Это упрощает импорты и делает API пакета более чистым.
 * 
 * 🎯 ПРЕИМУЩЕСТВА BARREL EXPORTS:
 * 1. Единая точка входа для всех компонентов
 * 2. Легче рефакторить внутреннюю структуру пакета
 * 3. Более чистые импорты в потребляющем коде
 * 4. Лучшая поддержка tree-shaking в современных бандлерах
 * 
 * 🔄 ПРИМЕР ИСПОЛЬЗОВАНИЯ:
 * import { ChatWindow, MessageList, MessageInput } from '@mcp-ui/chat-ui';
 * 
 * вместо:
 * import ChatWindow from '@mcp-ui/chat-ui/ChatWindow';
 * import MessageList from '@mcp-ui/chat-ui/MessageList';
 * import MessageInput from '@mcp-ui/chat-ui/MessageInput';
 */

// 💬 ОСНОВНЫЕ КОМПОНЕНТЫ ЧАТА
export { default as ChatWindow } from './ChatWindow';
export type { ChatWindowProps } from './ChatWindow';

export { default as MessageList } from './MessageList';
export type { MessageListProps } from './MessageList';

export { default as MessageInput } from './MessageInput';
export type { 
  MessageInputProps, 
  MessageInputRef,
  MCPTool,
  FileAttachment 
} from './MessageInput';

// 📝 TODO: Будущие компоненты для экспорта
// export { default as Message } from './Message';
// export { default as ServerSidebar } from './ServerSidebar';
// export { default as UIRenderer } from './UIRenderer';
// export { default as FileManager } from './FileManager';

/**
 * 🎨 CONVENIENCE EXPORTS
 * 
 * 📚 Экспортируем все типы из types/index.ts для удобства
 * Это позволяет импортировать типы и компоненты из одного места
 */
export type {
  // Core message types
  Message,
  MessageType,
  MessageStatus,
  MessageMetadata,
  MessageError,
  
  // Configuration types
  ChatWindowConfig,
  MessageInputConfig,
  
  // Event types
  ChatEvent,
  ChatEventData,
  UIAction,
  
  // Utility types
  CreateMessageInput,
  UpdateMessageInput,
  MessageFilters,
  ChatStats,
  
  // Theme types
  ChatColorScheme,
  ChatTheme,
} from '../types';

/**
 * 🎛️ CONFIGURATION EXPORTS
 * 
 * 📚 Экспортируем константы конфигурации по умолчанию
 */
export {
  DEFAULT_CHAT_CONFIG,
  DEFAULT_INPUT_CONFIG,
  CHAT_TIMEOUTS,
  CHAT_LIMITS,
} from '../types';

/**
 * 🎯 HOOKS (БУДУЩИЕ)
 * 
 * 📝 TODO: Добавить custom hooks для работы с чатом
 * export { useChat } from '../hooks/useChat';
 * export { useMessages } from '../hooks/useMessages';
 * export { useMessageInput } from '../hooks/useMessageInput';
 * export { useChatEvents } from '../hooks/useChatEvents';
 */

/**
 * 🛠️ UTILITIES (БУДУЩИЕ)
 * 
 * 📝 TODO: Добавить утилиты для работы с сообщениями
 * export { formatMessage } from '../utils/messageUtils';
 * export { validateMessage } from '../utils/validation';
 * export { groupMessages } from '../utils/grouping';
 */

// 🔧 ОБРАЗОВАТЕЛЬНЫЕ КОММЕНТАРИИ:

/**
 * 🎓 BARREL EXPORT BEST PRACTICES:
 * 
 * 1. 📦 Группируйте экспорты логически
 *    - Основные компоненты
 *    - Типы и интерфейсы  
 *    - Константы и конфигурация
 *    - Hooks и утилиты
 * 
 * 2. 🎯 Используйте named exports вместо default
 *    - Лучше для tree-shaking
 *    - Более явный API
 *    - Легче рефакторить
 * 
 * 3. 📝 Документируйте что экспортируется
 *    - Пользователи должны понимать что доступно
 *    - Помогает с автокомплитом в IDE
 * 
 * 4. 🔄 Планируйте будущие экспорты
 *    - Оставляйте комментарии TODO
 *    - Думайте об обратной совместимости
 * 
 * 5. ⚡ Оптимизируйте для производительности
 *    - Избегайте re-exports всего подряд
 *    - Экспортируйте только то что нужно пользователям
 */

/**
 * 🎨 КОНВЕНЦИИ ИМЕНОВАНИЯ:
 * 
 * - 🏗️ Компоненты: PascalCase (ChatWindow, MessageList)
 * - 📝 Типы: PascalCase с суффиксом (ChatWindowProps, MessageType)
 * - 🎛️ Константы: UPPER_SNAKE_CASE (DEFAULT_CHAT_CONFIG)
 * - 🪝 Hooks: camelCase с префиксом use (useChat, useMessages)
 * - 🛠️ Утилиты: camelCase (formatMessage, validateInput)
 */

/**
 * 🚀 TREE-SHAKING OPTIMIZATION:
 * 
 * Современные бандлеры (Webpack, Vite, Rollup) автоматически удаляют
 * неиспользуемые экспорты из barrel файлов, если:
 * 
 * 1. Используются ES modules (import/export)
 * 2. Пакет помечен как "sideEffects": false в package.json
 * 3. Экспорты являются named exports (не default)
 * 4. Нет побочных эффектов при импорте модулей
 */