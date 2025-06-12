// In packages/@auto-ui/server/src/__tests__/AutoUIServer.spec.ts
import { AutoUIServer, MemoryCacheManager, HtmlResourceBlock } from '../index'; // Assuming MockUISchemaGenerator is internal or not directly tested here
import { RuleBasedDataAnalysisEngine } from '@auto-ui/analyzer';
import type { DataAnalysisEngine, UISchemaGenerator, UISchema, DataStructureAnalysis, UIMetadata as CoreUIMetadata, ComponentSuggestion, ComponentType, LayoutConstraints, ValidationResult, UserPreferences } from '@auto-ui/core';

// Re-define a minimal MockUISchemaGenerator for testing if not exported or for more control
class TestMockUISchemaGenerator implements UISchemaGenerator {
  generateSchema(analysis: DataStructureAnalysis, _metadata?: CoreUIMetadata): UISchema {
    return {
      version: '1.0-testmock',
      type: 'page',
      layout: { type: 'flow' },
      components: analysis.suggestedComponents.map((suggestion: ComponentSuggestion, index: number) => ({
        id: `test-${suggestion.component}-${index}`,
        type: suggestion.component as ComponentType,
        props: suggestion.props || {},
      })),
    };
  }
  optimizeLayout = jest.fn((schema: UISchema) => schema);
  validateSchema = jest.fn((_schema: UISchema): ValidationResult => ({ isValid: true })); // Added return type
  mergeUserPreferences = jest.fn((schema: UISchema, _prefs: UserPreferences) => schema); // Added UserPreferences type
}

describe('AutoUIServer', () => {
  let analyzer: DataAnalysisEngine;
  let generator: UISchemaGenerator;
  let cacheManager: MemoryCacheManager;
  let server: AutoUIServer;

  beforeEach(() => {
    analyzer = new RuleBasedDataAnalysisEngine(); // Use the real one for integration testing
    generator = new TestMockUISchemaGenerator(); // Use a controlled mock for the generator
    cacheManager = new MemoryCacheManager();
    server = new AutoUIServer(analyzer, generator, cacheManager);
  });

  const testData = { name: "Test User", email: "test@example.com" };
  const testMetadata: CoreUIMetadata = { title: "Test Page" };

  test('generateAutoUI should call analyzer and generator for new data', async () => {
    const analyzeSpy = jest.spyOn(analyzer, 'analyzeDataStructure');
    const generateSpy = jest.spyOn(generator, 'generateSchema');

    const result = await server.generateAutoUI(testData, testMetadata);

    expect(analyzeSpy).toHaveBeenCalledWith(testData);
    expect(generateSpy).toHaveBeenCalled();
    expect(result.type).toBe('ui_schema');
    expect(result.content).toBeDefined();

    const schema = JSON.parse(result.content) as UISchema;
    expect(schema.version).toBe('1.0-testmock');
    expect(schema.components.length).toBeGreaterThan(0);
  });

  test('generateAutoUI should return cached schema on subsequent calls with same data', async () => {
    await server.generateAutoUI(testData, testMetadata);

    const analyzeSpy = jest.spyOn(analyzer, 'analyzeDataStructure');
    const generateSpy = jest.spyOn(generator, 'generateSchema');
    const cacheRetrieveSpy = jest.spyOn(cacheManager, 'retrieve');

    const result = await server.generateAutoUI(testData, testMetadata);

    expect(cacheRetrieveSpy).toHaveBeenCalled();
    expect(analyzeSpy).not.toHaveBeenCalled();
    expect(generateSpy).not.toHaveBeenCalled();
    expect(result.type).toBe('ui_schema');

    const schema = JSON.parse(result.content) as UISchema;
    expect(schema.version).toBe('1.0-testmock');
  });

  test('generateAutoUI should generate different schemas for different data', async () => {
    const result1 = await server.generateAutoUI({ item: "A" }, testMetadata);
    const schema1Content = result1.content;

    const result2 = await server.generateAutoUI({ item: "B" }, testMetadata);
    const schema2Content = result2.content;

    expect(schema1Content).not.toEqual(schema2Content);
  });

  test('generateAutoUI should handle errors during analysis or generation', async () => {
    const faultyAnalyzer = {
        ...analyzer,
        analyzeDataStructure: jest.fn().mockImplementation(() => {
            throw new Error("Analysis failed!");
        })
    } as DataAnalysisEngine; // Cast to assure it's a DataAnalysisEngine
    const errorServer = new AutoUIServer(faultyAnalyzer, generator, cacheManager);

    const result = await errorServer.generateAutoUI(testData, testMetadata);

    // The createHtmlResource in case of error stringifies the error object.
    // The type in this case would be 'html_string' as per the updated AutoUIServer.ts
    expect(result.type).toBe('html_string');
    expect(result.content).toBeDefined();
    const errorContent = JSON.parse(result.content);
    expect(errorContent.error).toBe("Failed to generate UI");
    expect(errorContent.details).toBe("Analysis failed!");
  });

  test('generateAutoUI should use different cache keys for different metadata', async () => {
    await server.generateAutoUI(testData, { title: "Page One" });

    const analyzeSpy = jest.spyOn(analyzer, 'analyzeDataStructure');
    const generateSpy = jest.spyOn(generator, 'generateSchema');

    await server.generateAutoUI(testData, { title: "Page Two" });

    expect(analyzeSpy).toHaveBeenCalledTimes(1);
    expect(generateSpy).toHaveBeenCalledTimes(1);
  });

});
