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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with provider status */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">AI Chat</h2>
          <p className="text-sm text-gray-600">
            {activeProvider ? `Подключен: ${activeProvider}` : 'Провайдер не настроен'}
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Генерируется...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              <div className="whitespace-pre-wrap">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-1" />
                )}
              </div>
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp && formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={activeProvider ? "Введите сообщение... (Enter для отправки, Shift+Enter для новой строки)" : "Настройте AI провайдер для начала общения"}
            disabled={!activeProvider || isLoading}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-32 disabled:opacity-50"
            rows={1}
            style={{ 
              height: 'auto',
              minHeight: '44px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !activeProvider || isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
          >
            {isLoading ? '...' : 'Отправить'}
          </button>
        </div>
        
        {!activeProvider && (
          <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ Настройте AI провайдер для начала общения
          </div>
        )}
      </div>
    </div>
  );
};