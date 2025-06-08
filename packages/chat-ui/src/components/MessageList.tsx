/**
 * 📜 MESSAGE LIST COMPONENT
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Компонент для отображения списка сообщений с виртуализацией для производительности.
 * Отделен от ChatWindow для лучшей модульности и переиспользования.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Virtual Scrolling - для обработки тысяч сообщений без потери производительности
 * 2. Memoization - предотвращение ненужных ререндеров
 * 3. Intersection Observer - lazy loading и автоматическая прокрутка
 * 4. Message Grouping - группировка сообщений от одного отправителя
 */

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  memo 
} from 'react';
import { clsx } from 'clsx';
import { 
  Message, 
  MessageType,
  ChatWindowConfig,
  ChatEventData,
  MessageFilters,
  DEFAULT_CHAT_CONFIG 
} from '../types';

// 📦 ПРОПСЫ КОМПОНЕНТА
interface MessageListProps {
  /** 💬 Массив сообщений для отображения */
  messages: Message[];
  
  /** 🎛️ Конфигурация отображения */
  config?: Partial<ChatWindowConfig>;
  
  /** 🎯 Callback для событий сообщений */
  onMessageEvent?: (event: ChatEventData) => void;
  
  /** 🔍 Фильтры для сообщений */
  filters?: MessageFilters;
  
  /** 📏 Высота одного сообщения (для виртуализации) */
  estimatedMessageHeight?: number;
  
  /** 🔄 Автоматическая прокрутка к новым сообщениям */
  autoScroll?: boolean;
  
  /** ⌨️ Показать индикатор печати */
  isTyping?: boolean;
  
  /** 🎭 Кастомный рендерер сообщений */
  messageRenderer?: (message: Message, index: number) => React.ReactNode;
  
  /** 📏 Кастомные CSS классы */
  className?: string;
}

/**
 * 📜 Виртуализированный список сообщений
 * 
 * 🚀 ОПТИМИЗАЦИИ:
 * - Virtual scrolling для больших списков
 * - Memoization для предотвращения ререндеров
 * - Intersection Observer для автоматической прокрутки
 * - Message grouping для улучшения UX
 */
export const MessageList: React.FC<MessageListProps> = memo(({
  messages,
  config = {},
  onMessageEvent,
  filters,
  estimatedMessageHeight = 80,
  autoScroll = true,
  isTyping = false,
  messageRenderer,
  className,
}) => {
  // 🎛️ Объединяем конфигурацию
  const mergedConfig = { ...DEFAULT_CHAT_CONFIG, ...config };
  
  // 📝 Локальное состояние
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  // 📍 Refs для управления скроллом и измерений
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout>();
  
  // 🔍 Фильтрация сообщений
  const filteredMessages = useMemo(() => {
    if (!filters) return messages;
    
    return messages.filter(message => {
      // 📝 Фильтр по типу
      if (filters.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        if (!types.includes(message.type)) return false;
      }
      
      // 🏷️ Фильтр по серверу
      if (filters.serverId && message.serverId !== filters.serverId) {
        return false;
      }
      
      // 📊 Фильтр по статусу
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        if (!statuses.includes(message.status)) return false;
      }
      
      // 📅 Фильтр по дате
      if (filters.dateRange) {
        const messageDate = message.timestamp;
        if (messageDate < filters.dateRange.from || messageDate > filters.dateRange.to) {
          return false;
        }
      }
      
      // 🔍 Поиск по тексту
      if (filters.searchText) {
        const searchText = filters.searchText.toLowerCase();
        const content = typeof message.content === 'string' 
          ? message.content.toLowerCase()
          : '';
        if (!content.includes(searchText)) return false;
      }
      
      return true;
    });
  }, [messages, filters]);
  
  // 📊 Группировка сообщений для улучшения UX
  const groupedMessages = useMemo(() => {
    const groups: Array<{
      id: string;
      messages: Message[];
      sender: string;
      timestamp: Date;
      type: MessageType;
    }> = [];
    
    filteredMessages.forEach(message => {
      const lastGroup = groups[groups.length - 1];
      
      // 🤝 Группируем сообщения от одного отправителя если они идут подряд
      // и разница во времени меньше 5 минут
      if (
        lastGroup &&
        lastGroup.type === message.type &&
        lastGroup.sender === (message.serverName || 'user') &&
        (message.timestamp.getTime() - lastGroup.timestamp.getTime()) < 5 * 60 * 1000
      ) {
        lastGroup.messages.push(message);
        lastGroup.timestamp = message.timestamp;
      } else {
        // 🆕 Создаем новую группу
        groups.push({
          id: `group-${message.id}`,
          messages: [message],
          sender: message.serverName || 'user',
          timestamp: message.timestamp,
          type: message.type,
        });
      }
    });
    
    return groups;
  }, [filteredMessages]);
  
  // 📏 Виртуализация - вычисляем видимые сообщения
  const visibleRange = useMemo(() => {
    if (containerHeight === 0) return { start: 0, end: groupedMessages.length };
    
    const buffer = 5; // Буфер для плавной прокрутки
    const visibleCount = Math.ceil(containerHeight / estimatedMessageHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / estimatedMessageHeight) - buffer);
    const endIndex = Math.min(groupedMessages.length, startIndex + visibleCount + buffer * 2);
    
    return { start: startIndex, end: endIndex };
  }, [containerHeight, scrollTop, estimatedMessageHeight, groupedMessages.length]);
  
  // 🔄 Автоматическая прокрутка к новым сообщениям
  const scrollToBottom = useCallback((force = false) => {
    if ((autoScroll && !isUserScrolling) || force) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [autoScroll, isUserScrolling]);
  
  // 📊 Отслеживание изменения размера контейнера
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);
  
  // 🔄 Автоматическая прокрутка при новых сообщениях
  useEffect(() => {
    if (filteredMessages.length > 0) {
      const timeoutId = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [filteredMessages.length, scrollToBottom]);
  
  // ⌨️ Обработчик скролла
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);
    
    // 👤 Определяем, что пользователь скроллит вручную
    setIsUserScrolling(true);
    
    // ⏱️ Сбрасываем флаг через 2 секунды бездействия
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);
    
    // 🔄 Если пользователь скроллит в самый низ, включаем автоскролл
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom) {
      setIsUserScrolling(false);
    }
  }, []);
  
  // 🎨 CSS классы контейнера
  const containerClasses = clsx(
    'flex-1 overflow-y-auto custom-scrollbar',
    'scroll-smooth', // Плавная прокрутка
    className
  );
  
  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      onScroll={handleScroll}
      role="log"
      aria-label="Список сообщений чата"
      aria-live="polite"
    >
      {/* 📊 Контейнер сообщений */}
      <div className="relative">
        {/* 🌟 Empty state */}
        {filteredMessages.length === 0 ? (
          <EmptyMessageList filters={filters} />
        ) : (
          <>
            {/* 📏 Виртуальный spacer сверху */}
            {visibleRange.start > 0 && (
              <div 
                style={{ height: visibleRange.start * estimatedMessageHeight }}
                aria-hidden="true"
              />
            )}
            
            {/* 📜 Видимые группы сообщений */}
            {groupedMessages
              .slice(visibleRange.start, visibleRange.end)
              .map((group, index) => (
                <MessageGroup
                  key={group.id}
                  group={group}
                  config={mergedConfig}
                  onMessageEvent={onMessageEvent}
                  messageRenderer={messageRenderer}
                  groupIndex={visibleRange.start + index}
                />
              ))}
            
            {/* 📏 Виртуальный spacer снизу */}
            {visibleRange.end < groupedMessages.length && (
              <div 
                style={{ 
                  height: (groupedMessages.length - visibleRange.end) * estimatedMessageHeight 
                }}
                aria-hidden="true"
              />
            )}
          </>
        )}
        
        {/* ⌨️ Индикатор печати */}
        {isTyping && <TypingIndicator />}
        
        {/* 📍 Маркер для автоматической прокрутки */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 🔄 Кнопка "Прокрутить вниз" */}
      {isUserScrolling && (
        <ScrollToBottomButton onClick={() => scrollToBottom(true)} />
      )}
    </div>
  );
});

MessageList.displayName = 'MessageList';

/**
 * 👥 MESSAGE GROUP COMPONENT
 * 
 * 📚 Группа сообщений от одного отправителя
 */
interface MessageGroupProps {
  group: {
    id: string;
    messages: Message[];
    sender: string;
    timestamp: Date;
    type: MessageType;
  };
  config: ChatWindowConfig;
  onMessageEvent?: (event: ChatEventData) => void;
  messageRenderer?: (message: Message, index: number) => React.ReactNode;
  groupIndex: number;
}

const MessageGroup: React.FC<MessageGroupProps> = memo(({
  group,
  config,
  onMessageEvent,
  messageRenderer,
  groupIndex,
}) => {
  // 🎨 Стили группы в зависимости от типа отправителя
  const groupClasses = clsx(
    'mb-4 last:mb-2',
    {
      'flex flex-col items-end': group.type === 'user',
      'flex flex-col items-start': group.type === 'assistant' || group.type === 'error',
      'flex flex-col items-center': group.type === 'system',
    }
  );
  
  // ⏰ Форматирование времени группы
  const formatGroupTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) return 'только что';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div className={groupClasses}>
      {/* 🏷️ Заголовок группы (отправитель + время) */}
      {config.showTimestamps && (
        <div className="flex items-center space-x-2 mb-2 px-1">
          {config.showServerNames && group.sender !== 'user' && (
            <span className="text-sm font-medium text-text-secondary">
              {group.sender}
            </span>
          )}
          <span className="text-xs text-text-muted">
            {formatGroupTime(group.timestamp)}
          </span>
        </div>
      )}
      
      {/* 💬 Сообщения в группе */}
      <div className={clsx(
        'space-y-1 max-w-[70%]',
        {
          'items-end': group.type === 'user',
          'items-start': group.type !== 'user',
        }
      )}>
        {group.messages.map((message, messageIndex) => (
          <div key={message.id}>
            {messageRenderer ? (
              messageRenderer(message, groupIndex * 10 + messageIndex)
            ) : (
              <DefaultMessageRenderer 
                message={message}
                config={config}
                onMessageEvent={onMessageEvent}
                isFirstInGroup={messageIndex === 0}
                isLastInGroup={messageIndex === group.messages.length - 1}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

MessageGroup.displayName = 'MessageGroup';

/**
 * 💬 DEFAULT MESSAGE RENDERER
 * 
 * 📚 Стандартный рендерер для сообщений
 */
interface DefaultMessageRendererProps {
  message: Message;
  config: ChatWindowConfig;
  onMessageEvent?: (event: ChatEventData) => void;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

const DefaultMessageRenderer: React.FC<DefaultMessageRendererProps> = memo(({
  message,
  config,
  onMessageEvent,
  isFirstInGroup,
  isLastInGroup,
}) => {
  // 🎨 Стили сообщения
  const messageClasses = clsx(
    'px-4 py-2 break-words transition-all duration-200',
    'hover:shadow-md group relative',
    {
      // 👤 Сообщения пользователя
      'bg-chat-user text-white rounded-2xl': message.type === 'user',
      'rounded-br-md': message.type === 'user' && isFirstInGroup,
      'rounded-tr-md': message.type === 'user' && isLastInGroup,
      
      // 🤖 Сообщения ассистента
      'bg-bg-secondary text-text-primary rounded-2xl': message.type === 'assistant',
      'rounded-bl-md': message.type === 'assistant' && isFirstInGroup,
      'rounded-tl-md': message.type === 'assistant' && isLastInGroup,
      
      // ⚙️ Системные сообщения
      'bg-bg-tertiary text-text-secondary rounded-lg text-center text-sm': message.type === 'system',
      
      // 🎨 UI компоненты
      'bg-bg-elevated border border-border-primary rounded-lg p-0': message.type === 'ui-component',
      
      // ❌ Ошибки
      'bg-accent-error text-white rounded-2xl': message.type === 'error',
    }
  );
  
  return (
    <div className={messageClasses}>
      {/* 📄 Содержимое сообщения */}
      {typeof message.content === 'string' ? (
        <div className="whitespace-pre-wrap select-text">
          {message.content}
        </div>
      ) : (
        // 🎨 UI компонент (placeholder)
        <div className="p-4 text-center text-text-muted">
          <div className="text-2xl mb-2">🎨</div>
          <div className="font-medium">UI Component</div>
          <div className="text-sm opacity-75">{message.content.uri}</div>
          {/* TODO: Здесь будет настоящий UIRenderer */}
        </div>
      )}
      
      {/* 📊 Статус сообщения */}
      {message.status !== 'completed' && (
        <div className="mt-1 text-xs opacity-75">
          <MessageStatusBadge status={message.status} />
        </div>
      )}
      
      {/* ❌ Ошибка */}
      {message.error && (
        <div className="mt-2 p-2 bg-black bg-opacity-20 rounded text-xs">
          <div className="font-medium">Ошибка: {message.error.message}</div>
          {message.error.code && (
            <div className="opacity-75">Код: {message.error.code}</div>
          )}
        </div>
      )}
      
      {/* 🛠️ Действия с сообщением (показываются при hover) */}
      <MessageActions 
        message={message}
        onMessageEvent={onMessageEvent}
      />
    </div>
  );
});

DefaultMessageRenderer.displayName = 'DefaultMessageRenderer';

/**
 * 🌟 EMPTY MESSAGE LIST
 * 
 * 📚 Отображается когда нет сообщений
 */
interface EmptyMessageListProps {
  filters?: MessageFilters;
}

const EmptyMessageList: React.FC<EmptyMessageListProps> = ({ filters }) => {
  const hasFilters = filters && Object.keys(filters).length > 0;
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="text-6xl mb-4">
        {hasFilters ? '🔍' : '💬'}
      </div>
      <h3 className="text-text-primary text-lg font-medium mb-2">
        {hasFilters ? 'Сообщения не найдены' : 'Начните общение'}
      </h3>
      <p className="text-text-muted max-w-md">
        {hasFilters 
          ? 'Попробуйте изменить фильтры поиска или очистить их'
          : 'Отправьте сообщение, чтобы начать взаимодействие с MCP сервером'
        }
      </p>
      {hasFilters && (
        <button 
          className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => {
            // TODO: Добавить callback для очистки фильтров
          }}
        >
          Очистить фильтры
        </button>
      )}
    </div>
  );
};

/**
 * ⌨️ TYPING INDICATOR
 * 
 * 📚 Анимированный индикатор печати
 */
const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-3 px-4 py-3 mb-4">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="text-sm text-text-muted">Печатает...</span>
  </div>
);

/**
 * 📊 MESSAGE STATUS BADGE
 */
const MessageStatusBadge: React.FC<{ status: Message['status'] }> = ({ status }) => {
  const statusConfig = {
    sending: { icon: '⏳', text: 'Отправка', color: 'text-accent-warning' },
    sent: { icon: '✓', text: 'Отправлено', color: 'text-accent-success' },
    delivered: { icon: '✓✓', text: 'Доставлено', color: 'text-accent-success' },
    failed: { icon: '❌', text: 'Ошибка', color: 'text-accent-error' },
    processing: { icon: '🔄', text: 'Обработка', color: 'text-accent-info' },
    completed: { icon: '✅', text: 'Готово', color: 'text-accent-success' },
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={clsx('flex items-center space-x-1 text-xs', config.color)}>
      <span className={status === 'processing' ? 'animate-spin' : ''}>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
};

/**
 * 🛠️ MESSAGE ACTIONS
 */
const MessageActions: React.FC<{
  message: Message;
  onMessageEvent?: (event: ChatEventData) => void;
}> = ({ message, onMessageEvent }) => (
  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <div className="flex space-x-1">
      {/* 📋 Копировать */}
      <button
        className="p-1 bg-bg-hover rounded hover:bg-bg-elevated transition-colors"
        onClick={() => {
          if (typeof message.content === 'string') {
            navigator.clipboard.writeText(message.content);
          }
        }}
        title="Копировать"
      >
        📋
      </button>
      
      {/* 🗑️ Удалить (только для пользовательских сообщений) */}
      {message.type === 'user' && (
        <button
          className="p-1 bg-bg-hover rounded hover:bg-accent-error hover:text-white transition-colors"
          onClick={() => {
            onMessageEvent?.({
              type: 'message-delete',
              payload: { messageId: message.id },
              timestamp: new Date(),
            });
          }}
          title="Удалить"
        >
          🗑️
        </button>
      )}
    </div>
  </div>
);

/**
 * 🔄 SCROLL TO BOTTOM BUTTON
 */
const ScrollToBottomButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      'fixed bottom-20 right-4 z-10',
      'bg-accent-primary hover:bg-blue-600 text-white',
      'w-12 h-12 rounded-full shadow-lg',
      'flex items-center justify-center',
      'transition-all duration-200 hover:scale-110',
      'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50'
    )}
    title="Прокрутить вниз"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </button>
);

// 🎯 ЭКСПОРТЫ
export default MessageList;
export type { MessageListProps };

// 🔧 СЛЕДУЮЩИЕ ШАГИ:
// TODO: Добавить поддержку infinite scroll для истории сообщений
// TODO: Реализовать поиск и фильтрацию сообщений
// TODO: Добавить возможность выделения и группового действия с сообщениями
// TODO: Реализовать контекстное меню для сообщений
// FIXME: Оптимизировать виртуализацию для переменной высоты сообщений
// HACK: Временно используем простые эмодзи иконки, заменить на Lucide React