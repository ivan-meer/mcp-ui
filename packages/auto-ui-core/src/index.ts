import type {
  DataStructureAnalysis,
  ComponentProps
} from '@auto-ui/analyzer';

export interface LayoutConstraints {
  maxColumns?: number;
  [key: string]: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface UserPreferences {
  [key: string]: unknown;
}

export interface ResponsiveConfig {
  [key: string]: unknown;
}

export interface SpacingConfig {
  [key: string]: unknown;
}

export interface AlignmentConfig {
  [key: string]: unknown;
}

export interface BreakpointConfig {
  [key: string]: unknown;
}

export interface InteractionRule {
  type: string;
  [key: string]: unknown;
}

export interface StylingConfig {
  [key: string]: unknown;
}

export interface AccessibilityConfig {
  [key: string]: unknown;
}

export interface ValidationConfig {
  [key: string]: unknown;
}

export interface DataBinding {
  source: string;
  path?: string;
}

export interface ConditionalRule {
  condition: string;
  value?: unknown;
}

export interface EventHandler {
  type: string;
  handler: string;
}

export type ComponentType =
  | 'table'
  | 'form'
  | 'chart'
  | 'card'
  | 'dashboard'
  | 'list'
  | string;

export interface ComponentDefinition {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: ComponentDefinition[];
  conditions?: ConditionalRule[];
  events?: EventHandler[];
  data?: DataBinding;
}

export interface LayoutDefinition {
  type: 'grid' | 'flex' | 'absolute' | 'flow';
  responsive: ResponsiveConfig;
  spacing: SpacingConfig;
  alignment: AlignmentConfig;
  breakpoints: BreakpointConfig;
}

export interface UISchema {
  version: string;
  type: 'page' | 'component' | 'widget';
  layout: LayoutDefinition;
  components: ComponentDefinition[];
  interactions: InteractionRule[];
  styling: StylingConfig;
  accessibility: AccessibilityConfig;
  validation: ValidationConfig;
}

export interface OptimizedUISchema extends UISchema {}

export interface UIMetadata {
  title?: string;
  description?: string;
  preferredComponents?: ComponentType[];
  [key: string]: unknown;
}

export interface UISchemaGenerator {
  generateSchema(
    analysis: DataStructureAnalysis,
    metadata?: UIMetadata
  ): Promise<UISchema> | UISchema;
  optimizeLayout(
    schema: UISchema,
    constraints: LayoutConstraints
  ): Promise<OptimizedUISchema> | OptimizedUISchema;
  validateSchema(schema: UISchema): ValidationResult;
  mergeUserPreferences(
    schema: UISchema,
    preferences: UserPreferences
  ): UISchema;
}

export interface LayoutEngine {
  optimize(
    schema: UISchema,
    constraints: LayoutConstraints
  ): OptimizedUISchema;
}


export class SimpleLayoutEngine implements LayoutEngine {
  optimize(schema: UISchema, constraints: LayoutConstraints): OptimizedUISchema {
    // Naive implementation: just return schema without modifications
    // respecting maxColumns constraint for demonstration
    if (constraints.maxColumns && schema.layout.type === 'grid') {
      schema.layout.breakpoints = {
        ...schema.layout.breakpoints,
        maxColumns: constraints.maxColumns
      } as BreakpointConfig;
    }
    return { ...schema };
  }
}

export { SimpleUISchemaGenerator } from './SimpleUISchemaGenerator';
