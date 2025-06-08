import { BaseAIProvider } from '../BaseProvider';
import { AIProviderConfig, AIMessage, AIResponse } from '../types';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';
  models = [
    'gpt-4o',
    'gpt-4o-mini', 
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k'
  ];
  supportsStreaming = true;

  protected async validateConfig(config: AIProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Test API key validity
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API key validation failed: ${response.status}`);
      }
    } catch (error) {
      throw new Error('Failed to validate OpenAI API key');
    }
  }

  async sendMessage(messages: AIMessage[], configOverrides?: Partial<AIProviderConfig>): Promise<AIResponse> {
    this.ensureInitialized();
    const config = this.mergeConfig(configOverrides);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2000,
          top_p: config.topP || 1,
          frequency_penalty: config.frequencyPenalty || 0,
          presence_penalty: config.presencePenalty || 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
        model: data.model,
        finish_reason: data.choices[0]?.finish_reason
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async *streamMessage(messages: AIMessage[], configOverrides?: Partial<AIProviderConfig>): AsyncGenerator<string, void, unknown> {
    this.ensureInitialized();
    const config = this.mergeConfig(configOverrides);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2000,
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
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
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
}