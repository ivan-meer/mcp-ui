## 📦 Model Context Protocol UI SDK

<p align="center">
  <a href="https://www.npmjs.com/package/@mcp-ui/server"><img src="https://img.shields.io/npm/v/@mcp-ui/server?label=server&color=green" alt="Server Version"></a>
  <a href="https://www.npmjs.com/package/@mcp-ui/client"><img src="https://img.shields.io/npm/v/@mcp-ui/client?label=client&color=blue" alt="Client Version"></a>
</p>

<p align="center">
  <a href="#-what-is-mcp-ui">What's mcp-ui?</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-demo-prototype">Demo & Prototype</a> •
  <a href="#-json-schema-generator">JSON Schema Generator</a> •
  <a href="#-core-concepts">Core Concepts</a> •
  <a href="#-examples">Examples</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

----

**`mcp-ui`** brings interactive web components to the [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP). Deliver rich, dynamic UI resources directly from your MCP server to be rendered by the client. Take AI interaction to the next level!

> *This project is an experimental playground for MCP UI ideas. Expect rapid iteration and community-driven enhancements!*

<video src="https://github.com/user-attachments/assets/51f7c712-8133-4d7c-86d3-fdca550b9767"></video>

## 💡 What's `mcp-ui`?

`mcp-ui` is a TypeScript SDK comprising two packages:

* **`@mcp-ui/server`**: Utilities to generate `HtmlResourceBlock` objects on your MCP server.
* **`@mcp-ui/client`**: UI components (e.g., `<HtmlResource />`) to render those blocks in the browser and handle their events.

Together, they let you define reusable UI resource blocks on the server side, seamlessly display them in the client, and react to their actions in the MCP host environment.


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

`HtmlResource` now supports an experimental `secure` render mode that sanitizes the HTML with DOMPurify instead of using an iframe. This avoids the security pitfalls of embedding untrusted sites. Future improvements may leverage React Server Components or Remote DOM for even better isolation.

### UI Action

UI blocks must be able to interact with the agent. In `mcp-ui`, this is done by hooking into events sent from the UI block and reacting to them in the host. For example, an HTML may trigger a tool call when a button is clicked by sending an event which will be caught handled by the client.

## 🏗️ Installation

```bash
# using npm
npm install @mcp-ui/server @mcp-ui/client

# or pnpm
pnpm add @mcp-ui/server @mcp-ui/client

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

## 🎨 Demo & Prototype

We've created a comprehensive prototype showcasing the full potential of MCP UI SDK! 

### 🚀 Quick Demo

**Option 1: Static Demo (Instant)**
```bash
# Open the demo file directly in your browser
open demo.html
# or
firefox demo.html
# or 
google-chrome demo.html
```

**Option 2: Local Server**
```bash
# Start local HTTP server
./start-demo.sh
# Opens http://localhost:8080/demo.html automatically
```

### 🎯 What's in the Demo

The prototype includes **6 different UI component types**:

| Component | Description | Features |
|-----------|-------------|----------|
| 📊 **Analytics Dashboard** | Interactive charts and metrics | Chart.js integration, real-time data, system status |
| 📝 **Form Generator** | Dynamic forms from JSON Schema | Validation, multiple input types, data handling |
| 📋 **Data Tables** | Interactive data display | Sorting, filtering, pagination |
| 📅 **Calendar** | Event scheduling interface | Monthly/weekly views, event management |
| 💬 **Chat Interface** | Embedded chat component | Message handling, user interactions |
| 📁 **File Manager** | File system browser | Directory navigation, file operations |

### 🔧 MCP Tools Added

The demo server includes these new MCP tools:

```typescript
// Gallery of all UI components
server.tool('show_ui_gallery', ...)

// Interactive analytics dashboard with Chart.js
server.tool('show_dashboard', { type: z.string().optional() }, ...)

// Dynamic form generator with validation
server.tool('show_form_generator', { 
  schema: z.string(), 
  data: z.record(z.any()).optional() 
}, ...)
```

### ✨ Demo Features

- **🎨 Modern Design**: Beautiful gradients, animations, hover effects
- **📱 Responsive**: Works on desktop, tablet, and mobile
- **⚡ Interactive**: All buttons and elements are fully functional
- **🔒 Secure**: Safe HTML rendering with DOMPurify
- **📊 Chart.js Integration**: Live, animated charts and graphs
- **🎯 Event Handling**: Complete MCP tool integration

### 📁 Demo Files Structure

```
/home/how2ai/mcp-ui/
├── demo.html                    # Main prototype demo
├── start-demo.sh               # Auto-launch script
├── examples/server/src/index.ts # Enhanced MCP server
└── docs/
    ├── DEMO_GUIDE.md          # Detailed demo documentation
    └── COMPONENTS.md          # Component reference
```

## 🧩 JSON Schema Generator

Generate simple React forms from JSON Schema using the `generateUI` API.

```tsx
import { generateUI } from "@mcp-ui/generator";

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
    color: { type: "string", enum: ["red", "green"] },
  },
};

export default function MyForm() {
  return generateUI(schema);
}
```


## 🌍 Examples

**Client example**
* [ui-inspector](https://github.com/idosal/ui-inspector) - inspect local `mcp-ui`-enabled servers. Check out the [hosted version](https://scira-mcp-chat-git-main-idosals-projects.vercel.app/)!
* [MCP-UI Chat](https://github.com/idosal/scira-mcp-ui-chat) - interactive chat built with the `mcp-ui` client.

**Server example**
Try out the hosted app -
* **HTTP Streaming**: `https://remote-mcp-server-authless.idosalomon.workers.dev/mcp`
* **SSE**: `https://remote-mcp-server-authless.idosalomon.workers.dev/sse`

The app is deployed from `examples/server`.

Drop those URLs into any MCP-compatible host to see `mcp-ui` in action.


## 🛣️ Roadmap

- [X] Add online playground
- [ ] Support React Server Components
- [ ] Support Remote-DOM
- [ ] Support additional client-side libraries (e.g., Vue)
- [ ] Expand UI Action API (beyond tool calls)
- [ ] Do more with Resources and Sampling

## 🌙 Документация на русском

- [План трансформации проекта](docs/src/ru/transformation-plan.md)

## 🤝 Contributing

Contributions, ideas, and bug reports are welcome! See the [contribution guidelines](https://github.com/idosal/mcp-ui/blob/main/.github/CONTRIBUTING.md) to get started.


## 📄 License

Apache License 2.0 © [The MCP UI Authors](LICENSE)

## Disclaimer

This project is provided “as is”, without warranty of any kind. The `mcp-ui` authors and contributors shall not be held liable for any damages, losses, or issues arising from the use of this software. Use at your own risk.
