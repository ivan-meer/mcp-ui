/**
 * @fileoverview MCP UI Server SDK - HTML resource creation utilities
 * @author MCP UI Team
 * @since 2.0.0
 */

import {
  type CreateHtmlResourceOptions,
  type HtmlResourceBlock,
  type DeliveryMethod,
  McpUiError,
  validateUri,
  validateContentPayload,
  hasBufferSupport,
  hasModernEncodingSupport,
  DEFAULTS
} from '@mcp-ui/shared';

/**
 * Robustly encodes a UTF-8 string to Base64.
 * Uses Node.js Buffer if available, otherwise TextEncoder and btoa.
 * @param str - The string to encode
 * @returns Base64 encoded string
 * @throws {McpUiError} When encoding fails
 */
function robustUtf8ToBase64(str: string): string {
  if (!str || typeof str !== 'string') {
    throw new McpUiError('ENCODING_ERROR', 'Input must be a non-empty string', 'INVALID_INPUT');
  }

  try {
    if (hasBufferSupport()) {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
    
    if (hasModernEncodingSupport()) {
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(str);
      let binaryString = '';
      uint8Array.forEach((byte) => {
        binaryString += String.fromCharCode(byte);
      });
      return btoa(binaryString);
    }
    
    // Fallback to btoa with warning
    console.warn(
      'MCP UI SDK: Using fallback btoa encoding. UTF-8 safety not guaranteed.'
    );
    return btoa(str);
    
  } catch (error) {
    throw new McpUiError(
      'ENCODING_ERROR',
      'Failed to encode string to Base64',
      'ENCODING_FAILED',
      { originalError: error, inputLength: str.length }
    );
  }
}

/**
 * Creates an HtmlResourceBlock for MCP protocol.
 * This is the primary function for server-side HTML resource creation.
 * 
 * @param options - Configuration for the interactive resource
 * @returns HtmlResourceBlock ready for MCP protocol transmission
 * @throws {McpUiError} When validation fails or encoding errors occur
 * 
 * @example
 * ```typescript
 * // Create raw HTML resource
 * const resource = createHtmlResource({
 *   uri: 'ui://dashboard/analytics',
 *   content: { type: 'rawHtml', htmlString: '<div>Dashboard</div>' },
 *   delivery: 'text'
 * });
 * 
 * // Create external URL resource
 * const externalResource = createHtmlResource({
 *   uri: 'ui-app://external-service',
 *   content: { type: 'externalUrl', iframeUrl: 'https://example.com' },
 *   delivery: 'blob'
 * });
 * ```
 */
export function createHtmlResource(
  options: CreateHtmlResourceOptions,
): HtmlResourceBlock {
  // Comprehensive validation
  if (!options || typeof options !== 'object') {
    throw new McpUiError('VALIDATION_ERROR', 'Options object is required', 'MISSING_OPTIONS');
  }

  const { uri, content, delivery } = options;

  // Validate delivery method
  if (!delivery || !['text', 'blob'].includes(delivery)) {
    throw new McpUiError(
      'VALIDATION_ERROR', 
      'Delivery method must be "text" or "blob"', 
      'INVALID_DELIVERY'
    );
  }

  // Validate URI and content using shared validators
  validateUri(uri, content.type);
  validateContentPayload(content);

  // Extract content string
  const actualContentString = content.type === 'rawHtml' 
    ? content.htmlString 
    : content.iframeUrl;

  // Build resource object
  const resource: HtmlResourceBlock['resource'] = {
    uri,
    mimeType: DEFAULTS.MIME_TYPE,
  };

  // Apply delivery method
  if (delivery === 'text') {
    resource.text = actualContentString;
  } else {
    resource.blob = robustUtf8ToBase64(actualContentString);
  }

  return {
    type: 'resource',
    resource,
  };
}

// ===========================
// HTML Utilities
// ===========================

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param unsafe - Unsafe HTML string
 * @returns Safely escaped HTML string
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes HTML attribute values
 * @param unsafe - Unsafe attribute value
 * @returns Safely escaped attribute value
 */
export function escapeAttribute(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Creates a complete HTML document with proper structure
 * @param title - Document title
 * @param content - HTML body content
 * @param styles - Optional CSS styles
 * @param scripts - Optional JavaScript code
 * @returns Complete HTML document string
 */
export function createHtmlDocument(
  title: string,
  content: string,
  styles?: string,
  scripts?: string
): string {
  const safeTitle = escapeHtml(title);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  ${styles ? `<style>\n${styles}\n</style>` : ''}
</head>
<body>
  ${content}
  ${scripts ? `<script>\n${scripts}\n</script>` : ''}
</body>
</html>`;
}

// ===========================
// Re-exports
// ===========================

// Re-export types from shared package
export type {
  CreateHtmlResourceOptions,
  HtmlResourceBlock,
  ResourceContentPayload,
  DeliveryMethod,
  UriScheme,
  UiActionEvent,
  McpUiErrorType
} from '@mcp-ui/shared';

// Re-export classes and utilities
export { McpUiError, VERSION, URI_SCHEMES, DEFAULTS } from '@mcp-ui/shared';
