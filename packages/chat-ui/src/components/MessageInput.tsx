/**
 * ⌨️ MESSAGE INPUT COMPONENT
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Продвинутое поле ввода сообщений с автокомплитом, валидацией и поддержкой файлов.
 * Включает интеллектуальные возможности для работы с MCP инструментами.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Controlled Component - полный контроль над состоянием
 * 2. Debounced Validation - валидация с задержкой для производительности
 * 3. Command Pattern - автокомплит команд и инструментов MCP
 * 4. Accessibility First - полная поддержка клавиатурной навигации
 */

import React, { 
  useState, 
  useRef, 
  useCallback, 
  useEffect, 
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { clsx } from 'clsx';
import { 
  MessageInputConfig,
  ChatEventData,
  DEFAULT_INPUT_CONFIG,
  CHAT_LIMITS 
} from '../types';

// 📦 ИНТЕРФЕЙСЫ

/**
 * 🔧 MCP Tool для автокомплита
 */
export interface MCPTool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
  category?: string;
  icon?: string;
}

/**
 * 📁 Загружаемый файл
 */
export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string; // Data URL для превью
}

/**
 * 📝 Пропсы компонента
 */
interface MessageInputProps {
  /** ⚡ Callback для отправки сообщения */
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  
  /** 🎯 Callback для событий ввода */
  onInputEvent?: (event: ChatEventData) => void;
  
  /** 🎛️ Конфигурация поля ввода */
  config?: Partial<MessageInputConfig>;
  
  /** 🔧 Доступные MCP инструменты для автокомплита */
  availableTools?: MCPTool[];
  
  /** 🔄 Состояние загрузки */
  isLoading?: boolean;
  
  /** 🔌 Состояние подключения */
  isConnected?: boolean;
  
  /** 💡 Показать подсказки пользователю */
  showHints?: boolean;
  
  /** 📏 Кастомные CSS классы */
  className?: string;
  
  /** 🎭 Кастомный placeholder */
  placeholder?: string;
}

/**
 * 🎯 Ref методы для внешнего управления
 */
export interface MessageInputRef {
  focus: () => void;
  clear: () => void;
  insertText: (text: string) => void;
  getValue: () => string;
}

/**
 * ⌨️ Продвинутое поле ввода сообщений
 * 
 * 🚀 ВОЗМОЖНОСТИ:
 * - Автокомплит MCP инструментов
 * - Валидация ввода в реальном времени
 * - Поддержка файлов drag & drop
 * - Горячие клавиши и команды
 * - Автоматическое изменение размера
 */
export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({
  onSendMessage,
  onInputEvent,
  config = {},
  availableTools = [],
  isLoading = false,
  isConnected = true,
  showHints = true,
  className,
  placeholder,
}, ref) => {
  // 🎛️ Объединяем конфигурацию
  const mergedConfig = { ...DEFAULT_INPUT_CONFIG, ...config };
  const finalPlaceholder = placeholder || mergedConfig.placeholder || 'Введите сообщение...';
  
  // 📝 Локальное состояние
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [charCount, setCharCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // 📍 Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🎯 Expose ref methods
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    clear: () => setValue(''),
    insertText: (text: string) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.slice(0, start) + text + value.slice(end);
        setValue(newValue);
        
        // Восстанавливаем позицию курсора
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + text.length;
        }, 0);
      }
    },
    getValue: () => value,
  }), [value]);
  
  // 🔍 Автокомплит - фильтрация инструментов
  const autocompleteResults = useMemo(() => {
    if (!autocompleteQuery || !mergedConfig.enableAutocomplete) return [];
    
    const query = autocompleteQuery.toLowerCase();
    return availableTools
      .filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      )
      .slice(0, 8); // Максимум 8 результатов
  }, [autocompleteQuery, availableTools, mergedConfig.enableAutocomplete]);
  
  // ⌨️ Автоматическое изменение размера textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 150; // Максимальная высота
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, []);
  
  // 📊 Обновление счетчика символов и высоты при изменении значения
  useEffect(() => {
    setCharCount(value.length);
    adjustTextareaHeight();
    
    // 🔍 Проверяем на команды автокомплита
    if (mergedConfig.enableAutocomplete) {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPosition);
        const match = textBeforeCursor.match(/\/([\\w]*)$/);
        
        if (match) {
          setAutocompleteQuery(match[1]);
          setShowAutocomplete(true);
          setSelectedSuggestionIndex(-1);
        } else {
          setShowAutocomplete(false);
        }
      }
    }
  }, [value, mergedConfig.enableAutocomplete]);
  
  // ⚡ Обработчик отправки сообщения
  const handleSend = useCallback(() => {
    const trimmedValue = value.trim();
    if (!trimmedValue && attachments.length === 0) return;
    if (!isConnected) return;
    
    // 📤 Отправляем сообщение
    onSendMessage(trimmedValue, attachments.length > 0 ? attachments : undefined);
    
    // 🎯 Отправляем событие
    if (onInputEvent) {
      onInputEvent({
        type: 'message-send',
        payload: { 
          content: trimmedValue, 
          attachments: attachments.map(a => ({ name: a.name, size: a.size, type: a.type }))
        },
        timestamp: new Date(),
        sourceId: 'message-input',
      });
    }
    
    // 🧹 Очищаем поле и вложения
    setValue('');
    setAttachments([]);
    
    // 🎯 Возвращаем фокус
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [value, attachments, isConnected, onSendMessage, onInputEvent]);
  
  // ⌨️ Обработчик клавиатурных событий
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 🔍 Навигация по автокомплиту
    if (showAutocomplete && autocompleteResults.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : 0
        );
        return;
      }
      
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : autocompleteResults.length - 1
        );
        return;
      }
      
      if (event.key === 'Enter' && selectedSuggestionIndex >= 0) {
        event.preventDefault();
        handleSelectSuggestion(autocompleteResults[selectedSuggestionIndex]);
        return;
      }
      
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowAutocomplete(false);
        return;
      }
    }
    
    // ↩️ Отправка сообщения
    if (event.key === 'Enter' && !event.shiftKey && mergedConfig.submitOnEnter) {
      event.preventDefault();
      handleSend();
      return;
    }
    
    // 🎯 Горячие клавиши
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          handleSend();
          break;
        case 'k':
          event.preventDefault();
          // TODO: Открыть панель команд
          break;
      }
    }
  }, [showAutocomplete, autocompleteResults, selectedSuggestionIndex, mergedConfig.submitOnEnter, handleSend]);
  
  // 🔍 Выбор предложения автокомплита
  const handleSelectSuggestion = useCallback((tool: MCPTool) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPosition);
      const textAfterCursor = value.slice(cursorPosition);
      
      // Заменяем команду на название инструмента
      const newTextBefore = textBeforeCursor.replace(/\/[\\w]*$/, `/${tool.name} `);
      const newValue = newTextBefore + textAfterCursor;
      
      setValue(newValue);
      setShowAutocomplete(false);
      
      // Устанавливаем курсор после вставленного текста
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newTextBefore.length;
        textarea.focus();
      }, 0);
    }
  }, [value]);
  
  // 📁 Обработка загрузки файлов
  const handleFileUpload = useCallback((files: FileList) => {
    if (!mergedConfig.allowFileUpload) return;
    
    Array.from(files).forEach(file => {
      // 📊 Проверка размера файла
      if (file.size > CHAT_LIMITS.MAX_FILE_SIZE) {
        // TODO: Показать уведомление об ошибке
        return;
      }
      
      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      };
      
      // 🖼️ Создаем превью для изображений
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string;
          setAttachments(prev => [...prev, attachment]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments(prev => [...prev, attachment]);
      }
    });
  }, [mergedConfig.allowFileUpload]);
  
  // 🎯 Drag & Drop обработчики
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);
  
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);
  
  // 🗑️ Удаление вложения
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  }, []);
  
  // 🎨 CSS классы
  const containerClasses = clsx(
    'border-t border-border-primary bg-bg-secondary transition-all duration-200',
    {
      'bg-bg-elevated shadow-lg': isFocused,
      'border-accent-primary': isFocused && isConnected,
      'border-accent-error': !isConnected,
      'ring-2 ring-accent-primary ring-opacity-30': isDragOver,
    },
    className
  );
  
  const textareaClasses = clsx(
    'w-full resize-none bg-bg-tertiary border border-border-muted rounded-lg',
    'px-4 py-3 text-text-primary placeholder-text-muted transition-all duration-200',
    'focus:border-border-focus focus:bg-bg-secondary focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      'text-sm': mergedConfig.fontSize === 'small',
      'text-base': mergedConfig.fontSize === 'medium',
      'text-lg': mergedConfig.fontSize === 'large',
    }
  );
  
  return (
    <div 
      className={containerClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 📁 Область drag & drop */}
      {isDragOver && (
        <div className="absolute inset-0 bg-accent-primary bg-opacity-20 border-2 border-dashed border-accent-primary rounded-lg flex items-center justify-center z-10">
          <div className="text-accent-primary text-lg font-medium">
            📁 Отпустите файлы для загрузки
          </div>
        </div>
      )}
      
      {/* 📎 Отображение вложений */}
      {attachments.length > 0 && (
        <AttachmentsList 
          attachments={attachments}
          onRemove={removeAttachment}
        />
      )}
      
      {/* ⌨️ Основное поле ввода */}
      <div className="p-4 relative">
        <div className="flex items-end space-x-3">
          {/* 📝 Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                // Задержка чтобы клик по автокомплиту сработал
                setTimeout(() => setShowAutocomplete(false), 200);
              }}
              placeholder={finalPlaceholder}
              className={textareaClasses}
              disabled={isLoading || !isConnected}
              maxLength={mergedConfig.maxLength}
              rows={1}
              style={{ minHeight: '44px' }}
              aria-label="Поле ввода сообщения"
              aria-describedby="input-hints"
            />
            
            {/* 📊 Счетчик символов */}
            {charCount > (mergedConfig.maxLength || CHAT_LIMITS.MAX_MESSAGE_LENGTH) * 0.8 && (
              <div className={clsx(
                'absolute bottom-2 right-2 text-xs pointer-events-none',
                {
                  'text-text-muted': charCount < (mergedConfig.maxLength || CHAT_LIMITS.MAX_MESSAGE_LENGTH) * 0.95,
                  'text-accent-warning': charCount >= (mergedConfig.maxLength || CHAT_LIMITS.MAX_MESSAGE_LENGTH) * 0.95,
                  'text-accent-error': charCount >= (mergedConfig.maxLength || CHAT_LIMITS.MAX_MESSAGE_LENGTH),
                }
              )}>
                {charCount}/{mergedConfig.maxLength || CHAT_LIMITS.MAX_MESSAGE_LENGTH}
              </div>
            )}
            
            {/* 🔍 Автокомплит */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <AutocompleteDropdown
                ref={autocompleteRef}
                results={autocompleteResults}
                selectedIndex={selectedSuggestionIndex}
                onSelect={handleSelectSuggestion}
              />
            )}
          </div>
          
          {/* 🔧 Кнопки действий */}
          <div className="flex items-center space-x-2">
            {/* 📎 Прикрепить файл */}
            {mergedConfig.allowFileUpload && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || !isConnected}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
                title="Прикрепить файл"
              >
                📎
              </button>
            )}
            
            {/* 😊 Эмодзи (если включено) */}
            {mergedConfig.showEmojiPicker && (
              <button
                type="button"
                disabled={isLoading || !isConnected}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
                title="Добавить эмодзи"
              >
                😊
              </button>
            )}
            
            {/* 📤 Отправить */}
            <button
              type="button"
              onClick={handleSend}
              disabled={(!value.trim() && attachments.length === 0) || isLoading || !isConnected}
              className={clsx(
                'bg-accent-primary hover:bg-blue-600 disabled:bg-bg-hover',
                'text-white disabled:text-text-muted rounded-lg px-4 py-2',
                'transition-all duration-200 flex items-center justify-center',
                'min-w-[44px] h-[44px]',
                'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50'
              )}
              title="Отправить сообщение"
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* 💡 Подсказки */}
        {showHints && (
          <InputHints 
            config={mergedConfig}
            isConnected={isConnected}
            hasTools={availableTools.length > 0}
          />
        )}
      </div>
      
      {/* 📁 Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files);
            e.target.value = ''; // Сброс для повторного выбора того же файла
          }
        }}
        accept="*/*"
      />
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

/**
 * 🔍 AUTOCOMPLETE DROPDOWN
 */
interface AutocompleteDropdownProps {
  results: MCPTool[];
  selectedIndex: number;
  onSelect: (tool: MCPTool) => void;
}

const AutocompleteDropdown = forwardRef<HTMLDivElement, AutocompleteDropdownProps>(({
  results,
  selectedIndex,
  onSelect,
}, ref) => (
  <div
    ref={ref}
    className="absolute bottom-full left-0 right-0 mb-2 bg-bg-elevated border border-border-primary rounded-lg shadow-lg max-h-64 overflow-y-auto z-20"
  >
    <div className="p-2 text-xs text-text-muted border-b border-border-muted">
      MCP Инструменты
    </div>
    {results.map((tool, index) => (
      <button
        key={tool.name}
        className={clsx(
          'w-full text-left px-3 py-2 hover:bg-bg-hover transition-colors',
          {
            'bg-accent-primary text-white': index === selectedIndex,
          }
        )}
        onClick={() => onSelect(tool)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{tool.icon || '🔧'}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">/{tool.name}</div>
            <div className="text-xs opacity-75 truncate">{tool.description}</div>
          </div>
        </div>
      </button>
    ))}
  </div>
));

AutocompleteDropdown.displayName = 'AutocompleteDropdown';

/**
 * 📎 ATTACHMENTS LIST
 */
interface AttachmentsListProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({ attachments, onRemove }) => (
  <div className="border-b border-border-muted p-3">
    <div className="flex flex-wrap gap-2">
      {attachments.map(attachment => (
        <AttachmentPreview
          key={attachment.id}
          attachment={attachment}
          onRemove={() => onRemove(attachment.id)}
        />
      ))}
    </div>
  </div>
);

/**
 * 🖼️ ATTACHMENT PREVIEW
 */
interface AttachmentPreviewProps {
  attachment: FileAttachment;
  onRemove: () => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, onRemove }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <div className="relative bg-bg-tertiary border border-border-muted rounded-lg p-2 group">
      <div className="flex items-center space-x-2">
        {/* 🖼️ Превью */}
        {attachment.preview ? (
          <img 
            src={attachment.preview} 
            alt={attachment.name}
            className="w-8 h-8 object-cover rounded"
          />
        ) : (
          <div className="w-8 h-8 bg-bg-hover rounded flex items-center justify-center text-xs">
            📄
          </div>
        )}
        
        {/* 📝 Информация */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {attachment.name}
          </div>
          <div className="text-xs text-text-muted">
            {formatFileSize(attachment.size)}
          </div>
        </div>
        
        {/* 🗑️ Удалить */}
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-accent-error transition-all"
          title="Удалить файл"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/**
 * 💡 INPUT HINTS
 */
interface InputHintsProps {
  config: MessageInputConfig;
  isConnected: boolean;
  hasTools: boolean;
}

const InputHints: React.FC<InputHintsProps> = ({ config, isConnected, hasTools }) => (
  <div id="input-hints" className="mt-2 space-y-1">
    {/* ⌨️ Горячие клавиши */}
    {config.submitOnEnter && (
      <div className="text-xs text-text-muted">
        <kbd className="px-1 bg-bg-hover rounded">Enter</kbd> для отправки, 
        <kbd className="px-1 bg-bg-hover rounded ml-1">Shift+Enter</kbd> для новой строки
      </div>
    )}
    
    {/* 🔧 Подсказка по инструментам */}
    {hasTools && config.enableAutocomplete && (
      <div className="text-xs text-text-muted">
        Введите <kbd className="px-1 bg-bg-hover rounded">/</kbd> для автокомплита инструментов
      </div>
    )}
    
    {/* 📁 Файлы */}
    {config.allowFileUpload && (
      <div className="text-xs text-text-muted">
        Перетащите файлы для загрузки
      </div>
    )}
    
    {/* 🔌 Статус подключения */}
    {!isConnected && (
      <div className="text-xs text-accent-error">
        Нет подключения к серверу
      </div>
    )}
  </div>
);

// 🎯 ЭКСПОРТЫ
export default MessageInput;
export type { MessageInputProps, MessageInputRef, MCPTool, FileAttachment };

// 🔧 СЛЕДУЮЩИЕ ШАГИ:
// TODO: Добавить поддержку emoji picker
// TODO: Реализовать команды slash (/) для быстрых действий
// TODO: Добавить поддержку mention (@) для упоминания пользователей
// TODO: Реализовать предварительный просмотр ссылок
// FIXME: Улучшить обработку больших файлов с прогресс-баром
// HACK: Временно используем простые эмодзи, заменить на proper icon library