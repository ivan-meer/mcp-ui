/**
 * @fileoverview Enhanced unit tests for HtmlResource component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { HtmlResource, type RenderHtmlResourceProps } from '../HtmlResource';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html: string) => html.replace(/<script/g, '&lt;script'))
  }
}));

describe('HtmlResource Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock console methods to avoid test noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Iframe Rendering Mode', () => {
    it('should render HTML content in iframe with srcDoc', () => {
      const resource: Partial<Resource> = {
        uri: 'ui://test/component',
        mimeType: 'text/html',
        text: '<div data-testid="test-content">Hello World</div>'
      };

      render(<HtmlResource resource={resource} />);

      const iframe = screen.getByRole('iframe', { name: /MCP HTML Resource.*Embedded Content/i });
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('srcDoc', resource.text);
      expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    });

    it('should render external URL in iframe with src', () => {
      const resource: Partial<Resource> = {
        uri: 'ui-app://external/service',
        mimeType: 'text/html',
        text: 'https://example.com'
      };

      render(<HtmlResource resource={resource} />);

      const iframe = screen.getByRole('iframe', { name: /MCP HTML Resource.*URL/i });
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://example.com');
      expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
    });

    it('should decode base64 blob content', async () => {
      const htmlContent = '<div>Decoded Content</div>';
      const encodedContent = btoa(htmlContent);
      
      const resource: Partial<Resource> = {
        uri: 'ui://test/blob',
        mimeType: 'text/html',
        blob: encodedContent
      };

      render(<HtmlResource resource={resource} />);

      await waitFor(() => {
        const iframe = screen.getByRole('iframe');
        expect(iframe).toHaveAttribute('srcDoc', htmlContent);
      });
    });
  });

  describe('Secure Rendering Mode', () => {
    it('should render sanitized HTML directly without iframe', () => {
      const resource: Partial<Resource> = {
        uri: 'ui://test/secure',
        mimeType: 'text/html',
        text: '<div data-testid="secure-content">Secure Content</div><script>alert("xss")</script>'
      };

      render(<HtmlResource resource={resource} renderMode="secure" />);

      const container = screen.getByTestId('html-resource-secure');
      expect(container).toBeInTheDocument();
      expect(container.innerHTML).toContain('Secure Content');
      expect(container.innerHTML).toContain('&lt;script');
    });

    it('should reject external URLs in secure mode', () => {
      const resource: Partial<Resource> = {
        uri: 'ui-app://external/service',
        mimeType: 'text/html',
        text: 'https://example.com'
      };

      render(<HtmlResource resource={resource} renderMode="secure" />);

      expect(screen.getByText(/Secure renderer only supports inline ui:\/\/ HTML content/)).toBeInTheDocument();
    });

    it('should handle blob content in secure mode', async () => {
      const htmlContent = '<div>Secure Blob Content</div>';
      const encodedContent = btoa(htmlContent);
      
      const resource: Partial<Resource> = {
        uri: 'ui://test/secure-blob',
        mimeType: 'text/html',
        blob: encodedContent
      };

      render(<HtmlResource resource={resource} renderMode="secure" />);

      await waitFor(() => {
        const container = screen.getByTestId('html-resource-secure');
        expect(container.innerHTML).toContain('Secure Blob Content');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error for non-HTML mime type', () => {
      const resource: Partial<Resource> = {
        uri: 'ui://test',
        mimeType: 'application/json',
        text: '{"test": true}'
      };

      render(<HtmlResource resource={resource} />);

      expect(screen.getByText('Resource is not of type text/html.')).toBeInTheDocument();
    });

    it('should show error for empty ui-app URL', () => {
      const resource: Partial<Resource> = {
        uri: 'ui-app://test',
        mimeType: 'text/html',
        text: ''
      };

      render(<HtmlResource resource={resource} />);

      expect(screen.getByText(/ui-app:\/\/ resource expects a non-empty text/)).toBeInTheDocument();
    });

    it('should handle invalid base64 blob gracefully', () => {
      const resource: Partial<Resource> = {
        uri: 'ui://test',
        mimeType: 'text/html',
        blob: 'invalid-base64!'
      };

      render(<HtmlResource resource={resource} />);

      expect(screen.getByText('Error decoding HTML content from blob.')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      const resource: Partial<Resource> = {
        uri: 'ui://test',
        mimeType: 'text/html',
        text: '<div>Content</div>'
      };

      // Render with initial loading state
      const { rerender } = render(<HtmlResource resource={{}} />);
      
      expect(screen.getByText('Loading HTML content...')).toBeInTheDocument();
      
      // Update with actual resource
      rerender(<HtmlResource resource={resource} />);
      
      expect(screen.queryByText('Loading HTML content...')).not.toBeInTheDocument();
    });
  });

  describe('UI Action Events', () => {
    it('should handle postMessage events from iframe', async () => {
      const onUiAction = vi.fn().mockResolvedValue(undefined);
      const resource: Partial<Resource> = {
        uri: 'ui://test/interactive',
        mimeType: 'text/html',
        text: '<button onclick="parent.postMessage({tool: \\'test-action\\', params: {key: \\'value\\'}}, \\'*\\')">Click</button>'
      };

      render(<HtmlResource resource={resource} onUiAction={onUiAction} />);

      const iframe = screen.getByRole('iframe');
      
      // Simulate postMessage from iframe
      const mockEvent = new MessageEvent('message', {
        data: { tool: 'test-action', params: { key: 'value' } },
        source: iframe.contentWindow
      });

      fireEvent(window, mockEvent);

      await waitFor(() => {
        expect(onUiAction).toHaveBeenCalledWith('test-action', { key: 'value' });
      });
    });

    it('should handle click events in secure mode', async () => {
      const onUiAction = vi.fn().mockResolvedValue(undefined);
      const resource: Partial<Resource> = {
        uri: 'ui://test/secure-interactive',
        mimeType: 'text/html',
        text: '<button data-tool="test-action" data-params=\'{"key": "value"}\'>Click</button>'
      };

      render(<HtmlResource resource={resource} renderMode="secure" onUiAction={onUiAction} />);

      const button = screen.getByRole('button', { name: 'Click' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onUiAction).toHaveBeenCalledWith('test-action', { key: 'value' });
      });
    });

    it('should handle malformed data-params gracefully', async () => {
      const onUiAction = vi.fn().mockResolvedValue(undefined);
      const resource: Partial<Resource> = {
        uri: 'ui://test/malformed',
        mimeType: 'text/html',
        text: '<button data-tool="test-action" data-params="invalid-json">Click</button>'
      };

      render(<HtmlResource resource={resource} renderMode="secure" onUiAction={onUiAction} />);

      const button = screen.getByRole('button', { name: 'Click' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onUiAction).toHaveBeenCalledWith('test-action', {});
      });
    });

    it('should ignore events without tool attribute', async () => {
      const onUiAction = vi.fn();
      const resource: Partial<Resource> = {
        uri: 'ui://test/no-tool',
        mimeType: 'text/html',
        text: '<button data-params=\'{"key": "value"}\'>Click</button>'
      };

      render(<HtmlResource resource={resource} renderMode="secure" onUiAction={onUiAction} />);

      const button = screen.getByRole('button', { name: 'Click' });
      fireEvent.click(button);

      // Wait a bit to ensure no action is called
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(onUiAction).not.toHaveBeenCalled();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom styles to iframe', () => {
      const resource: Partial<Resource> = {
        uri: 'ui://test/styled',
        mimeType: 'text/html',
        text: '<div>Styled Content</div>'
      };

      const customStyle = { border: '1px solid red', height: '400px' };

      render(<HtmlResource resource={resource} style={customStyle} />);

      const iframe = screen.getByRole('iframe');
      expect(iframe).toHaveStyle('border: 1px solid red');
      expect(iframe).toHaveStyle('height: 400px');
    });

    it('should apply custom styles to secure container', () => {
      const resource: Partial<Resource> = {
        uri: 'ui://test/styled-secure',
        mimeType: 'text/html',
        text: '<div>Styled Secure Content</div>'
      };

      const customStyle = { backgroundColor: 'lightblue', padding: '20px' };

      render(<HtmlResource resource={resource} renderMode="secure" style={customStyle} />);

      const container = screen.getByTestId('html-resource-secure');
      expect(container).toHaveStyle('background-color: lightblue');
      expect(container).toHaveStyle('padding: 20px');
    });
  });

  describe('Edge Cases', () => {
    it('should handle resource updates', () => {
      const initialResource: Partial<Resource> = {
        uri: 'ui://test/initial',
        mimeType: 'text/html',
        text: '<div>Initial Content</div>'
      };

      const updatedResource: Partial<Resource> = {
        uri: 'ui://test/updated',
        mimeType: 'text/html',
        text: '<div>Updated Content</div>'
      };

      const { rerender } = render(<HtmlResource resource={initialResource} />);
      
      expect(screen.getByRole('iframe')).toHaveAttribute('srcDoc', '<div>Initial Content</div>');

      rerender(<HtmlResource resource={updatedResource} />);
      
      expect(screen.getByRole('iframe')).toHaveAttribute('srcDoc', '<div>Updated Content</div>');
    });

    it('should handle render mode changes', () => {
      const resource: Partial<Resource> = {
        uri: 'ui://test/mode-change',
        mimeType: 'text/html',
        text: '<div>Mode Change Content</div>'
      };

      const { rerender } = render(<HtmlResource resource={resource} renderMode="iframe" />);
      
      expect(screen.getByRole('iframe')).toBeInTheDocument();
      expect(screen.queryByTestId('html-resource-secure')).not.toBeInTheDocument();

      rerender(<HtmlResource resource={resource} renderMode="secure" />);
      
      expect(screen.queryByRole('iframe')).not.toBeInTheDocument();
      expect(screen.getByTestId('html-resource-secure')).toBeInTheDocument();
    });

    it('should handle empty resource gracefully', () => {
      render(<HtmlResource resource={{}} />);
      expect(screen.getByText('Resource is not of type text/html.')).toBeInTheDocument();
    });

    it('should handle null resource gracefully', () => {
      render(<HtmlResource resource={null as any} />);
      expect(screen.getByText('Resource is not of type text/html.')).toBeInTheDocument();
    });
  });
});

// Integration test
test('Complete workflow: render interactive dashboard', async () => {
  const onUiAction = vi.fn().mockResolvedValue({ success: true });
  
  const dashboardHtml = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Dashboard</h1>
      <button data-tool="refresh" data-params='{"section": "overview"}'>
        Refresh Overview
      </button>
      <div id="chart-container">Chart will load here</div>
    </div>
  `;

  const resource: Partial<Resource> = {
    uri: 'ui://dashboard/main',
    mimeType: 'text/html',
    text: dashboardHtml
  };

  render(
    <HtmlResource 
      resource={resource} 
      renderMode="secure"
      onUiAction={onUiAction}
      style={{ border: '1px solid #ccc', borderRadius: '8px' }}
    />
  );

  // Check that content is rendered
  const container = screen.getByTestId('html-resource-secure');
  expect(container).toBeInTheDocument();
  expect(container.innerHTML).toContain('Dashboard');
  
  // Check styling is applied
  expect(container).toHaveStyle('border: 1px solid #ccc');
  expect(container).toHaveStyle('border-radius: 8px');

  // Test interaction
  const refreshButton = screen.getByRole('button', { name: 'Refresh Overview' });
  fireEvent.click(refreshButton);

  await waitFor(() => {
    expect(onUiAction).toHaveBeenCalledWith('refresh', { section: 'overview' });
  });
});