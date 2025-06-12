// In packages/@auto-ui/analyzer/src/__tests__/RuleBasedDataAnalysisEngine.spec.ts

import { RuleBasedDataAnalysisEngine } from '../index'; // Adjust path if index.ts exports it
import type { DataStructureAnalysis, TypeInferenceResult, PatternMatch, ComponentSuggestion } from '@auto-ui/core';

describe('RuleBasedDataAnalysisEngine', () => {
  let engine: RuleBasedDataAnalysisEngine;

  beforeEach(() => {
    engine = new RuleBasedDataAnalysisEngine();
  });

  describe('analyzeDataStructure', () => {
    test('should analyze a simple primitive (string)', async () => {
      const data = "hello world";
      const analysis = await engine.analyzeDataStructure(data);
      expect(analysis.dataType).toBe('primitive');
      expect(analysis.complexity).toBe('simple');
      expect(analysis.fieldTypes.value.type).toBe('string');
      expect(analysis.nestingLevel).toBe(0);
      expect(analysis.suggestedComponents[0].component).toBe('DisplayValue');
    });

    test('should analyze a simple object', async () => {
      const data = { name: "Alice", age: 30 };
      const analysis = await engine.analyzeDataStructure(data);
      expect(analysis.dataType).toBe('object');
      expect(analysis.complexity).toBe('simple');
      expect(analysis.fieldTypes.name.type).toBe('string');
      expect(analysis.fieldTypes.age.type).toBe('number');
      expect(analysis.nestingLevel).toBe(1); // Corrected expectation
      expect(analysis.suggestedComponents[0].component).toBe('AutoForm');
    });

    test('should calculate nesting level for nested objects correctly', async () => {
      const data = { id: 1, user: { name: 'Bob', address: { street: '123 Main St', city: 'Anytown' } } };
      const analysis = await engine.analyzeDataStructure(data);
      expect(analysis.dataType).toBe('object');
      // nestingLevel for { street: '...', city: '...' } is 1 relative to 'address'
      // nestingLevel for { name: '...', address: { ... } } is 2 relative to 'user'
      // nestingLevel for { id: ..., user: { ... } } is 3 relative to root
      expect(analysis.nestingLevel).toBe(3);
    });

    test('should analyze an array of objects', async () => {
      const data = [{ id: 1, task: "Buy milk" }, { id: 2, task: "Walk dog" }];
      const analysis = await engine.analyzeDataStructure(data);
      expect(analysis.dataType).toBe('array');
      expect(analysis.recordCount).toBe(2);
      expect(analysis.fieldTypes.id.type).toBe('number'); // Inferred from first item
      expect(analysis.fieldTypes.task.type).toBe('string');
      expect(analysis.suggestedComponents[0].component).toBe('AutoTable');
    });

    test('should analyze an array of primitives', async () => {
      const data = [1, 2, 3, 4, 5];
      const analysis = await engine.analyzeDataStructure(data);
      expect(analysis.dataType).toBe('array');
      expect(analysis.recordCount).toBe(5);
      // Field types for array of primitives might be handled differently,
      // e.g. first item's type or a generic 'arrayItem' type.
      // Current implementation takes fieldTypes from first item.
      expect(analysis.fieldTypes.value.type).toBe('number');
      const listSuggestion = analysis.suggestedComponents.find(c => c.component === 'AutoList'); // Expect AutoList
      expect(listSuggestion).toBeDefined();
      if (listSuggestion) { // Type guard for TS
          expect(listSuggestion.reasoning).toBe('Data is an array of primitives.');
      }
    });
  });

  describe('inferDataTypes', () => {
    test('should infer basic types from an object', () => {
      const data = { name: "Bob", age: 42, isActive: true, registeredAt: "2023-01-01T12:00:00Z" };
      const types = engine.inferDataTypes(data);
      expect(types.name.type).toBe('string');
      expect(types.age.type).toBe('number');
      expect(types.isActive.type).toBe('boolean');
      expect(types.registeredAt.type).toBe('date'); // 'datetime-iso'
      expect(types.registeredAt.confidence).toBe(0.9);
    });

    test('should infer date type for YYYY-MM-DD format', () => {
      const data = { birthDate: "1990-12-25" };
      const types = engine.inferDataTypes(data);
      expect(types.birthDate.type).toBe('date');
      expect(types.birthDate.confidence).toBe(0.9);
    });
  });

  describe('recognizePatterns', () => {
    test('should recognize ListOfIdentifiableNamedObjects pattern', () => {
      const data = [{ id: 1, name: "Item A" }, { id: 2, name: "Item B" }];
      const patterns = engine.recognizePatterns(data);
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].patternName).toBe('ListOfIdentifiableNamedObjects');
      expect(patterns[0].confidence).toBe(0.7);
    });

    test('should not recognize ListOfIdentifiableNamedObjects for non-conforming data', () => {
      const data = [{ foo: 1, bar: "Item A" }, { foo: 2, bar: "Item B" }];
      const patterns = engine.recognizePatterns(data);
      const targetPattern = patterns.find(p => p.patternName === 'ListOfIdentifiableNamedObjects');
      expect(targetPattern).toBeUndefined();
    });
  });

  describe('suggestVisualizations', () => {
    test('should suggest bar/line chart and table for array of objects with numeric and string fields', () => {
        const analysis: DataStructureAnalysis = {
            dataType: 'array',
            recordCount: 2,
            fieldTypes: { name: { type: 'string' }, value: { type: 'number' } },
            complexity: 'simple',
            nestingLevel: 1,
            patterns: [{ name: 'ListOfObjects', confidence: 0.8 }],
            suggestedComponents: [{ component: 'AutoTable', confidence: 0.8, reasoning: '', props: {} }]
        };
        const suggestions = engine.suggestVisualizations(analysis);
        expect(suggestions.some(s => s.chartType === 'bar')).toBe(true);
        expect(suggestions.some(s => s.chartType === 'line')).toBe(true);
        expect(suggestions.some(s => s.chartType === 'table')).toBe(true);
    });

    test('should suggest table if AutoTable component was suggested', () => {
        const analysis: DataStructureAnalysis = {
            dataType: 'array',
            recordCount: 2,
            fieldTypes: { name: { type: 'string' }, email: { type: 'string' } }, // No numeric
            complexity: 'simple',
            nestingLevel: 1,
            patterns: [{ name: 'ListOfObjects', confidence: 0.8 }],
            suggestedComponents: [{ component: 'AutoTable', confidence: 0.8, reasoning: '', props: {} }]
        };
        const suggestions = engine.suggestVisualizations(analysis);
        expect(suggestions.some(s => s.chartType === 'table')).toBe(true);
        expect(suggestions.some(s => s.chartType === 'bar')).toBe(false); // No numeric fields
    });
  });
});
