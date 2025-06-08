import React, { useState, useEffect } from 'react';
import { MCPServerRegistry } from '../services/mcp/MCPServerRegistry';
import { MCPServerInstance, MCPServerConfig } from '../services/mcp/types';

interface Props {
  registry: MCPServerRegistry;
}

export const MCPServerPanel: React.FC<Props> = ({ registry }) => {
  const [servers, setServers] = useState<MCPServerInstance[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const updateServers = () => {
      setServers(registry.getAllServers());
    };

    updateServers();

    const listeners = [
      () => updateServers(),
      () => updateServers(),
      () => updateServers(),
      () => updateServers()
    ];

    registry.on('serverAdded', listeners[0]);
    registry.on('serverRemoved', listeners[1]);
    registry.on('serverStatusChanged', listeners[2]);
    registry.on('serverInitialized', listeners[3]);

    return () => {
      registry.off('serverAdded', listeners[0]);
      registry.off('serverRemoved', listeners[1]);
      registry.off('serverStatusChanged', listeners[2]);
      registry.off('serverInitialized', listeners[3]);
    };
  }, [registry]);

  const handleConnect = async (serverId: string) => {
    try {
      await registry.connectServer(serverId);
    } catch (error: any) {
      alert(`Ошибка подключения: ${error.message}`);
    }
  };

  const handleDisconnect = async (serverId: string) => {
    try {
      await registry.disconnectServer(serverId);
    } catch (error: any) {
      alert(`Ошибка отключения: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Подключен';
      case 'connecting': return 'Подключается...';
      case 'error': return 'Ошибка';
      default: return 'Отключен';
    }
  };

  const selectedServerData = selectedServer ? servers.find(s => s.config.id === selectedServer) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">MCP Серверы</h2>
          <p className="text-muted mt-1">Управление подключениями к серверам Model Context Protocol</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить сервер
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted">Подключено</p>
              <p className="text-xl font-bold text-emerald-600">{servers.filter(s => s.status === 'connected').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted">Всего серверов</p>
              <p className="text-xl font-bold text-blue-600">{servers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted">Подключается</p>
              <p className="text-xl font-bold text-amber-600">{servers.filter(s => s.status === 'connecting').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted">Ошибки</p>
              <p className="text-xl font-bold text-red-600">{servers.filter(s => s.status === 'error').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-base">
          <h3 className="text-lg font-semibold text-primary">Список серверов</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server List */}
            <div className="space-y-3">
              {servers.map(server => (
                <div
                  key={server.config.id}
                  className={`p-4 border border-base rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    selectedServer === server.config.id 
                      ? 'border-primary bg-blue-50 shadow-md' 
                      : 'hover:border-strong'
                  }`}
                  onClick={() => setSelectedServer(server.config.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        server.status === 'connected' ? 'bg-emerald-100' :
                        server.status === 'connecting' ? 'bg-amber-100' :
                        server.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          server.status === 'connected' ? 'text-emerald-600' :
                          server.status === 'connecting' ? 'text-amber-600' :
                          server.status === 'error' ? 'text-red-600' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">{server.config.name}</h4>
                        <p className="text-xs text-muted">{server.config.type} • {server.config.url}</p>
                      </div>
                    </div>
                    <span className={`badge ${
                      server.status === 'connected' ? 'badge-success' :
                      server.status === 'connecting' ? 'badge-warning' :
                      server.status === 'error' ? 'badge-danger' : ''
                    }`}>
                      {getStatusText(server.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {server.tools && (
                        <span>🛠️ {server.tools.length} инструментов</span>
                      )}
                      {server.resources && (
                        <span>📁 {server.resources.length} ресурсов</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {server.status === 'disconnected' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(server.config.id);
                          }}
                          className="btn btn-secondary text-xs px-3 py-1"
                        >
                          Подключить
                        </button>
                      ) : server.status === 'connected' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDisconnect(server.config.id);
                          }}
                          className="btn btn-ghost text-xs px-3 py-1 text-red-600 hover:bg-red-50"
                        >
                          Отключить
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {server.lastError && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600" title={server.lastError}>
                        ❌ {server.lastError}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {servers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Нет серверов</h3>
                  <p className="text-muted mb-4">Добавьте первый MCP сервер для начала работы</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary"
                  >
                    Добавить сервер
                  </button>
                </div>
              )}
            </div>

            {/* Server Details */}
            <div className="border-l border-base pl-6">
              {selectedServerData ? (
                <ServerDetails server={selectedServerData} registry={registry} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Детали сервера</h3>
                  <p className="text-muted">Выберите сервер для просмотра подробной информации</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <AddServerForm
          registry={registry}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

interface ServerDetailsProps {
  server: MCPServerInstance;
  registry: MCPServerRegistry;
}

const ServerDetails: React.FC<ServerDetailsProps> = ({ server, registry }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Информация о сервере</h4>
        <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
          <p><span className="font-medium">Название:</span> {server.config.name}</p>
          <p><span className="font-medium">Тип:</span> {server.config.type}</p>
          {server.config.url && (
            <p><span className="font-medium">URL:</span> {server.config.url}</p>
          )}
          {server.connectedAt && (
            <p><span className="font-medium">Подключен:</span> {server.connectedAt.toLocaleString()}</p>
          )}
          {server.info && (
            <>
              <p><span className="font-medium">Версия:</span> {server.info.version}</p>
              <p><span className="font-medium">Протокол:</span> {server.info.protocolVersion}</p>
            </>
          )}
        </div>
      </div>

      {server.tools && server.tools.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Инструменты ({server.tools.length})</h4>
          <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
            {server.tools.map(tool => (
              <div key={tool.name} className="mb-2 last:mb-0">
                <p className="font-medium">{tool.name}</p>
                <p className="text-gray-600 text-xs">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {server.resources && server.resources.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Ресурсы ({server.resources.length})</h4>
          <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
            {server.resources.map(resource => (
              <div key={resource.uri} className="mb-2 last:mb-0">
                <p className="font-medium">{resource.name}</p>
                <p className="text-gray-600 text-xs">{resource.uri}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {server.prompts && server.prompts.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Промпты ({server.prompts.length})</h4>
          <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
            {server.prompts.map(prompt => (
              <div key={prompt.name} className="mb-2 last:mb-0">
                <p className="font-medium">{prompt.name}</p>
                <p className="text-gray-600 text-xs">{prompt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface AddServerFormProps {
  registry: MCPServerRegistry;
  onClose: () => void;
}

const AddServerForm: React.FC<AddServerFormProps> = ({ registry, onClose }) => {
  const [config, setConfig] = useState<Partial<MCPServerConfig>>({
    name: '',
    type: 'websocket',
    url: '',
    enabled: true,
    autoStart: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.name || !config.type) {
      alert('Заполните обязательные поля');
      return;
    }

    if (config.type !== 'local' && !config.url) {
      alert('URL обязателен для внешних серверов');
      return;
    }

    const fullConfig: MCPServerConfig = {
      id: Date.now().toString(),
      name: config.name,
      type: config.type as 'websocket' | 'sse' | 'local',
      url: config.url,
      enabled: config.enabled ?? true,
      autoStart: config.autoStart ?? false,
      timeout: 30000
    };

    registry.addServer(fullConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Добавить MCP сервер</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название *</label>
            <input
              type="text"
              value={config.name || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Мой MCP сервер"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип подключения *</label>
            <select
              value={config.type || 'websocket'}
              onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="websocket">WebSocket</option>
              <option value="sse">Server-Sent Events</option>
              <option value="local" disabled>Локальный процесс (скоро)</option>
            </select>
          </div>

          {config.type !== 'local' && (
            <div>
              <label className="block text-sm font-medium mb-1">URL *</label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ws://localhost:8080 или http://localhost:8080/events"
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enabled ?? true}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Включен</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.autoStart ?? false}
                onChange={(e) => setConfig(prev => ({ ...prev, autoStart: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Автозапуск</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};