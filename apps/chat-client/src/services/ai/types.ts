// AI Provider Types and Interfaces

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  finish_reason?: string;
}

export interface AIProviderConfig {
  name: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIProvider {
  name: string;
  models: string[];
  supportsStreaming: boolean;
  initialize(config: AIProviderConfig): Promise<void>;
  sendMessage(messages: AIMessage[], config?: Partial<AIProviderConfig>): Promise<AIResponse>;
  streamMessage?(messages: AIMessage[], config?: Partial<AIProviderConfig>): AsyncGenerator<string, void, unknown>;
  isConfigured(): boolean;
}

export type AIProviderType = 'openai' | 'anthropic' | 'ollama' | 'gemini' | 'custom';

export interface ProviderStatus {
  name: string;
  type: AIProviderType;
  isAvailable: boolean;
  isConfigured: boolean;
  lastError?: string;
  models?: string[];
}