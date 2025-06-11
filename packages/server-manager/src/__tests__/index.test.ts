import { describe, it, expect } from 'vitest';
import { ServerManager, ServerRegistry } from '../index';

describe('@mcp-ui/server-manager', () => {
  it('exports ServerManager class', () => {
    expect(ServerManager).toBeDefined();
    const manager = new ServerManager();
    expect(typeof manager.listServers).toBe('function');
  });

  it('exports ServerRegistry class', () => {
    expect(ServerRegistry).toBeDefined();
    const registry = new ServerRegistry();
    expect(Array.isArray(registry.listServers())).toBe(true);
  });
});
