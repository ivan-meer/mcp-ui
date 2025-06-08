/**
 * @fileoverview Unit tests for shared types and utilities
 */

import { describe, it, expect, test } from 'vitest';
import {
  McpUiError,
  validateUri,
  validateContentPayload,
  isHtmlResourceBlock,
  isUiActionEvent,
  hasBufferSupport,
  hasModernEncodingSupport,
  URI_SCHEMES,
  DEFAULTS,
  VERSION,
  type CreateHtmlResourceOptions,
  type HtmlResourceBlock,
  type UiActionEvent,
  type ResourceContentPayload
} from '../index';

describe('McpUiError', () => {
  it('should create error with correct properties', () => {
    const error = new McpUiError('VALIDATION_ERROR', 'Test message', 'TEST_CODE');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('McpUiError');
    expect(error.type).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.code).toBe('TEST_CODE');
  });

  it('should use type as code when code not provided', () => {
    const error = new McpUiError('NETWORK_ERROR', 'Network failed');
    expect(error.code).toBe('NETWORK_ERROR');
  });
});

describe('validateUri', () => {
  it('should pass for valid ui:// URI with rawHtml', () => {
    expect(() => validateUri('ui://test/component', 'rawHtml')).not.toThrow();
  });

  it('should pass for valid ui-app:// URI with externalUrl', () => {
    expect(() => validateUri('ui-app://external/service', 'externalUrl')).not.toThrow();
  });

  it('should throw for empty URI', () => {
    expect(() => validateUri('', 'rawHtml')).toThrow(McpUiError);
  });

  it('should throw for wrong scheme combination', () => {
    expect(() => validateUri('ui://test', 'externalUrl')).toThrow(McpUiError);
    expect(() => validateUri('ui-app://test', 'rawHtml')).toThrow(McpUiError);
  });
});

describe('validateContentPayload', () => {
  it('should pass for valid rawHtml payload', () => {
    const payload: ResourceContentPayload = {
      type: 'rawHtml',
      htmlString: '<div>Test</div>'
    };
    expect(() => validateContentPayload(payload)).not.toThrow();
  });

  it('should pass for valid externalUrl payload', () => {
    const payload: ResourceContentPayload = {
      type: 'externalUrl',
      iframeUrl: 'https://example.com'
    };
    expect(() => validateContentPayload(payload)).not.toThrow();
  });

  it('should throw for missing htmlString in rawHtml', () => {
    const payload = { type: 'rawHtml' } as ResourceContentPayload;
    expect(() => validateContentPayload(payload)).toThrow(McpUiError);
  });

  it('should throw for invalid URL in externalUrl', () => {
    const payload: ResourceContentPayload = {
      type: 'externalUrl',
      iframeUrl: 'not-a-url'
    };
    expect(() => validateContentPayload(payload)).toThrow(McpUiError);
  });
});

describe('Type Guards', () => {
  it('should correctly identify HtmlResourceBlock', () => {
    const validBlock: HtmlResourceBlock = {
      type: 'resource',
      resource: {
        uri: 'ui://test',
        mimeType: 'text/html',
        text: '<div>Test</div>'
      }
    };
    
    expect(isHtmlResourceBlock(validBlock)).toBe(true);
    expect(isHtmlResourceBlock(null)).toBe(false);
    expect(isHtmlResourceBlock({})).toBe(false);
  });

  it('should correctly identify UiActionEvent', () => {
    const validEvent: UiActionEvent = {
      tool: 'test-action',
      params: { key: 'value' }
    };
    
    expect(isUiActionEvent(validEvent)).toBe(true);
    expect(isUiActionEvent({})).toBe(false);
    expect(isUiActionEvent({ params: {} })).toBe(false);
  });
});

describe('Environment Detection', () => {
  it('should detect buffer support', () => {
    const hasBuffer = hasBufferSupport();
    expect(typeof hasBuffer).toBe('boolean');
  });

  it('should detect modern encoding support', () => {
    const hasModern = hasModernEncodingSupport();
    expect(typeof hasModern).toBe('boolean');
  });
});

describe('Constants', () => {
  it('should have correct URI schemes', () => {
    expect(URI_SCHEMES.UI).toBe('ui://');
    expect(URI_SCHEMES.UI_APP).toBe('ui-app://');
  });

  it('should have valid defaults', () => {
    expect(DEFAULTS.DELIVERY_METHOD).toBe('text');
    expect(DEFAULTS.RENDER_MODE).toBe('iframe');
    expect(DEFAULTS.MIME_TYPE).toBe('text/html');
    expect(typeof DEFAULTS.MIN_HEIGHT).toBe('number');
  });

  it('should have valid version', () => {
    expect(VERSION).toBe('2.0.0');
    expect(typeof VERSION).toBe('string');
  });
});

// Test TypeScript type definitions
test('TypeScript types should be properly defined', () => {
  // This test ensures our types compile correctly
  const options: CreateHtmlResourceOptions = {
    uri: 'ui://test/component',
    content: {
      type: 'rawHtml',
      htmlString: '<div>Test</div>'
    },
    delivery: 'text'
  };
  
  const block: HtmlResourceBlock = {
    type: 'resource',
    resource: {
      uri: options.uri,
      mimeType: 'text/html',
      text: 'test'
    }
  };
  
  const event: UiActionEvent = {
    tool: 'test-action',
    params: { key: 'value' }
  };
  
  // If this compiles, our types are working
  expect(options.content.type).toBe('rawHtml');
  expect(block.type).toBe('resource');
  expect(event.tool).toBe('test-action');
});