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
      
      {/* Mobile-First Tab Navigation */}
      <div className="bg-card border-b border-base backdrop-blur-xl">
        <div className="flex items-center px-3 sm:px-6 py-2">
          {/* Mobile: Compact tab switcher */}
          <div className="flex items-center gap-1 bg-surface rounded-xl p-1 glow-effect w-full sm:w-auto overflow-x-auto scrollbar-thin">
            {[
              { id: 'chat', label: '💬 Чат', key: 'chat', icon: '💬' },
              { id: 'servers', label: '🔌 Серверы', key: 'servers', icon: '🔌' },
              { id: 'tools', label: '🛠️ Инструменты', key: 'tools', icon: '🛠️' },
              { id: 'resources', label: '📁 Ресурсы', key: 'resources', icon: '📁' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-card text-primary shadow-md glow-effect'
                    : 'text-secondary hover:text-primary hover:bg-elevated'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden xs:block sm:block text-xs sm:text-sm">{tab.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
          
          {/* Mobile: Floating AI Settings Button */}
          {activeTab === 'chat' && (
            <button 
              onClick={() => setShowMobileAIPanel(!showMobileAIPanel)}
              className="ml-3 sm:hidden btn btn-primary p-2 rounded-xl shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          
          {/* Desktop: Tab Actions */}
          <div className="hidden sm:flex ml-auto items-center gap-3">
            {activeTab === 'chat' && (
              <div className="flex items-center gap-2 text-xs text-muted bg-surface px-3 py-2 rounded-full border border-base">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-medium">AI Ready</span>
              </div>
            )}
            
            {activeTab === 'servers' && (
              <button className="btn btn-primary text-xs px-4 py-2 shadow-lg hover:shadow-xl glow-effect">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">Добавить сервер</span>
                <span className="md:hidden">Добавить</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 flex relative overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto animate-slide-in">
            {renderActiveTab()}
          </div>
        </div>
        
        {/* Desktop: AI Config Sidebar */}
        {activeTab === 'chat' && (
          <div className="hidden lg:block w-80 border-l border-base bg-card backdrop-blur-xl slide-in-from-right">
            <AIProviderConfigPanel 
              manager={aiManager} 
              onConfigUpdate={handleConfigUpdate}
            />
          </div>
        )}
      </main>
      
      {/* Mobile: AI Config Bottom Sheet */}
      {activeTab === 'chat' && showMobileAIPanel && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="fixed inset-0 bg-overlay backdrop-blur-sm" onClick={() => setShowMobileAIPanel(false)} />
          <div className="w-full bg-card backdrop-blur-xl border-t border-base rounded-t-2xl shadow-2xl animate-slide-up max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b border-base flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">AI Настройки</h3>
              <button
                onClick={() => setShowMobileAIPanel(false)}
                className="btn btn-ghost p-2 rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto">
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