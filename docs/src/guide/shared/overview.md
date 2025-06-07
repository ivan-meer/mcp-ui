# @mcp-ui/shared Overview

The `@mcp-ui/shared` package is the foundation of the MCP-UI SDK, providing common types, enums, and utility functions used by both the server and client packages.

## Key Exports

- **`HtmlResourceBlock` (Interface)**: The core data structure for defining interactive HTML resources. (See [Protocol Details](../protocol-details.md) for more information).
- **`ResourceContentPayload` (Type)**: Defines the structure for `content` within `CreateHtmlResourceOptions`, discriminating between direct HTML and external URLs.
- **`CreateHtmlResourceOptions` (Interface)**: Options for the `createHtmlResource` function in `@mcp-ui/server`.
- **`PlaceholderEnum` (Enum)**: An example enum: `export enum PlaceholderEnum { FOO = 'FOO', BAR = 'BAR' }`.
- **`greet` (Function)**: An example utility function: `export const greet = (name: string): string => `Hello, ${name}!`;

## Purpose

- **Consistency**: Ensures that client and server components operate on the same data structures.
- **Reusability**: Offers common utilities that can be used across different parts of an MCP application.
- **Type Safety**: Provides TypeScript definitions for better development experience.

## Building

This package is built using Vite in library mode. It outputs ESM (`.mjs`) and UMD (`.js`) formats, along with TypeScript declaration files (`.d.ts`).

To build specifically this package from the monorepo root:

```bash
pnpm build --filter @mcp-ui/shared
```
