import { AIProvider, AIProviderConfig, AIMessage, AIResponse } from './types';

export abstract class BaseAIProvider implements AIProvider {
  protected config?: AIProviderConfig;
  protected initialized = false;

  abstract name: string;
  abstract models: string[];
  abstract supportsStreaming: boolean;

  async initialize(config: AIProviderConfig): Promise<void> {
    this.config = config;
    await this.validateConfig(config);
    this.initialized = true;
  }

  protected abstract validateConfig(config: AIProviderConfig): Promise<void>;

  abstract sendMessage(messages: AIMessage[], config?: Partial<AIProviderConfig>): Promise<AIResponse>;

  isConfigured(): boolean {
    return this.initialized && !!this.config?.apiKey;
  }

  protected ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new Error(`${this.name} provider not initialized`);
    }
  }

  protected mergeConfig(overrides?: Partial<AIProviderConfig>): AIProviderConfig {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }
    return { ...this.config, ...overrides };
  }

  protected handleError(error: any): never {
    console.error(`${this.name} Provider Error:`, error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error');
    } else {
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
}