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
      <div className="h-full bg-card">
        <div className="p-4 border-b border-base">
          <h3 className="font-semibold text-primary">AI Настройки</h3>
          <p className="text-sm text-muted mt-1">Конфигурация провайдеров</p>
        </div>
        
        <div className="p-4">
          <button
            onClick={() => setIsVisible(true)}
            className="btn btn-primary w-full"
          >
            ⚙️ Настроить AI
          </button>
          
          {/* Текущий статус */}
          <div className="mt-4 space-y-2">
            {providers.filter(p => p.isConfigured).map(provider => (
              <div key={provider.type} className="card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-primary text-sm">{provider.name}</h4>
                    <p className="text-xs text-muted">{provider.models?.[0]}</p>
                  </div>
                  <span className="badge badge-success text-xs">✓ Активен</span>
                </div>
              </div>
            ))}
            
            {providers.filter(p => p.isConfigured).length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto mb-3">
                  💡
                </div>
                <p className="text-muted text-sm">Провайдер не настроен</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-card backdrop-blur-xl border border-base rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-fade-in-scale mobile-safe-area">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-base">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-primary">Настройка AI</h2>
            <p className="text-xs sm:text-sm text-muted mt-1">Конфигурация провайдеров искусственного интеллекта</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="btn btn-ghost p-2 rounded-xl hover:bg-surface touch-target"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)]">
          {/* Provider Selection */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Выберите AI Провайдер
            </h3>
            <div className="grid gap-3 sm:gap-4">
              {providers.map((provider) => (
                <div
                  key={provider.type}
                  className={`card p-3 sm:p-5 cursor-pointer transition-all duration-200 touch-target ${
                    selectedProvider === provider.type
                      ? 'border-accent glow-effect bg-card-hover'
                      : 'hover:border-elevated hover:bg-card-hover'
                  } ${
                    provider.isConfigured ? 'ring-1 ring-emerald-500/30' : ''
                  }`}
                  onClick={() => handleProviderSelect(provider.type)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="font-semibold text-primary text-sm sm:text-base">{provider.name}</h4>
                        {provider.isConfigured && (
                          <div className="badge badge-success text-xs">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Настроен
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-secondary mb-2">
                        {getProviderDescription(provider.type)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {provider.models?.slice(0, 2).map(model => (
                          <span key={model} className="text-xs bg-surface px-2 py-1 rounded-full text-muted">
                            {model}
                          </span>
                        ))}
                        {provider.models && provider.models.length > 2 && (
                          <span className="text-xs text-muted px-2 py-1">
                            +{provider.models.length - 2} еще
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <svg className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${selectedProvider === provider.type ? 'rotate-90' : ''}`} 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          {selectedProvider && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-surface rounded-xl p-4 sm:p-6 border border-base">
                <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  <span className="truncate">Конфигурация {providers.find(p => p.type === selectedProvider)?.name}</span>
                </h3>
                
                <div className="space-y-4 sm:space-y-5">
                  {selectedProvider !== 'ollama' && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-primary mb-2">
                        API Ключ *
                      </label>
                      <input
                        type="password"
                        value={config.apiKey || ''}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        className="input w-full touch-target"
                        placeholder="Введите ваш API ключ"
                      />
                      <div className="mt-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-xs text-blue-400 flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getSetupInstructions(selectedProvider)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProvider === 'ollama' && (
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={config.baseUrl || 'http://localhost:11434'}
                        onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                        className="input"
                        placeholder="http://localhost:11434"
                      />
                      <div className="mt-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-purple-400 flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getSetupInstructions(selectedProvider)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Модель
                    </label>
                    <select
                      value={config.model || ''}
                      onChange={(e) => setConfig({ ...config, model: e.target.value })}
                      className="input"
                    >
                      {providers.find(p => p.type === selectedProvider)?.models?.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-primary mb-2">
                        Температура
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature || 0.7}
                        onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                        className="input w-full touch-target"
                      />
                      <p className="text-xs text-muted mt-1">0 = детерминированно, 2 = креативно</p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-primary mb-2">
                        Макс. токенов
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8000"
                        value={config.maxTokens || 2000}
                        onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                        className="input w-full touch-target"
                      />
                      <p className="text-xs text-muted mt-1">Максимальная длина ответа</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {selectedProvider && (
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 p-4 sm:p-6 bg-surface border-t border-base mobile-safe-area">
            <button
              onClick={() => setSelectedProvider(null)}
              className="btn btn-secondary w-full sm:w-auto touch-target"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад
            </button>
            <button
              onClick={handleConfigSubmit}
              disabled={isConfiguring || (!config.apiKey && selectedProvider !== 'ollama')}
              className="btn btn-primary w-full sm:w-auto touch-target"
            >
              {isConfiguring ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Настройка...</span>
                  <span className="sm:hidden">Настройка...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">Сохранить и активировать</span>
                  <span className="sm:hidden">Сохранить</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};