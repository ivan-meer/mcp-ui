# @mcp-ui/client Usage & Examples

Here’s how to use the `<HtmlResource />` component from `@mcp-ui/client`.

## Installation

Make sure you have `@mcp-ui/client` and its peer dependencies installed in your React project:

```bash
pnpm add @mcp-ui/client react @modelcontextprotocol/sdk
```

## Rendering HTML Resources

```tsx
import React, { useState } from 'react';
import { HtmlResource } from '@mcp-ui/client';
import type { HtmlResourceBlock } from '@mcp-ui/shared';

// Simulate fetching an MCP resource block
const fetchMcpResource = async (id: string): Promise<HtmlResourceBlock> => {
  if (id === 'direct') {
    return {
      type: 'resource',
      resource: {
        uri: 'ui://example/direct-html',
        mimeType: 'text/html',
        text: "<h1>Direct HTML via Text</h1><p>Content loaded directly.</p><button onclick=\"window.parent.postMessage({tool: 'uiInteraction', params: { action: 'directClick', value: Date.now() }}, '*')\">Click Me (Direct)</button>",
      },
    };
  } else if (id === 'blob') {
    const html =
      "<h1>HTML from Blob</h1><p>Content was Base64 encoded.</p><button onclick=\"window.parent.postMessage({tool: 'uiInteraction', params: { action: 'blobClick', value: 'test' }}, '*')\">Click Me (Blob)</button>";
    return {
      type: 'resource',
      resource: {
        uri: 'ui://example/blob-html',
        mimeType: 'text/html',
        blob: btoa(html),
      },
    };
  } else if (id === 'external') {
    return {
      type: 'resource',
      resource: {
        uri: 'ui-app://example/external-site',
        mimeType: 'text/html',
        text: 'https://vitepress.dev',
      },
    };
  }
  throw new Error('Unknown resource ID');
};

const App: React.FC = () => {
  const [resourceBlock, setResourceBlock] = useState<HtmlResourceBlock | null>(
    null,
  );
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
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleGenericMcpAction = async (
    tool: string,
    params: Record<string, unknown>,
  ) => {
    console.log(`Action received in host app - Tool: ${tool}, Params:`, params);
    setLastAction({ tool, params });
    return {
      status: 'Action handled by host application',
      receivedParams: params,
    };
  };

  return (
    <div>
      <h1>MCP-UI Client Demo</h1>
      <button onClick={() => loadResource('direct')}>
        Load Direct HTML (Text)
      </button>
      <button onClick={() => loadResource('blob')}>
        Load Direct HTML (Blob)
      </button>
      <button onClick={() => loadResource('external')}>
        Load External App (URL)
      </button>

      {loading && <p>Loading resource...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {resourceBlock && resourceBlock.resource && (
        <div style={{ marginTop: 20, border: '2px solid blue', padding: 10 }}>
          <h2>Rendering Resource: {resourceBlock.resource.uri}</h2>
          <HtmlResource
            resource={resourceBlock.resource}
            onGenericMcpAction={handleGenericMcpAction}
          />
        </div>
      )}

      {lastAction && (
        <div style={{ marginTop: 20, border: '1px solid green', padding: 10 }}>
          <h3>Last Action Received by Host:</h3>
          <pre>{JSON.stringify(lastAction, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
```

---

That’s it! Just use `<HtmlResource />` with the right props and you’re ready to render interactive HTML from MCP resources in your React app. If you need more details, check out the [HtmlResource Component](./html-resource.md) page.
