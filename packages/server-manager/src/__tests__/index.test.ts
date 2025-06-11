import * as serverManager from '../index';

describe('@mcp-ui/server-manager exports', () => {
  it('should export ServerManager and ServerRegistry', () => {
    expect(serverManager.ServerManager).toBeDefined();
    expect(serverManager.ServerRegistry).toBeDefined();
  });

  it('should have a default export with core components', () => {
    expect(serverManager.default.ServerManager).toBe(serverManager.ServerManager);
    expect(serverManager.default.ServerRegistry).toBe(serverManager.ServerRegistry);
    expect(serverManager.default.ServerConfigForm).toBe(serverManager.ServerConfigForm);
  });
});
