import React, { useState, useEffect, useRef } from 'react';
import { AIProviderManager } from '../services/ai/AIProviderManager';
import { AIMessage } from '../services/ai/types';

interface ChatMessage extends AIMessage {
  id: string;
  isStreaming?: boolean;
}

interface Props {
  manager: AIProviderManager;
}

export const AIChat: React.FC<Props> = ({ manager }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я готов помочь вам. Для начала настройте AI провайдер, нажав на кнопку "⚙️ Configure AI" в верхнем правом углу.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const provider = manager.getActiveProvider();
    setActiveProvider(provider?.name || null);
  }, [manager]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const provider = manager.getActiveProvider();
    if (!provider) {
      alert('Пожалуйста, настройте AI провайдер перед отправкой сообщений');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Try streaming first
      if (provider.supportsStreaming && provider.streamMessage) {
        let fullContent = '';
        
        for await (const chunk of manager.streamMessage(conversationHistory)) {
          fullContent += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullContent, isStreaming: true }
              : msg
          ));
        }

        // Mark streaming as complete
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        ));
      } else {
        // Fallback to non-streaming
        const response = await manager.sendMessage(conversationHistory);
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: response.content, isStreaming: false }
            : msg
        ));
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: `❌ Ошибка: ${error.message}. Проверьте настройки AI провайдера.`,
              isStreaming: false
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessage = (content: string) => {
    // Форматирование различных типов контента
    if (content.includes('```')) {
      // Обработка кода
      return content.split('```').map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre key={index} className="bg-gray-800 text-green-400 p-3 rounded my-2 overflow-x-auto text-sm font-mono">
              <code>{part}</code>
            </pre>
          );
        } else {
          return formatTextContent(part, index);
        }
      });
    } else {
      return formatTextContent(content, 0);
    }
  };

  const formatTextContent = (text: string, key: number) => {
    // Разделение на строки и форматирование
    const lines = text.split('\n');
    
    return (
      <div key={key}>
        {lines.map((line, lineIndex) => {
          // Заголовки
          if (line.match(/^#{1,6}\s/)) {
            const level = line.match(/^(#{1,6})/)?.[1].length || 1;
            const text = line.replace(/^#{1,6}\s/, '');
            const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag key={lineIndex} className="font-bold mt-3 mb-1 text-gray-800">
                {text}
              </HeadingTag>
            );
          }
          
          // Списки
          if (line.match(/^\s*[•·-]\s/) || line.match(/^\s*\d+\.\s/)) {
            return (
              <div key={lineIndex} className="ml-4 mb-1">
                <span className="text-blue-600 mr-2">
                  {line.match(/^\s*\d+\./) ? '📋' : '•'}
                </span>
                {line.replace(/^\s*([•·-]|\d+\.)\s/, '')}
              </div>
            );
          }
          
          // Эмодзи заголовки (🌤️ Погода в городе...)
          if (line.match(/^[🌤️🧮🆔🔄🎲📊📋📖📝❌⚠️💡✅🔗📨📤🛑]/)) {
            return (
              <div key={lineIndex} className="font-semibold mt-2 mb-1 text-gray-800 flex items-start">
                <span className="mr-2 text-lg">{line.match(/^[^\s]+/)?.[0]}</span>
                <span>{line.replace(/^[^\s]+\s*/, '')}</span>
              </div>
            );
          }
          
          // Отступы для структурированного текста
          if (line.match(/^\s{2,}/)) {
            const indentLevel = Math.floor((line.match(/^\s*/)?.[0].length || 0) / 2);
            return (
              <div 
                key={lineIndex} 
                className={`mb-1 text-gray-700 ${indentLevel > 1 ? 'ml-4' : 'ml-2'}`}
                style={{ marginLeft: `${indentLevel * 16}px` }}
              >
                {line.trim()}
              </div>
            );
          }
          
          // Обычные строки
          if (line.trim()) {
            return (
              <div key={lineIndex} className="mb-1">
                {line}
              </div>
            );
          } else {
            return <div key={lineIndex} className="h-2" />;
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Modern Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-base bg-card rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">Умный Чат</h2>
            <div className="flex items-center gap-2">
              {activeProvider ? (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-secondary font-medium">{activeProvider}</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-muted">Настройте провайдер</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700 font-medium">Думаю...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Avatar and Name */}
              <div className={`flex items-center gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                }`}>
                  {message.role === 'user' ? 'Вы' : 'AI'}
                </div>
                <span className="text-xs text-muted font-medium">
                  {message.timestamp && formatTime(message.timestamp)}
                </span>
              </div>
              
              {/* Message Bubble */}
              <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                  : 'bg-card border border-base text-primary'
              }`}>
                <div className="prose prose-sm max-w-none">
                  {message.role === 'assistant' ? (
                    <div>
                      {formatMessage(message.content)}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1 rounded-full" />
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-white">
                      {message.content}
                    </div>
                  )}
                </div>
                
                {/* Message Actions */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-opacity-20">
                  <div className="flex items-center gap-2">
                    {message.role === 'assistant' && (
                      <>
                        <button className="text-xs text-muted hover:text-secondary transition-colors">
                          👍
                        </button>
                        <button className="text-xs text-muted hover:text-secondary transition-colors">
                          👎
                        </button>
                        <button className="text-xs text-muted hover:text-secondary transition-colors">
                          📋 Копировать
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input */}
      <div className="p-6 bg-card border-t border-base">
        <div className="relative">
          <div className="flex items-end gap-3 p-3 bg-muted rounded-2xl border border-base focus-within:border-primary transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={activeProvider ? "Напишите сообщение..." : "Настройте AI провайдер"}
              disabled={!activeProvider || isLoading}
              className="flex-1 bg-transparent resize-none outline-none placeholder-muted text-primary min-h-[24px] max-h-32 disabled:opacity-50"
              rows={1}
              style={{ 
                height: 'auto',
                minHeight: '24px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-ghost p-2 text-muted hover:text-secondary"
                title="Прикрепить файл"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              <button 
                className="btn btn-ghost p-2 text-muted hover:text-secondary"
                title="Голосовое сообщение"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !activeProvider || isLoading}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && activeProvider && !isLoading
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:scale-105'
                    : 'bg-subtle text-muted cursor-not-allowed'
                }`}
                title="Отправить сообщение"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Keyboard Shortcuts */}
          <div className="flex items-center justify-between mt-2 text-xs text-muted">
            <span>Enter для отправки • Shift+Enter для новой строки</span>
            {!activeProvider && (
              <span className="text-amber-600">⚠️ Настройте провайдер</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};