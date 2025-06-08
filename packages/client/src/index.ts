/**
 * @fileoverview MCP UI Client SDK - React components for HTML resource rendering
 * @author MCP UI Team
 * @since 2.0.0
 */

// Core components
export * from './components/HtmlResource';

// Re-export shared types for convenience
export type {
  HtmlResourceBlock,
  UiActionEvent,
  RenderMode,
  McpUiErrorType
} from '@mcp-ui/shared';

// Re-export utilities
export { McpUiError, isHtmlResourceBlock, isUiActionEvent } from '@mcp-ui/shared';
