/**
 * 📱 MAIN APP COMPONENT
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Главный компонент MCP Chat Client приложения.
 * Объединяет все основные части: роутинг, состояние, UI компоненты.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. React Router для навигации
 * 2. Zustand для управления состоянием
 * 3. Compound Component Pattern для чата
 * 4. Error Boundaries для надежности
 */

import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🎨 UI Компоненты
import { ChatWindow, MessageList, MessageInput } from '@mcp-ui/chat-ui';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { StatusBar } from '@/components/StatusBar';

// 🔌 MCP подключения
import { useMcpStore } from '@/store/mcpStore';
import { useChatStore } from '@/store/chatStore';

// 🛠️ Хуки и утилиты
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';

// 📝 Типы
import type { Message } from '@mcp-ui/chat-ui';

/**
 * 📱 Главный компонент приложения
 */
function App() {
  // 🎨 Тема
  const { theme, toggleTheme } = useTheme();
  
  // 📊 Состояние
  const { 
    servers, 
    activeServer, 
    connectionStatus,
    connectToServer,
    disconnectFromServer 
  } = useMcpStore();
  
  const {
    messages,
    addMessage,
    isTyping,
    sendMessage
  } = useChatStore();
  
  // 🔧 Локальное состояние
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ⌨️ Горячие клавиши
  useKeyboardShortcuts({
    'Ctrl+K': () => setSidebarOpen(!sidebarOpen),
    'Ctrl+Shift+T': toggleTheme,
  });
  
  // 🚀 Инициализация приложения
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 📝 Загружаем настройки из localStorage
        const savedTheme = localStorage.getItem('mcp-chat-theme');
        if (savedTheme && savedTheme !== theme) {
          // setTheme(savedTheme as 'light' | 'dark');
        }
        
        // 📋 Загружаем сохраненные серверы
        const savedServers = localStorage.getItem('mcp-chat-servers');
        if (savedServers) {
          // loadServers(JSON.parse(savedServers));
        }
        
        // ✅ Приложение готово
        setLoading(false);
        
        console.log('✅ MCP Chat Client инициализирован');
      } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        setLoading(false);
      }
    };
    
    initializeApp();
  }, [theme]);
  
  // 📤 Обработчик отправки сообщения
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      // 📝 Добавляем сообщение пользователя
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: content.trim(),
        timestamp: new Date(),
        status: 'completed',
      };
      
      addMessage(userMessage);
      
      // 📤 Отправляем через MCP если есть активный сервер
      if (activeServer) {
        await sendMessage(content.trim());
      } else {
        // 🤖 Фиктивный ответ если нет сервера
        setTimeout(() => {
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            type: 'assistant', 
            content: 'Для начала работы подключите MCP сервер через боковую панель (Ctrl+K)',
            timestamp: new Date(),
            status: 'completed',
          };
          addMessage(assistantMessage);
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      
      // ❌ Добавляем сообщение об ошибке
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
      addMessage(errorMessage);
    }
  };
  
  // 🎯 Обработчик событий чата
  const handleChatEvent = (event: any) => {
    console.log('💬 Chat Event:', event);
    
    switch (event.type) {
      case 'message-send':
        // Уже обработано в handleSendMessage
        break;
      case 'message-delete':
        // TODO: Реализовать удаление сообщений
        break;
      default:
        console.log('🔍 Неизвестное событие чата:', event.type);
    }
  };
  
  // ⏳ Экран загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <h2 className="mt-4 text-xl font-semibold text-text-primary">
            Загрузка MCP Chat Client...
          </h2>
          <p className="mt-2 text-text-muted">
            Инициализация системы и подключений
          </p>
        </div>
      </div>
    );
  }
  
  // 📱 Основной интерфейс
  return (
    <div className={`min-h-screen bg-bg-primary ${theme}`}>
      {/* 📊 Главная структура */}
      <div className="flex h-screen">
        {/* 📋 Боковая панель */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          servers={servers}
          activeServer={activeServer}
          onConnectServer={connectToServer}
          onDisconnectServer={disconnectFromServer}
        />
        
        {/* 💬 Основная область чата */}
        <div className="flex-1 flex flex-col">
          {/* 📊 Шапка */}
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            activeServer={activeServer}
            connectionStatus={connectionStatus}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          
          {/* 💬 Область чата */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* 💬 Главная страница - чат */}
                <Route path="/" element={
                  <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onChatEvent={handleChatEvent}
                    connectionStatus={connectionStatus}
                    activeServer={activeServer}
                    isTyping={isTyping}
                    config={{
                      theme: theme,
                      showTimestamps: true,
                      showServerNames: true,
                      autoScroll: true,
                      compactMode: false,
                    }}
                    className="flex-1"
                  />
                } />
                
                {/* 🔄 Перенаправление */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          
          {/* 📊 Строка состояния */}
          <StatusBar
            connectionStatus={connectionStatus}
            activeServer={activeServer}
            messageCount={messages.length}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 APP ARCHITECTURE:
 * 
 * 🏗️ **Component Structure**:
 * - Header: навигация и статус
 * - Sidebar: управление серверами  
 * - ChatWindow: основной интерфейс чата
 * - StatusBar: информация о состоянии
 * 
 * 📊 **State Management**:
 * - useMcpStore: MCP серверы и подключения
 * - useChatStore: сообщения и чат логика
 * - Локальное состояние для UI
 * 
 * 🎯 **Event Handling**:
 * - Keyboard shortcuts для UX
 * - Chat events для интерактивности
 * - Error handling для надежности
 */

/**
 * 🔄 MESSAGE FLOW:
 * 
 * 📤 **Outgoing Messages**:
 * 1. User types in MessageInput
 * 2. handleSendMessage adds user message
 * 3. Message sent to active MCP server
 * 4. Server response added as assistant message
 * 
 * 📥 **Incoming Messages**:
 * 1. MCP server sends response/notification
 * 2. Message processed by MCP connector
 * 3. Chat store updated with new message
 * 4. UI automatically re-renders
 * 
 * ❌ **Error Handling**:
 * - Network errors gracefully handled
 * - Error messages shown to user
 * - Fallback responses when no server
 */