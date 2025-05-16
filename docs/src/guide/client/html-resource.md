# HtmlResource Component

The `<HtmlResource />` component is currently the main component of the`@mcp-ui/client` package. It's the only export you need to render interactive HTML resources in your React app.

## Props

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types';

export interface RenderHtmlResourceProps {
  resource: Partial<Resource>;
  onGenericMcpAction: (tool: string, params: Record<string, unknown>) => Promise<any>;
  style?: React.CSSProperties;
}
```

- **`resource`**: The resource object from an `HtmlResourceBlock`. It should include `uri`, `mimeType`, and either `text` or `blob`.
- **`onGenericMcpAction`**: A callback that fires when the iframe content (for `ui://` resources) posts a message to your app. The message should look like `{ tool: string, params: Record<string, unknown> }`.
- **`style`** (optional): Custom styles for the iframe.

## How It Works

1.  **Checks Content Type**: If `resource.mimeType` isn't `"text/html"`, you'll see an error.
2.  **Handles URI Schemes**:
    *   For `ui-app://` URIs:
        *   Expects `resource.text` or `resource.blob` to contain a URL.
        *   If using `blob`, it decodes it from Base64.
        *   Renders an `<iframe>` with its `src` set to the URL.
        *   Sandbox: `allow-scripts allow-same-origin` (needed for some external sites; be mindful of security).
    *   For `ui://` URIs (or if there's no URI but you provide HTML in `text`/`blob`):
        *   Expects `resource.text` or `resource.blob` to contain HTML.
        *   If using `blob`, it decodes it from Base64.
        *   Renders an `<iframe>` with its `srcdoc` set to the HTML.
        *   Sandbox: `allow-scripts`.
3.  **Listens for Messages**: Adds a global `message` event listener. If an iframe posts a message with `event.data.tool`, your `onGenericMcpAction` callback is called.

## Styling

By default, the iframe stretches to 100% width and is at least 200px tall. You can override this with the `style` prop or your own CSS.

## Example Usage

See [Client SDK Usage & Examples](./usage-examples.md).

## Security Notes

- **`sandbox` attribute**: Restricts what the iframe can do. `allow-scripts` is needed for interactivity. `allow-same-origin` is only used for `ui-app://` URLs. Caution - it's not a secure way to render untrusted code. We should add more secure methods such as RSC ASAP.
- **`postMessage` origin**: When sending messages from the iframe, always specify the target origin for safety. The component listens globally, so your iframe content should be explicit.
- **Content Sanitization**: HTML is rendered as-is. If you don't fully trust the source, sanitize the HTML before passing it in, or rely on the iframe's sandboxing. 