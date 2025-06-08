/**
 * 🔌 MCP STORE
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Zustand store для управления MCP серверами и подключениями.
 * Содержит логику подключения, отключения и мониторинга серверов.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { McpServer, McpConnectionStatus } from '@mcp-ui/mcp-connector';

// 📝 Интерфейс состояния
interface McpStoreState {
  // 📊 Данные
  servers: McpServer[];
  activeServer: McpServer | null;
  connectionStatus: McpConnectionStatus;
  
  // 🔧 Действия
  addServer: (server: McpServer) => void;
  removeServer: (serverId: string) => void;
  connectToServer: (serverId: string) => Promise<void>;
  disconnectFromServer: () => Promise<void>;
  updateServerStatus: (serverId: string, status: 'online' | 'offline' | 'error') => void;
}

/**
 * 🔌 MCP Store
 */
export const useMcpStore = create<McpStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // 📊 Начальное состояние
        servers: [
          // 🧪 Демо сервер для тестирования
          {
            id: 'demo-server',
            name: 'Demo MCP Server',
            description: 'Локальный демо сервер для тестирования MCP возможностей',
            version: '1.0.0',
            url: 'ws://localhost:3001',
            status: 'unknown',
            capabilities: {
              tools: { listChanged: true },
              resources: { listChanged: true },
              prompts: { listChanged: true },
            },
            transport: {
              type: 'websocket',
              config: {
                url: 'ws://localhost:3001',
                autoReconnect: true,
              },
            },
            metadata: {
              isDemo: true,
              category: 'development',
            },
          },
        ],
        activeServer: null,
        connectionStatus: 'disconnected',

        // 🔧 Действия
        addServer: (server) => {
          set((state) => ({
            servers: [...state.servers, server],
          }), false, 'addServer');
        },

        removeServer: (serverId) => {
          set((state) => ({
            servers: state.servers.filter(s => s.id !== serverId),
            activeServer: state.activeServer?.id === serverId ? null : state.activeServer,
          }), false, 'removeServer');
        },

        connectToServer: async (serverId) => {
          const server = get().servers.find(s => s.id === serverId);
          if (!server) {
            console.error('❌ Сервер не найден:', serverId);
            return;
          }

          try {
            // 🔄 Обновляем статус
            set({ connectionStatus: 'connecting' }, false, 'connectToServer:start');
            
            console.log('🔌 Подключение к серверу:', server.name);
            
            // TODO: Реальное подключение через MCP Client
            // const client = createWebSocketClient({ url: server.url });
            // await client.connect();
            
            // 🧪 Имитация подключения для демо
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // ✅ Успешное подключение
            set({
              activeServer: server,
              connectionStatus: 'connected',
            }, false, 'connectToServer:success');
            
            // 📊 Обновляем статус сервера
            get().updateServerStatus(serverId, 'online');
            
            console.log('✅ Подключено к серверу:', server.name);
            
          } catch (error) {
            console.error('❌ Ошибка подключения:', error);
            
            set({
              connectionStatus: 'error',
              activeServer: null,
            }, false, 'connectToServer:error');
            
            get().updateServerStatus(serverId, 'error');
          }
        },

        disconnectFromServer: async () => {
          const activeServer = get().activeServer;
          if (!activeServer) return;

          try {
            set({ connectionStatus: 'disconnecting' }, false, 'disconnectFromServer:start');
            
            console.log('💔 Отключение от сервера:', activeServer.name);
            
            // TODO: Реальное отключение
            // await client.disconnect();
            
            // 🧪 Имитация отключения
            await new Promise(resolve => setTimeout(resolve, 500));
            
            set({
              activeServer: null,
              connectionStatus: 'disconnected',
            }, false, 'disconnectFromServer:success');
            
            console.log('💔 Отключено от сервера');
            
          } catch (error) {
            console.error('❌ Ошибка отключения:', error);
          }
        },

        updateServerStatus: (serverId, status) => {
          set((state) => ({
            servers: state.servers.map(server =>
              server.id === serverId
                ? { ...server, status, lastConnected: new Date() }
                : server
            ),
          }), false, 'updateServerStatus');
        },
      }),
      {
        name: 'mcp-store',
        // 🔒 Не сохраняем чувствительные данные
        partialize: (state) => ({
          servers: state.servers.map(server => ({
            ...server,
            // 🚫 Исключаем чувствительную информацию
            transport: {
              ...server.transport,
              config: {
                ...server.transport.config,
                // Не сохраняем токены и пароли
              }
            }
          })),
        }),
      }
    ),
    {
      name: 'mcp-store',
    }
  )
);

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 ZUSTAND STORE PATTERNS:
 * 
 * 🏗️ **Store Structure**:
 * - State: данные приложения
 * - Actions: функции изменения состояния  
 * - Selectors: вычисляемые значения
 * 
 * 🔧 **Middleware Benefits**:
 * - devtools: Redux DevTools integration
 * - persist: автоматическое сохранение в localStorage
 * - immer: immutable updates (опционально)
 * 
 * 📊 **State Management**:
 * - Immutable updates через set()
 * - Async actions для API calls
 * - Error handling в actions
 */

/**
 * 🔌 CONNECTION MANAGEMENT:
 * 
 * 🎯 **Connection States**:
 * - disconnected: нет подключения
 * - connecting: процесс подключения
 * - connected: активное подключение
 * - error: ошибка подключения
 * 
 * 🔄 **Connection Flow**:
 * 1. User selects server
 * 2. connectToServer action triggered
 * 3. MCP client creates connection
 * 4. Status updated based on result
 * 5. UI reflects current state
 * 
 * 🛡️ **Error Handling**:
 * - Try/catch для всех async operations
 * - Graceful fallback на error states
 * - User feedback через UI notifications
 */