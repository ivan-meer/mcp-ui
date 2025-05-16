/**
 * Defines the structure of an interactive HTML resource block
 * that the server will send to the client.
 */

// Import types first
import { CreateHtmlResourceOptions } from './types.js';

export interface HtmlResourceBlock {
  type: 'resource';
  resource: {
    uri: string; // Primary identifier. Starts with "ui://" or "ui-app://"
    mimeType: 'text/html'; // Always text/html
    text?: string; // HTML content if uri starts with "ui://", or iframe URL if uri starts with "ui-app://"
    blob?: string; // Base64 encoded HTML content if uri starts with "ui://", or iframe URL if uri starts with "ui-app://"
  };
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
  } else if (
    typeof TextEncoder !== 'undefined' &&
    typeof btoa !== 'undefined'
  ) {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(str);
    let binaryString = '';
    uint8Array.forEach((byte) => {
      binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString);
  } else {
    console.warn(
      'MCP SDK: Buffer API and TextEncoder/btoa not available. Base64 encoding might not be UTF-8 safe.',
    );
    try {
      return btoa(str);
    } catch (e) {
      throw new Error(
        'MCP SDK: Suitable UTF-8 to Base64 encoding method not found, and fallback btoa failed.',
      );
    }
  }
}

/**
 * Creates an HtmlResourceBlock.
 * This is the object that should be included in the 'content' array of a toolResult.
 * @param options Configuration for the interactive resource.
 * @returns An HtmlResourceBlock.
 */
export function createHtmlResource(
  options: CreateHtmlResourceOptions,
): HtmlResourceBlock {
  let actualContentString: string;

  if (options.content.type === 'directHtml') {
    if (!options.uri.startsWith('ui://')) {
      throw new Error(
        "MCP SDK: URI must start with 'ui://' when content.type is 'directHtml'.",
      );
    }
    actualContentString = options.content.htmlString;
    if (typeof actualContentString !== 'string') {
      throw new Error(
        "MCP SDK: content.htmlString must be provided as a string when content.type is 'directHtml'.",
      );
    }
  } else if (options.content.type === 'externalUrl') {
    if (!options.uri.startsWith('ui-app://')) {
      throw new Error(
        "MCP SDK: URI must start with 'ui-app://' when content.type is 'externalUrl'.",
      );
    }
    actualContentString = options.content.iframeUrl;
    if (typeof actualContentString !== 'string') {
      throw new Error(
        "MCP SDK: content.iframeUrl must be provided as a string when content.type is 'externalUrl'.",
      );
    }
  } else {
    // This case should ideally be prevented by TypeScript's discriminated union checks
    const exhaustiveCheckContent: never = options.content;
    throw new Error(
      `MCP SDK: Invalid content.type specified: ${exhaustiveCheckContent}`,
    );
  }

  const resource: HtmlResourceBlock['resource'] = {
    uri: options.uri,
    mimeType: 'text/html',
  };

  switch (options.delivery) {
    case 'text':
      resource.text = actualContentString;
      break;
    case 'blob':
      resource.blob = robustUtf8ToBase64(actualContentString);
      break;
  }

  return {
    type: 'resource',
    resource: resource,
  };
}

// --- HTML Escaping Utilities ---
// These are kept as they can be useful for consumers preparing HTML strings.
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeAttribute(unsafe: string): string {
  // Simplified: primarily for quotes. More robust escaping might be needed
  // depending on context, but for attributes, quotes are key.
  return unsafe.replace(/"/g, '&quot;');
}

export type {
  CreateHtmlResourceOptions as CreateResourceOptions,
  ResourceContentPayload,
} from './types.js';
