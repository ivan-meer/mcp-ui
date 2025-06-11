// packages/ui-renderer/src/UIComponentRenderer.tsx
import React, { useEffect, useRef } from 'react';
import { HtmlResourceBlock, ResourceContentPayload, UiActionEvent, DEFAULTS as SHARED_DEFAULTS } from '@mcp-ui/shared';
import { UIComponentRendererProps } from './types';

const UIComponentRenderer: React.FC<UIComponentRendererProps> = ({
  resource,
  onEvent,
  sandbox = true, // Default to true, applying standard sandbox attributes
  maxHeight,
  className = '',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ensure content is properly cast and accessed
  const contentPayload = resource.content as ResourceContentPayload;
  const contentType = contentPayload?.type;
  const rawHtml = contentPayload?.rawHtml;
  const iframeUrl = contentPayload?.iframeUrl;


  useEffect(() => {
    // Handle events from iframe
    const handleMessage = (event: MessageEvent) => {
      // Basic security: Check origin if possible, though depends on deployment
      // if (event.origin !== expectedOrigin) return;

      if (event.data && typeof event.data === 'object' && event.data.type === 'uiActionEvent') {
        if (onEvent) {
          onEvent(event.data.payload as UiActionEvent);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onEvent]);

  const getSandboxAttributes = () => {
    if (typeof sandbox === 'string') {
      return sandbox;
    }
    if (sandbox === true) {
      // Common secure defaults, adjust as per SHARED_DEFAULTS.IFRAME_SANDBOX or specific needs
      // 'allow-scripts' is needed if the UI component itself is interactive.
      // 'allow-same-origin' is powerful; only use if the iframe source is trusted or if postMessage is strictly validated.
      // For UiActionEvent via postMessage, 'allow-scripts' is essential.
      // Consider if 'allow-popups', 'allow-forms' are needed.
      return SHARED_DEFAULTS.IFRAME_SANDBOX || 'allow-scripts';
    }
    return undefined; // No sandbox attribute
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    // maxHeight: maxHeight || undefined, // Apply maxHeight directly to iframe for consistency
    overflow: 'auto', // Ensure scrollability if content exceeds maxHeight
  };

  // Apply maxHeight to the iframe's style directly
  const iframeStyle: React.CSSProperties = {
      ...containerStyle,
      height: maxHeight ? 'auto' : '100%', // If maxHeight is set, height becomes auto to be constrained by container. Or set it directly.
      maxHeight: maxHeight || undefined,
  };


  if (contentType === 'iframeUrl' && iframeUrl) {
    return (
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        sandbox={getSandboxAttributes()}
        style={iframeStyle}
        className={`ui-component-renderer-iframe ${className}`}
        title={resource.uri || 'UI Component'}
        // allow="microphone *; camera *;" // Example for specific permissions if needed by components
      />
    );
  }

  if (contentType === 'rawHtml' && typeof rawHtml === 'string') {
    // Using srcDoc for sandboxed raw HTML rendering
    return (
      <iframe
        ref={iframeRef}
        srcDoc={rawHtml}
        sandbox={getSandboxAttributes()}
        style={iframeStyle}
        className={`ui-component-renderer-iframe ${className}`}
        title={resource.uri || 'UI Component'}
      />
    );
  }

  // Fallback for unsupported content or errors
  return (
    <div className={`p-2 text-red-500 border border-red-300 rounded ${className}`} style={maxHeight ? { maxHeight, overflowY: 'auto'} : {}}>
      <p>Error: Unsupported UI component content type or missing data.</p>
      <pre className="text-xs">{JSON.stringify(resource.content, null, 2)}</pre>
    </div>
  );
};

export default UIComponentRenderer;
