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
// Ensure all needed hooks are listed if not already (useState, useCallback, useRef, useEffect are used by emoji picker)
// useEffect, useState, useCallback, useMemo are definitely used by link preview.
import Picker, { EmojiClickData } from 'emoji-picker-react';
import { getLinkPreview /*, LinkPreviewData */ } from 'link-preview-js'; // Conditional import
// Assuming LinkPreviewData might be part of the library's main export or needs specific import if used explicitly
// For this diff, we'll use a local type or inline it for simplicity if not directly from lib.
type LinkPreviewData = any; // Placeholder if direct import is an issue
import { clsx } from 'clsx';
import { 
  MessageInputConfig,
  ChatEventData,
  DEFAULT_INPUT_CONFIG,
  CHAT_LIMITS,
  MentionUser
} from '../types'; // Added MentionUser

// 📦 ИНТЕРФЕЙСЫ

export interface SlashCommand {
  name: string;
  description: string;
  action: (currentValue: string, setValue: (value: string) => void, textareaRef?: React.RefObject<HTMLTextAreaElement>) => void;
  category?: string; // Optional: for grouping in UI if needed later
  icon?: string; // Optional: for UI
}

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
  progress?: number; // 0-100
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string; // Error message if uploadStatus is 'error'
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
  /** ⚡ Доступные slash-команды */
  availableSlashCommands?: SlashCommand[];
  /** 👥 Доступные пользователи для упоминания */
  availableUsers?: MentionUser[];
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
  availableSlashCommands = [],
  availableUsers = [], // New prop
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [linkPreview, setLinkPreview] = useState<(LinkPreviewData & { fetchedUrl?: string }) | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  
  // 📍 Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
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

  // Define default slash commands if not passed via props
  const defaultSlashCommands: SlashCommand[] = useMemo(() => [ // useMemo to avoid redefining on every render
    {
      name: 'clear',
      description: 'Очистить поле ввода',
      icon: '🧹', // Example icon
      action: (currentValue, setValue) => setValue(''),
    },
    {
      name: 'shrug',
      description: 'Вставить ¯\_(ツ)_/¯',
      icon: '🤷',
      action: (currentValue, setValue, textareaRef) => {
        const shrug = '¯\_(ツ)_/¯ ';
        if (textareaRef?.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const newValue = currentValue.slice(0, start) + shrug + currentValue.slice(end);
          setValue(newValue);
          setTimeout(() => {
            if(textareaRef.current) textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + shrug.length;
          }, 0);
        } else {
          setValue(currentValue + shrug);
        }
      },
    },
    {
      name: 'help',
      description: 'Показать доступные команды (в консоли)',
      icon: '❓',
      action: () => {
        // Access availableTools from closure, and finalSlashCommands (defined below)
        console.log("Доступные MCP инструменты:", availableTools.map(t => `/${t.name} - ${t.description}`).join('\n'));
        console.log("Доступные slash-команды:", finalSlashCommands.map(c => `/${c.name} - ${c.description}`).join('\n'));
        // TODO: Implement a more user-friendly help display, perhaps via onInputEvent
      },
    },
  ], [availableTools]); // availableTools dependency for the help command to log current tools

  const finalSlashCommands = availableSlashCommands.length > 0 ? availableSlashCommands : defaultSlashCommands;

  // HACK: Basic @mention implementation. Could be enhanced with specific styling for mentions in input.
  // TODO: Consider how mentions should be processed/stored when message is sent (e.g., as plain text or structured data).
  // TODO: Improve UI for mention suggestions in AutocompleteDropdown (e.g., show avatars).

  const autocompleteResults = useMemo(() => {
    const isToolOrCommandQuery = autocompleteQuery.startsWith('/');
    const isMentionQuery = autocompleteQuery.startsWith('@');

    if (!mergedConfig.enableAutocomplete || (!isToolOrCommandQuery && !isMentionQuery) || autocompleteQuery.length <= 1) {
      return [];
    }
    
    const query = autocompleteQuery.substring(1).toLowerCase(); // Remove the prefix (@ or /)

    if (isToolOrCommandQuery) {
      const toolResults = availableTools
        .filter(tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
        )
        .map(tool => ({ ...tool, type: 'tool' as const }));

      const commandResults = finalSlashCommands
        .filter(cmd => cmd.name.toLowerCase().includes(query))
        .map(cmd => ({ ...cmd, type: 'command' as const }));
      return [...commandResults, ...toolResults].slice(0, 8);
    } else if (isMentionQuery) {
      const mentionResults = availableUsers
        .filter(user => user.name.toLowerCase().includes(query))
        .map(user => ({ ...user, id: String(user.id), type: 'mention' as const })); // Ensure id is string for key
      return mentionResults.slice(0, 8);
    }
    return [];
  }, [autocompleteQuery, availableTools, finalSlashCommands, availableUsers, mergedConfig.enableAutocomplete]);
  
  // ⌨️ Автоматическое изменение размера textarea

  // HACK: Basic link preview. Robust error handling and caching could be added.
  // TODO: Consider more sophisticated URL detection (e.g., handling multiple URLs, choosing which to preview).
  // TODO: Allow dismissing the link preview more permanently for a given URL.
  // FIXME: The fallback title parsing is very basic and might fail on many sites or if content isn't HTML.

  const extractUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    return urls && urls.length > 0 ? urls[urls.length - 1] : null;
  };

  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const fetchPreview = useCallback(async (urlToFetch: string) => {
    if (!mergedConfig.enableLinkPreview) { // Check against mergedConfig
      setLinkPreview(null);
      return;
    }
    setIsFetchingPreview(true);
    setLinkPreview(null);
    try {
      // @ts-ignore - Conditional import if link-preview-js is not found by worker
      if (typeof getLinkPreview !== 'undefined') {
        const data = await getLinkPreview(urlToFetch, {
          followRedirects: 'follow',
          timeout: 3000,
        });
        setLinkPreview({ ...data, fetchedUrl: urlToFetch } as LinkPreviewData & { fetchedUrl?: string });
      } else {
        const response = await fetch(`/api/cors-proxy?url=${encodeURIComponent(urlToFetch)}`);
        if (!response.ok) throw new Error('Failed to fetch URL for preview (fallback)');
        const html = await response.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : urlToFetch;
        setLinkPreview({ title, url: urlToFetch, mediaType: response.headers.get('content-type') || 'text/html', contentType: response.headers.get('content-type') || 'text/html', fetchedUrl: urlToFetch } as LinkPreviewData & { fetchedUrl?: string });
      }
    } catch (error) {
      console.warn('Failed to fetch link preview:', error);
      setLinkPreview(null);
    } finally {
      setIsFetchingPreview(false);
    }
  }, [mergedConfig.enableLinkPreview]); // Added mergedConfig.enableLinkPreview to dependency array

  const debouncedFetchPreview = useMemo(() => debounce(fetchPreview, 750), [fetchPreview]);

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

    // Link preview logic
    const currentUrl = extractUrl(value);
    if (currentUrl) {
      if (currentUrl !== detectedUrl || (linkPreview && currentUrl !== linkPreview.fetchedUrl && !isFetchingPreview)) {
        setDetectedUrl(currentUrl);
        debouncedFetchPreview(currentUrl);
      }
    } else if (!currentUrl && detectedUrl) { // If URL removed from input
      setDetectedUrl(null);
      setLinkPreview(null);
    }
    
    // 🔍 Проверяем на команды автокомплита
    if (mergedConfig.enableAutocomplete) {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPosition);
        const match = textBeforeCursor.match(/([\/@])([\w-]*)$/); // New: / or @, allow hyphens

        if (match) {
          setAutocompleteQuery(match[0]); // Query includes the prefix / or @
          setShowAutocomplete(true);
          setSelectedSuggestionIndex(-1);
        } else {
          setShowAutocomplete(false);
        }
      }
    }
  }, [value, detectedUrl, linkPreview, debouncedFetchPreview, mergedConfig.enableAutocomplete]); // Added mergedConfig.enableAutocomplete (already there but good to confirm)
  
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
    setLinkPreview(null); // Clear preview on send
    setDetectedUrl(null);
    
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
        handleSelectSuggestion(autocompleteResults[selectedSuggestionIndex] as (MCPTool & {type: 'tool'}) | (SlashCommand & {type: 'command'}) | (MentionUser & {type: 'mention'}));
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
  
  // 🔍 Выбор предложения автокомплита (инструмента, команды или пользователя)
  const handleSelectSuggestion = useCallback((item: (MCPTool & {type: 'tool'}) | (SlashCommand & {type: 'command'}) | (MentionUser & {type: 'mention'})) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPosition);
      const textAfterCursor = value.slice(cursorPosition);
      
      if (item.type === 'tool') {
        const newTextBefore = textBeforeCursor.replace(/\/[\w-]*$/, `/${item.name} `);
        const newValue = newTextBefore + textAfterCursor;
        setValue(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newTextBefore.length;
          textarea.focus();
        }, 0);
      } else if (item.type === 'command') {
        const newTextBefore = textBeforeCursor.replace(/\/[\w-]*$/, '');
        const tempValue = newTextBefore + textAfterCursor;
        // setValue(tempValue); // Action will call setValue
        item.action(tempValue, setValue, textareaRef);
        setTimeout(() => {
          textarea.focus();
          if (document.activeElement === textarea && textarea.selectionStart === textarea.selectionEnd && textarea.selectionStart === 0 && tempValue.length > 0 && value === tempValue) {
            textarea.selectionStart = textarea.selectionEnd = newTextBefore.length;
          }
        }, 0);
      } else if (item.type === 'mention') {
        const newTextBefore = textBeforeCursor.replace(/@[\w-]*$/, `@${item.name} `);
        const newValue = newTextBefore + textAfterCursor;
        setValue(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newTextBefore.length;
          textarea.focus();
        }, 0);
      }
      setShowAutocomplete(false);
    }
  }, [value, setValue, finalSlashCommands, availableUsers]); // Added availableUsers

  // 📁 Обработка загрузки файлов
  const handleFileUpload = useCallback((files: FileList) => {
    if (!mergedConfig.allowFileUpload) return;
    
    Array.from(files).forEach(file => {
      if (file.size > (mergedConfig.maxFileSize || CHAT_LIMITS.MAX_FILE_SIZE)) {
        const errorAttachment: FileAttachment = {
          id: `file-error-${Date.now()}-${Math.random()}`,
          file, name: file.name, size: file.size, type: file.type,
          uploadStatus: 'error',
          progress: 0,
          error: `File exceeds max size of ${(mergedConfig.maxFileSize || CHAT_LIMITS.MAX_FILE_SIZE) / (1024*1024)}MB`,
        };
        setAttachments(prev => [...prev, errorAttachment]);
        setTimeout(() => removeAttachment(errorAttachment.id), 5000); // Auto-remove error after 5s
        return;
      }
      
      const attachmentId = `file-${Date.now()}-${Math.random()}`;
      const newAttachment: FileAttachment = {
        id: attachmentId,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        uploadStatus: 'pending',
      };
      
      setAttachments(prev => [...prev, newAttachment]);

      // HACK: Simulating file upload progress. Replace with actual upload logic.
      // TODO: Integrate with a real file upload service.
      const simulateUpload = (attId: string) => {
        setAttachments(prev => prev.map(att =>
          att.id === attId ? { ...att, uploadStatus: 'uploading', progress: 0 } : att
        ));

        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 10;
          if (currentProgress <= 100) {
            setAttachments(prev => prev.map(att =>
              att.id === attId ? { ...att, progress: currentProgress } : att
            ));
          } else {
            clearInterval(interval);
            const uploadFailed = Math.random() < 0.1;
            setAttachments(prev => prev.map(att =>
              att.id === attId ? {
                ...att,
                uploadStatus: uploadFailed ? 'error' : 'completed',
                progress: 100,
                error: uploadFailed ? 'Simulated upload failure.' : undefined,
              } : att
            ));
          }
        }, 200);
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => prev.map(att =>
            att.id === attachmentId ? { ...att, preview: e.target?.result as string } : att
          ));
          setTimeout(() => simulateUpload(attachmentId), 100);
        };
        reader.readAsDataURL(file);
      } else {
        setTimeout(() => simulateUpload(attachmentId), 100);
      }
    });
  }, [mergedConfig.allowFileUpload, mergedConfig.maxFileSize, removeAttachment]); // Added dependencies
  
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

  // + HACK: Basic emoji picker integration. Could be enhanced with custom styling or categories.
  // + TODO: Ensure emoji picker position is optimal on all screen sizes and when textarea resizes.
  // + TODO: Consider accessibility for the emoji picker button and the picker itself.

  const handleEmojiClick = (emojiData: EmojiClickData /*, event: MouseEvent */) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + emojiData.emoji + value.slice(end);
      setValue(newValue);

      // Restore cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emojiData.emoji.length;
        textarea.focus(); // Keep focus on textarea
      }, 0);
    }
    // setShowEmojiPicker(false); // Optionally close picker after selection
  };

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node) &&
          // Also check that the click is not on the toggle button itself
          !(event.target instanceof HTMLElement && event.target.closest('.emoji-toggle-button'))) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);
  
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

      {/* ✨ Link Preview Display */}
      {linkPreview && mergedConfig.enableLinkPreview && (
        <div className="p-2 border-b border-border-muted bg-bg-tertiary relative">
          <button
            onClick={() => { setLinkPreview(null); setDetectedUrl(null); }} // Also clear detectedUrl to allow re-fetching if URL is typed again
            className="absolute top-1 right-1 p-1 text-xs text-text-muted hover:text-text-primary bg-bg-secondary rounded-full"
            aria-label="Dismiss link preview"
          >
            ✕
          </button>
          <div className="flex items-center space-x-2">
            {linkPreview.images && linkPreview.images.length > 0 && (
              <img src={linkPreview.images[0]} alt="Preview" className="w-16 h-16 object-cover rounded flex-shrink-0" />
            )}
            {(linkPreview.favicons && linkPreview.favicons.length > 0 && (!linkPreview.images || linkPreview.images.length === 0)) && (
               <img src={linkPreview.favicons[0]} alt="Favicon" className="w-8 h-8 object-contain rounded flex-shrink-0" />
            )}
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-text-primary truncate">{linkPreview.title || 'No title'}</div>
              {linkPreview.description && (
                <p className="text-xs text-text-muted truncate">{linkPreview.description}</p>
              )}
              <a href={linkPreview.url || linkPreview.fetchedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-link hover:underline truncate">
                {linkPreview.url || linkPreview.fetchedUrl}
              </a>
            </div>
          </div>
          {isFetchingPreview && <div className="text-xs text-text-muted pt-1">Fetching preview...</div>}
        </div>
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
                results={autocompleteResults as Array<(MCPTool | SlashCommand | MentionUser) & { type: 'tool' | 'command' | 'mention' }>}
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
              <div className="relative"> {/* Wrapper for emoji button and picker */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={isLoading || !isConnected}
                  className="emoji-toggle-button p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
                  title="Добавить эмодзи"
                >
                  😊 {/* Replace with a proper icon if available */}
                </button>
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-20"> {/* Position picker */}
                    <Picker
                      onEmojiClick={handleEmojiClick}
                      // pickerStyle={{ width: '100%', boxShadow: 'none' }} // Example styling
                      // Other props like theme, categories can be added
                    />
                  </div>
                )}
              </div>
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
  results: Array<(MCPTool | SlashCommand | MentionUser) & { type: 'tool' | 'command' | 'mention' }>;
  selectedIndex: number;
  onSelect: (item: (MCPTool & {type: 'tool'}) | (SlashCommand & {type: 'command'}) | (MentionUser & {type: 'mention'})) => void;
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
      Подсказки
    </div>
    {results.map((item, index) => (
      <button
        key={item.id || item.name} // Use id for users if available, otherwise name
        className={clsx(
          'w-full text-left px-3 py-2 hover:bg-bg-hover transition-colors',
          {
            'bg-accent-primary text-white': index === selectedIndex,
          }
        )}
        onClick={() => onSelect(item)}
      >
        <div className="flex items-center space-x-2">
          {item.type === 'mention' && item.avatar && <img src={item.avatar} alt={item.name} className="w-5 h-5 rounded-full mr-1" />}
          <span className="text-lg">{item.icon || (item.type === 'tool' ? '🔧' : item.type === 'command' ? '⚡' : '👤')}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {item.type === 'mention' ? '@' : '/'}{item.name}
            </div>
            {item.description && <div className="text-xs opacity-75 truncate">{item.description}</div>}
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
    if (attachment.uploadStatus === 'error' && attachment.size === file.size) return ''; // Don't show size for initial error state if it's about size
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <div className="relative bg-bg-tertiary border border-border-muted rounded-lg p-2 group w-64"> {/* Added w-64 */}
      <div className="flex items-center space-x-2">
        {/* 🖼️ Превью */}
        {attachment.preview ? (
          <img 
            src={attachment.preview} 
            alt={attachment.name}
            className="w-8 h-8 object-cover rounded flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-bg-hover rounded flex items-center justify-center text-xs flex-shrink-0">
            {attachment.type.startsWith('image/') ? '🖼️' : '📄'}
          </div>
        )}
        
        {/* 📝 Информация */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {attachment.name}
          </div>
          <div className="text-xs text-text-muted">
            {formatFileSize(attachment.size)}
            {attachment.uploadStatus === 'error' && attachment.error && (
              <span className="text-accent-error ml-1"> - {attachment.error.length > 20 ? attachment.error.substring(0,17)+'...' : attachment.error}</span>
            )}
            {attachment.uploadStatus === 'uploading' && (
              <span className="text-text-muted ml-1"> - {attachment.progress}%</span>
            )}
            {attachment.uploadStatus === 'completed' && (
              <span className="text-accent-success ml-1"> - Done!</span>
            )}
          </div>
        </div>
        
        {/* 🗑️ Удалить */}
        {attachment.uploadStatus !== 'uploading' && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-accent-error transition-all"
            title="Удалить файл"
          >
            ✕
          </button>
        )}
      </div>
      {/* 📊 Progress Bar */}
      {attachment.uploadStatus === 'uploading' && attachment.progress !== undefined && (
        <div className="mt-1 h-1 w-full bg-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-primary transition-all duration-150"
            style={{ width: `${attachment.progress}%` }}
          />
        </div>
      )}
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
// INFO: Basic emoji picker functionality added.
// INFO: Basic slash command functionality added (/clear, /shrug, /help).
// TODO: Expand slash command library and improve /help display.
// INFO: Basic @mention functionality added.
// TODO: Enhance AutocompleteDropdown UI for mentions (e.g., avatars).
// INFO: Basic link preview functionality added.
// NOTE: The fallback preview fetch requires a CORS proxy at /api/cors-proxy?url=
// INFO: Basic simulated progress bar for file uploads added.
// TODO: Replace simulated upload with actual file upload service integration.
// HACK: Временно используем простые эмодзи, заменить на proper icon library