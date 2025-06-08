import { AIProvider, AIProviderConfig, AIProviderType, ProviderStatus, AIMessage, AIResponse } from './types';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { OllamaProvider } from './providers/OllamaProvider';

export class AIProviderManager {
  private providers = new Map<AIProviderType, AIProvider>();
  private activeProvider: AIProvider | null = null;
  private configs = new Map<AIProviderType, AIProviderConfig>();

  constructor() {
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('anthropic', new AnthropicProvider());
    this.registerProvider('ollama', new OllamaProvider());
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
      
      // Save to localStorage for persistence
      localStorage.setItem(`ai_config_${type}`, JSON.stringify(config));
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
    localStorage.setItem('active_ai_provider', type);
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

  loadPersistedConfigs(): void {
    // Load configs from localStorage
    for (const type of ['openai', 'anthropic', 'ollama'] as AIProviderType[]) {
      const saved = localStorage.getItem(`ai_config_${type}`);
      if (saved) {
        try {
          const config = JSON.parse(saved);
          this.configureProvider(type, config).catch(console.error);
        } catch (error) {
          console.error(`Failed to load config for ${type}:`, error);
        }
      }
    }

    // Load active provider
    const activeType = localStorage.getItem('active_ai_provider') as AIProviderType;
    if (activeType && this.providers.has(activeType)) {
      const provider = this.providers.get(activeType);
      if (provider?.isConfigured()) {
        this.activeProvider = provider;
      }
    }
  }

  clearConfig(type: AIProviderType): void {
    this.configs.delete(type);
    localStorage.removeItem(`ai_config_${type}`);
    
    if (this.activeProvider === this.providers.get(type)) {
      this.activeProvider = null;
      localStorage.removeItem('active_ai_provider');
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