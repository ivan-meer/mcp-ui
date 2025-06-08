import { BaseAIProvider } from '../BaseProvider';
import { AIProviderConfig, AIMessage, AIResponse } from '../types';

export class AnthropicProvider extends BaseAIProvider {
  name = 'Anthropic';
  models = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022', 
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ];
  supportsStreaming = true;

  protected async validateConfig(config: AIProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // Test API key validity by making a simple request
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }]
        })
      });

      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
    } catch (error: any) {
      if (error.message === 'Invalid API key') {
        throw error;
      }
      // Other errors might be network issues, we'll allow them
    }
  }

  async sendMessage(messages: AIMessage[], configOverrides?: Partial<AIProviderConfig>): Promise<AIResponse> {
    this.ensureInitialized();
    const config = this.mergeConfig(configOverrides);

    try {
      // Convert messages format for Anthropic
      const anthropicMessages = this.convertMessages(messages);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-haiku-20240307',
          max_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.7,
          messages: anthropicMessages.messages,
          system: anthropicMessages.system
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.content[0]?.text || '',
        usage: {
          prompt_tokens: data.usage?.input_tokens || 0,
          completion_tokens: data.usage?.output_tokens || 0,
          total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        },
        model: data.model,
        finish_reason: data.stop_reason
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async *streamMessage(messages: AIMessage[], configOverrides?: Partial<AIProviderConfig>): AsyncGenerator<string, void, unknown> {
    this.ensureInitialized();
    const config = this.mergeConfig(configOverrides);

    try {
      const anthropicMessages = this.convertMessages(messages);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-haiku-20240307',
          max_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.7,
          messages: anthropicMessages.messages,
          system: anthropicMessages.system,
          stream: true
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
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text;
                if (text) {
                  yield text;
                }
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private convertMessages(messages: AIMessage[]): { messages: any[], system?: string } {
    let system: string | undefined;
    const convertedMessages: any[] = [];

    for (const message of messages) {
      if (message.role === 'system') {
        system = message.content;
      } else {
        convertedMessages.push({
          role: message.role,
          content: message.content
        });
      }
    }

    return { messages: convertedMessages, system };
  }
}