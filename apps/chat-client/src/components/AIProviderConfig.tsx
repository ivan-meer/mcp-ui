import React, { useState, useEffect } from 'react';
import { AIProviderManager } from '../services/ai/AIProviderManager';
import { AIProviderType, AIProviderConfig, ProviderStatus } from '../services/ai/types';

interface Props {
  manager: AIProviderManager;
  onConfigUpdate?: () => void;
}

export const AIProviderConfigPanel: React.FC<Props> = ({ manager, onConfigUpdate }) => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType | null>(null);
  const [config, setConfig] = useState<Partial<AIProviderConfig>>({});
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = () => {
    const status = manager.getProviderStatus();
    setProviders(status);
  };

  const handleProviderSelect = (type: AIProviderType) => {
    setSelectedProvider(type);
    setConfig({
      name: type,
      apiKey: '',
      model: manager.getProvider(type)?.models[0] || '',
      temperature: 0.7,
      maxTokens: 2000
    });
    setError(null);
  };

  const handleConfigSubmit = async () => {
    if (!selectedProvider || !config.apiKey) {
      setError('Please fill in all required fields');
      return;
    }

    setIsConfiguring(true);
    setError(null);

    try {
      await manager.configureProvider(selectedProvider, config as AIProviderConfig);
      await manager.setActiveProvider(selectedProvider);
      loadProviders();
      onConfigUpdate?.();
      setIsVisible(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConfiguring(false);
    }
  };

  const getProviderDescription = (type: AIProviderType): string => {
    switch (type) {
      case 'openai':
        return 'Access GPT-4, GPT-3.5 and other OpenAI models';
      case 'anthropic':
        return 'Access Claude 3.5 Sonnet, Opus, and other Anthropic models';
      case 'ollama':
        return 'Use local LLM models via Ollama (requires Ollama to be running)';
      default:
        return '';
    }
  };

  const getSetupInstructions = (type: AIProviderType): string => {
    switch (type) {
      case 'openai':
        return 'Get your API key from https://platform.openai.com/api-keys';
      case 'anthropic':
        return 'Get your API key from https://console.anthropic.com/';
      case 'ollama':
        return 'Install Ollama from https://ollama.ai and run: ollama pull llama2';
      default:
        return '';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 z-50"
      >
        ⚙️ Configure AI
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">AI Provider Configuration</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Provider Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select AI Provider</h3>
          <div className="grid gap-3">
            {providers.map((provider) => (
              <div
                key={provider.type}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProvider === provider.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  provider.isConfigured ? 'ring-2 ring-green-200' : ''
                }`}
                onClick={() => handleProviderSelect(provider.type)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{provider.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {getProviderDescription(provider.type)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Models: {provider.models?.slice(0, 3).join(', ')}
                      {provider.models && provider.models.length > 3 && '...'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    {provider.isConfigured && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ Configured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        {selectedProvider && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Configure {providers.find(p => p.type === selectedProvider)?.name}
            </h3>
            
            <div className="space-y-4">
              {selectedProvider !== 'ollama' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    API Key *
                  </label>
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your API key"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {getSetupInstructions(selectedProvider)}
                  </p>
                </div>
              )}

              {selectedProvider === 'ollama' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={config.baseUrl || 'http://localhost:11434'}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="http://localhost:11434"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {getSetupInstructions(selectedProvider)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Model
                </label>
                <select
                  value={config.model || ''}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {providers.find(p => p.type === selectedProvider)?.models?.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Temperature
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature || 0.7}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8000"
                    value={config.maxTokens || 2000}
                    onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfigSubmit}
                disabled={isConfiguring || !config.apiKey && selectedProvider !== 'ollama'}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfiguring ? 'Configuring...' : 'Save & Activate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};