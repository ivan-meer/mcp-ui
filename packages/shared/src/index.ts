/**
 * Shared types and utilities for the mcp-ui SDK.
 * This file provides common interfaces that can be reused
 * by both the client and server packages.
 */

export interface HtmlResourceBlock {
  type: 'resource';
  resource: {
    uri: string;
    mimeType: 'text/html';
    text?: string;
    blob?: string;
  };
}

export type ResourceContentPayload =
  | { type: 'rawHtml'; htmlString: string }
  | { type: 'externalUrl'; iframeUrl: string };

export interface CreateHtmlResourceOptions {
  /**
   * URI must start with `ui://` when using `rawHtml`
   * and `ui-app://` when using `externalUrl`.
   */
  uri: string;
  /** The payload that contains the actual HTML or URL */
  content: ResourceContentPayload;
  /** How the content should be delivered */
  delivery: 'text' | 'blob';
}

/** Example enum exported for demonstration purposes */
export enum PlaceholderEnum {
  FOO = 'FOO',
  BAR = 'BAR',
}

/**
 * Simple greeting helper used in examples.
 */
export const greet = (name: string): string => `Hello, ${name}!`;

