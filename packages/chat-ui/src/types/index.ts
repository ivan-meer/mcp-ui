/**
 * 💬 CHAT UI TYPES DEFINITIONS
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Этот файл содержит все TypeScript типы для чат интерфейса.
 * Строгая типизация помогает избежать runtime ошибок и улучшает DX.
 * 
 * 🎯 Принципы именования:
 * - Интерфейсы начинаются с большой буквы
 * - Enums используют PascalCase
 * - Union types для ограниченных наборов значений
 * - Generic types для переиспользования
 */

import { HtmlResourceBlock } from '@mcp-ui/shared';

// 🎭 MESSAGE TYPES AND INTERFACES

/**
 * 📝 Типы сообщений в чате
 * 
 * 🔍 ОБРАЗОВАТЕЛЬНЫЙ МОМЕНТ:
 * Используем union types вместо enum для лучшей совместимости с JSON
 * и более гибкой сериализации/десериализации
 */
export type MessageType = 
  | 'user'        // 👤 Сообщение от пользователя
  | 'assistant'   // 🤖 Ответ от MCP сервера/ассистента  
  | 'system'      // ⚙️ Системные уведомления
  | 'ui-component' // 🎨 UI компоненты (HtmlResourceBlock)
  | 'error';      // ❌ Ошибки и исключения

/**
 * 📊 Статусы сообщений
 * 
 * 💡 ТЕХНИЧЕСКАЯ ЗАМЕТКА:
 * Статусы помогают показывать состояние обработки сообщения
 * и предоставляют обратную связь пользователю
 */
export type MessageStatus = 
  | 'sending'     // ⏳ Отправляется на сервер
  | 'sent'        // ✅ Успешно отправлено
  | 'delivered'   // 📬 Доставлено серверу  
  | 'failed'      // ❌ Ошибка отправки
  | 'processing'  // 🔄 Обрабатывается сервером
  | 'completed'; // ✨ Обработка завершена

/**
 * 💬 Основной интерфейс сообщения
 * 
 * 🎯 АРХИТЕКТУРНОЕ РЕШЕНИЕ:
 * Используем универсальную структуру для всех типов сообщений.
 * Контент может быть строкой (текст) или HtmlResourceBlock (UI компонент)
 */
export interface Message {
  /** 🆔 Уникальный идентификатор сообщения */
  id: string;
  
  /** 📝 Тип сообщения */
  type: MessageType;
  
  /** 📄 Содержимое сообщения */
  content: string | HtmlResourceBlock;
  
  /** ⏰ Время создания сообщения */
  timestamp: Date;
  
  /** 📊 Текущий статус сообщения */
  status: MessageStatus;
  
  /** 🏷️ ID сервера, от которого пришло сообщение */
  serverId?: string;
  
  /** 🏷️ Имя сервера для отображения */
  serverName?: string;
  
  /** 📋 Метаданные сообщения */
  metadata?: MessageMetadata;
  
  /** ❌ Информация об ошибке (если есть) */
  error?: MessageError;
}

/**
 * 📋 Метаданные сообщения
 * 
 * 🔧 РАСШИРЯЕМОСТЬ:
 * Используем Record для возможности добавления произвольных метаданных
 * без изменения основного интерфейса
 */
export interface MessageMetadata {
  /** 🔧 Инструмент, который был вызван */
  toolName?: string;
  
  /** ⚡ Время выполнения запроса (мс) */
  executionTime?: number;
  
  /** 📊 Размер ответа (байты) */
  responseSize?: number;
  
  /** 🎭 Кастомные поля */
  [key: string]: unknown;
}

/**
 * ❌ Информация об ошибке
 */
export interface MessageError {
  /** 📝 Текст ошибки */
  message: string;
  
  /** 🏷️ Код ошибки */
  code?: string;
  
  /** 📚 Детали ошибки */
  details?: Record<string, unknown>;
  
  /** 📍 Stack trace (только для разработки) */
  stack?: string;
}

// 🎨 CHAT INTERFACE TYPES

/**
 * 💬 Конфигурация чат окна
 * 
 * 🎛️ КАСТОМИЗАЦИЯ:
 * Позволяет настраивать внешний вид и поведение чата
 */
export interface ChatWindowConfig {
  /** 📏 Показывать ли временные метки */
  showTimestamps?: boolean;
  
  /** 👤 Показывать ли аватары */
  showAvatars?: boolean;
  
  /** 🏷️ Показывать ли имена серверов */
  showServerNames?: boolean;
  
  /** ⚡ Автоматическая прокрутка к новым сообщениям */
  autoScroll?: boolean;
  
  /** 📱 Компактный режим для мобильных устройств */
  compactMode?: boolean;
  
  /** 🎨 Тема оформления */
  theme?: 'dark' | 'light' | 'auto';
  
  /** 📏 Максимальная высота чата */
  maxHeight?: string;
  
  /** 🔤 Размер шрифта */
  fontSize?: 'small' | 'medium' | 'large';
}

/**
 * ⌨️ Конфигурация поля ввода
 */
export interface MessageInputConfig {
  /** 📝 Placeholder текст */
  placeholder?: string;
  
  /** 📏 Максимальная длина сообщения */
  maxLength?: number;
  
  /** ↩️ Отправка по Enter */
  submitOnEnter?: boolean;
  
  /** 🔧 Показывать доступные инструменты */
  showTools?: boolean;
  
  /** 📎 Поддержка файлов */
  allowFileUpload?: boolean;
  
  /** 🎭 Эмодзи пикер */
  showEmojiPicker?: boolean;
  
  /** 💡 Автокомплит команд */
  enableAutocomplete?: boolean;
}

// 🎭 EVENT TYPES

/**
 * ⚡ События чата
 * 
 * 🔄 EVENT-DRIVEN ARCHITECTURE:
 * Используем события для связи между компонентами без прямых зависимостей
 */
export type ChatEvent = 
  | 'message-send'      // 📤 Отправка сообщения
  | 'message-receive'   // 📥 Получение сообщения
  | 'message-edit'      // ✏️ Редактирование сообщения
  | 'message-delete'    // 🗑️ Удаление сообщения
  | 'typing-start'      // ⌨️ Начало печати
  | 'typing-stop'       // ⌨️ Окончание печати
  | 'server-connect'    // 🔌 Подключение к серверу
  | 'server-disconnect' // 🔌 Отключение от сервера
  | 'ui-action';        // 🎯 Действие в UI компоненте

/**
 * 📊 Данные события чата
 */
export interface ChatEventData {
  /** ⚡ Тип события */
  type: ChatEvent;
  
  /** 📊 Полезная нагрузка события */
  payload: Record<string, unknown>;
  
  /** ⏰ Время события */
  timestamp: Date;
  
  /** 🆔 ID источника события */
  sourceId?: string;
}

// 🎯 UI ACTION TYPES

/**
 * 🎯 Действия в UI компонентах
 * 
 * 💡 ИНТЕРАКТИВНОСТЬ:
 * UI компоненты могут отправлять события обратно в чат
 * для выполнения действий или запуска новых инструментов
 */
export interface UIAction {
  /** 🎯 Тип действия */
  type: string;
  
  /** 📊 Данные действия */
  data?: Record<string, unknown>;
  
  /** 🆔 ID компонента, который отправил действие */
  componentId?: string;
  
  /** 🏷️ Человеко-читаемое описание действия */
  description?: string;
}

// 🔧 UTILITY TYPES

/**
 * 📝 Тип для создания нового сообщения
 * 
 * 🛠️ UTILITY TYPE:
 * Omit убирает поля, которые генерируются автоматически
 */
export type CreateMessageInput = Omit<Message, 'id' | 'timestamp' | 'status'> & {
  /** 📊 Предварительный статус (по умолчанию 'sending') */
  status?: MessageStatus;
};

/**
 * ✏️ Тип для обновления существующего сообщения
 */
export type UpdateMessageInput = Partial<Pick<Message, 'content' | 'status' | 'metadata' | 'error'>>;

/**
 * 🔍 Фильтры для поиска сообщений
 */
export interface MessageFilters {
  /** 📝 Тип сообщений */
  type?: MessageType | MessageType[];
  
  /** 🏷️ ID сервера */
  serverId?: string;
  
  /** 📊 Статус сообщений */
  status?: MessageStatus | MessageStatus[];
  
  /** 📅 Диапазон дат */
  dateRange?: {
    from: Date;
    to: Date;
  };
  
  /** 🔍 Поиск по тексту */
  searchText?: string;
}

/**
 * 📊 Статистика чата
 */
export interface ChatStats {
  /** 📊 Общее количество сообщений */
  totalMessages: number;
  
  /** 👤 Сообщения от пользователя */
  userMessages: number;
  
  /** 🤖 Сообщения от ассистента */
  assistantMessages: number;
  
  /** 🎨 UI компоненты */
  uiComponents: number;
  
  /** ❌ Ошибки */
  errors: number;
  
  /** ⏱️ Среднее время ответа (мс) */
  averageResponseTime: number;
  
  /** 📅 Последняя активность */
  lastActivity: Date;
}

// 🎨 THEME TYPES

/**
 * 🎨 Цветовая схема чата
 */
export interface ChatColorScheme {
  /** 🌙 Фоновые цвета */
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  
  /** 📝 Цвета текста */
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  
  /** 🎯 Акцентные цвета */
  accent: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  /** 🔲 Цвета границ */
  border: {
    primary: string;
    secondary: string;
    muted: string;
    focus: string;
  };
  
  /** 💬 Цвета сообщений */
  message: {
    user: string;
    assistant: string;
    system: string;
    ui: string;
  };
}

/**
 * 🎭 Тема оформления
 */
export interface ChatTheme {
  /** 🏷️ Название темы */
  name: string;
  
  /** 🌙 Режим темы */
  mode: 'light' | 'dark';
  
  /** 🎨 Цветовая схема */
  colors: ChatColorScheme;
  
  /** 🔤 Типографика */
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  
  /** 📏 Отступы и размеры */
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  
  /** 🎭 Анимации */
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// 📚 ОБРАЗОВАТЕЛЬНЫЕ ЭКСПОРТЫ
// Экспортируем все типы для использования в других пакетах

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
};

// 🔧 DEFAULT VALUES AND CONSTANTS

/**
 * 🎯 Константы по умолчанию
 */
export const DEFAULT_CHAT_CONFIG: ChatWindowConfig = {
  showTimestamps: true,
  showAvatars: true,
  showServerNames: true,
  autoScroll: true,
  compactMode: false,
  theme: 'dark', // 🌙 Темная тема по умолчанию
  maxHeight: '600px',
  fontSize: 'medium',
};

export const DEFAULT_INPUT_CONFIG: MessageInputConfig = {
  placeholder: 'Введите сообщение...',
  maxLength: 4000,
  submitOnEnter: true,
  showTools: true,
  allowFileUpload: false,
  showEmojiPicker: false,
  enableAutocomplete: true,
};

/**
 * ⏱️ Таймауты и интервалы
 */
export const CHAT_TIMEOUTS = {
  TYPING_INDICATOR: 3000,    // 3 секунды
  MESSAGE_RETRY: 5000,       // 5 секунд
  CONNECTION_TIMEOUT: 10000, // 10 секунд
  AUTO_SCROLL_DELAY: 100,    // 100мс
} as const;

/**
 * 📏 Лимиты
 */
export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_MESSAGES_IN_MEMORY: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_CONCURRENT_REQUESTS: 5,
} as const;

// 🎯 СЛЕДУЮЩИЕ ШАГИ:
// TODO: Добавить типы для voice messages
// TODO: Реализовать типы для collaborative editing
// FIXME: Уточнить типы для file attachments
// HACK: Временно используем Record<string, unknown> для metadata