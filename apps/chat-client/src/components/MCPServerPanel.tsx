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
    <div className="space-y-6">
      {/* Server Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            server.status === 'connected' ? 'bg-emerald-100' :
            server.status === 'connecting' ? 'bg-amber-100' :
            server.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            <svg className={`w-6 h-6 ${
              server.status === 'connected' ? 'text-emerald-600' :
              server.status === 'connecting' ? 'text-amber-600' :
              server.status === 'error' ? 'text-red-600' : 'text-gray-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">{server.config.name}</h3>
            <p className="text-muted">{server.config.type} сервер</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted uppercase tracking-wide">URL</p>
            <p className="text-sm font-medium text-primary">{server.config.url || 'Не указан'}</p>
          </div>
          {server.connectedAt && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted uppercase tracking-wide">Подключен</p>
              <p className="text-sm font-medium text-primary">{server.connectedAt.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Server Info */}
      {server.info && (
        <div>
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Информация о сервере
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-base p-3 rounded-lg">
              <p className="text-xs text-muted">Версия</p>
              <p className="font-medium text-primary">{server.info.version}</p>
            </div>
            <div className="bg-card border border-base p-3 rounded-lg">
              <p className="text-xs text-muted">Протокол</p>
              <p className="font-medium text-primary">{server.info.protocolVersion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tools */}
      {server.tools && server.tools.length > 0 && (
        <div>
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Инструменты
            <span className="badge badge-primary">{server.tools.length}</span>
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {server.tools.map(tool => (
              <div key={tool.name} className="bg-card border border-base p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-primary">{tool.name}</p>
                    <p className="text-xs text-muted mt-1">{tool.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-muted mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      {server.resources && server.resources.length > 0 && (
        <div>
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ресурсы
            <span className="badge badge-primary">{server.resources.length}</span>
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {server.resources.map(resource => (
              <div key={resource.uri} className="bg-card border border-base p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-primary">{resource.name}</p>
                    <p className="text-xs text-muted mt-1">{resource.uri}</p>
                    {resource.mimeType && (
                      <span className="inline-block mt-2 px-2 py-1 bg-muted text-xs rounded">
                        {resource.mimeType}
                      </span>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-muted mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompts */}
      {server.prompts && server.prompts.length > 0 && (
        <div>
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Промпты
            <span className="badge badge-primary">{server.prompts.length}</span>
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {server.prompts.map(prompt => (
              <div key={prompt.name} className="bg-card border border-base p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-primary">{prompt.name}</p>
                    <p className="text-xs text-muted mt-1">{prompt.description}</p>
                    {prompt.arguments && prompt.arguments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {prompt.arguments.map(arg => (
                          <span key={arg.name} className="inline-block px-2 py-1 bg-muted text-xs rounded">
                            {arg.name}{arg.required && '*'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-muted mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
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
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md animate-slide-in">
        <div className="p-6 border-b border-base">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-primary">Новый MCP сервер</h3>
              <p className="text-muted mt-1">Добавьте подключение к серверу MCP</p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost p-2 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Название сервера *</label>
            <input
              type="text"
              value={config.name || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="Demo Server"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Тип подключения *</label>
            <select
              value={config.type || 'websocket'}
              onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
              className="input"
            >
              <option value="websocket">WebSocket</option>
              <option value="sse">Server-Sent Events</option>
              <option value="local" disabled>Локальный процесс (в разработке)</option>
            </select>
          </div>

          {config.type !== 'local' && (
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">URL подключения *</label>
              <input
                type="text"
                value={config.url || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                className="input"
                placeholder="ws://localhost:8081"
              />
              <p className="text-xs text-muted mt-1">
                {config.type === 'websocket' 
                  ? 'Пример: ws://localhost:8081' 
                  : 'Пример: http://localhost:8081/events'
                }
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border border-base rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <input
                type="checkbox"
                checked={config.enabled ?? true}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-primary">Включен</span>
                <p className="text-xs text-muted">Сервер будет доступен</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-base rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <input
                type="checkbox"
                checked={config.autoStart ?? false}
                onChange={(e) => setConfig(prev => ({ ...prev, autoStart: e.target.checked }))}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-primary">Автозапуск</span>
                <p className="text-xs text-muted">Подключать при старте</p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Добавить сервер
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};