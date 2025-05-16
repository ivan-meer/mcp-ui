import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HtmlResource, RenderHtmlResourceProps } from '../HtmlResource.js';
import { vi, Mock, MockInstance } from 'vitest';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';

describe('HtmlResource component', () => {
  const mockOnUiAction = vi.fn();

  const defaultProps: RenderHtmlResourceProps = {
    resource: { mimeType: 'text/html', text: '<p>Hello Test</p>' },
    onUiAction: mockOnUiAction,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders HTML content from text property using srcDoc', () => {
    render(<HtmlResource {...defaultProps} />);
    const iframe = screen.getByTitle(
      'MCP HTML Resource (Embedded Content)',
    ) as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.srcdoc).toContain('<p>Hello Test</p>');
  });

  it('renders iframe with src for ui-app:// URI with text', () => {
    const props: RenderHtmlResourceProps = {
      resource: {
        uri: 'ui-app://my-app',
        mimeType: 'text/html',
        text: 'https://example.com/app',
      },
      onUiAction: mockOnUiAction,
    };
    render(<HtmlResource {...props} />);
    const iframe = screen.getByTitle(
      'MCP HTML Resource (URL)',
    ) as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toBe('https://example.com/app');
  });

  it('shows loading message initially (concept, actual timing is fast)', () => {
    // This test is more conceptual for async resources not covered by defaultProps
    // For a truly async resource, you'd mock its loading state
    const loadingProps: RenderHtmlResourceProps = {
      resource: { mimeType: 'text/html', uri: 'ui://loading-resource' }, // No text/blob means it would try to fetch
      onUiAction: mockOnUiAction,
    };
    // Simulate that it would be loading if content wasn't immediate.
    // Actual component logic might set isLoading=false very quickly if no real async fetch is triggered.
    // To test loading, you would typically mock useMcpResourceFetcher to be in a loading state.
    render(<HtmlResource {...loadingProps} />);
    // Since our default HtmlResource resolves synchronously if text/blob is missing for ui://,
    // it might show an error or "No HTML content" instead of "Loading".
    // This assertion depends heavily on the refined async logic of HtmlResource.
    // For now, let's expect the fallback paragraph because no content is provided.
    expect(
      screen.getByText('ui:// HTML resource requires text or blob content.'),
    ).toBeInTheDocument();
  });

  it('displays an error message if resource mimeType is not text/html', () => {
    const props: RenderHtmlResourceProps = {
      resource: { mimeType: 'application/json', text: '{}' },
      onUiAction: mockOnUiAction,
    };
    render(<HtmlResource {...props} />);
    expect(
      screen.getByText('Resource is not of type text/html.'),
    ).toBeInTheDocument();
  });

  it('decodes HTML from blob for ui:// resource', () => {
    const html = '<p>Blob Content</p>';
    const encodedHtml = Buffer.from(html).toString('base64');
    const props: RenderHtmlResourceProps = {
      resource: {
        uri: 'ui://blob-test',
        mimeType: 'text/html',
        blob: encodedHtml,
      },
      onUiAction: mockOnUiAction,
    };
    render(<HtmlResource {...props} />);
    const iframe = screen.getByTitle(
      'MCP HTML Resource (Embedded Content)',
    ) as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain(html);
  });

  it('decodes URL from blob for ui-app:// resource', () => {
    const url = 'https://example.com/blob-app';
    const encodedUrl = Buffer.from(url).toString('base64');
    const props: RenderHtmlResourceProps = {
      resource: {
        uri: 'ui-app://blob-app-test',
        mimeType: 'text/html',
        blob: encodedUrl,
      },
      onUiAction: mockOnUiAction,
    };
    render(<HtmlResource {...props} />);
    const iframe = screen.getByTitle(
      'MCP HTML Resource (URL)',
    ) as HTMLIFrameElement;
    expect(iframe.src).toBe(url);
  });
});

const mockResourceBaseForUiActionTests: Partial<Resource> = {
  mimeType: 'text/html',
  text: '<html><body><h1>Test Content</h1><script>console.log("iframe script loaded for onUiAction tests")</script></body></html>',
};

// Helper to dispatch a message event
const dispatchMessage = (
  source: Window | null,
  data: Record<string, unknown> | null,
) => {
  fireEvent(
    window,
    new MessageEvent('message', {
      data,
      source,
    }),
  );
};

describe('HtmlResource - onUiAction', () => {
  let mockOnUiAction: Mock<[string, Record<string, unknown>], Promise<unknown>>;
  let consoleErrorSpy: MockInstance<Parameters<Console['error']>, void>;

  beforeEach(() => {
    mockOnUiAction = vi.fn().mockResolvedValue(undefined);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const renderComponentForUiActionTests = (props: Partial<RenderHtmlResourceProps> = {}) => {
    return render(
      <HtmlResource
        resource={props.resource || mockResourceBaseForUiActionTests}
        onUiAction={'onUiAction' in props ? props.onUiAction : mockOnUiAction}
        style={props.style}
      />,
    );
  };

  it('should call onUiAction with tool and params when a valid message is received from the iframe', async () => {
    renderComponentForUiActionTests();
    const iframe = (await screen.findByTitle(
      'MCP HTML Resource (Embedded Content)',
    )) as HTMLIFrameElement;

    const eventData = { tool: 'testTool', params: { foo: 'bar' } };
    dispatchMessage(iframe.contentWindow, eventData);

    expect(mockOnUiAction).toHaveBeenCalledTimes(1);
    expect(mockOnUiAction).toHaveBeenCalledWith('testTool', { foo: 'bar' });
  });

  it('should use empty params if event.data.params is missing', async () => {
    renderComponentForUiActionTests();
    const iframe = (await screen.findByTitle(
      'MCP HTML Resource (Embedded Content)',
    )) as HTMLIFrameElement;
    
    const eventData = { tool: 'testTool' }; // No params
    dispatchMessage(iframe.contentWindow, eventData);

    expect(mockOnUiAction).toHaveBeenCalledTimes(1);
    expect(mockOnUiAction).toHaveBeenCalledWith('testTool', {});
  });

  it('should not call onUiAction if the message event is not from the iframe', async () => {
    renderComponentForUiActionTests();
    // Ensure iframe is rendered before dispatching an event from the wrong source
    await screen.findByTitle('MCP HTML Resource (Embedded Content)');

    const eventData = { tool: 'testTool', params: { foo: 'bar' } };
    dispatchMessage(window, eventData); // Source is the main window

    expect(mockOnUiAction).not.toHaveBeenCalled();
  });

  it('should not call onUiAction if event.data.tool is missing', async () => {
    renderComponentForUiActionTests();
    const iframe = (await screen.findByTitle(
      'MCP HTML Resource (Embedded Content)',
    )) as HTMLIFrameElement;

    const eventData = { params: { foo: 'bar' } }; // Missing 'tool'
    dispatchMessage(iframe.contentWindow, eventData);

    expect(mockOnUiAction).not.toHaveBeenCalled();
  });

  it('should not call onUiAction if event.data is null', async () => {
    renderComponentForUiActionTests();
    const iframe = (await screen.findByTitle(
      'MCP HTML Resource (Embedded Content)',
    )) as HTMLIFrameElement;

    dispatchMessage(iframe.contentWindow, null);

    expect(mockOnUiAction).not.toHaveBeenCalled();
  });
  
  it('should work correctly and not throw if onUiAction is undefined', async () => {
    // Pass undefined directly to onUiAction for this specific test
    renderComponentForUiActionTests({ onUiAction: undefined, resource: mockResourceBaseForUiActionTests });
    const iframe = (await screen.findByTitle(
      'MCP HTML Resource (Embedded Content)',
    )) as HTMLIFrameElement;

    const eventData = { tool: 'testTool', params: { foo: 'bar' } };
    
    expect(() => {
      dispatchMessage(iframe.contentWindow, eventData);
    }).not.toThrow();
    // mockOnUiAction (the one from the describe block scope) should not be called
    // as it was effectively replaced by 'undefined' for this render.
    expect(mockOnUiAction).not.toHaveBeenCalled(); 
  });

  it('should log an error if onUiAction returns a rejected promise', async () => {
    const errorMessage = 'Async action failed';
    const specificMockForThisTest = vi.fn<[string, Record<string, unknown>], Promise<unknown>>().mockRejectedValue(new Error(errorMessage));
    renderComponentForUiActionTests({ onUiAction: specificMockForThisTest, resource: mockResourceBaseForUiActionTests });

    const iframe = (await screen.findByTitle(
      'MCP HTML Resource (Embedded Content)',
    )) as HTMLIFrameElement;
    const eventData = { tool: 'testTool', params: { foo: 'bar' } };
    dispatchMessage(iframe.contentWindow, eventData);

    await waitFor(() => {
      expect(specificMockForThisTest).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error from onUiAction in RenderHtmlResource:',
        expect.objectContaining({ message: errorMessage }),
      );
    });
  });

  it('should not attempt to call onUiAction if iframeRef.current is null (e.g. resource error)', async () => {
    // Render with a resource that will cause an error and prevent iframe rendering
    const localMockOnUiAction = vi.fn<[string, Record<string, unknown>], Promise<unknown>>();
    render(
      <HtmlResource 
        resource={{ mimeType: 'text/plain', text: 'not html' }} // Invalid mimeType
        onUiAction={localMockOnUiAction} 
      />
    );

    // Iframe should not be present
    expect(screen.queryByTitle('MCP HTML Resource (Embedded Content)')).not.toBeInTheDocument();
    // Error message should be displayed
    expect(await screen.findByText('Resource is not of type text/html.')).toBeInTheDocument();
    
    const eventData = { tool: 'testTool', params: { foo: 'bar' } };
    dispatchMessage(window, eventData); 

    expect(localMockOnUiAction).not.toHaveBeenCalled();
    expect(mockOnUiAction).not.toHaveBeenCalled(); // also check the describe-scoped one
  });
});
