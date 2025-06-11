// packages/ui-renderer/src/types.ts
import { HtmlResourceBlock, UiActionEvent } from '@mcp-ui/shared'; // Assuming shared types

export interface UIComponentRendererProps {
  resource: HtmlResourceBlock;
  onEvent?: (event: UiActionEvent) => void;
  sandbox?: boolean | string; // boolean for default sandbox, string for custom sandbox attributes
  maxHeight?: number | string;
  className?: string;
}
