# Introduction

Welcome to the MCP-UI documentation!

This SDK provides tools for building Model Context Protocol (MCP) enabled applications with interactive UI components. It aims to standardize how models and tools can request the display of rich HTML interfaces within a client application.

## What is MCP UI?

MCP UI is a TypeScript SDK containing:

- **`@mcp-ui/client`**: UI components (like `<HtmlResource />`) for easy rendering of interactive HTML resources.
- **`@mcp-ui/server`**: Helper functions (like `createHtmlResource`) for server-side logic to easily construct `HtmlResource` objects.

## Core Concept: The Interactive HTML Resource Protocol

The central piece of this SDK is the `HtmlResource`. This object defines a contract for how interactive HTML content should be structured and delivered from a server/tool to a client.

### `HtmlResource` Structure

```typescript
// Defined in @mcp-ui/shared, but shown here for clarity
export interface HtmlResource {
  type: 'resource'; // Fixed type identifier
  resource: {
    uri: string; // Unique identifier. Governs rendering behavior.
    mimeType: 'text/html'; // Must be text/html.
    text?: string; // Raw HTML string or an iframe URL string.
    blob?: string; // Base64 encoded HTML string or iframe URL string.
  };
}
```

### Key Field Details:

- **`uri` (Uniform Resource Identifier)**:
  - If starts with `ui://` (e.g., `ui://my-custom-form/instance-01`):
    - The client should render the HTML content (from `text` or `blob`) directly, typically within a sandboxed `<iframe>` using the `srcdoc` attribute.
    - This is for self-contained HTML snippets or components.
  - If starts with `ui-app://` (e.g., `ui-app://external-dashboard/user-xyz`):
    - The client should render the URL (from `text` or `blob`) within an `<iframe>` using the `src` attribute.
    - This is for embedding full external web applications or pages.
- **`mimeType`**: Must be `"text/html"` for this protocol.
- **`text` or `blob` Content Delivery**:
  - `text`: The HTML string or URL is provided directly.
  - `blob`: The HTML string or URL is Base64 encoded. Useful for complex HTML, ensuring integrity, or avoiding issues with JSON encoding of special characters.

This protocol allows for flexible delivery and rendering of HTML content, from simple static blocks to fully interactive applications embedded within the client.

Dive into the "Getting Started" guide or explore specific SDK packages for more details.

## Philosophy

[Explain the project's philosophy here...]
