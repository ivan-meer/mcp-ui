import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { AIChat } from './components/AIChat';
import { AIProviderConfigPanel } from './components/AIProviderConfig';
import { AIProviderManager } from './services/ai/AIProviderManager';

const App = () => {
  const [aiManager] = useState(() => new AIProviderManager());
  const [configUpdated, setConfigUpdated] = useState(0);

  useEffect(() => {
    // Load persisted configurations on app start
    aiManager.loadPersistedConfigs();
  }, []);

  const handleConfigUpdate = () => {
    setConfigUpdated(prev => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex relative">
        <div className="flex-1">
          <AIChat manager={aiManager} key={configUpdated} />
        </div>
        <AIProviderConfigPanel 
          manager={aiManager} 
          onConfigUpdate={handleConfigUpdate}
        />
      </main>
      <StatusBar />
    </div>
  );
};

export default App;