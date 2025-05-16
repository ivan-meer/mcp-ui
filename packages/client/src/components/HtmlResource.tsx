import React, { useEffect, useRef, useState } from 'react';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';

export interface RenderHtmlResourceProps {
  resource: Partial<Resource>;
  onGenericMcpAction: (tool: string, params: Record<string, unknown>) => Promise<unknown>;
  style?: React.CSSProperties;
}

export const HtmlResource: React.FC<RenderHtmlResourceProps> = ({
  resource,
  onGenericMcpAction,
  style,
}) => {
  const [htmlString, setHtmlString] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [iframeRenderMode, setIframeRenderMode] = useState<'srcDoc' | 'src'>('srcDoc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const processResource = async () => {
      setIsLoading(true);
      setError(null);
      setHtmlString(null);
      setIframeSrc(null);
      setIframeRenderMode('srcDoc'); // Default to srcDoc

      if (resource.mimeType !== "text/html") {
        setError("Resource is not of type text/html.");
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
              Uint8Array.from(atob(resource.blob), (c) => c.charCodeAt(0))
            );
            if (decodedUrl.trim() !== '') {
              setIframeSrc(decodedUrl);
            } else {
              setError("Decoded blob for ui-app:// URL is empty.");
            }
          } catch (e) {
            console.error("Error decoding base64 blob for ui-app URL:", e);
            setError("Error decoding URL from blob for ui-app://.");
          }
        } else {
          setError("ui-app:// resource expects a non-empty text or blob field containing the URL.");
        }
      } else if (
        resource.uri?.startsWith('ui://') ||
        (!resource.uri && (typeof resource.text === 'string' || typeof resource.blob === 'string'))
      ) {
        setIframeRenderMode('srcDoc');
        if (typeof resource.text === 'string') {
          setHtmlString(resource.text);
        } else if (typeof resource.blob === 'string') {
          try {
            const decodedHtml = new TextDecoder().decode(
              Uint8Array.from(atob(resource.blob), (c) => c.charCodeAt(0))
            );
            setHtmlString(decodedHtml);
          } catch (e) {
            console.error("Error decoding base64 blob for HTML content:", e);
            setError("Error decoding HTML content from blob.");
          }
        } else if (resource.uri?.startsWith('ui://')) {
          // This case implies uri is 'ui://' but no text AND no blob.
          setError("ui:// HTML resource requires text or blob content.");
        }
        // If !resource.uri, the outer condition ensures text or blob is present.
      } else {
        // MimeType is text/html, but no uri, or URI schema not handled, and no direct text/blob.
        setError("HTML resource has no suitable content (text, blob, or interpretable URI).");
      }
      setIsLoading(false);
    };

    processResource();
  }, [resource]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && typeof event.data === 'object' && event.data.tool) {
        onGenericMcpAction(event.data.tool, event.data.params || {})
          .catch(err => {
            console.error("Error from onGenericMcpAction in RenderHtmlResource:", err);
          });
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGenericMcpAction]);

  if (isLoading) return <p>Loading HTML content...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (iframeRenderMode === 'srcDoc') {
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
        return <p className="text-orange-500">No URL provided for HTML resource.</p>;
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