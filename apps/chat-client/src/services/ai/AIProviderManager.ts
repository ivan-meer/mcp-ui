import { AIProvider, AIProviderConfig, AIProviderType, ProviderStatus, AIMessage, AIResponse } from './types';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { OllamaProvider } from './providers/OllamaProvider';
import { secureStorageService } from '../storage/SecureStorageService';

export class AIProviderManager {
  private providers = new Map<AIProviderType, AIProvider>();
  private activeProvider: AIProvider | null = null;
  private configs = new Map<AIProviderType, AIProviderConfig>();

  constructor() {
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('anthropic', new AnthropicProvider());
    this.registerProvider('ollama', new OllamaProvider());
    
    // Initialize secure storage
    secureStorageService.initialize().catch(console.error);
  }

  private registerProvider(type: AIProviderType, provider: AIProvider): void {
    this.providers.set(type, provider);
  }

  async configureProvider(type: AIProviderType, config: AIProviderConfig): Promise<void> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider ${type} not found`);
    }

    try {
      await provider.initialize(config);
      this.configs.set(type, config);
      
      // Store API key securely if provided
      if (config.apiKey) {
        await secureStorageService.storeApiKey(type, config.apiKey, `${provider.name} API Key`);
        console.log(`🔐 API key stored securely for ${type}`);
      }
      
      // Save config (without API key) to secure storage
      const configToStore = { ...config };
      delete (configToStore as any).apiKey; // Remove API key from stored config
      await secureStorageService.storeSetting(`ai_config_${type}`, configToStore);
    } catch (error: any) {
      throw new Error(`Failed to configure ${type}: ${error.message}`);
    }
  }

  async setActiveProvider(type: AIProviderType): Promise<void> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider ${type} not found`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider ${type} is not configured`);
    }

    this.activeProvider = provider;
    await secureStorageService.storeSetting('active_ai_provider', type);
  }

  getActiveProvider(): AIProvider | null {
    return this.activeProvider;
  }

  getProvider(type: AIProviderType): AIProvider | undefined {
    return this.providers.get(type);
  }

  async sendMessage(messages: AIMessage[], config?: Partial<AIProviderConfig>): Promise<AIResponse> {
    if (!this.activeProvider) {
      throw new Error('No active AI provider configured');
    }

    return await this.activeProvider.sendMessage(messages, config);
  }

  async *streamMessage(messages: AIMessage[], config?: Partial<AIProviderConfig>): AsyncGenerator<string, void, unknown> {
    if (!this.activeProvider) {
      throw new Error('No active AI provider configured');
    }

    if (!this.activeProvider.supportsStreaming || !this.activeProvider.streamMessage) {
      // Fallback to non-streaming
      const response = await this.activeProvider.sendMessage(messages, config);
      yield response.content;
      return;
    }

    yield* this.activeProvider.streamMessage(messages, config);
  }

  getProviderStatus(): ProviderStatus[] {
    const statuses: ProviderStatus[] = [];

    for (const [type, provider] of this.providers.entries()) {
      statuses.push({
        name: provider.name,
        type,
        isAvailable: true,
        isConfigured: provider.isConfigured(),
        models: provider.models
      });
    }

    return statuses;
  }

  async loadPersistedConfigs(): Promise<void> {
    try {
      // Load configs from secure storage
      for (const type of ['openai', 'anthropic', 'ollama'] as AIProviderType[]) {
        try {
          const config = await secureStorageService.getSetting(`ai_config_${type}`);
          const apiKey = await secureStorageService.getApiKey(type);
          
          if (config) {
            // Reconstruct full config with API key
            const fullConfig = { ...config };
            if (apiKey) {
              fullConfig.apiKey = apiKey;
            }
            
            await this.configureProvider(type, fullConfig);
            console.log(`✅ Loaded persisted config for ${type}`);
          }
        } catch (error) {
          console.error(`Failed to load config for ${type}:`, error);
        }
      }

      // Load active provider
      const activeType = await secureStorageService.getSetting('active_ai_provider') as AIProviderType;
      if (activeType && this.providers.has(activeType)) {
        const provider = this.providers.get(activeType);
        if (provider?.isConfigured()) {
          this.activeProvider = provider;
          console.log(`✅ Set active provider: ${activeType}`);
        }
      }
    } catch (error) {
      console.error('Failed to load persisted configs:', error);
    }
  }

  async clearConfig(type: AIProviderType): Promise<void> {
    this.configs.delete(type);
    
    // Remove API keys from secure storage
    try {
      const keys = await secureStorageService.listApiKeys();
      const providerKeys = keys.filter(k => k.provider === type);
      
      for (const key of providerKeys) {
        await secureStorageService.deleteApiKey(key.id);
      }
      
      // Remove config from secure storage
      await secureStorageService.storeSetting(`ai_config_${type}`, null);
    } catch (error) {
      console.error(`Failed to clear secure storage for ${type}:`, error);
    }
    
    if (this.activeProvider === this.providers.get(type)) {
      this.activeProvider = null;
      try {
        await secureStorageService.storeSetting('active_ai_provider', null);
      } catch (error) {
        console.error('Failed to clear active provider setting:', error);
      }
    }
  }

  getAvailableProviders(): { type: AIProviderType; name: string; models: string[] }[] {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      name: provider.name,
      models: provider.models
    }));
  }
}