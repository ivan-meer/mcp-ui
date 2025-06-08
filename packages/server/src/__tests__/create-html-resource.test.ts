/**
 * @fileoverview Unit tests for createHtmlResource function
 */

import { describe, it, expect, test } from 'vitest';
import { createHtmlResource, escapeHtml, escapeAttribute, createHtmlDocument } from '../index';
import { McpUiError } from '@mcp-ui/shared';
import type { CreateHtmlResourceOptions, HtmlResourceBlock } from '@mcp-ui/shared';

describe('createHtmlResource', () => {
  describe('Raw HTML Resources', () => {
    it('should create resource with text delivery', () => {
      const options: CreateHtmlResourceOptions = {
        uri: 'ui://test/component',
        content: {
          type: 'rawHtml',
          htmlString: '<div>Hello World</div>'
        },
        delivery: 'text'
      };

      const result = createHtmlResource(options);

      expect(result.type).toBe('resource');
      expect(result.resource.uri).toBe('ui://test/component');
      expect(result.resource.mimeType).toBe('text/html');
      expect(result.resource.text).toBe('<div>Hello World</div>');
      expect(result.resource.blob).toBeUndefined();
    });

    it('should create resource with blob delivery', () => {
      const options: CreateHtmlResourceOptions = {
        uri: 'ui://test/component',
        content: {
          type: 'rawHtml',
          htmlString: '<div>Hello</div>'
        },
        delivery: 'blob'
      };

      const result = createHtmlResource(options);

      expect(result.type).toBe('resource');
      expect(result.resource.uri).toBe('ui://test/component');
      expect(result.resource.mimeType).toBe('text/html');
      expect(result.resource.blob).toBeDefined();
      expect(result.resource.text).toBeUndefined();
      expect(typeof result.resource.blob).toBe('string');
    });
  });

  describe('External URL Resources', () => {
    it('should create resource with external URL', () => {
      const options: CreateHtmlResourceOptions = {
        uri: 'ui-app://external/service',
        content: {
          type: 'externalUrl',
          iframeUrl: 'https://example.com'
        },
        delivery: 'text'
      };

      const result = createHtmlResource(options);

      expect(result.type).toBe('resource');
      expect(result.resource.uri).toBe('ui-app://external/service');
      expect(result.resource.mimeType).toBe('text/html');
      expect(result.resource.text).toBe('https://example.com');
    });
  });

  describe('Validation', () => {
    it('should throw for missing options', () => {
      expect(() => createHtmlResource(null as any)).toThrow(McpUiError);
      expect(() => createHtmlResource(undefined as any)).toThrow(McpUiError);
    });

    it('should throw for invalid delivery method', () => {
      const options = {
        uri: 'ui://test',
        content: { type: 'rawHtml', htmlString: '<div>Test</div>' },
        delivery: 'invalid'
      } as any;

      expect(() => createHtmlResource(options)).toThrow(McpUiError);
    });

    it('should throw for wrong URI scheme', () => {
      const options: CreateHtmlResourceOptions = {
        uri: 'ui-app://test', // Wrong scheme for rawHtml
        content: {
          type: 'rawHtml',
          htmlString: '<div>Test</div>'
        },
        delivery: 'text'
      };

      expect(() => createHtmlResource(options)).toThrow(McpUiError);
    });

    it('should throw for invalid URL in externalUrl', () => {
      const options: CreateHtmlResourceOptions = {
        uri: 'ui-app://test',
        content: {
          type: 'externalUrl',
          iframeUrl: 'not-a-valid-url'
        },
        delivery: 'text'
      };

      expect(() => createHtmlResource(options)).toThrow(McpUiError);
    });
  });

  describe('Base64 Encoding', () => {
    it('should handle Unicode characters correctly', () => {
      const options: CreateHtmlResourceOptions = {
        uri: 'ui://test/unicode',
        content: {
          type: 'rawHtml',
          htmlString: '<div>🎉 Unicode test ñáéíóú</div>'
        },
        delivery: 'blob'
      };

      const result = createHtmlResource(options);
      expect(result.resource.blob).toBeDefined();
      expect(typeof result.resource.blob).toBe('string');
    });

    it('should handle empty strings', () => {
      const options: CreateHtmlResourceOptions = {
        uri: 'ui://test/empty',
        content: {
          type: 'rawHtml',
          htmlString: ''
        },
        delivery: 'blob'
      };

      expect(() => createHtmlResource(options)).toThrow(McpUiError);
    });
  });
});

describe('HTML Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
      expect(escapeHtml('Hello & goodbye')).toBe('Hello &amp; goodbye');
      expect(escapeHtml("It's a 'test'")).toBe('It&#039;s a &#039;test&#039;');
    });

    it('should handle empty/null strings', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null as any)).toBe('');
      expect(escapeHtml(undefined as any)).toBe('');
    });
  });

  describe('escapeAttribute', () => {
    it('should escape attribute values', () => {
      expect(escapeAttribute('value with "quotes"')).toBe('value with &quot;quotes&quot;');
      expect(escapeAttribute("value with 'quotes'")).toBe('value with &#039;quotes&#039;');
      expect(escapeAttribute('value with <tags>')).toBe('value with &lt;tags&gt;');
    });

    it('should handle empty/null strings', () => {
      expect(escapeAttribute('')).toBe('');
      expect(escapeAttribute(null as any)).toBe('');
      expect(escapeAttribute(undefined as any)).toBe('');
    });
  });

  describe('createHtmlDocument', () => {
    it('should create complete HTML document', () => {
      const doc = createHtmlDocument(
        'Test Page',
        '<div>Content</div>',
        'body { margin: 0; }',
        'console.log("test");'
      );

      expect(doc).toContain('<!DOCTYPE html>');
      expect(doc).toContain('<title>Test Page</title>');
      expect(doc).toContain('<div>Content</div>');
      expect(doc).toContain('<style>\nbody { margin: 0; }\n</style>');
      expect(doc).toContain('<script>\nconsole.log("test");\n</script>');
    });

    it('should create minimal document without styles/scripts', () => {
      const doc = createHtmlDocument('Simple', '<p>Hello</p>');

      expect(doc).toContain('<!DOCTYPE html>');
      expect(doc).toContain('<title>Simple</title>');
      expect(doc).toContain('<p>Hello</p>');
      expect(doc).not.toContain('<style>');
      expect(doc).not.toContain('<script>');
    });

    it('should escape title content', () => {
      const doc = createHtmlDocument('<script>alert("xss")</script>', '<p>Safe</p>');
      expect(doc).toContain('<title>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</title>');
    });
  });
});

// Test comprehensive workflow
test('Complete workflow: create and validate resource', () => {
  const htmlContent = createHtmlDocument(
    'Test Dashboard',
    '<div class="dashboard">Dashboard content</div>',
    '.dashboard { padding: 20px; }',
    'document.addEventListener("DOMContentLoaded", () => console.log("loaded"));'
  );

  const options: CreateHtmlResourceOptions = {
    uri: 'ui://dashboard/main',
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    delivery: 'blob'
  };

  const resource = createHtmlResource(options);

  // Validate the result structure
  expect(resource.type).toBe('resource');
  expect(resource.resource.uri).toBe('ui://dashboard/main');
  expect(resource.resource.mimeType).toBe('text/html');
  expect(resource.resource.blob).toBeDefined();
  expect(resource.resource.text).toBeUndefined();

  // Verify that blob contains base64 encoded content
  expect(resource.resource.blob).toMatch(/^[A-Za-z0-9+/=]+$/);
});