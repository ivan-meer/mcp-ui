# @mcp-ui/server Overview

The `@mcp-ui/server` package provides server-side utilities to help construct `HtmlResource` objects, which can then be sent to a client as part of an MCP response.

## Key Exports

- **`createHtmlResource(options: CreateHtmlResourceOptions): HtmlResource`**:
  The primary function for creating resource blocks. It takes an options object to define the URI, content (direct HTML or external URL), and delivery method (text or blob).

## Purpose

- **Ease of Use**: Simplifies the creation of valid `HtmlResource` objects.
- **Validation**: Includes basic validation (e.g., URI prefixes matching content type).
- **Encoding**: Handles Base64 encoding when `delivery: 'blob'` is specified.

## Building

This package is built using Vite in library mode, targeting Node.js environments. It outputs ESM (`.mjs`) and CJS (`.js`) formats, along with TypeScript declaration files (`.d.ts`).

To build specifically this package from the monorepo root:

```bash
pnpm build --filter @mcp-ui/server
```

See the [Server SDK Usage & Examples](./usage-examples.md) page for practical examples.
