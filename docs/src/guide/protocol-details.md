# Protocol Details

This section dives deeper into the `HtmlResourceBlock` and its intended usage.

## `HtmlResourceBlock` Recap

```typescript
export interface HtmlResourceBlock {
  type: 'resource';
  resource: {
    uri: string;
    mimeType: 'text/html';
    text?: string;
    blob?: string;
  };
}
```

## URI Schemes

- **`ui://<component-name>/<instance-id>`**

  - **Purpose**: For self-contained HTML that the client renders directly.
  - **Content**: `text` or `blob` contains the HTML string.
  - **Client Action**: Render in a sandboxed iframe using `srcdoc`.
  - **Example**: A custom button, a small form, a data visualization snippet.

- **`ui-app://<app-name>/<session-info>`**
  - **Purpose**: For embedding external web applications or complex UIs via a URL.
  - **Content**: `text` or `blob` contains the URL.
  - **Client Action**: Render in an iframe using `src`.
  - **Example**: Embedding a Grafana dashboard, a third-party widget, a mini-application.

## Content Delivery: `text` vs. `blob`

- **`text`**: Simple, direct string. Good for smaller, less complex content.
- **`blob`**: Base64 encoded string.
  - **Pros**: Handles special characters robustly, can be better for larger payloads, ensures integrity during JSON transport.
  - **Cons**: Requires Base64 decoding on the client, slightly increases payload size.

## Communication (Client <-> Iframe)

For `ui://` or `ui-app://` resources, you can use `window.parent.postMessage` to send data or actions from the iframe back to the host client application. The client application should set up an event listener for `message` events.

**Iframe Script Example:**

```html
<button onclick="handleAction()">Submit Data</button>
<script>
  function handleAction() {
    const data = { action: 'formData', value: 'someValue' };
    // IMPORTANT: Always specify the targetOrigin for security!
    // Use '*' only if the parent origin is unknown or variable and security implications are understood.
    window.parent.postMessage({ tool: 'myCustomTool', params: data }, '*');
  }
</script>
```

**Client-Side Handler:**

```typescript
window.addEventListener('message', (event) => {
  // Add origin check for security: if (event.origin !== "expectedOrigin") return;
  if (event.data && event.data.tool) {
    // Call the onUiAction prop of HtmlResource
  }
});
```

For `ui-app://` resources, communication depends on what the external application supports (e.g., its own `postMessage` API, URL parameters, etc.).
