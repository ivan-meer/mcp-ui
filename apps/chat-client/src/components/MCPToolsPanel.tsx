import React, { useState, useEffect } from 'react';
import { MCPServerRegistry } from '../services/mcp/MCPServerRegistry';
import { MCPServerInstance, MCPTool, MCPToolCall } from '../services/mcp/types';

interface Props {
  registry: MCPServerRegistry;
  onToolCall?: (serverId: string, toolCall: MCPToolCall) => void;
}

export const MCPToolsPanel: React.FC<Props> = ({ registry, onToolCall }) => {
  const [servers, setServers] = useState<MCPServerInstance[]>([]);
  const [selectedTool, setSelectedTool] = useState<{ serverId: string; tool: MCPTool } | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

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

  const allTools = servers.flatMap(server => 
    (server.tools || []).map(tool => ({ serverId: server.config.id, serverName: server.config.name, tool }))
  );

  const handleToolSelect = (serverId: string, tool: MCPTool) => {
    setSelectedTool({ serverId, tool });
    setToolArgs({});
    setLastResult(null);
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;

    setIsExecuting(true);
    try {
      const result = await registry.callTool(
        selectedTool.serverId,
        selectedTool.tool.name,
        toolArgs
      );
      
      setLastResult(result);
      
      if (onToolCall) {
        onToolCall(selectedTool.serverId, {
          toolName: selectedTool.tool.name,
          arguments: toolArgs
        });
      }
    } catch (error: any) {
      setLastResult({ error: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const renderToolArguments = () => {
    if (!selectedTool) return null;

    const schema = selectedTool.tool.inputSchema;
    const properties = schema.properties || {};
    const required = schema.required || [];

    return (
      <div className="space-y-3">
        <h4 className="font-medium">Параметры:</h4>
        {Object.entries(properties).map(([key, propSchema]: [string, any]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">
              {key}
              {required.includes(key) && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {propSchema.type === 'string' ? (
              propSchema.enum ? (
                <select
                  value={toolArgs[key] || ''}
                  onChange={(e) => setToolArgs(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите значение</option>
                  {propSchema.enum.map((option: string) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={toolArgs[key] || ''}
                  onChange={(e) => setToolArgs(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={propSchema.description || key}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )
            ) : propSchema.type === 'number' ? (
              <input
                type="number"
                value={toolArgs[key] || ''}
                onChange={(e) => setToolArgs(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                placeholder={propSchema.description || key}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : propSchema.type === 'boolean' ? (
              <select
                value={toolArgs[key] !== undefined ? String(toolArgs[key]) : ''}
                onChange={(e) => setToolArgs(prev => ({ ...prev, [key]: e.target.value === 'true' }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите значение</option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : propSchema.type === 'object' || propSchema.type === 'array' ? (
              <textarea
                value={toolArgs[key] ? JSON.stringify(toolArgs[key], null, 2) : ''}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setToolArgs(prev => ({ ...prev, [key]: parsed }));
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder={`${propSchema.type === 'object' ? '{}' : '[]'} (JSON)`}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={3}
              />
            ) : (
              <input
                type="text"
                value={toolArgs[key] || ''}
                onChange={(e) => setToolArgs(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={propSchema.description || key}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {propSchema.description && (
              <p className="text-xs text-gray-600 mt-1">{propSchema.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">MCP Инструменты</h3>
        <span className="text-sm text-gray-600">
          {allTools.length} инструментов
        </span>
      </div>

      <div className="flex-1 flex gap-4">
        {/* Tools List */}
        <div className="w-1/2 border-r pr-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allTools.map(({ serverId, serverName, tool }) => (
              <div
                key={`${serverId}-${tool.name}`}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedTool?.serverId === serverId && selectedTool?.tool.name === tool.name
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToolSelect(serverId, tool)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">{tool.name}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {serverName}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{tool.description}</p>
                
                {tool.inputSchema.required && tool.inputSchema.required.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      Обязательные параметры: {tool.inputSchema.required.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {allTools.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Нет доступных инструментов</p>
                <p className="text-sm">Подключите MCP серверы с инструментами</p>
              </div>
            )}
          </div>
        </div>

        {/* Tool Details and Execution */}
        <div className="w-1/2 pl-4">
          {selectedTool ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Выполнение инструмента</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><span className="font-medium">Инструмент:</span> {selectedTool.tool.name}</p>
                  <p><span className="font-medium">Сервер:</span> {servers.find(s => s.config.id === selectedTool.serverId)?.config.name}</p>
                  <p><span className="font-medium">Описание:</span> {selectedTool.tool.description}</p>
                </div>
              </div>

              {renderToolArguments()}

              <div className="flex justify-end">
                <button
                  onClick={handleExecuteTool}
                  disabled={isExecuting}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isExecuting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{isExecuting ? 'Выполняется...' : 'Выполнить'}</span>
                </button>
              </div>

              {lastResult && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Результат:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {JSON.stringify(lastResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Выберите инструмент для выполнения</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};