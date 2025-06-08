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

import React, { useCallback, useRef, useEffect } from 'react'; // Removed useState
import { clsx } from 'clsx';
import { 
  Message,
  // MessageType, // No longer needed directly here
  // MessageStatus, // No longer needed directly here
  ChatWindowConfig, 
  // ChatEvent, // No longer needed directly here
  ChatEventData,
  // CreateMessageInput, // No longer needed directly here
  DEFAULT_CHAT_CONFIG,
  CHAT_TIMEOUTS 
} from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

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
 * - Отображение списка сообщений (через MessageList)
 * - Поле ввода новых сообщений (через MessageInput)
 * - Автоматическая прокрутка к новым сообщениям (в MessageList)
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
  
  // 📝 Локальное состояние компонента - inputValue и isInputFocused теперь в MessageInput
  // 📍 Refs для управления прокруткой и фокусом - messagesEndRef в MessageList, inputRef в MessageInput
  const chatContainerRef = useRef<HTMLDivElement>(null); // This might still be useful for overall container
  
  // 🔄 Автоматическая прокрутка к новым сообщениям - теперь в MessageList
  // ⚡ Обработчик отправки сообщения - onSendMessage prop передается в MessageInput
  // ⌨️ Обработчик клавиатурных событий - теперь в MessageInput

  // 🎨 Динамические CSS классы на основе состояния
  const chatWindowClasses = clsx(
    // 🏗️ Базовые стили контейнера
    'flex flex-col h-full bg-bg-primary border border-border-primary rounded-lg', // Base container styles
    'shadow-lg overflow-hidden transition-all duration-300',
    'dark:bg-bg-primary dark:border-border-primary', // Dark theme styles
    {
      'max-w-sm mx-auto': mergedConfig.compactMode, // Compact mode for mobile
      'min-h-[400px]': !mergedConfig.compactMode,   // Min height for desktop
    },
    { // Connection status styles
      'ring-2 ring-accent-success ring-opacity-50': connectionStatus === 'connected',
      'ring-2 ring-accent-error ring-opacity-50': connectionStatus === 'error',
      'ring-2 ring-accent-warning ring-opacity-50': connectionStatus === 'connecting',
    },
    className // Custom classes
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
      {/* This header section is preserved as per requirements */}
      {(activeServer || connectionStatus !== 'connected') && (
        <div className="bg-bg-secondary border-b border-border-primary px-4 py-3">
          <div className="flex items-center justify-between">
            {activeServer && (
              <div className="flex items-center space-x-3">
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
      
      {/* 💬 Message List Area */}
      <MessageList
        messages={messages}
        config={mergedConfig?.messageListConfig || mergedConfig} // Pass sub-config or whole config
        isTyping={isTyping}
        className="flex-grow p-4 min-h-0" // Ensure it fills space and scrolls
        onMessageEvent={onChatEvent} // Pass onChatEvent for bubble actions
      />

      {/* ⌨️ Message Input Area */}
      <MessageInput
        onSendMessage={onSendMessage} // Prop from ChatWindow
        config={mergedConfig?.messageInputConfig || mergedConfig} // Pass sub-config or whole config
        isLoading={isLoading}
        isConnected={connectionStatus === 'connected'}
        placeholder={mergedConfig?.placeholder || "Type a message..."}
        className="p-2 border-t border-gray-200"
        // availableTools={availableTools} // Pass if availableTools prop exists and is used by MessageInput
      />
    </div>
  );
};

// MessageBubble and MessageStatusIndicator are removed from here.
// They are expected to be part of MessageList.tsx or its children.

// 🎯 ЭКСПОРТЫ
export default ChatWindow;

// 📚 ОБРАЗОВАТЕЛЬНЫЕ ЭКСПОРТЫ
export type { ChatWindowProps }; // MessageBubbleProps removed

// 🔧 СЛЕДУЮЩИЕ ШАГИ: (These TODOs might now belong to MessageList or MessageInput)
// INFO: Removed TODO for drag & drop for files, as this is handled by the child MessageInput component.
// TODO: Реализовать контекстное меню для сообщений (копировать, удалить) (MessageList/MessageBubble)
// TODO: Добавить поддержку markdown рендеринга в сообщениях (MessageList/MessageBubble)
// TODO: Реализовать виртуализацию для больших списков сообщений (MessageList)
// INFO: Debouncing for auto-scroll has been implemented in MessageList.
// HACK: Временно используем простые иконки, позже заменим на Lucide React (General UI concern)