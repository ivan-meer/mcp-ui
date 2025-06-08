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
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Header } from '@/components/Header';
import { StatusBar } from '@/components/StatusBar';

// 🔌 MCP подключения (заглушки)
// import { useMcpStore } from '@/store/mcpStore';
// import { useChatStore } from '@/store/chatStore';

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
    servers: serversFromStore, // Rename to avoid conflict
    activeServer: activeServerFromStore, // Rename
    connectionStatus,
    connectToServer,
    disconnectFromServer 
  } = useMcpStore();
  
  const {
    messages,
    addMessage,
    isTyping,
    sendMessage,
    removeMessage // Assuming removeMessage is now exported from useChatStore (it was, named removeMessage)
  } = useChatStore();
  
  // 🔧 Локальное состояние
  const [sidebarOpen, setSidebarOpen] = useState(false); // For OldSidebar
  const [isServerSidebarOpen, setIsServerSidebarOpen] = useState(false); // For new ServerSidebar
  const [loading, setLoading] = useState(true);

  // Instantiate ServerManager - ensure it's created once
  const [serverManagerInstance] = useState(() => {
    // HACK: Add some default servers for testing if none are loaded from elsewhere (e.g., localStorage)
    // TODO: Implement proper loading of server configs into ServerManager, possibly from localStorage or a config file.
    const initialServers: ServerConfig[] = [
      { id: 'default-ws', name: 'Default WebSocket', transport: 'websocket', url: 'ws://localhost:8080', type: 'mcp' },
      { id: 'local-echo', name: 'Local Echo Server', transport: 'localprocess', url: 'echo_server_command', type: 'mcp' },
    ];
    console.log("Initializing ServerManager with initial configs for sidebar:", initialServers);
    return new ServerManager(initialServers);
  });

  const [activeServerIdForSidebar, setActiveServerIdForSidebar] = useState<string | null>(serverManagerInstance.getActiveServerId());
  const [serverListForSidebar, setServerListForSidebar] = useState<ServerConfig[]>(serverManagerInstance.listServers());

  // Effect to subscribe to ServerManager events
  useEffect(() => {
    const handleActiveServerChanged = (server: ServerConfig | null) => {
      console.log("App.tsx: Active server changed in manager:", server);
      setActiveServerIdForSidebar(server ? server.id : null);
    };
    const handleServersChanged = (updatedServers: ServerConfig[]) => {
      console.log("App.tsx: Server list changed in manager:", updatedServers);
      setServerListForSidebar(updatedServers);
    };
    const handleStatusChanged = ({ serverId, status }: { serverId: string, status: string }) => {
      console.log(`App.tsx: Status for ${serverId} changed to ${status} in manager`);
      // This will trigger re-render in ServerSidebar due to its own useEffect listening to serverManager
    };

    serverManagerInstance.on('activeServerChanged', handleActiveServerChanged);
    serverManagerInstance.on('serversChanged', handleServersChanged);
    serverManagerInstance.on('statusChanged', handleStatusChanged);

    // Initial sync
    setActiveServerIdForSidebar(serverManagerInstance.getActiveServerId());
    setServerListForSidebar(serverManagerInstance.listServers());

    return () => {
      serverManagerInstance.off('activeServerChanged', handleActiveServerChanged);
      serverManagerInstance.off('serversChanged', handleServersChanged);
      serverManagerInstance.off('statusChanged', handleStatusChanged);
    };
  }, [serverManagerInstance]);
  
  // ⌨️ Горячие клавиши
  useKeyboardShortcuts({
    'Ctrl+K': () => setSidebarOpen(!sidebarOpen), // Original shortcut for OldSidebar
    'Ctrl+Alt+S': () => setIsServerSidebarOpen(!isServerSidebarOpen), // New shortcut for ServerSidebar
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
      if (activeServerFromStore) { // Use renamed
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
  const handleChatEvent = (event: ChatEventData) => { // Changed 'any' to 'ChatEventData'
    console.log('💬 Chat Event:', event);
    
    switch (event.type) {
      case 'message-send':
        // Уже обработано в handleSendMessage
        break;
      case 'requestDeleteMessage': // Matches the event from MessageList context menu
        if (event.messageId && typeof event.messageId === 'string') { // Ensure messageId is a string
          console.log(`App: Request to delete message ${event.messageId}`);
          if (typeof removeMessage === 'function') {
            removeMessage(event.messageId);
          } else {
            console.warn("removeMessage action not found in useChatStore. Message deletion failed.");
          }
          // TODO: Add confirmation dialog before actual deletion if desired by product requirements.
        } else {
          console.warn("requestDeleteMessage event received without valid messageId", event);
        }
        break;
      case 'uiAction': // Matches the event from UIComponentRenderer
        console.log('App: UI Action event received:', event.payload);
        // TODO: Implement logic to handle actions from UI components (e.g., call MCP tools, interact with app state).
        addMessage({
          id: `ui-action-${Date.now()}`,
          type: 'system',
          content: `UI Action from component: ${event.payload?.tool || event.payload?.action || 'Unknown action'} with params: ${JSON.stringify(event.payload?.params)}`,
          timestamp: new Date(),
          status: 'completed', // System messages are typically completed
        });
        break;
      case 'systemNotification': // Matches the event from MessageList context menu copy action
        console.log('App: System Notification:', event.payload);
        // Optionally, display this in a more user-friendly way (e.g., a toast notification system).
        // For now, logging is sufficient. Adding to chat might be too noisy.
        // addMessage({
        //   id: `sys-notification-${Date.now()}`,
        //   type: 'system',
        //   content: `Notification: ${event.payload?.text} (Level: ${event.payload?.level})`,
        //   timestamp: new Date(),
        //   status: 'completed',
        // });
        break;
      default:
        console.log('🔍 Неизвестное событие чата:', event.type);
    }
  };
  
  // ... useKeyboardShortcuts, useEffect for initializeApp ...

  // Handlers for the new ServerSidebar
  const handleSelectServerForSidebar = useCallback((serverId: string) => {
    console.log(`App: ServerSidebar requests to select server ${serverId}`);
    serverManagerInstance.setActiveServer(serverId);
    // Note: This only sets it active in serverManagerInstance for ServerSidebar's context.
    // The main app's activeServer (from useMcpStore) is still separate for now.
    // TODO: Fully integrate ServerManager with useMcpStore so they are in sync.
  }, [serverManagerInstance]);

  const handleConnectServerFromSidebar = useCallback(async (serverId: string) => {
    const serverToConnect = serverManagerInstance.getServerById(serverId);
    if (!serverToConnect) {
      console.error(`App: Server ${serverId} not found in ServerManager.`);
      return;
    }
    console.log(`App: ServerSidebar requests to connect to server ${serverId}`);
    serverManagerInstance.updateServerStatus(serverId, 'connecting');
    try {
      // Assuming connectToServer from useMcpStore takes a ServerConfig-like object or just the ID
      // For this refinement, we'll assume useMcpStore's connectToServer can handle a server ID
      // and find the full config, or that it needs the full config.
      // For now, connectToServer (from useMcpStore) is NOT being called here to avoid dual state issues.
      // This handler will just update the status in ServerManager for the sidebar's view.
      console.warn(`App: connectToServer from useMcpStore NOT CALLED for ${serverId} to prevent state conflicts during this refinement step.`);
      console.log(`Simulating connection to ${serverToConnect.name}...`);
      // Simulate connection attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = Math.random() > 0.3; // Simulate success/failure
      if (success) {
        serverManagerInstance.updateServerStatus(serverId, 'connected');
        // If this were the main connection: useMcpStore.setState({ activeServer: serverToConnect, connectionStatus: 'connected' });
      } else {
        serverManagerInstance.updateServerStatus(serverId, 'error');
        // If this were the main connection: useMcpStore.setState({ connectionStatus: 'error' });
      }
    } catch (err) {
      console.error(`App: Error connecting to server ${serverId} from sidebar:`, err);
      serverManagerInstance.updateServerStatus(serverId, 'error');
    }
  }, [serverManagerInstance/*, connectToServer - re-add if fully integrating */]);

  const handleDisconnectServerFromSidebar = useCallback(async (serverId: string) => {
    console.log(`App: ServerSidebar requests to disconnect from server ${serverId}`);
    // Similar to connect, this will just update ServerManager's status for now.
    // disconnectFromServer(serverId); // from useMcpStore - NOT CALLED
    console.warn(`App: disconnectFromServer from useMcpStore NOT CALLED for ${serverId} to prevent state conflicts.`);
    serverManagerInstance.updateServerStatus(serverId, 'disconnected');
    if (serverManagerInstance.getActiveServerId() === serverId) {
       serverManagerInstance.setActiveServer(null); // Also deactivate in manager if it was active
    }
  }, [serverManagerInstance/*, disconnectFromServer - re-add if fully integrating */]);

  // ⏳ Экран загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          {/* Using the new LoadingSpinner component with mapped size and message prop */}
          <LoadingSpinner isLoading={true} size="lg" message="Загрузка MCP Chat Client..." />
        </div>
      </div>
    );
  }
  
  // 📱 Основной интерфейс
  return (
    <div className={`min-h-screen bg-bg-primary ${theme}`}>
      {/* 📊 Главная структура */}
      <div className="flex h-screen">
        {/* 📋 Боковая панель (старая) */}
        <OldSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          servers={serversFromStore} // Use renamed store state
          activeServer={activeServerFromStore} // Use renamed store state
          onConnectServer={connectToServer}
          onDisconnectServer={disconnectFromServer}
        />

        {/* Новый ServerSidebar */}
        <ServerSidebar
          isOpen={isServerSidebarOpen}
          onClose={() => setIsServerSidebarOpen(false)}
          serverManager={serverManagerInstance}
          activeServerId={activeServerIdForSidebar}
          onSelectServer={handleSelectServerForSidebar}
          onConnectServer={handleConnectServerFromSidebar}
          onDisconnectServer={handleDisconnectServerFromSidebar}
        />
        
        {/* 💬 Основная область чата */}
        <div className="flex-1 flex flex-col">
          {/* 📊 Шапка */}
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            activeServer={activeServerFromStore} // Use renamed store state for Header
            connectionStatus={connectionStatus}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          
          {/* 💬 Область чата */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Suspense fallback={<LoadingSpinner isLoading={true} message="Загрузка..." />}>
              <Routes>
                {/* 💬 Главная страница - чат */}
                <Route path="/" element={
                  <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onChatEvent={handleChatEvent}
                    connectionStatus={connectionStatus} // This comes from useMcpStore
                    activeServer={activeServerFromStore} // This comes from useMcpStore
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
            connectionStatus={connectionStatus} // From useMcpStore
            currentServer={activeServerFromStore?.name} // From useMcpStore
            // messageCount prop removed as it's not in the new StatusBarProps
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