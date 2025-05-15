# @mcp-ui/client Usage & Examples

This page shows how to use the `<HtmlResource />` component from `@mcp-ui/client`.

## Basic Setup

Ensure `@mcp-ui/client` and its peer dependencies (`react`, `@mcp-ui/shared`, and potentially `@modelcontextprotocol/sdk`) are installed in your React project.

```bash
pnpm add @mcp-ui/client @mcp-ui/shared react @modelcontextprotocol/sdk
```

## Using the `<HtmlResource />` Component

```tsx
import React, { useState, useEffect } from 'react';
import { HtmlResource } from '@mcp-ui/client';
// Assuming HtmlResourceBlock structure comes from @mcp-ui/shared or a compatible type
import type { HtmlResourceBlock } from '@mcp-ui/shared'; 

// Mock function to simulate receiving an MCP resource block
const fetchMcpResource = async (id: string): Promise<HtmlResourceBlock> => {
  // In a real app, this would be an API call
  if (id === 'direct') {
    return {
      type: 'resource',
      resource: {
        uri: 'ui://example/direct-html',
        mimeType: 'text/html',
        text: '<h1>Direct HTML via Text</h1><p>Content loaded directly.</p><button onclick="window.parent.postMessage({tool: \'uiInteraction\', params: { action: \'directClick', value: Date.now() }}, \'*\')">Click Me (Direct)</button>'
      }
    };
  } else if (id === 'blob') {
    const html = '<h1>HTML from Blob</h1><p>Content was Base64 encoded.</p><button onclick="window.parent.postMessage({tool: \'uiInteraction\', params: { action: \'blobClick\', value: \'test\' }}, \'*\')">Click Me (Blob)</button>';
    return {
      type: 'resource',
      resource: {
        uri: 'ui://example/blob-html',
        mimeType: 'text/html',
        blob: btoa(html) // In Node.js you'd use Buffer.from(html).toString('base64')
      }
    };
  } else if (id === 'external') {
    return {
      type: 'resource',
      resource: {
        uri: 'ui-app://example/external-site',
        mimeType: 'text/html',
        text: 'https://vitepress.dev' // Any URL
      }
    };
  }
  throw new Error('Unknown resource ID');
};

const App: React.FC = () => {
  const [resourceBlock, setResourceBlock] = useState<HtmlResourceBlock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<any>(null);

  const loadResource = async (id: string) => {
    setLoading(true);
    setError(null);
    setResourceBlock(null);
    try {
      const block = await fetchMcpResource(id);
      setResourceBlock(block);
    } catch (e:any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleGenericMcpAction = async (tool: string, params: Record<string, unknown>) => {
    console.log(`Action received in host app - Tool: ${tool}, Params:`, params);
    setLastAction({ tool, params });
    // Example: You might send this to a backend, or update local state further
    return { status: 'Action handled by host application', receivedParams: params };
  };

  return (
    <div>
      <h1>MCP-UI Client Demo</h1>
      <button onClick={() => loadResource('direct')}>Load Direct HTML (Text)</button>
      <button onClick={() => loadResource('blob')}>Load Direct HTML (Blob)</button>
      <button onClick={() => loadResource('external')}>Load External App (URL)</button>

      {loading && <p>Loading resource...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {resourceBlock && resourceBlock.resource && (
        <div style={{ marginTop: '20px', border: '2px solid blue', padding: '10px' }}>
          <h2>Rendering Resource: {resourceBlock.resource.uri}</h2>
          <HtmlResource 
            resource={resourceBlock.resource} 
            onGenericMcpAction={handleGenericMcpAction} 
          />
        </div>
      )}

      {lastAction && (
        <div style={{ marginTop: '20px', border: '1px solid green', padding: '10px' }}>
          <h3>Last Action Received by Host:</h3>
          <pre>{JSON.stringify(lastAction, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
``` 