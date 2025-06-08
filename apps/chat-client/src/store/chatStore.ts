/**
 * 💬 CHAT STORE
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Zustand store для управления чат сообщениями и взаимодействием.
 * Содержит логику отправки сообщений, истории и UI состояния.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Message } from '@mcp-ui/chat-ui';

// 📝 Интерфейс состояния
interface ChatStoreState {
  // 📊 Данные
  messages: Message[];
  isTyping: boolean;
  
  // 🔧 Действия
  addMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
  setTyping: (typing: boolean) => void;
}

/**
 * 💬 Chat Store
 */
export const useChatStore = create<ChatStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // 📊 Начальное состояние
        messages: [
          // 👋 Приветственное сообщение
          {
            id: 'welcome-1',
            type: 'system',
            content: 'Добро пожаловать в MCP Chat Client! 🎉',
            timestamp: new Date(),
            status: 'completed',
          },
          {
            id: 'welcome-2', 
            type: 'system',
            content: 'Подключите MCP сервер через боковую панель (нажмите Ctrl+K или кнопку меню) чтобы начать общение.',
            timestamp: new Date(),
            status: 'completed',
          },
        ],
        isTyping: false,

        // 🔧 Действия
        addMessage: (message) => {
          set((state) => ({
            messages: [...state.messages, message],
          }), false, 'addMessage');
        },

        removeMessage: (messageId) => {
          set((state) => ({
            messages: state.messages.filter(m => m.id !== messageId),
          }), false, 'removeMessage');
        },

        updateMessage: (messageId, updates) => {
          set((state) => ({
            messages: state.messages.map(message =>
              message.id === messageId
                ? { ...message, ...updates }
                : message
            ),
          }), false, 'updateMessage');
        },

        clearMessages: () => {
          set({ messages: [] }, false, 'clearMessages');
        },

        sendMessage: async (content) => {
          try {
            // 📤 Создаем сообщение пользователя
            const userMessage: Message = {
              id: `user-${Date.now()}`,
              type: 'user',
              content,
              timestamp: new Date(),
              status: 'sending',
            };

            // 📝 Добавляем сообщение
            get().addMessage(userMessage);

            // 🔄 Обновляем статус на "отправлено"
            setTimeout(() => {
              get().updateMessage(userMessage.id, { status: 'sent' });
            }, 100);

            // ⌨️ Показываем индикатор печати
            get().setTyping(true);

            // 🧪 Имитация ответа от сервера
            setTimeout(() => {
              // 🤖 Создаем ответ ассистента
              const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                type: 'assistant',
                content: generateMockResponse(content),
                timestamp: new Date(),
                status: 'completed',
                metadata: {
                  executionTime: Math.floor(Math.random() * 1000) + 500,
                },
              };

              // 📝 Добавляем ответ и убираем индикатор печати
              get().addMessage(assistantMessage);
              get().setTyping(false);

              // ✅ Обновляем статус пользовательского сообщения
              get().updateMessage(userMessage.id, { status: 'completed' });
            }, 1500 + Math.random() * 2000);

          } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error);
            
            // ❌ Создаем сообщение об ошибке
            const errorMessage: Message = {
              id: `error-${Date.now()}`,
              type: 'error',
              content: `Ошибка отправки сообщения: ${error}`,
              timestamp: new Date(),
              status: 'failed',
              error: {
                message: String(error),
                code: 'SEND_ERROR',
              },
            };

            get().addMessage(errorMessage);
            get().setTyping(false);
          }
        },

        setTyping: (typing) => {
          set({ isTyping: typing }, false, 'setTyping');
        },
      }),
      {
        name: 'chat-store',
        // 📝 Сохраняем только сообщения (не UI состояние)
        partialize: (state) => ({
          messages: state.messages,
        }),
      }
    ),
    {
      name: 'chat-store',
    }
  )
);

/**
 * 🤖 Генерация мокового ответа
 */
function generateMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // 👋 Приветствие
  if (message.includes('привет') || message.includes('hello')) {
    return 'Привет! 👋 Я демо-помощник MCP Chat Client. Пока что я работаю в режиме демонстрации. Подключите настоящий MCP сервер для полной функциональности!';
  }
  
  // ❓ Помощь
  if (message.includes('помощь') || message.includes('help')) {
    return `🆘 **Доступные команды:**

• Подключите MCP сервер через меню (Ctrl+K)
• Используйте горячие клавиши:
  - Ctrl+K: открыть/закрыть панель серверов
  - Ctrl+Shift+T: переключить тему
• Начните общение с любого сообщения

📚 Это демо-режим. Для полной функциональности подключите реальный MCP сервер.`;
  }
  
  // 🔧 Инструменты
  if (message.includes('инструмент') || message.includes('tool')) {
    return '🔧 **Доступные инструменты:** В демо-режиме инструменты недоступны. Подключите MCP сервер чтобы получить доступ к real-time инструментам для работы с файлами, API, базами данных и другими ресурсами.';
  }
  
  // 📊 Статус
  if (message.includes('статус') || message.includes('status')) {
    return '📊 **Текущий статус:**\n\n• Режим: Демонстрация\n• MCP сервер: Не подключен\n• Сообщений: ' + useChatStore.getState().messages.length + '\n• Тема: Темная\n\nДля полной функциональности подключите MCP сервер.';
  }
  
  // 🎯 Общий ответ
  const responses = [
    'Интересно! 🤔 В полной версии с MCP сервером я смогу дать более детальный ответ.',
    'Понял! 📝 Сейчас я работаю в демо-режиме. Подключите MCP сервер для расширенных возможностей.',
    'Хороший вопрос! 💡 С подключенным MCP сервером я смогу использовать специальные инструменты для ответа.',
    'Заметил! 👀 В демо-режиме мои возможности ограничены. Подключите реальный MCP сервер для полной функциональности.',
    'Отлично! ✨ Это демо-ответ. С настоящим MCP сервером я смогу предоставить более полезную информацию.',
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 CHAT STATE MANAGEMENT:
 * 
 * 📝 **Message Lifecycle**:
 * 1. User types message
 * 2. Message added with 'sending' status
 * 3. Sent to server, status → 'sent'
 * 4. Server processes, status → 'completed'
 * 5. Response received and displayed
 * 
 * 🔄 **State Updates**:
 * - Immutable updates через Zustand
 * - Optimistic UI updates
 * - Error handling с fallback states
 * 
 * 💾 **Persistence**:
 * - Messages saved to localStorage
 * - UI state (typing) not persisted
 * - Partial state save для оптимизации
 */

/**
 * 🤖 MOCK SYSTEM:
 * 
 * 🎯 **Demo Responses**:
 * - Pattern matching для smart responses
 * - Contextual help и guidance
 * - Consistent UX even without real server
 * 
 * ⏱️ **Realistic Timing**:
 * - Typing indicators
 * - Variable response delays
 * - Status transitions simulation
 * 
 * 🔄 **Fallback Strategy**:
 * - Graceful degradation без MCP server
 * - Educational responses
 * - Clear indication of demo mode
 */