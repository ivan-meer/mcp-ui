## 📦 Model Context Protocol UI SDK

<p align="center">
  <a href="https://www.npmjs.com/package/@mcp-ui/server"><img src="https://img.shields.io/npm/v/@mcp-ui/server?label=server&color=green" alt="Server Version"></a>
  <a href="https://www.npmjs.com/package/@mcp-ui/client"><img src="https://img.shields.io/npm/v/@mcp-ui/client?label=client&color=blue" alt="Client Version"></a>
</p>

<p align="center">
  <a href="#-what-is-mcp-ui">What Is `mcp-ui`</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-core-concepts">Core Concepts</a> •
  <a href="#-example-implementation">Example Implementation</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

----

**`mcp-ui`** brings interactive web components to your [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) workflow. Build on the server, render on the client — let your MCP server deliver dynamic HTML resources out of the box.

> *This project is an experimental playground for MCP UI ideas. Expect rapid iteration and community-driven enhancements!*

<video src="https://github.com/user-attachments/assets/51f7c712-8133-4d7c-86d3-fdca550b9767"></video>

## 💡 What Is `mcp-ui`?

`mcp-ui` is a TypeScript SDK comprising two packages:

* **`@mcp-ui/server`**: Utilities to generate `HtmlResourceBlock` objects on your MCP server.
* **`@mcp-ui/client`**: UI components (e.g., `<HtmlResource />`) to render those blocks in the browser and handle their events.

Together, they let you define reusable HTML resource blocks on the server side and seamlessly display them and react to their actions in any MCP host environment.


## ✨ Core Concepts

### HtmlResource

The primary payload exchanged between the server and the client:

```ts
interface HtmlResourceBlock {
  type: 'resource';
  resource: {
    uri: string;       // e.g. "ui://component/id" or "ui-app://app/instance"
    mimeType: 'text/html';
    text?: string;      // Inline HTML or external URL
    blob?: string;      // Base64-encoded HTML or URL (for large payloads)
  };
}
```

* **`uri`**: Unique identifier for caching and routing
  * `ui://…` — self-contained HTML (rendered via `<iframe srcDoc>`)
  * `ui-app://…` — external app/site (rendered via `<iframe src>`)
* **`mimeType`**: Always `text/html`
* **`text` vs. `blob`**: Choose `text` for simple strings; use `blob` for larger or encoded content.

It's rendered in the client with the `<HtmlResource>` React component.

The HTML method is limited, and the external app method isn't secure enough for untrusted 3rd party sites. We need a better method. Some ideas we should explore: RSC, remotedom, etc.

### UI Action

UI blocks must be able to interact with the agent. In `mcp-ui`, this is done by hooking into events sent from the UI block and reacting to them in the host. For example, an HTML may trigger a tool call when a button is clicked by sending an event which will be caught handled by the client.

## 🏗️ Installation

```bash
# using npm
npm install @mcp-ui/server @mcp-ui/client

# or yarn
yarn add @mcp-ui/server @mcp-ui/client
```

## 🎬 Quickstart

1. **Server-side**: Build your resource blocks

   ```ts
   import { createHtmlResource } from '@mcp-ui/server';

   // Inline HTML
   const direct = createHtmlResource({
     uri: 'ui://greeting/1',
     content: { type: 'rawHtml', htmlString: '<p>Hello, MCP UI!</p>' },
     delivery: 'text',
   });

   // External URL
   const external = createHtmlResource({
     uri: 'ui-app://widget/session-42',
     content: { type: 'externalUrl', iframeUrl: 'https://example.com/widget' },
     delivery: 'text',
   });
   ```

2. **Client-side**: Render in your MCP host

   ```tsx
   import React from 'react';
   import { HtmlResource } from '@mcp-ui/client';

   function App({ mcpResource }) {
     if (
       mcpResource.type === 'resource' &&
       mcpResource.resource.mimeType === 'text/html'
     ) {
       return (
         <HtmlResource
           resource={mcpResource.resource}
           onUiAction={(tool, params) => {
             console.log('Action:', tool, params);
             return { status: 'ok' };
           }}
         />
       );
     }
     return <p>Unsupported resource</p>;
   }
   ```

3. **Enjoy** interactive MCP UIs — no extra configuration required.

## 🌍 Example implementation

**Client example**
https://github.com/modelcontextprotocol/inspector/pull/413

**Server example**
Try out the hosted app at -
* **HTTP Streaming**: `https://remote-mcp-server-authless.idosalomon.workers.dev/mcp`
* **SSE**: `https://remote-mcp-server-authless.idosalomon.workers.dev/sse`

The app is deployed from `examples/server`.

Drop those URLs into any MCP-compatible host to see `mcp-ui` in action.

## 🛣️ Roadmap

- [ ] Support new SSR methods (e.g., RSC)
- [ ] Support additional client-side libraries
- [ ] Expand UI Action API
- [ ] Do more with Resources and Sampling

## 🤝 Contributing

Contributions, ideas, and bug reports are welcome! See our [contribution guidelines](https://github.com/idosal/mco-ui/blob/main/.github/CONTRIBUTING.md) to get started.


## 📄 License

Apache License 2.0 © [The MCP UI Authors](LICENSE)

## Disclaimer

This project is provided “as is”, without warranty of any kind. The `mcp-ui` authors and contributors shall not be held liable for any damages, losses, or issues arising from the use of this software. Use at your own risk.
