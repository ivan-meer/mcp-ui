/**
     * Defines the structure of an interactive HTML resource block
     * that the server will send to the client.
     */
import { PlaceholderEnum } from '@mcp-ui/shared';

export interface InteractiveHtmlResourceBlock {
    type: "resource";
    resource: {
        uri: string;        // Primary identifier. Starts with "ui://" or "ui-app://"
        mimeType: "text/html"; // Always text/html
        text?: string;      // HTML content if uri starts with "ui://", or iframe URL if uri starts with "ui-app://"
        blob?: string;      // Base64 encoded HTML content if uri starts with "ui://", or iframe URL if uri starts with "ui-app://"
    }
}

/**
 * Defines the type of content being provided for an interactive resource.
 * - If `type` is "directHtml", `htmlString` is the HTML content provided directly.
 * - If `type` is "externalUrl", `iframeUrl` is the URL to be rendered in an iframe by the client.
 */
export type ResourceContentPayload =
    | { type: "directHtml"; htmlString: string }
    | { type: "externalUrl"; iframeUrl: string };

/**
 * Options for creating an interactive resource block.
 */
export interface CreateInteractiveResourceOptions {
    uri: string;          // REQUIRED. Must start with "ui://" if content.type is "directHtml",
                          // or "ui-app://" if content.type is "externalUrl".
    content: ResourceContentPayload; // REQUIRED. The actual content payload.
    delivery: "text" | "blob"; // REQUIRED. How the content string (htmlString or iframeUrl) should be packaged.
}

/**
 * Robustly encodes a UTF-8 string to Base64.
 * Uses Node.js Buffer if available, otherwise TextEncoder and btoa.
 * @param str The string to encode.
 * @returns Base64 encoded string.
 */
function robustUtf8ToBase64(str: string): string {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'utf-8').toString('base64');
    } else if (typeof TextEncoder !== 'undefined' && typeof btoa !== 'undefined') {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(str);
        let binaryString = '';
        uint8Array.forEach((byte) => {
            binaryString += String.fromCharCode(byte);
        });
        return btoa(binaryString);
    } else {
        console.warn("MCP SDK: Buffer API and TextEncoder/btoa not available. Base64 encoding might not be UTF-8 safe.");
        try {
            return btoa(str);
        } catch (e) {
             throw new Error("MCP SDK: Suitable UTF-8 to Base64 encoding method not found, and fallback btoa failed.");
        }
    }
}

/**
 * Creates an InteractiveHtmlResourceBlock.
 * This is the object that should be included in the 'content' array of a toolResult.
 * @param options Configuration for the interactive resource.
 * @returns An InteractiveHtmlResourceBlock.
 */
export function createInteractiveResource(options: CreateInteractiveResourceOptions): InteractiveHtmlResourceBlock {
    let actualContentString: string;

    if (options.content.type === "directHtml") {
        if (!options.uri.startsWith("ui://")) {
            throw new Error("MCP SDK: URI must start with 'ui://' when content.type is 'directHtml'.");
        }
        actualContentString = options.content.htmlString;
        if (typeof actualContentString !== 'string') {
             throw new Error("MCP SDK: content.htmlString must be provided as a string when content.type is 'directHtml'.");
        }
    } else if (options.content.type === "externalUrl") {
        if (!options.uri.startsWith("ui-app://")) {
            throw new Error("MCP SDK: URI must start with 'ui-app://' when content.type is 'externalUrl'.");
        }
        actualContentString = options.content.iframeUrl;
        if (typeof actualContentString !== 'string') {
            throw new Error("MCP SDK: content.iframeUrl must be provided as a string when content.type is 'externalUrl'.");
       }
    } else {
        // This case should ideally be prevented by TypeScript's discriminated union checks
        const exhaustiveCheckContent: never = options.content;
        throw new Error(`MCP SDK: Invalid content.type specified: ${exhaustiveCheckContent}`);
    }
    
    const resource: InteractiveHtmlResourceBlock["resource"] = {
        uri: options.uri,
        mimeType: "text/html",
    };

    switch (options.delivery) {
        case "text":
            resource.text = actualContentString;
            break;
        case "blob":
            resource.blob = robustUtf8ToBase64(actualContentString);
            break;
        default:
            // Should not happen with TypeScript, but good for robustness
            const exhaustiveCheck: never = options.delivery;
            throw new Error(`MCP SDK: Invalid delivery method specified: ${exhaustiveCheck}`);
    }
    
    return {
        type: "resource",
        resource: resource
    };
}

// --- HTML Escaping Utilities ---
// These are kept as they can be useful for consumers preparing HTML strings.
export function escapeHtml(unsafe: string): string {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

export function escapeAttribute(unsafe: string): string {
    // Simplified: primarily for quotes. More robust escaping might be needed
    // depending on context, but for attributes, quotes are key.
    return unsafe.replace(/"/g, "&quot;");
}

 // namespace McpInteractiveUIServerSDK

// Example Usage (for server-side tool developers):
/*
import { McpInteractiveUIServerSDK } from './mcp-interactive-ui-server-sdk';

// Example 1: Delivering direct HTML content using 'ui://'
const myHtml = `
<div>
<h1>Hello from MCP Interactive UI</h1>
<p>This is HTML rendered directly.</p>
<button onclick="window.parent.postMessage({tool: 'userAction', params: {action: 'buttonClicked', value: 'testBtn'}}, '*')">Click Me</button>
</div>
<script>
// Any additional client-side script for the HTML.
// Ensure postMessage targets window.parent and specifies targetOrigin.
</script>
`;

const htmlResource = McpInteractiveUIServerSDK.createInteractiveResource({
uri: "ui://my-unique-content-id/1", // Consumer defines the URI
content: { type: "directHtml", htmlString: myHtml },
delivery: "text" // or "blob"
});

// This htmlResource would then be part of a tool's result content.
// e.g., return { content: [htmlResource] };


// Example 2: Delivering an iframe URL using 'ui-app://'
const iframeUrl = "https://www.example.com/interactive-app";

const iframeResource = McpInteractiveUIServerSDK.createInteractiveResource({
uri: "ui-app://my-external-app-id/1", // Consumer defines the URI
content: { type: "externalUrl", iframeUrl: iframeUrl },
delivery: "blob" // or "text". 'blob' will Base64 encode the URL string.
});

// This iframeResource would then be part of a tool's result content.


// Example 3: Server wants client to fetch content (advanced, SDK no longer manages this part)
// If a server wants the client to fetch content via 'resources/read', it would:
// 1. Implement its own 'resources/read' handler for a specific URI (e.g., "ui://my-fetchable-content/data").
// 2. Return a resource block like this (constructed manually or via a slimmed-down helper if they build one):
const fetchableResource = {
type: "resource",
resource: {
    uri: "ui://my-fetchable-content/data", // Client will call resources/read(this_uri)
    mimeType: "text/html"
    // text and blob are omitted
}
};
// The client, upon seeing no text/blob, would issue a resources/read for the URI.
// The server's MCP framework and resources/read implementation would handle serving the content.

*/ 