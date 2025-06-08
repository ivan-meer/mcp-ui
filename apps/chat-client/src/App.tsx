import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { AIChat } from './components/AIChat';
import { AIProviderConfigPanel } from './components/AIProviderConfig';
import { MCPServerPanel } from './components/MCPServerPanel';
import { MCPToolsPanel } from './components/MCPToolsPanel';
import { MCPResourcesPanel } from './components/MCPResourcesPanel';
import { AIProviderManager } from './services/ai/AIProviderManager';
import { MCPServerRegistry } from './services/mcp/MCPServerRegistry';

const App = () => {
  const [aiManager] = useState(() => new AIProviderManager());
  const [mcpRegistry] = useState(() => new MCPServerRegistry());
  const [configUpdated, setConfigUpdated] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'servers' | 'tools' | 'resources'>('chat');

  useEffect(() => {
    // Load persisted configurations on app start
    aiManager.loadPersistedConfigs();
  }, []);

  const handleConfigUpdate = () => {
    setConfigUpdated(prev => prev + 1);
  };

  const handleToolCall = (serverId: string, toolCall: any) => {
    // Integration point for calling tools from chat
    console.log('Tool called:', serverId, toolCall);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return <AIChat manager={aiManager} key={configUpdated} />;
      case 'servers':
        return <MCPServerPanel registry={mcpRegistry} />;
      case 'tools':
        return <MCPToolsPanel registry={mcpRegistry} onToolCall={handleToolCall} />;
      case 'resources':
        return <MCPResourcesPanel registry={mcpRegistry} />;
      default:
        return <AIChat manager={aiManager} key={configUpdated} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-base">
      <Header />
      
      {/* Modern Tab Navigation */}
      <div className="bg-card border-b border-base">
        <div className="flex items-center px-6">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {[
              { id: 'chat', label: '💬 Чат', key: 'chat', icon: '💬' },
              { id: 'servers', label: '🔌 Серверы', key: 'servers', icon: '🔌' },
              { id: 'tools', label: '🛠️ Инструменты', key: 'tools', icon: '🛠️' },
              { id: 'resources', label: '📁 Ресурсы', key: 'resources', icon: '📁' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-subtle'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:block">{tab.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Actions */}
          <div className="ml-auto flex items-center gap-2">
            {activeTab === 'chat' && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>AI Ready</span>
              </div>
            )}
            
            {activeTab === 'servers' && (
              <button className="btn btn-primary text-xs px-3 py-1.5">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добавить сервер
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderActiveTab()}
          </div>
        </div>
        
        {activeTab === 'chat' && (
          <div className="w-80 border-l border-base bg-card">
            <AIProviderConfigPanel 
              manager={aiManager} 
              onConfigUpdate={handleConfigUpdate}
            />
          </div>
        )}
      </main>
      
      <StatusBar />
    </div>
  );
};

export default App;