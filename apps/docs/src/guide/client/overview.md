# @mcp-ui/client Overview

The `@mcp-ui/client` package is designed to help you render `InteractiveHtmlResourceBlock` objects received from an MCP-enabled server or tool within a React application.

## Key Exports

- **`HtmlResource` (React Component)**:
  The primary component for rendering an interactive HTML resource. It handles:
    - Decoding Base64 blobs if necessary.
    - Rendering content using `srcDoc` for `ui://` URIs.
    - Rendering content using `src` for `ui-app://` URIs.
    - Setting up a `message` event listener to receive actions from `ui://` iframes.
- **(Other potential exports might include context providers or hooks if the client SDK grows more complex).**

## Purpose

- **Simplified Rendering**: Abstract away the complexities of handling different URI schemes and content delivery methods (`text` vs. `blob`).
- **Security**: Encourages rendering user-provided HTML within sandboxed iframes.
- **Interactivity**: Provides a basic mechanism (`onGenericMcpAction` prop) for iframe content to communicate back to the host application.

## Building

This package is built using Vite in library mode. It outputs ESM (`.mjs`) and UMD (`.js`) formats, along with TypeScript declaration files (`.d.ts`). It correctly externalizes `react` and `@mcp-ui/shared`.

To build specifically this package from the monorepo root:
```bash
pnpm build --filter @mcp-ui/client
```

See the following pages for more details:
- [HtmlResource Component](./html-resource.md)
- [Client SDK Usage & Examples](./usage-examples.md) 