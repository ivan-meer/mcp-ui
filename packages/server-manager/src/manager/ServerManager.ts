// packages/server-manager/src/manager/ServerManager.ts
import { ServerConfig, ServerStatus } from '../types';
import { ServerRegistry } from '../registry/ServerRegistry';
// import { EventEmitter } // Assuming an EventEmitter is available, e.g., from 'events' or a shared utility

// If no central EventEmitter, a simple one for this class:
class SimpleEventEmitter {
    private listeners: Record<string, Function[]> = {};
    on(event: string, listener: Function) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(listener);
    }
    emit(event: string, ...args: any[]) {
        this.listeners[event]?.forEach(listener => listener(...args));
    }
    off(event: string, listener: Function) {
         if (this.listeners[event]) {
             this.listeners[event] = this.listeners[event].filter(l => l !== listener);
         }
    }
}


export class ServerManager extends SimpleEventEmitter { // or extends real EventEmitter
  private registry: ServerRegistry;
  private activeServerId: string | null = null;
  private serverStatuses: Map<string, ServerStatus['status']> = new Map(); // Basic status tracking

  constructor(initialServers: ServerConfig[] = []) {
    super();
    this.registry = new ServerRegistry(initialServers);
    // Initialize statuses
    initialServers.forEach(s => this.serverStatuses.set(s.id, 'disconnected'));
  }

  // Registry methods
  addServer(config: ServerConfig): boolean {
    const success = this.registry.addServer(config);
    if (success) {
      this.serverStatuses.set(config.id, 'disconnected');
      this.emit('serversChanged', this.listServers());
    }
    return success;
  }

  removeServer(serverId: string): boolean {
    const success = this.registry.removeServer(serverId);
    if (success) {
      this.serverStatuses.delete(serverId);
      if (this.activeServerId === serverId) {
        this.activeServerId = null;
        this.emit('activeServerChanged', null);
      }
      this.emit('serversChanged', this.listServers());
    }
    return success;
  }

  updateServer(serverId: string, updates: Partial<Omit<ServerConfig, 'id'>>): ServerConfig | null {
    const updatedServer = this.registry.updateServer(serverId, updates);
    if (updatedServer) {
      this.emit('serversChanged', this.listServers());
    }
    return updatedServer;
  }

  getServerById(serverId: string): ServerConfig | undefined {
    return this.registry.getServerById(serverId);
  }

  getServerByName(name: string): ServerConfig | undefined {
     return this.registry.getServerByName(name);
  }

  listServers(): ServerConfig[] {
    return this.registry.listServers();
  }

  // Active server management
  setActiveServer(serverId: string | null): void {
    if (serverId !== null && !this.registry.getServerById(serverId)) {
      console.error(`Server with ID ${serverId} not found.`);
      return;
    }
    if (this.activeServerId !== serverId) {
      this.activeServerId = serverId;
      this.emit('activeServerChanged', this.getActiveServer());
    }
  }

  getActiveServer(): ServerConfig | null {
    return this.activeServerId ? this.registry.getServerById(this.activeServerId) || null : null;
  }

  getActiveServerId(): string | null {
     return this.activeServerId;
  }

  // Status management (basic)
  getServerStatus(serverId: string): ServerStatus['status'] | undefined {
    return this.serverStatuses.get(serverId);
  }

  updateServerStatus(serverId: string, status: ServerStatus['status']): void {
    if (this.registry.getServerById(serverId)) {
      this.serverStatuses.set(serverId, status);
      this.emit('statusChanged', { serverId, status });
    }
  }
}
