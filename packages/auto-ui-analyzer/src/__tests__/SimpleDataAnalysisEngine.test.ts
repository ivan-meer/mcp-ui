import { SimpleDataAnalysisEngine } from '../SimpleDataAnalysisEngine';

describe('SimpleDataAnalysisEngine', () => {
  it('suggests a table component for array of objects', () => {
    const engine = new SimpleDataAnalysisEngine();
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];

    const result = engine.analyzeDataStructure(data);

    expect(result.dataType).toBe('array');
    expect(result.suggestedComponents[0]?.component).toBe('table');
  });
});
