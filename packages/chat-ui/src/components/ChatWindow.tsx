/**
 * 💬 CHAT WINDOW COMPONENT
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Главный компонент чат интерфейса. Объединяет MessageList и MessageInput,
 * управляет состоянием сообщений и взаимодействием с MCP серверами.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Compound Component Pattern - MessageList и MessageInput как дети
 * 2. Controlled Component - состояние управляется родителем
 * 3. Event-driven Communication - использует callbacks для уведомлений
 * 4. Responsive Design - адаптируется под разные размеры экрана
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Message, 
  MessageType, 
  MessageStatus,
  ChatWindowConfig, 
  ChatEvent,
  ChatEventData,
  CreateMessageInput,
  DEFAULT_CHAT_CONFIG,
  CHAT_TIMEOUTS 
} from '../types';

// 📦 ПРОПСЫ КОМПОНЕНТА
interface ChatWindowProps {
  /** 💬 Массив сообщений для отображения */
  messages: Message[];
  
  /** ⚡ Callback для отправки нового сообщения */
  onSendMessage: (content: string) => void;
  
  /** 🎯 Callback для событий чата (опционально) */
  onChatEvent?: (event: ChatEventData) => void;
  
  /** 🎛️ Конфигурация чат окна */
  config?: Partial<ChatWindowConfig>;
  
  /** 📶 Состояние подключения к серверу */
  connectionStatus?: 'connected' | 'disconnected' | 'connecting' | 'error';
  
  /** 🏷️ Активный сервер */
  activeServer?: {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'error';
  };
  
  /** ⌨️ Показать индикатор печати */
  isTyping?: boolean;
  
  /** 🔄 Показать индикатор загрузки */
  isLoading?: boolean;
  
  /** 📏 Кастомные CSS классы */
  className?: string;
  
  /** 🎭 Кастомные стили */
  style?: React.CSSProperties;
}

/**
 * 💬 Основной компонент чат окна
 * 
 * 🎯 ФУНКЦИОНАЛЬНОСТЬ:
 * - Отображение списка сообщений
 * - Поле ввода новых сообщений
 * - Автоматическая прокрутка к новым сообщениям
 * - Индикаторы состояния (печать, загрузка, подключение)
 * - Responsive дизайн для мобильных устройств
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  onChatEvent,
  config = {},
  connectionStatus = 'disconnected',
  activeServer,
  isTyping = false,
  isLoading = false,
  className,
  style,
}) => {
  // 🎛️ Объединяем пользовательскую конфигурацию с дефолтной
  const mergedConfig = { ...DEFAULT_CHAT_CONFIG, ...config };
  
  // 📝 Локальное состояние компонента
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // 📍 Refs для управления прокруткой и фокусом
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // 🔄 Автоматическая прокрутка к новым сообщениям
  const scrollToBottom = useCallback(() => {
    if (mergedConfig.autoScroll && messagesEndRef.current) {
      // ⚡ Используем requestAnimationFrame для плавной прокрутки
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      });
    }
  }, [mergedConfig.autoScroll]);
  
  // 📊 Автоматическая прокрутка при новых сообщениях
  useEffect(() => {
    // ⏱️ Небольшая задержка для обновления DOM
    const timeoutId = setTimeout(scrollToBottom, CHAT_TIMEOUTS.AUTO_SCROLL_DELAY);
    return () => clearTimeout(timeoutId);
  }, [messages.length, scrollToBottom]);
  
  // ⚡ Обработчик отправки сообщения
  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    // 🔄 Отправляем сообщение родительскому компоненту
    onSendMessage(content.trim());
    
    // 📊 Отправляем событие чата (если есть обработчик)
    if (onChatEvent) {
      const eventData: ChatEventData = {
        type: 'message-send',
        payload: { content: content.trim() },
        timestamp: new Date(),
        sourceId: 'chat-window',
      };
      onChatEvent(eventData);
    }
    
    // 🧹 Очищаем поле ввода
    setInputValue('');
    
    // 🎯 Возвращаем фокус на поле ввода
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onSendMessage, onChatEvent]);
  
  // ⌨️ Обработчик клавиатурных событий
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // ↩️ Enter для отправки (если не зажат Shift)
    if (event.key === 'Enter' && !event.shiftKey && mergedConfig.submitOnEnter) {
      event.preventDefault();
      handleSendMessage(inputValue);
    }
  }, [handleSendMessage, inputValue, mergedConfig.submitOnEnter]);
  
  // 🎨 Динамические CSS классы на основе состояния
  const chatWindowClasses = clsx(
    // 🏗️ Базовые стили контейнера
    'flex flex-col h-full bg-bg-primary border border-border-primary rounded-lg',
    'shadow-lg overflow-hidden transition-all duration-300',
    
    // 🌙 Темная тема стили
    'dark:bg-bg-primary dark:border-border-primary',
    
    // 📱 Responsive поведение
    {
      'max-w-sm mx-auto': mergedConfig.compactMode, // Компактный режим для мобильных
      'min-h-[400px]': !mergedConfig.compactMode,   // Минимальная высота для десктопа
    },
    
    // 📶 Стили в зависимости от состояния подключения
    {
      'ring-2 ring-accent-success ring-opacity-50': connectionStatus === 'connected',
      'ring-2 ring-accent-error ring-opacity-50': connectionStatus === 'error',
      'ring-2 ring-accent-warning ring-opacity-50': connectionStatus === 'connecting',
    },
    
    // 🎭 Пользовательские классы
    className
  );
  
  // 🎨 Стили для контейнера сообщений
  const messagesContainerClasses = clsx(
    'flex-1 overflow-y-auto p-4 space-y-3',
    'custom-scrollbar', // Кастомная прокрутка из globals.css
    {
      'space-y-2': mergedConfig.compactMode, // Меньше отступов в компактном режиме
    }
  );
  
  // 🎨 Стили для поля ввода
  const inputContainerClasses = clsx(
    'border-t border-border-primary bg-bg-secondary p-4',
    'transition-all duration-200',
    {
      'bg-bg-elevated': isInputFocused, // Подсветка при фокусе
    }
  );
  
  return (
    <div 
      ref={chatContainerRef}
      className={chatWindowClasses}
      style={{ ...style, maxHeight: mergedConfig.maxHeight }}
      role="main"
      aria-label="Чат с MCP сервером"
    >
      {/* 📊 HEADER - Статус подключения и информация о сервере */}
      {(activeServer || connectionStatus !== 'connected') && (
        <div className="bg-bg-secondary border-b border-border-primary px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 🏷️ Информация о сервере */}
            {activeServer && (
              <div className="flex items-center space-x-3">
                {/* 📡 Индикатор статуса сервера */}
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  {
                    'bg-accent-success': activeServer.status === 'online',
                    'bg-accent-error': activeServer.status === 'error',
                    'bg-accent-warning': activeServer.status === 'offline',
                  }
                )} />
                <span className="text-text-primary font-medium">
                  {activeServer.name}
                </span>
              </div>
            )}
            
            {/* 📶 Статус подключения */}
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connecting' && (
                <div className="animate-spin w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full" />
              )}
              <span className={clsx(
                'text-sm',
                {
                  'text-accent-success': connectionStatus === 'connected',
                  'text-accent-error': connectionStatus === 'error',
                  'text-accent-warning': connectionStatus === 'connecting',
                  'text-text-muted': connectionStatus === 'disconnected',
                }
              )}>
                {connectionStatus === 'connected' && '🟢 Подключен'}
                {connectionStatus === 'connecting' && '🟡 Подключение...'}
                {connectionStatus === 'error' && '🔴 Ошибка'}
                {connectionStatus === 'disconnected' && '⚫ Отключен'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 💬 MESSAGES CONTAINER */}
      <div className={messagesContainerClasses}>
        {/* 📝 Отображение сообщений */}
        {messages.length === 0 ? (
          // 🌟 Empty state - когда нет сообщений
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-text-primary text-lg font-medium mb-2">
              Начните общение
            </h3>
            <p className="text-text-muted max-w-md">
              Отправьте сообщение, чтобы начать взаимодействие с MCP сервером
            </p>
          </div>
        ) : (
          // 📊 Список сообщений
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              config={mergedConfig}
              onMessageEvent={onChatEvent}
            />
          ))
        )}
        
        {/* ⌨️ Индикатор печати */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-text-muted">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Печатает...</span>
          </div>
        )}
        
        {/* 📍 Маркер для автоматической прокрутки */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* ⌨️ INPUT CONTAINER */}
      <div className={inputContainerClasses}>
        <div className="flex items-end space-x-3">
          {/* 📝 Поле ввода сообщения */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={mergedConfig.placeholder || 'Введите сообщение...'}
              className={clsx(
                'w-full resize-none bg-bg-tertiary border border-border-muted rounded-lg',
                'px-4 py-3 text-text-primary placeholder-text-muted',
                'focus:border-border-focus focus:bg-bg-secondary focus:outline-none',
                'transition-all duration-200 max-h-32',
                {
                  'text-sm': mergedConfig.fontSize === 'small',
                  'text-base': mergedConfig.fontSize === 'medium',
                  'text-lg': mergedConfig.fontSize === 'large',
                }
              )}
              rows={1}
              style={{
                minHeight: '44px', // Минимальная высота для touch targets
                scrollbarWidth: 'thin',
              }}
              disabled={isLoading || connectionStatus !== 'connected'}
              maxLength={4000} // Лимит символов
              aria-label="Поле ввода сообщения"
            />
            
            {/* 📊 Счетчик символов (показываем при приближении к лимиту) */}
            {inputValue.length > 3500 && (
              <div className={clsx(
                'absolute bottom-1 right-2 text-xs',
                {
                  'text-text-muted': inputValue.length < 3800,
                  'text-accent-warning': inputValue.length >= 3800 && inputValue.length < 3950,
                  'text-accent-error': inputValue.length >= 3950,
                }
              )}>
                {inputValue.length}/4000
              </div>
            )}
          </div>
          
          {/* 📤 Кнопка отправки */}
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading || connectionStatus !== 'connected'}
            className={clsx(
              'bg-accent-primary hover:bg-blue-600 disabled:bg-bg-hover',
              'text-white disabled:text-text-muted rounded-lg px-4 py-3',
              'transition-all duration-200 flex items-center justify-center',
              'min-w-[44px] h-[44px]', // Минимальный размер для touch targets
              'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50'
            )}
            aria-label="Отправить сообщение"
          >
            {isLoading ? (
              // 🔄 Спиннер загрузки
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              // ➤ Иконка отправки
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                />
              </svg>
            )}
          </button>
        </div>
        
        {/* 💡 Подсказки пользователю */}
        {mergedConfig.submitOnEnter && (
          <div className="mt-2 text-xs text-text-muted">
            <kbd className="px-1 bg-bg-hover rounded text-xs">Enter</kbd> для отправки, 
            <kbd className="px-1 bg-bg-hover rounded text-xs ml-1">Shift+Enter</kbd> для новой строки
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 💭 MESSAGE BUBBLE COMPONENT
 * 
 * 📚 Отдельный компонент для отображения одного сообщения
 * Вынесен в отдельную функцию для лучшей производительности и читаемости
 */
interface MessageBubbleProps {
  message: Message;
  config: ChatWindowConfig;
  onMessageEvent?: (event: ChatEventData) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  config, 
  onMessageEvent 
}) => {
  // 🎨 Стили в зависимости от типа сообщения
  const bubbleClasses = clsx(
    'max-w-[80%] rounded-lg px-4 py-3 relative group',
    'animate-fade-in', // Анимация появления из globals.css
    {
      // 👤 Сообщения пользователя (справа, синие)
      'bg-chat-user text-white ml-auto message-user': message.type === 'user',
      
      // 🤖 Сообщения ассистента (слева, серые)
      'bg-bg-secondary text-text-primary mr-auto message-assistant': message.type === 'assistant',
      
      // ⚙️ Системные сообщения (по центру, приглушенные)
      'bg-bg-tertiary text-text-secondary mx-auto message-system text-center': message.type === 'system',
      
      // 🎨 UI компоненты (полная ширина)
      'bg-bg-elevated border border-border-primary max-w-full': message.type === 'ui-component',
      
      // ❌ Сообщения об ошибках
      'bg-accent-error text-white mr-auto': message.type === 'error',
    }
  );
  
  // ⏰ Форматирование времени
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div className="flex flex-col space-y-1">
      {/* 💬 Основное сообщение */}
      <div className={bubbleClasses}>
        {/* 🏷️ Заголовок сообщения (сервер + статус) */}
        {(message.serverName || message.status !== 'completed') && (
          <div className="flex items-center justify-between mb-2 text-xs opacity-75">
            {message.serverName && (
              <span className="font-medium">{message.serverName}</span>
            )}
            {message.status !== 'completed' && (
              <MessageStatusIndicator status={message.status} />
            )}
          </div>
        )}
        
        {/* 📄 Содержимое сообщения */}
        <div className="whitespace-pre-wrap">
          {typeof message.content === 'string' ? (
            // 📝 Текстовое сообщение
            <span className="break-words">{message.content}</span>
          ) : (
            // 🎨 UI компонент (будет реализован позже)
            <div className="text-accent-info">
              🎨 UI Component: {message.content.uri}
              {/* TODO: Здесь будет UIRenderer компонент */}
            </div>
          )}
        </div>
        
        {/* ❌ Отображение ошибки */}
        {message.error && (
          <div className="mt-2 p-2 bg-accent-error bg-opacity-20 rounded text-accent-error text-xs">
            <div className="font-medium">Ошибка: {message.error.message}</div>
            {message.error.code && (
              <div className="opacity-75">Код: {message.error.code}</div>
            )}
          </div>
        )}
      </div>
      
      {/* ⏰ Временная метка */}
      {config.showTimestamps && (
        <div className={clsx(
          'text-xs text-text-muted px-1',
          {
            'text-right': message.type === 'user',
            'text-left': message.type === 'assistant' || message.type === 'error',
            'text-center': message.type === 'system',
          }
        )}>
          {formatTime(message.timestamp)}
          {message.metadata?.executionTime && (
            <span className="ml-2 opacity-75">
              ({message.metadata.executionTime}ms)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 📊 MESSAGE STATUS INDICATOR
 * 
 * 🎯 Показывает текущий статус обработки сообщения
 */
interface MessageStatusIndicatorProps {
  status: MessageStatus;
}

const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    sending: { icon: '⏳', text: 'Отправка...', color: 'text-accent-warning' },
    sent: { icon: '✓', text: 'Отправлено', color: 'text-accent-success' },
    delivered: { icon: '✓✓', text: 'Доставлено', color: 'text-accent-success' },
    failed: { icon: '❌', text: 'Ошибка', color: 'text-accent-error' },
    processing: { icon: '🔄', text: 'Обработка...', color: 'text-accent-info' },
    completed: { icon: '✅', text: 'Готово', color: 'text-accent-success' },
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={clsx('flex items-center space-x-1', config.color)}>
      <span className={status === 'processing' ? 'animate-spin' : ''}>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
};

// 🎯 ЭКСПОРТЫ
export default ChatWindow;

// 📚 ОБРАЗОВАТЕЛЬНЫЕ ЭКСПОРТЫ
export type { ChatWindowProps, MessageBubbleProps };

// 🔧 СЛЕДУЮЩИЕ ШАГИ:
// TODO: Добавить поддержку drag & drop для файлов
// TODO: Реализовать контекстное меню для сообщений (копировать, удалить)
// TODO: Добавить поддержку markdown рендеринга в сообщениях
// TODO: Реализовать виртуализацию для больших списков сообщений
// FIXME: Добавить debouncing для автоматической прокрутки
// HACK: Временно используем простые иконки, позже заменим на Lucide React