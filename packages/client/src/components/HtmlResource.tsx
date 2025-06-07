import React, { useEffect, useRef, useState } from 'react';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import DOMPurify from 'dompurify';

export interface RenderHtmlResourceProps {
  resource: Partial<Resource>;
  onUiAction?: (
    tool: string,
    params: Record<string, unknown>,
  ) => Promise<unknown>;
  style?: React.CSSProperties;
  /**
   * Choose how the HTML should be rendered. Defaults to `iframe`.
   * `secure` renders sanitized HTML directly without an iframe.
   */
  renderMode?: 'iframe' | 'secure';
}

export const HtmlResource: React.FC<RenderHtmlResourceProps> = ({
  resource,
  onUiAction,
  style,
  renderMode = 'iframe',
}) => {
  const [htmlString, setHtmlString] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [iframeRenderMode, setIframeRenderMode] = useState<'srcDoc' | 'src'>(
    'srcDoc',
  );
  const [secureHtml, setSecureHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const secureContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processResource = async () => {
      setIsLoading(true);
      setError(null);
      setHtmlString(null);
      setIframeSrc(null);
      setSecureHtml(null);
      setIframeRenderMode('srcDoc'); // Default to srcDoc

      if (resource.mimeType !== 'text/html') {
        setError('Resource is not of type text/html.');
        setIsLoading(false);
        return;
      }

      if (renderMode === 'secure') {
        if (
          resource.uri &&
          !resource.uri.startsWith('ui://') &&
          !resource.uri.startsWith('data:')
        ) {
          setError('Secure renderer only supports inline ui:// HTML content.');
          setIsLoading(false);
          return;
        }

        let html = '';
        if (typeof resource.text === 'string') {
          html = resource.text;
        } else if (typeof resource.blob === 'string') {
          try {
            html = new TextDecoder().decode(
              Uint8Array.from(atob(resource.blob), (c) => c.charCodeAt(0)),
            );
          } catch (e) {
            console.error('Error decoding base64 blob for HTML content:', e);
            setError('Error decoding HTML content from blob.');
            setIsLoading(false);
            return;
          }
        } else {
          setError('Secure renderer requires text or blob HTML content.');
          setIsLoading(false);
          return;
        }

        setSecureHtml(DOMPurify.sanitize(html));
        setIsLoading(false);
        return;
      }

      if (resource.uri?.startsWith('ui-app://')) {
        setIframeRenderMode('src');
        if (typeof resource.text === 'string' && resource.text.trim() !== '') {
          setIframeSrc(resource.text);
        } else if (typeof resource.blob === 'string') {
          try {
            const decodedUrl = new TextDecoder().decode(
              Uint8Array.from(atob(resource.blob), (c) => c.charCodeAt(0)),
            );
            if (decodedUrl.trim() !== '') {
              setIframeSrc(decodedUrl);
            } else {
              setError('Decoded blob for ui-app:// URL is empty.');
            }
          } catch (e) {
            console.error('Error decoding base64 blob for ui-app URL:', e);
            setError('Error decoding URL from blob for ui-app://.');
          }
        } else {
          setError(
            'ui-app:// resource expects a non-empty text or blob field containing the URL.',
          );
        }
      } else if (
        resource.uri?.startsWith('ui://') ||
        (!resource.uri &&
          (typeof resource.text === 'string' ||
            typeof resource.blob === 'string'))
      ) {
        setIframeRenderMode('srcDoc');
        if (typeof resource.text === 'string') {
          setHtmlString(resource.text);
        } else if (typeof resource.blob === 'string') {
          try {
            const decodedHtml = new TextDecoder().decode(
              Uint8Array.from(atob(resource.blob), (c) => c.charCodeAt(0)),
            );
            setHtmlString(decodedHtml);
          } catch (e) {
            console.error('Error decoding base64 blob for HTML content:', e);
            setError('Error decoding HTML content from blob.');
          }
        } else if (resource.uri?.startsWith('ui://')) {
          // This case implies uri is 'ui://' but no text AND no blob.
          setError('ui:// HTML resource requires text or blob content.');
        }
        // If !resource.uri, the outer condition ensures text or blob is present.
      } else {
        // MimeType is text/html, but no uri, or URI schema not handled, and no direct text/blob.
        setError(
          'HTML resource has no suitable content (text, blob, or interpretable URI).',
        );
      }
      setIsLoading(false);
    };

    processResource();
  }, [resource, renderMode]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only process the message if it came from this specific iframe
      if (
        onUiAction &&
        iframeRef.current &&
        event.source === iframeRef.current.contentWindow &&
        event.data?.tool
      ) {
        onUiAction(event.data.tool, event.data.params || {}).catch((err) => {
          console.error('Error from onUiAction in RenderHtmlResource:', err);
        });
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onUiAction]);

  useEffect(() => {
    if (renderMode !== 'secure' || !onUiAction) return;

    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tool = target.getAttribute('data-tool');
      if (tool) {
        const paramsAttr = target.getAttribute('data-params');
        let params: Record<string, unknown> = {};
        if (paramsAttr) {
          try {
            params = JSON.parse(paramsAttr);
          } catch {
            params = {};
          }
        }
        onUiAction(tool, params).catch((err) => {
          console.error('Error from onUiAction in RenderHtmlResource:', err);
        });
      }
    };

    const container = secureContainerRef.current;
    container?.addEventListener('click', handler);
    return () => container?.removeEventListener('click', handler);
  }, [onUiAction, renderMode, secureHtml]);

  if (isLoading) return <p>Loading HTML content...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (renderMode === 'secure') {
    if (secureHtml === null || secureHtml === undefined) {
      if (!isLoading && !error) {
        return <p className="text-orange-500">No HTML content to display.</p>;
      }
      return null;
    }
    return (
      <div
        ref={secureContainerRef}
        data-testid="html-resource-secure"
        dangerouslySetInnerHTML={{ __html: secureHtml }}
        style={{ width: '100%', minHeight: 200, ...style }}
      />
    );
  } else if (iframeRenderMode === 'srcDoc') {
    if (htmlString === null || htmlString === undefined) {
      if (!isLoading && !error) {
        return <p className="text-orange-500">No HTML content to display.</p>;
      }
      return null;
    }
    return (
      <iframe
        ref={iframeRef}
        srcDoc={htmlString}
        sandbox="allow-scripts"
        style={{ width: '100%', minHeight: 200, ...style }}
        title="MCP HTML Resource (Embedded Content)"
      />
    );
  } else if (iframeRenderMode === 'src') {
    if (iframeSrc === null || iframeSrc === undefined) {
      if (!isLoading && !error) {
        return (
          <p className="text-orange-500">No URL provided for HTML resource.</p>
        );
      }
      return null;
    }
    return (
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        sandbox="allow-scripts allow-same-origin" // unsafe
        style={{ width: '100%', minHeight: 200, ...style }}
        title="MCP HTML Resource (URL)"
      />
    );
  }

  return <p className="text-gray-500">Initializing HTML resource display...</p>;
};
