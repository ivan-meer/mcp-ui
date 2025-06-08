// packages/server-manager/src/registry/ServerRegistry.ts
import { ServerConfig } from '../types';

export class ServerRegistry {
  private servers: Map<string, ServerConfig> = new Map();

  constructor(initialServers: ServerConfig[] = []) {
    initialServers.forEach(server => this.servers.set(server.id, server));
  }

  addServer(config: ServerConfig): boolean {
    if (this.servers.has(config.id)) {
      console.warn(`Server with ID ${config.id} already exists.`);
      return false;
    }
    // Optionally, check for duplicate names if they should be unique
    // const existingByName = Array.from(this.servers.values()).find(s => s.name === config.name);
    // if (existingByName) {
    //   console.warn(`Server with name "${config.name}" already exists.`);
    //   return false;
    // }
    this.servers.set(config.id, config);
    return true;
  }

  removeServer(serverId: string): boolean {
    return this.servers.delete(serverId);
  }

  updateServer(serverId: string, updates: Partial<Omit<ServerConfig, 'id'>>): ServerConfig | null {
    const existingServer = this.servers.get(serverId);
    if (!existingServer) {
      return null;
    }
    const updatedServer = { ...existingServer, ...updates };
    this.servers.set(serverId, updatedServer);
    return updatedServer;
  }

  getServerById(serverId: string): ServerConfig | undefined {
    return this.servers.get(serverId);
  }

  getServerByName(name: string): ServerConfig | undefined {
    return Array.from(this.servers.values()).find(s => s.name === name);
  }

  listServers(): ServerConfig[] {
    return Array.from(this.servers.values());
  }
}
