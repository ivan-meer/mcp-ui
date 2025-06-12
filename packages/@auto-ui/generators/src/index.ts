// packages/@auto-ui/generators/src/index.ts
import type {
  UISchemaGenerator,
  DataStructureAnalysis,
  UISchema,
  UIMetadata, // Using UIMetadata from @auto-ui/core
  LayoutConstraints,
  OptimizedUISchema,
  ValidationResult,
  UserPreferences,
  ComponentDefinition,
  ComponentType,
  ComponentSuggestion
} from '@auto-ui/core';

export class BasicUISchemaGenerator implements UISchemaGenerator {
  generateSchema(analysis: DataStructureAnalysis, metadata?: UIMetadata): UISchema {
    // console.log("BasicUISchemaGenerator: Received analysis:", JSON.stringify(analysis, null, 2));
    // console.log("BasicUISchemaGenerator: Received metadata:", metadata);

    const components: ComponentDefinition[] = analysis.suggestedComponents.map(
      (suggestion: ComponentSuggestion, index: number): ComponentDefinition => {
        return {
          id: `${suggestion.component}-${index}-${Date.now()}`, // Basic unique ID
          type: suggestion.component as ComponentType, // Type assertion
          props: suggestion.props || {}, // Pass through suggested props
          // children, conditions, events, data bindings are not handled by this basic generator yet
        };
      }
    );

    // If no components were suggested, but there's data, maybe add a raw data displayer
    if (components.length === 0 && analysis.dataType !== 'primitive') {
        components.push({
            id: `raw-data-viewer-0-${Date.now()}`,
            type: 'RawDataViewer' as ComponentType, // A hypothetical component
            props: { data: analysis } // Or the original data if accessible and preferred
        });
    }


    const schema: UISchema = {
      version: '1.0-basic',
      type: 'page', // Default to a page schema
      layout: {
        type: 'flow', // Simplest layout: components render one after another
        responsive: {},
        spacing: {},
        alignment: {},
        breakpoints: {},
      },
      components: components,
      // Optional fields, not populated by basic generator:
      // interactions: [],
      // styling: {},
      // accessibility: {},
      // validation: {}
    };

    if (metadata?.title) {
      // Prepend a title component if metadata provides a title
      schema.components.unshift({
        id: `page-title-${Date.now()}`,
        type: 'PageTitle' as ComponentType, // Hypothetical component for displaying a title
        props: { text: metadata.title, level: 1 }, // Assuming PageTitle takes text and level
      });
    }

    // console.log("BasicUISchemaGenerator: Generated schema:", JSON.stringify(schema, null, 2));
    return schema;
  }

  optimizeLayout(schema: UISchema, _constraints: LayoutConstraints): OptimizedUISchema {
    // console.log("BasicUISchemaGenerator: optimizeLayout called (no-op)");
    // No-op for basic generator
    return schema as OptimizedUISchema;
  }

  validateSchema(schema: UISchema): ValidationResult {
    // console.log("BasicUISchemaGenerator: validateSchema called (always valid)");
    // Basic validation: check for presence of components array
    if (!schema.components) {
      return { isValid: false, errors: [{ path: "components", message: "Components array is missing." }] };
    }
    // No-op for more detailed validation in basic generator
    return { isValid: true };
  }

  mergeUserPreferences(schema: UISchema, _preferences: UserPreferences): UISchema {
    // console.log("BasicUISchemaGenerator: mergeUserPreferences called (no-op)");
    // No-op for basic generator
    return schema;
  }
}
