import { MCPServerConfig, MCPServerInstance, MCPServerInfo, MCPTool, MCPResource, MCPPrompt } from './types';
import { MCPConnection } from './MCPConnection';
import { WebSocketConnection } from './WebSocketConnection';
import { SSEConnection } from './SSEConnection';

export class MCPServerRegistry {
  private servers = new Map<string, MCPServerInstance>();
  private connections = new Map<string, MCPConnection>();
  private eventListeners = new Map<string, Function[]>();

  constructor() {
    this.loadPersistedServers();
  }

  // Server Management
  addServer(config: MCPServerConfig): void {
    const instance: MCPServerInstance = {
      config,
      status: 'disconnected'
    };

    this.servers.set(config.id, instance);
    this.persistServers();
    this.emit('serverAdded', instance);

    if (config.enabled && config.autoStart) {
      this.connectServer(config.id);
    }
  }

  removeServer(serverId: string): void {
    const instance = this.servers.get(serverId);
    if (!instance) return;

    this.disconnectServer(serverId);
    this.servers.delete(serverId);
    this.persistServers();
    this.emit('serverRemoved', instance);
  }

  updateServer(serverId: string, updates: Partial<MCPServerConfig>): void {
    const instance = this.servers.get(serverId);
    if (!instance) return;

    const wasConnected = instance.status === 'connected';
    if (wasConnected) {
      this.disconnectServer(serverId);
    }

    instance.config = { ...instance.config, ...updates };
    this.servers.set(serverId, instance);
    this.persistServers();
    this.emit('serverUpdated', instance);

    if (wasConnected && instance.config.enabled) {
      this.connectServer(serverId);
    }
  }

  getServer(serverId: string): MCPServerInstance | undefined {
    return this.servers.get(serverId);
  }

  getAllServers(): MCPServerInstance[] {
    return Array.from(this.servers.values());
  }

  getConnectedServers(): MCPServerInstance[] {
    return this.getAllServers().filter(server => server.status === 'connected');
  }

  // Connection Management
  async connectServer(serverId: string): Promise<void> {
    const instance = this.servers.get(serverId);
    if (!instance || !instance.config.enabled) {
      throw new Error(`Server ${serverId} not found or disabled`);
    }

    if (instance.status === 'connected') {
      return;
    }

    try {
      const connection = this.createConnection(instance.config);
      this.connections.set(serverId, connection);

      this.setupConnectionEventListeners(serverId, connection, instance);

      await connection.connect();
      
      // Initialize server capabilities
      await this.initializeServer(serverId, connection, instance);

    } catch (error: any) {
      instance.status = 'error';
      instance.lastError = error.message;
      this.emit('serverError', instance, error);
      throw error;
    }
  }

  async disconnectServer(serverId: string): Promise<void> {
    const connection = this.connections.get(serverId);
    const instance = this.servers.get(serverId);

    if (connection) {
      await connection.disconnect();
      this.connections.delete(serverId);
    }

    if (instance) {
      instance.status = 'disconnected';
      instance.connectedAt = undefined;
      this.emit('serverDisconnected', instance);
    }
  }

  async disconnectAllServers(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.keys())
      .map(serverId => this.disconnectServer(serverId));
    
    await Promise.all(disconnectPromises);
  }

  // Tool and Resource Management
  async callTool(serverId: string, toolName: string, arguments_: Record<string, any>): Promise<any> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error(`Server ${serverId} is not connected`);
    }

    return await connection.sendRequest('tools/call', {
      name: toolName,
      arguments: arguments_
    });
  }

  async getResource(serverId: string, uri: string): Promise<any> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error(`Server ${serverId} is not connected`);
    }

    return await connection.sendRequest('resources/read', { uri });
  }

  async listTools(serverId: string): Promise<MCPTool[]> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error(`Server ${serverId} is not connected`);
    }

    const response = await connection.sendRequest('tools/list');
    return response.tools || [];
  }

  async listResources(serverId: string): Promise<MCPResource[]> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error(`Server ${serverId} is not connected`);
    }

    const response = await connection.sendRequest('resources/list');
    return response.resources || [];
  }

  async listPrompts(serverId: string): Promise<MCPPrompt[]> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error(`Server ${serverId} is not connected`);
    }

    const response = await connection.sendRequest('prompts/list');
    return response.prompts || [];
  }

  // Private Methods
  private createConnection(config: MCPServerConfig): MCPConnection {
    switch (config.type) {
      case 'websocket':
        return new WebSocketConnection(config);
      case 'sse':
        return new SSEConnection(config);
      case 'local':
        throw new Error('Local connections not yet implemented');
      default:
        throw new Error(`Unsupported connection type: ${config.type}`);
    }
  }

  private setupConnectionEventListeners(serverId: string, connection: MCPConnection, instance: MCPServerInstance): void {
    connection.on('statusChange', (status: any) => {
      instance.status = status;
      this.emit('serverStatusChanged', instance);
    });

    connection.on('connected', () => {
      instance.connectedAt = new Date();
      this.emit('serverConnected', instance);
    });

    connection.on('disconnected', () => {
      instance.connectedAt = undefined;
      this.emit('serverDisconnected', instance);
    });

    connection.on('error', (error: any) => {
      instance.lastError = error.message;
      this.emit('serverError', instance, error);
    });
  }

  private async initializeServer(serverId: string, connection: MCPConnection, instance: MCPServerInstance): Promise<void> {
    try {
      // Get server info
      const infoResponse = await connection.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: { listChanged: true },
          sampling: {},
        },
        clientInfo: {
          name: 'MCP Chat Client',
          version: '1.0.0'
        }
      });

      instance.info = infoResponse.serverInfo;

      // Load capabilities
      if (instance.info?.capabilities?.tools) {
        instance.tools = await this.listTools(serverId);
      }

      if (instance.info?.capabilities?.resources) {
        instance.resources = await this.listResources(serverId);
      }

      if (instance.info?.capabilities?.prompts) {
        instance.prompts = await this.listPrompts(serverId);
      }

      this.emit('serverInitialized', instance);
    } catch (error) {
      console.error(`Failed to initialize server ${serverId}:`, error);
      throw error;
    }
  }

  // Persistence
  private persistServers(): void {
    const configs = Array.from(this.servers.values()).map(server => server.config);
    localStorage.setItem('mcp_servers', JSON.stringify(configs));
  }

  private loadPersistedServers(): void {
    try {
      const stored = localStorage.getItem('mcp_servers');
      if (stored) {
        const configs: MCPServerConfig[] = JSON.parse(stored);
        configs.forEach(config => {
          const instance: MCPServerInstance = {
            config,
            status: 'disconnected'
          };
          this.servers.set(config.id, instance);
        });
      }
    } catch (error) {
      console.error('Failed to load persisted servers:', error);
    }
  }

  // Event Management
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

  private emit(event: string, ...args: any[]): void {
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
}