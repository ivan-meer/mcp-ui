// packages/@auto-ui/generators/src/__tests__/BasicUISchemaGenerator.spec.ts
import { BasicUISchemaGenerator } from '../index';
import type { DataStructureAnalysis, UISchema, ComponentSuggestion, UIMetadata, FieldTypeMap } from '@auto-ui/core';

describe('BasicUISchemaGenerator', () => {
  let generator: BasicUISchemaGenerator;

  beforeEach(() => {
    generator = new BasicUISchemaGenerator();
  });

  const mockEmptyAnalysis: DataStructureAnalysis = {
    dataType: 'object', // Default or provide a specific one for tests
    complexity: 'simple',
    recordCount: 0,
    fieldTypes: {} as FieldTypeMap, // Cast if empty or provide mock FieldTypeMap
    nestingLevel: 0,
    patterns: [],
    suggestedComponents: [],
  };

  test('should generate a schema with components from analysis suggestions', () => {
    const analysis: DataStructureAnalysis = {
      ...mockEmptyAnalysis, // Spread defaults
      dataType: 'array',
      suggestedComponents: [
        { component: 'AutoTable', confidence: 0.8, reasoning: '', props: { dataKey: 'items' } }  as ComponentSuggestion
      ],
    };
    const schema = generator.generateSchema(analysis);
    expect(schema.components.length).toBe(1);
    expect(schema.components[0].type).toBe('AutoTable');
    expect(schema.components[0].props).toEqual({ dataKey: 'items' });
    expect(schema.layout.type).toBe('flow');
  });

  test('should add PageTitle component if title is in metadata', () => {
    const analysis: DataStructureAnalysis = { ...mockEmptyAnalysis }; // Use mock for basic analysis
    const metadata: UIMetadata = { title: 'Test Page Title' };
    const schema = generator.generateSchema(analysis, metadata);

    // RawDataViewer might be added if suggestedComponents is empty
    const expectedComponents = (analysis.suggestedComponents.length === 0 && analysis.dataType !== 'primitive') ? 2 : 1;
    expect(schema.components.length).toBe(expectedComponents);

    const pageTitle = schema.components.find(c => c.type === 'PageTitle');
    expect(pageTitle).toBeDefined();
    expect(pageTitle?.props).toEqual({ text: 'Test Page Title', level: 1 });
  });

  test('should add RawDataViewer if no components suggested for non-primitive data', () => {
    const analysis: DataStructureAnalysis = {
      ...mockEmptyAnalysis,
      dataType: 'object', // Non-primitive
      suggestedComponents: [], // No suggestions
    };
    const schema = generator.generateSchema(analysis);
    expect(schema.components.length).toBe(1);
    expect(schema.components[0].type).toBe('RawDataViewer');
  });

  test('should NOT add RawDataViewer if no components suggested for primitive data', () => {
    const analysis: DataStructureAnalysis = {
      ...mockEmptyAnalysis,
      dataType: 'primitive',
      suggestedComponents: [],
    };
    const schema = generator.generateSchema(analysis);
    expect(schema.components.length).toBe(0); // No RawDataViewer for primitives
  });

  test('validateSchema should return valid for a basic schema', () => {
    const schema: UISchema = { version: '1.0', type: 'page', layout: {type: 'flow'}, components: []};
    const result = generator.validateSchema(schema);
    expect(result.isValid).toBe(true);
  });

  test('validateSchema should return invalid if components array is missing', () => {
    const schema = { version: '1.0', type: 'page', layout: {type: 'flow'} } as UISchema; // Missing components
    const result = generator.validateSchema(schema);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([{ path: "components", message: "Components array is missing." }]);
  });

  test('optimizeLayout should return the schema unchanged (no-op)', () => {
    const schema: UISchema = { version: '1.0', type: 'page', layout: {type: 'flow'}, components: []};
    const result = generator.optimizeLayout(schema, {}); // Empty constraints
    expect(result).toEqual(schema);
  });

  test('mergeUserPreferences should return the schema unchanged (no-op)', () => {
    const schema: UISchema = { version: '1.0', type: 'page', layout: {type: 'flow'}, components: []};
    const result = generator.mergeUserPreferences(schema, {}); // Empty preferences
    expect(result).toEqual(schema);
  });
});
