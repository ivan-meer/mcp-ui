// MCP Server Types and Interfaces

export interface MCPServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities: MCPCapabilities;
  description?: string;
}

export interface MCPCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: {};
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  type: 'websocket' | 'sse' | 'local';
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  autoStart?: boolean;
  enabled: boolean;
  timeout?: number;
}

export interface MCPServerInstance {
  config: MCPServerConfig;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  info?: MCPServerInfo;
  tools?: MCPTool[];
  resources?: MCPResource[];
  prompts?: MCPPrompt[];
  lastError?: string;
  connectedAt?: Date;
}

export interface MCPToolCall {
  toolName: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export type MCPConnectionType = 'websocket' | 'sse' | 'local';
export type MCPServerStatus = 'disconnected' | 'connecting' | 'connected' | 'error';