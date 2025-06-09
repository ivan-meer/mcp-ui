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
  const [showMobileAIPanel, setShowMobileAIPanel] = useState(false);

  useEffect(() => {
    // Load persisted configurations on app start
    aiManager.loadPersistedConfigs().catch(console.error);
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
    <div className="h-screen flex flex-col bg-gradient">
      <Header />
      
      {/* УПРОЩЕННАЯ навигация */}
      <nav className="bg-card border-b border-base">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'chat', label: 'Чат', key: 'chat', icon: '💬' },
              { id: 'servers', label: 'Серверы', key: 'servers', icon: '🔌' },
              { id: 'tools', label: 'Инструменты', key: 'tools', icon: '🛠️' },
              { id: 'resources', label: 'Ресурсы', key: 'resources', icon: '📁' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.key as any)}
                className={`btn flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
            
            {/* AI Settings Button для мобильных */}
            {activeTab === 'chat' && (
              <button 
                onClick={() => setShowMobileAIPanel(!showMobileAIPanel)}
                className="btn btn-primary ml-auto lg:hidden"
                title="Настройки AI"
              >
                ⚙️
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Основной контент */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            {renderActiveTab()}
          </div>
        </div>
        
        {/* Desktop: AI Settings Sidebar */}
        {activeTab === 'chat' && (
          <aside className="hidden lg:block w-80 border-l border-base bg-card">
            <AIProviderConfigPanel 
              manager={aiManager} 
              onConfigUpdate={handleConfigUpdate}
            />
          </aside>
        )}
      </main>
      
      {/* Mobile: AI Settings Modal */}
      {showMobileAIPanel && (
        <div className="lg:hidden fixed inset-0 z-50 bg-overlay flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-base flex items-center justify-between">
              <h3 className="font-semibold text-primary">AI Настройки</h3>
              <button
                onClick={() => setShowMobileAIPanel(false)}
                className="btn btn-ghost w-8 h-8 p-0"
                title="Закрыть"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
              <AIProviderConfigPanel 
                manager={aiManager} 
                onConfigUpdate={handleConfigUpdate}
              />
            </div>
          </div>
        </div>
      )}
      
      <StatusBar />
    </div>
  );
};

export default App;