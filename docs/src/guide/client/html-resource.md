# HtmlResource Component

The `<HtmlResource />` component is the workhorse of the `@mcp-ui/client` package.

## Props

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types'; // Or from @mcp-ui/shared if type is identical

export interface RenderHtmlResourceProps {
  resource: Partial<Resource>; // Or your specific HtmlResourceBlock.resource type
  onGenericMcpAction: (tool: string, params: Record<string, unknown>) => Promise<any>;
}
```

- **`resource`**: The `resource` object from an `HtmlResourceBlock`.
  - It expects `uri`, `mimeType`, and either `text` or `blob`.
- **`onGenericMcpAction`**: A callback function that is invoked when the iframe content (for `ui://` resources) posts a message to the parent window. The message from the iframe should be an object like: 
    `{ tool: string, params: Record<string, unknown> }`.

## Behavior

1.  **Content Type Check**: Verifies `resource.mimeType` is `"text/html"`. If not, an error is displayed.
2.  **URI Scheme Handling**:
    *   If `resource.uri` starts with `ui-app://`:
        *   It expects `resource.text` or `resource.blob` to contain a URL.
        *   If `blob` is used, it Base64 decodes it to get the URL.
        *   Renders an `<iframe>` with its `src` attribute set to this URL.
        *   Sandbox: `allow-scripts allow-same-origin` (consider if `allow-same-origin` is always appropriate).
    *   If `resource.uri` starts with `ui://` (or if no URI is present but `text`/`blob` HTML content is):
        *   It expects `resource.text` or `resource.blob` to contain an HTML string.
        *   If `blob` is used, it Base64 decodes it to get the HTML string.
        *   Renders an `<iframe>` with its `srcdoc` attribute set to this HTML string.
        *   Sandbox: `allow-scripts`.
3.  **Message Handling**: For both URI schemes, it adds a global `message` event listener. If an event is received from an iframe with `event.data.tool`, it calls the `onGenericMcpAction` prop.

## Styling

The component applies a default style to the iframe: `width: '100%', minHeight: 200, border: '1px solid #ccc'`. This can be overridden with CSS targeting iframes if needed, or by wrapping the component.

## Example Usage

See [Client SDK Usage & Examples](./usage-examples.md).

## Security Considerations

- **`sandbox` attribute**: The `sandbox` attribute on iframes is used to restrict their capabilities. 
  - `allow-scripts` is generally needed for interactive content.
  - `allow-same-origin` is added for `ui-app://` which might be necessary for some external sites but has security implications. Evaluate if this is always required or should be configurable.
- **`postMessage` origin**: When iframe content uses `window.parent.postMessage`, it should **always** specify the target origin for security. The `<HtmlResource>` component listens globally, so the iframe content is responsible for this.
- **Content Sanitization**: The component currently renders HTML content (from `srcDoc`) as is. If the HTML source is not fully trusted, consider an HTML sanitization step before passing it to the component or ensure the iframe sandbox is sufficiently restrictive. 