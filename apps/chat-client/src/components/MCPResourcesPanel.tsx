import React, { useState, useEffect } from 'react';
import { MCPServerRegistry } from '../services/mcp/MCPServerRegistry';
import { MCPServerInstance, MCPResource } from '../services/mcp/types';

interface Props {
  registry: MCPServerRegistry;
}

export const MCPResourcesPanel: React.FC<Props> = ({ registry }) => {
  const [servers, setServers] = useState<MCPServerInstance[]>([]);
  const [selectedResource, setSelectedResource] = useState<{ serverId: string; resource: MCPResource } | null>(null);
  const [resourceContent, setResourceContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateServers = () => {
      setServers(registry.getConnectedServers());
    };

    updateServers();

    const listeners = [
      () => updateServers(),
      () => updateServers(),
      () => updateServers()
    ];

    registry.on('serverConnected', listeners[0]);
    registry.on('serverDisconnected', listeners[1]);
    registry.on('serverInitialized', listeners[2]);

    return () => {
      registry.off('serverConnected', listeners[0]);
      registry.off('serverDisconnected', listeners[1]);
      registry.off('serverInitialized', listeners[2]);
    };
  }, [registry]);

  const allResources = servers.flatMap(server => 
    (server.resources || []).map(resource => ({ 
      serverId: server.config.id, 
      serverName: server.config.name, 
      resource 
    }))
  );

  const handleResourceSelect = async (serverId: string, resource: MCPResource) => {
    setSelectedResource({ serverId, resource });
    setResourceContent(null);
    setIsLoading(true);

    try {
      const content = await registry.getResource(serverId, resource.uri);
      setResourceContent(content);
    } catch (error: any) {
      setResourceContent({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResourceContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Загружается...</span>
        </div>
      );
    }

    if (!resourceContent) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p>Выберите ресурс для просмотра содержимого</p>
        </div>
      );
    }

    if (resourceContent.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h4 className="font-medium text-red-800 mb-2">Ошибка загрузки ресурса</h4>
          <p className="text-red-600">{resourceContent.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {selectedResource && (
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">Информация о ресурсе</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">URI:</span> {selectedResource.resource.uri}</p>
              <p><span className="font-medium">Имя:</span> {selectedResource.resource.name}</p>
              {selectedResource.resource.description && (
                <p><span className="font-medium">Описание:</span> {selectedResource.resource.description}</p>
              )}
              {selectedResource.resource.mimeType && (
                <p><span className="font-medium">Тип:</span> {selectedResource.resource.mimeType}</p>
              )}
              <p><span className="font-medium">Сервер:</span> {servers.find(s => s.config.id === selectedResource.serverId)?.config.name}</p>
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Содержимое</h4>
          <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
            {Array.isArray(resourceContent.contents) ? (
              resourceContent.contents.map((content: any, index: number) => (
                <div key={index} className="mb-4 last:mb-0">
                  {content.type === 'text' ? (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Текст</div>
                      <div className="whitespace-pre-wrap font-mono text-sm bg-white p-3 rounded border">
                        {content.text}
                      </div>
                    </div>
                  ) : content.type === 'image' ? (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Изображение</div>
                      {content.data ? (
                        <img 
                          src={`data:${content.mimeType || 'image/png'};base64,${content.data}`}
                          alt="Resource"
                          className="max-w-full h-auto rounded border"
                        />
                      ) : (
                        <div className="bg-gray-200 p-4 rounded text-center text-gray-600">
                          Изображение недоступно
                        </div>
                      )}
                    </div>
                  ) : content.type === 'resource' ? (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Ссылка на ресурс</div>
                      <div className="bg-white p-3 rounded border">
                        <a 
                          href={content.resource?.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {content.resource?.uri || 'Неизвестный ресурс'}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Неизвестный тип: {content.type}</div>
                      <div className="bg-white p-3 rounded border font-mono text-sm">
                        <pre>{JSON.stringify(content, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="font-mono text-sm bg-white p-3 rounded border">
                <pre>{JSON.stringify(resourceContent, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">MCP Ресурсы</h3>
        <span className="text-sm text-gray-600">
          {allResources.length} ресурсов
        </span>
      </div>

      <div className="flex-1 flex gap-4">
        {/* Resources List */}
        <div className="w-1/2 border-r pr-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allResources.map(({ serverId, serverName, resource }) => (
              <div
                key={`${serverId}-${resource.uri}`}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedResource?.serverId === serverId && selectedResource?.resource.uri === resource.uri
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleResourceSelect(serverId, resource)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">{resource.name}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {serverName}
                  </span>
                </div>
                
                {resource.description && (
                  <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                )}
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-mono">{resource.uri}</p>
                  {resource.mimeType && (
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {resource.mimeType}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {allResources.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Нет доступных ресурсов</p>
                <p className="text-sm">Подключите MCP серверы с ресурсами</p>
              </div>
            )}
          </div>
        </div>

        {/* Resource Content */}
        <div className="w-1/2 pl-4">
          {renderResourceContent()}
        </div>
      </div>
    </div>
  );
};