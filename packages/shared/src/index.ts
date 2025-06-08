/**
 * @fileoverview Shared types and utilities for MCP UI SDK
 * @author MCP UI Team
 * @since 2.0.0
 */

// ===========================
// Core Types
// ===========================

/**
 * URI scheme types for MCP UI resources
 */
export type UriScheme = 'ui://' | 'ui-app://';

/**
 * Content delivery methods
 */
export type DeliveryMethod = 'text' | 'blob';

/**
 * Render modes for HTML content
 */
export type RenderMode = 'iframe' | 'secure';

/**
 * Resource content payload discriminated union
 */
export type ResourceContentPayload =
  | { type: 'rawHtml'; htmlString: string }
  | { type: 'externalUrl'; iframeUrl: string };

/**
 * Options for creating an HTML resource
 */
export interface CreateHtmlResourceOptions {
  /** 
   * Unique resource identifier. Must start with "ui://" for rawHtml or "ui-app://" for externalUrl
   * @example "ui://dashboard/analytics" | "ui-app://external-service/widget"
   */
  uri: string;
  
  /** Resource content payload */
  content: ResourceContentPayload;
  
  /** How content should be delivered to client */
  delivery: DeliveryMethod;
}

/**
 * Standard HTML resource block structure for MCP protocol
 */
export interface HtmlResourceBlock {
  /** Fixed type identifier for MCP protocol */
  type: 'resource';
  
  /** Resource details */
  resource: {
    /** Unique URI identifier */
    uri: string;
    
    /** MIME type - always text/html for UI resources */
    mimeType: 'text/html';
    
    /** HTML content or URL as plain text */
    text?: string;
    
    /** Base64 encoded HTML content or URL */
    blob?: string;
  };
}

/**
 * UI action event payload
 */
export interface UiActionEvent {
  /** Tool/action identifier */
  tool: string;
  
  /** Action parameters */
  params?: Record<string, unknown>;
}

/**
 * Error types for MCP UI operations
 */
export type McpUiErrorType = 
  | 'VALIDATION_ERROR'
  | 'ENCODING_ERROR'
  | 'RENDER_ERROR'
  | 'SECURITY_ERROR'
  | 'NETWORK_ERROR';

/**
 * Base error class for MCP UI SDK
 */
export class McpUiError extends Error {
  public readonly type: McpUiErrorType;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    type: McpUiErrorType,
    message: string,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'McpUiError';
    this.type = type;
    this.code = code || type;
    this.details = details;
  }
}

// ===========================
// Validation Functions
// ===========================

/**
 * Validates URI format according to MCP UI schemes
 */
export function validateUri(uri: string, contentType: ResourceContentPayload['type']): void {
  if (!uri || typeof uri !== 'string') {
    throw new McpUiError('VALIDATION_ERROR', 'URI must be a non-empty string', 'INVALID_URI');
  }

  if (contentType === 'rawHtml' && !uri.startsWith('ui://')) {
    throw new McpUiError(
      'VALIDATION_ERROR',
      'URI must start with "ui://" for rawHtml content',
      'INVALID_URI_SCHEME'
    );
  }

  if (contentType === 'externalUrl' && !uri.startsWith('ui-app://')) {
    throw new McpUiError(
      'VALIDATION_ERROR',
      'URI must start with "ui-app://" for externalUrl content',
      'INVALID_URI_SCHEME'
    );
  }
}

/**
 * Validates resource content payload
 */
export function validateContentPayload(content: ResourceContentPayload): void {
  if (!content || typeof content !== 'object') {
    throw new McpUiError('VALIDATION_ERROR', 'Content payload is required', 'MISSING_CONTENT');
  }

  switch (content.type) {
    case 'rawHtml':
      if (!content.htmlString || typeof content.htmlString !== 'string') {
        throw new McpUiError(
          'VALIDATION_ERROR',
          'htmlString is required for rawHtml content',
          'INVALID_HTML_STRING'
        );
      }
      break;
    
    case 'externalUrl':
      if (!content.iframeUrl || typeof content.iframeUrl !== 'string') {
        throw new McpUiError(
          'VALIDATION_ERROR',
          'iframeUrl is required for externalUrl content',
          'INVALID_IFRAME_URL'
        );
      }
      
      try {
        new URL(content.iframeUrl);
      } catch {
        throw new McpUiError(
          'VALIDATION_ERROR',
          'iframeUrl must be a valid URL',
          'MALFORMED_URL'
        );
      }
      break;
    
    default:
      throw new McpUiError(
        'VALIDATION_ERROR',
        `Unknown content type: ${(content as any).type}`,
        'UNKNOWN_CONTENT_TYPE'
      );
  }
}

// ===========================
// Utility Functions
// ===========================

/**
 * Checks if environment supports Buffer API
 */
export function hasBufferSupport(): boolean {
  return typeof Buffer !== 'undefined' && typeof Buffer.from === 'function';
}

/**
 * Checks if environment supports modern encoding APIs
 */
export function hasModernEncodingSupport(): boolean {
  return typeof TextEncoder !== 'undefined' && typeof btoa !== 'undefined';
}

/**
 * Gets supported encoding methods in current environment
 */
export function getSupportedEncodingMethods(): string[] {
  const methods: string[] = [];
  
  if (hasBufferSupport()) methods.push('buffer');
  if (hasModernEncodingSupport()) methods.push('textencoder');
  if (typeof btoa !== 'undefined') methods.push('btoa');
  
  return methods;
}

// ===========================
// Constants
// ===========================

/**
 * Supported URI schemes
 */
export const URI_SCHEMES = {
  UI: 'ui://',
  UI_APP: 'ui-app://'
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  DELIVERY_METHOD: 'text' as DeliveryMethod,
  RENDER_MODE: 'iframe' as RenderMode,
  MIME_TYPE: 'text/html',
  MIN_HEIGHT: 200,
  IFRAME_SANDBOX: 'allow-scripts'
} as const;

/**
 * Version information
 */
export const VERSION = '2.0.0';

// ===========================
// Type Guards
// ===========================

/**
 * Type guard for HtmlResourceBlock
 */
export function isHtmlResourceBlock(obj: unknown): obj is HtmlResourceBlock {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'resource' &&
    'resource' in obj &&
    typeof obj.resource === 'object' &&
    obj.resource !== null &&
    'uri' in obj.resource &&
    'mimeType' in obj.resource &&
    obj.resource.mimeType === 'text/html'
  );
}

/**
 * Type guard for UiActionEvent
 */
export function isUiActionEvent(obj: unknown): obj is UiActionEvent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'tool' in obj &&
    typeof obj.tool === 'string'
  );
}

/**
 * Type guard for McpUiError
 */
export function isMcpUiError(error: unknown): error is McpUiError {
  return error instanceof McpUiError;
}