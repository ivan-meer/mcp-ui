import { MCPMessage, MCPServerConfig, MCPServerStatus } from './types';

export abstract class MCPConnection {
  protected config: MCPServerConfig;
  protected status: MCPServerStatus = 'disconnected';
  protected messageHandlers = new Map<string, (message: MCPMessage) => void>();
  protected pendingRequests = new Map<string | number, {
    resolve: (result: any) => void;
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
  }>();
  protected requestId = 1;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sendMessage(message: MCPMessage): Promise<void>;

  getStatus(): MCPServerStatus {
    return this.status;
  }

  getConfig(): MCPServerConfig {
    return this.config;
  }

  protected setStatus(status: MCPServerStatus): void {
    this.status = status;
    this.emit('statusChange', status);
  }

  protected generateRequestId(): string {
    return (this.requestId++).toString();
  }

  async sendRequest(method: string, params?: any): Promise<any> {
    const id = this.generateRequestId();
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.config.timeout || 30000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      this.sendMessage(message).catch(error => {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(error);
      });
    });
  }

  sendNotification(method: string, params?: any): Promise<void> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      method,
      params
    };

    return this.sendMessage(message);
  }

  protected handleMessage(message: MCPMessage): void {
    // Handle responses to requests
    if (message.id && this.pendingRequests.has(message.id)) {
      const pending = this.pendingRequests.get(message.id)!;
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    // Handle notifications and method calls
    if (message.method) {
      const handler = this.messageHandlers.get(message.method);
      if (handler) {
        handler(message);
      } else {
        this.emit('unhandledMessage', message);
      }
    }
  }

  onMessage(method: string, handler: (message: MCPMessage) => void): void {
    this.messageHandlers.set(method, handler);
  }

  offMessage(method: string): void {
    this.messageHandlers.delete(method);
  }

  // Event emitter functionality
  private eventListeners = new Map<string, Function[]>();

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener?: Function): void {
    if (!this.eventListeners.has(event)) return;
    
    if (listener) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  protected emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  protected cleanup(): void {
    // Clear pending requests
    for (const [id, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();

    // Clear message handlers
    this.messageHandlers.clear();

    // Clear event listeners
    this.eventListeners.clear();
  }
}