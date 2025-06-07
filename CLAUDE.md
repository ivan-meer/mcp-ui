# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for the Model Context Protocol UI SDK (mcp-ui), which brings interactive web components to the Model Context Protocol. The project consists of:

- **`@mcp-ui/server`**: Utilities to generate `HtmlResourceBlock` objects on MCP servers
- **`@mcp-ui/client`**: React components to render HTML resources and handle their events
- **`@mcp-ui/shared`**: Shared utilities and types (internal package)

## Development Commands

**Package Manager**: Use `pnpm` exclusively (enforced by preinstall script)

**Core Development**:
- `pnpm dev` - Start development mode for all packages in parallel
- `pnpm build` - Build all packages
- `pnpm test` - Run tests using Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm coverage` - Generate test coverage reports

**Code Quality**:
- `pnpm lint` - Run ESLint on TypeScript/React files
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Prettier

**Documentation**:
- `pnpm docs:dev` - Start VitePress docs development server
- `pnpm docs:build` - Build documentation
- `pnpm docs:preview` - Preview built documentation

**Example Server**:
- Navigate to `examples/server/`
- `pnpm dev` - Start React Router development server
- `pnpm build` - Build for Cloudflare Workers deployment
- `pnpm typecheck` - Run TypeScript type checking

## Architecture

**Monorepo Structure**:
- Uses pnpm workspaces with packages in `packages/` directory
- Shared TypeScript configuration in `tsconfig.base.json`
- Vitest for testing across all packages with shared configuration

**Core Concepts**:
- **HtmlResourceBlock**: Primary payload with `uri`, `mimeType`, and content (`text`/`blob`)
- **URI Schemes**: 
  - `ui://` for self-contained HTML (rendered via `<iframe srcDoc>`)
  - `ui-app://` for external apps (rendered via `<iframe src>`)
- **UI Actions**: Event-driven interaction between UI blocks and MCP hosts

**Package Dependencies**:
- Client package depends on React 18+ and MCP SDK
- Server package is framework-agnostic with minimal dependencies
- All packages use ES modules and support both CommonJS and ES module exports

**Testing Setup**:
- Vitest with jsdom environment for React components
- Global test APIs enabled (describe, it, expect)
- Coverage configured for all source files in packages

When working on this codebase, ensure changes maintain compatibility across the server and client packages, and follow the established patterns for HtmlResource creation and rendering.