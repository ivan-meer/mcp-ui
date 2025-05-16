# Model Context Protocol UI SDK

[![Server Version](https://img.shields.io/npm/v/@mcp-ui/server?label=server&color=green)](https://www.npmjs.com/package/@mcp-ui/server)
[![Client Version](https://img.shields.io/npm/v/@mcp-ui/client?label=client&color=blue)](https://www.npmjs.com/package/@mcp-ui/client)

**mcp-ui** is a TypeScript SDK that adds UI capabilities to the [Model-Context Protocol](https://modelcontextprotocol.io/introduction) (MCP). It provides packages to create interactive HTML components on the server and handle their rendering on the client.

This project is a playground for new ideas in the MCP community. Expect it to evolve rapidly!

<video src="https://github.com/user-attachments/assets/51f7c712-8133-4d7c-86d3-fdca550b9767"></video>

## Goal

Make it simple to create and render HTML resource blocks. These are special objects you can send in an MCP response, letting your MCP server deliver a structured interactive web component for the host to display.

### `HtmlResource` at a Glance

This is the main object exchanged between the server and the client:

```typescript
interface HtmlResource {
  type: 'resource';
  resource: {
    uri: string; // e.g., "ui://my-component/1" or "ui-app://my-app/instance-1"
    mimeType: 'text/html';
    text?: string; // HTML content OR external app URL
    blob?: string; // Base64 encoded HTML content or external app URL
  };
}
```

- **`uri`**: Uniquely identifies the resource.
  - `ui://...` means the content is self-contained HTML (rendered with `srcDoc` in an iframe).
  - `ui-app://...` means the content is an external app or site (rendered with `src` in an iframe).
- **`mimeType`**: Always `"text/html"` for this SDK.
- **`text` vs. `blob`**: Use `text` for direct strings, or `blob` for Base64-encoded content (handy for larger payloads or to avoid JSON issues).

## Packages

- **`@mcp-ui/client`**: React components for the client. The main export is `<HtmlResource />` — just drop it into your app to render MCP HTML resources.
- **`@mcp-ui/server`**: Helpers for building `HtmlResource` objects on the server.

## Quickstart
The example server (`examples/server`) is hosted at `https://remote-mcp-server-authless.idosalomon.workers.dev/mcp` (HTTP Streaming) and `https://remote-mcp-server-authless.idosalomon.workers.dev/sse` (SSE). You can use it with any compatible host.

## How to Use

### Server-Side (`@mcp-ui/server`)

Use `createHtmlResource` to build a resource block:

```typescript
import { createHtmlResource } from '@mcp-ui/server';

// Direct HTML content
const directHtmlResource = createHtmlResource({
  uri: 'ui://my-unique-component/instance1',
  content: { type: 'directHtml', htmlString: '<p>Hello from direct HTML!</p>' },
  delivery: 'text',
});

// External App URL
const appUrl = 'https://example.com/my-interactive-app';
const externalAppResource = createHtmlResource({
  uri: 'ui-app://my-app-identifier/session123',
  content: { type: 'externalUrl', iframeUrl: appUrl },
  delivery: 'text',
});
```

### Client-Side (`@mcp-ui/client`)

The main export is the `<HtmlResource />` React component. Use it to render any MCP HTML resource block:

```tsx
import React from 'react';
import { HtmlResource } from '@mcp-ui/client';

const MyComponent = ({ mcpResource }) => {
  const handleAction = async (tool, params) => {
    console.log('Action from iframe:', tool, params);
    // Handle actions posted from the iframe content
    return { status: 'Action handled' };
  };

  if (
    mcpResource.type === 'resource' &&
    mcpResource.resource.mimeType === 'text/html'
  ) {
    return (
      <HtmlResource
        resource={mcpResource.resource}
        onGenericMcpAction={handleAction}
      />
    );
  }
  return <p>Unsupported resource type.</p>;
};
```

For more details and advanced usage, check out the [docs](./docs/src/guide/client/overview.md) and the [HtmlResource component guide](./docs/src/guide/client/html-resource.md).

## 👥 Contributing

Ideas, feedback, and contributions are always welcome! See the [contribution guidelines](https://github.com/idosal/mco-ui/blob/main/.github/CONTRIBUTING.md).

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).

## Disclaimer

MCP UI is provided "as is" with no warranty. Use at your own risk.
