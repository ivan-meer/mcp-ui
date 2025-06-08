import { MCPConnection } from './MCPConnection';
import { MCPMessage, MCPServerConfig } from './types';

export class SSEConnection extends MCPConnection {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(config: MCPServerConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    if (!this.config.url) {
      throw new Error('SSE URL is required');
    }

    return new Promise((resolve, reject) => {
      try {
        this.setStatus('connecting');
        this.eventSource = new EventSource(this.config.url!);

        const connectTimeout = setTimeout(() => {
          this.eventSource?.close();
          reject(new Error('Connection timeout'));
        }, this.config.timeout || 30000);

        this.eventSource.onopen = () => {
          clearTimeout(connectTimeout);
          this.setStatus('connected');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const message: MCPMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse SSE message:', error);
            this.emit('error', error);
          }
        };

        this.eventSource.onerror = (error) => {
          clearTimeout(connectTimeout);
          
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.setStatus('disconnected');
            this.emit('disconnected', error);

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.scheduleReconnect();
            }
          } else {
            this.setStatus('error');
            this.emit('error', error);
            reject(error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.cleanup();
    this.setStatus('disconnected');
  }

  async sendMessage(message: MCPMessage): Promise<void> {
    if (!this.config.url) {
      throw new Error('SSE URL is not configured');
    }

    // For SSE, we typically send messages via HTTP POST to a separate endpoint
    const sendUrl = this.config.url.replace('/events', '/send') || `${this.config.url}/send`;

    try {
      const response = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (this.status === 'disconnected') {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
          this.emit('error', error);
        });
      }
    }, delay);
  }

  getConnectionInfo() {
    return {
      type: 'sse' as const,
      url: this.config.url,
      readyState: this.eventSource?.readyState,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}