# @mcp-ui/server Usage & Examples

This page provides practical examples for using the `@mcp-ui/server` package.

## Basic Setup

First, ensure you have `@mcp-ui/server` (and its peer `@mcp-ui/shared`) available in your Node.js project. If you're working outside this monorepo, you would typically install them:

```bash
pnpm add @mcp-ui/server @mcp-ui/shared
```

## Creating Interactive Resources

The core function is `createInteractiveResource`.

```typescript
import {
  createInteractiveResource,
  PlaceholderEnum // Example import from shared, re-exported by server or directly via @mcp-ui/shared
} from '@mcp-ui/server';

// Using a shared enum value (just for demonstration)
console.log('Shared Enum from server usage:', PlaceholderEnum.FOO);

// Example 1: Direct HTML, text delivery
const simpleHtml = '<p>This is a simple HTML snippet.</p>';
const resource1 = createInteractiveResource({
  uri: 'ui://simple-snippet/001',
  content: { type: 'directHtml', htmlString: simpleHtml },
  delivery: 'text'
});
console.log('Resource 1:', JSON.stringify(resource1, null, 2));
/* Output for Resource 1:
{
  "type": "resource",
  "resource": {
    "uri": "ui://simple-snippet/001",
    "mimeType": "text/html",
    "text": "<p>This is a simple HTML snippet.</p>"
  }
}
*/

// Example 2: Direct HTML, blob delivery (Base64 encoded)
const complexHtml = '<div><h2>Complex Content</h2><script>console.log("Loaded!")</script></div>';
const resource2 = createInteractiveResource({
  uri: 'ui://complex-snippet/002',
  content: { type: 'directHtml', htmlString: complexHtml },
  delivery: 'blob'
});
console.log('Resource 2 (blob will be Base64):', JSON.stringify(resource2, null, 2));
/* Output for Resource 2:
{
  "type": "resource",
  "resource": {
    "uri": "ui://complex-snippet/002",
    "mimeType": "text/html",
    "blob": "PGRpdj48aDI+Q29tcGxleCBDb250ZW50PC9oMj48c2NyaXB0PmNvbnNvbGUubG9nKFwiTG9hZGVkIVwiKTwvc2NyaXB0PjwvZGl2Pg=="
  }
}
*/

// Example 3: External URL, text delivery
const dashboardUrl = 'https://my.analytics.com/dashboard/123';
const resource3 = createInteractiveResource({
  uri: 'ui-app://analytics-dashboard/main',
  content: { type: 'externalUrl', iframeUrl: dashboardUrl },
  delivery: 'text'
});
console.log('Resource 3:', JSON.stringify(resource3, null, 2));
/* Output for Resource 3:
{
  "type": "resource",
  "resource": {
    "uri": "ui-app://analytics-dashboard/main",
    "mimeType": "text/html",
    "text": "https://my.analytics.com/dashboard/123"
  }
}
*/

// Example 4: External URL, blob delivery (URL is Base64 encoded)
const chartApiUrl = 'https://charts.example.com/api?type=pie&data=1,2,3';
const resource4 = createInteractiveResource({
  uri: 'ui-app://live-chart/session-xyz',
  content: { type: 'externalUrl', iframeUrl: chartApiUrl },
  delivery: 'blob'
});
console.log('Resource 4 (blob will be Base64 of URL):', JSON.stringify(resource4, null, 2));
/* Output for Resource 4:
{
  "type": "resource",
  "resource": {
    "uri": "ui-app://live-chart/session-xyz",
    "mimeType": "text/html",
    "blob": "aHR0cHM6Ly9jaGFydHMuZXhhbXBsZS5jb20vYXBpP3R5cGU9cGllJmRhdGE9MSwyLDM="
  }
}
*/

// These resource objects would then be included in the 'content' array
// of a toolResult in an MCP interaction.
```

## Error Handling

The `createInteractiveResource` function will throw errors if invalid combinations are provided, for example:
- URI `ui://` with `content.type: 'externalUrl'`
- URI `ui-app://` with `content.type: 'directHtml'`

```typescript
try {
  createInteractiveResource({
    uri: 'ui://should-be-direct-html',
    content: { type: 'externalUrl', iframeUrl: 'https://example.com' },
    delivery: 'text'
  });
} catch (e: any) {
  console.error('Caught expected error:', e.message);
  // MCP SDK: URI must start with 'ui-app://' when content.type is 'externalUrl'. (Or similar, error message might vary slightly)
}
``` 