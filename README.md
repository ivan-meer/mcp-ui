# Model Context Protocol UI SDK

**mcp-ui** is a TypeScript SDK for building applications that use the Model-Context Protocol (MCP) to deliver interactive HTML components. It provides packages for client-side handling, and server-side resource creation.

## Core Concept: Interactive HTML Resources

The primary goal of this SDK is to facilitate the creation and rendering of `HtmlResource` objects. These blocks are designed to be part of an MCP response, allowing a model or tool to send structured HTML content to a client for display.

### The `HtmlResource`

This is the fundamental object exchanged. It has the following structure (simplified):

```typescript
interface HtmlResourceBlock {
  type: "resource";
  resource: {
    uri: string;        // Primary identifier. e.g., "ui://my-component/1" or "ui-app://my-app/instance-1"
    mimeType: "text/html"; // Always text/html for this SDK's purpose
    text?: string;      // HTML content or an iframe URL
    blob?: string;      // Base64 encoded HTML content or iframe URL
  }
}
```

### Key Fields Explained:

*   **`uri`**: A unique identifier for the resource.
    *   `ui://<unique-id>`: Indicates the resource content is self-contained HTML, intended to be rendered directly by the client (e.g., in an iframe sandbox with `srcDoc`). The `text` or `blob` field will contain the HTML string.
    *   `ui-app://<app-id>/<instance-id>`: Indicates the resource is an external application or a more complex UI that should be rendered within an iframe using a URL. The `text` or `blob` field will contain the URL for the iframe's `src` attribute.
*   **`mimeType`**: For this SDK, it will always be `"text/html"`.
*   **`text` vs. `blob`**: This defines how the content (HTML string or URL string) is delivered:
    *   `text`: The content is provided as a direct string.
    *   `blob`: The content is provided as a Base64 encoded string. This is useful for ensuring content integrity or for embedding larger HTML payloads without issues in JSON.

## Packages


*   **`@mcp-ui/client`**: Provides React components and hooks for the client-side. The primary component is `<HtmlResource />` which can render an `HtmlResourceBlock`.
*   **`@mcp-ui/server`**: Includes helper functions for server-side tools to easily construct `HtmlResourceBlock` objects.
*   **`@mcp-ui/shared`**: Contains shared types (like `HtmlResourceBlock`), enums, and simple utility functions.
*   **`apps/docs`**: The VitePress documentation website.

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies from the monorepo root:**
   ```bash
    pnpm install
   ```
## How to Use

### Server-Side (`@mcp-ui/server`)

Use `createHtmlResource` to construct the resource block.

```typescript
import { createHtmlResource } from '@mcp-ui/server';

// Example 1: Direct HTML content, delivered as text
const directHtmlResource = createHtmlResource({
  uri: 'ui://my-unique-component/instance1',
  content: { type: 'directHtml', htmlString: '<p>Hello from direct HTML!</p>' },
  delivery: 'text',
});
// This `directHtmlResource` can now be included in your MCP response.

// Example 2: External App URL, delivered as Base64 blob
const appUrl = 'https://example.com/my-interactive-app';
const externalAppResource = createHtmlResource({
  uri: 'ui-app://my-app-identifier/session123',
  content: { type: 'externalUrl', iframeUrl: appUrl },
  delivery: 'blob', // URL string will be Base64 encoded
});
```

### Client-Side (`@mcp-ui/client`)

The `@mcp-ui/client` package provides an `<HtmlResource />` component (example path: `packages/client/src/components/HtmlResource.tsx`) designed to render these blocks.

**Conceptual Usage:**

```tsx
import React from 'react';
import { HtmlResource } from '@mcp-ui/client';

// Dummy type for the example
interface HtmlResourceBlock {
  type: "resource";
  resource: {
    uri: string;
    mimeType: "text/html";
    text?: string;
    blob?: string;
  }
}

const MyComponent: React.FC<{ mcpResource: HtmlResourceBlock }> = ({ mcpResource }) => {
  const handleAction = async (tool: string, params: Record<string, unknown>) => {
    console.log('Action from iframe:', tool, params);
    // Handle actions posted from the iframe content
    return { TBD: "Action handled" }; 
  };

  if (mcpResource.type === 'resource' && mcpResource.resource.mimeType === 'text/html') {
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

See the specific documentation for each package for more detailed API information and advanced usage.

## Contributing

[Details on how to contribute, coding standards, etc. can be added here.] 