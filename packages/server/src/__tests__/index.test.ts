import { createHtmlResource } from '../index';

describe('@mcp-ui/server', () => {
  describe('createHtmlResource', () => {
    it('should create a text-based direct HTML resource', () => {
      const options = {
        uri: 'ui://test-html',
        content: { type: 'rawHtml' as const, htmlString: '<p>Test</p>' },
        delivery: 'text' as const,
      };
      const resource = createHtmlResource(options);
      expect(resource.type).toBe('resource');
      expect(resource.resource.uri).toBe('ui://test-html');
      expect(resource.resource.mimeType).toBe('text/html');
      expect(resource.resource.text).toBe('<p>Test</p>');
      expect(resource.resource.blob).toBeUndefined();
    });

    it('should create a blob-based direct HTML resource', () => {
      const options = {
        uri: 'ui://test-html-blob',
        content: { type: 'rawHtml' as const, htmlString: '<h1>Blob</h1>' },
        delivery: 'blob' as const,
      };
      const resource = createHtmlResource(options);
      expect(resource.resource.blob).toBe(
        Buffer.from('<h1>Blob</h1>').toString('base64'),
      );
      expect(resource.resource.text).toBeUndefined();
    });

    it('should create a text-based external URL resource', () => {
      const options = {
        uri: 'ui-app://test-url',
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com',
        },
        delivery: 'text' as const,
      };
      const resource = createHtmlResource(options);
      expect(resource.resource.uri).toBe('ui-app://test-url');
      expect(resource.resource.text).toBe('https://example.com');
      expect(resource.resource.blob).toBeUndefined();
    });

    it('should create a blob-based external URL resource', () => {
      const options = {
        uri: 'ui-app://test-url-blob',
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com/blob',
        },
        delivery: 'blob' as const,
      };
      const resource = createHtmlResource(options);
      expect(resource.resource.blob).toBe(
        Buffer.from('https://example.com/blob').toString('base64'),
      );
      expect(resource.resource.text).toBeUndefined();
    });

    it('should throw error for invalid URI prefix with rawHtml', () => {
      const options = {
        uri: 'invalid://test-html',
        content: { type: 'rawHtml' as const, htmlString: '<p>Test</p>' },
        delivery: 'text' as const,
      };
      expect(() => createHtmlResource(options)).toThrow(
        "MCP SDK: URI must start with 'ui://' when content.type is 'rawHtml'.",
      );
    });

    it('should throw error for invalid URI prefix with externalUrl', () => {
      const options = {
        uri: 'invalid://test-url',
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com',
        },
        delivery: 'text' as const,
      };
      expect(() => createHtmlResource(options)).toThrow(
        "MCP SDK: URI must start with 'ui-app://' when content.type is 'externalUrl'.",
      );
    });
  });
});
