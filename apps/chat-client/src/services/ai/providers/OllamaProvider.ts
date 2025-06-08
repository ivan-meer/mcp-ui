import { BaseAIProvider } from '../BaseProvider';
import { AIProviderConfig, AIMessage, AIResponse } from '../types';

export class OllamaProvider extends BaseAIProvider {
  name = 'Ollama';
  models: string[] = [];
  supportsStreaming = true;

  protected async validateConfig(config: AIProviderConfig): Promise<void> {
    const baseUrl = config.baseUrl || 'http://localhost:11434';
    
    try {
      // Check if Ollama is running
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Ollama server not accessible');
      }

      // Get available models
      const data = await response.json();
      this.models = data.models?.map((model: any) => model.name) || [];
      
      if (this.models.length === 0) {
        throw new Error('No models found in Ollama. Please install models using: ollama pull <model_name>');
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running on ' + baseUrl);
      }
      throw error;
    }
  }

  async sendMessage(messages: AIMessage[], configOverrides?: Partial<AIProviderConfig>): Promise<AIResponse> {
    this.ensureInitialized();
    const config = this.mergeConfig(configOverrides);
    const baseUrl = config.baseUrl || 'http://localhost:11434';

    try {
      // Convert messages to Ollama format
      const prompt = this.convertMessagesToPrompt(messages);
      
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || this.models[0],
          prompt: prompt,
          stream: false,
          options: {
            temperature: config.temperature || 0.7,
            num_ctx: config.maxTokens || 2048
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.response || '',
        model: config.model || this.models[0],
        finish_reason: data.done ? 'stop' : 'length'
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async *streamMessage(messages: AIMessage[], configOverrides?: Partial<AIProviderConfig>): AsyncGenerator<string, void, unknown> {
    this.ensureInitialized();
    const config = this.mergeConfig(configOverrides);
    const baseUrl = config.baseUrl || 'http://localhost:11434';

    try {
      const prompt = this.convertMessagesToPrompt(messages);
      
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || this.models[0],
          prompt: prompt,
          stream: true,
          options: {
            temperature: config.temperature || 0.7,
            num_ctx: config.maxTokens || 2048
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.trim().split('\n');

        for (const line of lines) {
          if (line) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                yield data.response;
              }
              if (data.done) {
                return;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private convertMessagesToPrompt(messages: AIMessage[]): string {
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `System: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `Human: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    // Add final prompt for assistant response
    prompt += 'Assistant: ';
    
    return prompt;
  }

  async getAvailableModels(): Promise<string[]> {
    const config = this.config;
    if (!config) {
      return [];
    }

    const baseUrl = config.baseUrl || 'http://localhost:11434';
    
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch {
      return [];
    }
  }
}