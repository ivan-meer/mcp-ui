import type {
  DataStructureAnalysis,
  ComponentSuggestion,
} from '@auto-ui/analyzer';
import type {
  UISchemaGenerator,
  UISchema,
  LayoutConstraints,
  OptimizedUISchema,
  ValidationResult,
  UserPreferences,
  UIMetadata,
  LayoutDefinition,
  ComponentDefinition,
} from './index';
import { SimpleLayoutEngine } from './index';

/**
 * A naive UISchemaGenerator implementation that maps simple analysis
 * results into a basic UISchema using AutoTable components.
 */
export class SimpleUISchemaGenerator implements UISchemaGenerator {
  constructor(private layout = new SimpleLayoutEngine()) {}

  generateSchema(
    analysis: DataStructureAnalysis,
    metadata: UIMetadata = {}
  ): UISchema {
    const components: ComponentDefinition[] = [];

    analysis.suggestedComponents.forEach((suggestion: ComponentSuggestion, i) => {
      components.push({
        id: `component-${i}`,
        type: suggestion.component,
        props: suggestion.props,
      });
    });

    const layoutDef: LayoutDefinition = {
      type: 'grid',
      responsive: {},
      spacing: {},
      alignment: {},
      breakpoints: {},
    };

    return {
      version: '0.1',
      type: 'page',
      layout: layoutDef,
      components,
      interactions: [],
      styling: {},
      accessibility: {},
      validation: {},
      ...metadata,
    } as UISchema;
  }

  optimizeLayout(schema: UISchema, constraints: LayoutConstraints): OptimizedUISchema {
    return this.layout.optimize(schema, constraints);
  }

  validateSchema(_schema: UISchema): ValidationResult {
    return { valid: true };
  }

  mergeUserPreferences(schema: UISchema, _preferences: UserPreferences): UISchema {
    return schema;
  }
}

export default SimpleUISchemaGenerator;
