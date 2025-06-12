import { SimpleDataAnalysisEngine } from '@auto-ui/analyzer';
import { SimpleUISchemaGenerator } from '../SimpleUISchemaGenerator';

describe('SimpleUISchemaGenerator', () => {
  it('generates a basic UISchema from analysis results', () => {
    const engine = new SimpleDataAnalysisEngine();
    const generator = new SimpleUISchemaGenerator();
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];

    const analysis = engine.analyzeDataStructure(data);
    const schema = generator.generateSchema(analysis, { title: 'Users' });

    expect(schema.type).toBe('page');
    expect(schema.components.length).toBeGreaterThan(0);
    expect(schema.components[0].type).toBe('table');
    expect(schema.layout.type).toBe('grid');
  });
});
