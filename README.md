# Model Context Protocol UI SDK

**mcp-ui** is a TypeScript SDK that adds UI capabilities on top of the Model-Context Protocol (MCP). It provides packages to create interactive HTML components in the server and to handle their rendering in the client.

The library will evolve as a playground to experiment with the many exciting ideas in the community.

## Goal

The primary goal is to facilitate the creation and rendering of `HtmlResource` objects. These blocks are designed to be part of an MCP response, allowing a model or tool to send a structured HTML component or URL for a client for display.

### `HtmlResource`

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

*   **`uri`**: A unique identifier for the resource.
    *   `ui://<unique-id>`: Indicates the resource content is self-contained HTML, intended to be rendered directly by the client (e.g., in an iframe sandbox with `srcDoc`). The `text` or `blob` field will contain the HTML string.
    *   `ui-app://<app-id>/<instance-id>`: Indicates the resource is an external application or a more complex UI that should be rendered within an iframe using a URL. The `text` or `blob` field will contain the URL for the iframe's `src` attribute.
*   **`mimeType`**: For this SDK, it will always be `"text/html"`.
*   **`text` vs. `blob`**: This defines how the content (HTML string or URL string) is delivered:
    *   `text`: The content is provided as a direct string.
    *   `blob`: The content is provided as a Base64 encoded string. This is useful for ensuring content integrity or for embedding larger HTML payloads without issues in JSON.

## Packages

*   **`@mcp-ui/client`**: Provides React components and hooks for the client-side. The primary component is `<HtmlResource />`.
*   **`@mcp-ui/server`**: Includes helper functions for server-side tools to easily construct `HtmlResource` objects.

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
// This `directHtmlResource` can now be included in the tool response.

// Example 2: External App URL, delivered as text
const appUrl = 'https://example.com/my-interactive-app';
const externalAppResource = createHtmlResource({
  uri: 'ui-app://my-app-identifier/session123',
  content: { type: 'externalUrl', iframeUrl: appUrl },
  delivery: 'text',
});
```

### Client-Side (`@mcp-ui/client`)

The `@mcp-ui/client` package provides an `<HtmlResource />` component (example path: `packages/client/src/components/HtmlResource.tsx`) designed to render these blocks.

**Conceptual Usage:**

```tsx
import React from 'react';
import { HtmlResource } from '@mcp-ui/client';

// Dummy type for the example
interface HtmlResource {
  type: "resource";
  resource: {
    uri: string;
    mimeType: "text/html";
    text?: string;
    blob?: string;
  }
}

const MyComponent: React.FC<{ mcpResource: HtmlResource }> = ({ mcpResource }) => {
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


## 👥 Contributing

Contributions, feedback, and ideas are more than welcome! Please review the [contribution](https://github.com/idosal/mco-ui/blob/main/.github/CONTRIBUTING.md) guidelines.

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).

## Disclaimer

MCP UI is provided "as is" without warranty of any kind. Authors are not responsible for any damages or issues that may arise from its use.