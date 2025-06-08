import { MCPConnection } from './MCPConnection';
import { MCPMessage, MCPServerConfig } from './types';

export class WebSocketConnection extends MCPConnection {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(config: MCPServerConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    if (!this.config.url) {
      throw new Error('WebSocket URL is required');
    }

    return new Promise((resolve, reject) => {
      try {
        this.setStatus('connecting');
        this.ws = new WebSocket(this.config.url!);

        const connectTimeout = setTimeout(() => {
          this.ws?.close();
          reject(new Error('Connection timeout'));
        }, this.config.timeout || 30000);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this.setStatus('connected');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: MCPMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            this.emit('error', error);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout);
          this.setStatus('disconnected');
          this.emit('disconnected', event);

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          this.setStatus('error');
          this.emit('error', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
    this.cleanup();
    this.setStatus('disconnected');
  }

  async sendMessage(message: MCPMessage): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection is not open');
    }

    try {
      this.ws.send(JSON.stringify(message));
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
      type: 'websocket' as const,
      url: this.config.url,
      readyState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}