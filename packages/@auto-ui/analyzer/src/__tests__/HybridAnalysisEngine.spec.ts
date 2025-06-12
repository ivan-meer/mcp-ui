// packages/@auto-ui/analyzer/src/__tests__/HybridAnalysisEngine.spec.ts
import { HybridAnalysisEngine } from '../HybridAnalysisEngine';
import { RuleBasedDataAnalysisEngine } from '../index'; // Corrected import
import { AIPatternRecognizerService } from '../ai/AIPatternRecognizerService';
import type { AIComponentAnalysisResult } from '../ai/AIPatternRecognizerService';
import { MemoryCacheManager } from '@auto-ui/server';
import { RedisCacheManager } from '../cache/redis_cache_manager';
import type { DataStructureAnalysis, ComponentSuggestion, CacheManager } from '@auto-ui/core'; // CacheManager from core
// Removed incorrect CacheManager import from @auto-ui/server

// Mocks
// jest.mock('../RuleBasedDataAnalysisEngine'); // Old mock

jest.mock('../index', () => ({ // Mocking RuleBasedDataAnalysisEngine via index
  ...jest.requireActual('../index'), // Import and retain other exports from index.ts
  RuleBasedDataAnalysisEngine: jest.fn().mockImplementation(() => ({
    analyzeDataStructure: jest.fn(),
    recognizePatterns: jest.fn(),
    inferDataTypes: jest.fn(),
    findRelationships: jest.fn(),
    suggestVisualizations: jest.fn(),
  })),
}));

jest.mock('../ai/AIPatternRecognizerService');

// Mock @auto-ui/server to control MemoryCacheManager behavior for tests
jest.mock('@auto-ui/server', () => {
    const originalModule = jest.requireActual('@auto-ui/server');
    return {
        ...originalModule,
        MemoryCacheManager: jest.fn().mockImplementation(() => ({
            retrieve: jest.fn().mockResolvedValue(undefined), // Default to cache miss
            store: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(true),
            has: jest.fn().mockResolvedValue(false),
            isReady: jest.fn().mockResolvedValue(true), // MemoryCache is always ready
        })),
    };
});

// Mock RedisCacheManager
jest.mock('../cache/redis_cache_manager', () => ({
    RedisCacheManager: jest.fn().mockImplementation(() => ({
        retrieve: jest.fn().mockResolvedValue(undefined), // Default to cache miss
        store: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(true),
        has: jest.fn().mockResolvedValue(false),
        isReady: jest.fn().mockResolvedValue(true), // Assume ready for tests not focused on Redis itself
        disconnect: jest.fn().mockResolvedValue(undefined),
    })),
}));


describe('HybridAnalysisEngine', () => {
  let mockRuleBasedEngine: jest.Mocked<RuleBasedDataAnalysisEngine>;
  let mockAIRecognizer: jest.Mocked<AIPatternRecognizerService>;
  let mockMemCacheManager: jest.Mocked<MemoryCacheManager>;
  let mockRedisCacheManager: jest.Mocked<RedisCacheManager>;
  let engineWithAICapableRecognizer: HybridAnalysisEngine;
  let engineWithNonConfiguredAIRecognizer: HybridAnalysisEngine;

  const ruleBasedResult: DataStructureAnalysis = {
    dataType: 'object', complexity: 'simple', recordCount: 0, nestingLevel: 1, fieldTypes: {},
    patterns: [{ name: 'RulePattern', confidence: 1, details: 'Rule based' }],
    suggestedComponents: [{ component: 'AutoForm', confidence: 0.8, reasoning: 'Rule', props: {} } as ComponentSuggestion],
  };
  const aiSuggestions: AIComponentAnalysisResult = {
    componentSuggestions: [{ component: 'AutoCard', confidence: 0.9, reasoning: 'AI', props: {} } as ComponentSuggestion],
    rawResponse: "AI raw response"
  };

  beforeEach(() => {
    // Reset mocks for RuleBasedDataAnalysisEngine and AIPatternRecognizerService for each test
    jest.clearAllMocks();

    mockRuleBasedEngine = new RuleBasedDataAnalysisEngine() as jest.Mocked<RuleBasedDataAnalysisEngine>;
    mockRuleBasedEngine.analyzeDataStructure.mockResolvedValue(ruleBasedResult); // Changed to mockResolvedValue

    // Setup for AI Recognizer that IS configured
    mockAIRecognizer = new AIPatternRecognizerService() as jest.Mocked<AIPatternRecognizerService>;
    // Mock the internal aiServiceClient and its isConfigured method
    (mockAIRecognizer as any).aiServiceClient = { isConfigured: jest.fn(() => true) };

    // Setup for AI Recognizer that IS NOT configured
    const nonConfiguredMockAIRecognizer = new AIPatternRecognizerService() as jest.Mocked<AIPatternRecognizerService>;
    (nonConfiguredMockAIRecognizer as any).aiServiceClient = { isConfigured: jest.fn(() => false) };

    mockMemCacheManager = new MemoryCacheManager() as jest.Mocked<MemoryCacheManager>;
    mockRedisCacheManager = new RedisCacheManager() as jest.Mocked<RedisCacheManager>;

    // Engine with AI configured and cache (defaults to MemoryCache if Redis not forced by env)
    engineWithAICapableRecognizer = new HybridAnalysisEngine(mockRuleBasedEngine, mockAIRecognizer, mockMemCacheManager, true);
    // Engine with AI explicitly not configured
    engineWithNonConfiguredAIRecognizer = new HybridAnalysisEngine(mockRuleBasedEngine, nonConfiguredMockAIRecognizer, mockMemCacheManager, true);

  });

  it('should return rule-based results if AI is disabled (recognizer not configured)', async () => {
    const result = await engineWithNonConfiguredAIRecognizer.analyzeDataStructure({ data: 'test' });
    expect(result).toEqual(ruleBasedResult);
    // Check the correct mock instance associated with engineWithNonConfiguredAIRecognizer
    const nonConfiguredRecognizerInstance = (engineWithNonConfiguredAIRecognizer as any).aiRecognizer;
    expect(nonConfiguredRecognizerInstance.analyzeWithAI).not.toHaveBeenCalled();
  });

  it('should return merged results when AI is successful (cache miss)', async () => {
    mockMemCacheManager.retrieve.mockResolvedValue(undefined); // Cache miss
    mockAIRecognizer.analyzeWithAI.mockResolvedValue(aiSuggestions);

    const result = await engineWithAICapableRecognizer.analyzeDataStructure({ data: 'test' });

    expect(mockMemCacheManager.retrieve).toHaveBeenCalled();
    expect(mockAIRecognizer.analyzeWithAI).toHaveBeenCalledWith({ data: 'test' }); // Called with data
    expect(mockMemCacheManager.store).toHaveBeenCalledWith(expect.any(String), aiSuggestions, expect.any(Number));

    expect(result.suggestedComponents).toContainEqual(aiSuggestions.componentSuggestions![0]);
    expect(result.suggestedComponents).toContainEqual(ruleBasedResult.suggestedComponents[0]);
    expect(result.patterns).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'RulePattern' }),
        expect.objectContaining({ name: 'AIAnalysed', details: "AI analysis contributed" })
    ]));
  });

  it('should return merged results from AI cache (cache hit)', async () => {
    mockMemCacheManager.retrieve.mockResolvedValue(aiSuggestions); // Cache hit

    const result = await engineWithAICapableRecognizer.analyzeDataStructure({ data: 'test' });

    expect(mockMemCacheManager.retrieve).toHaveBeenCalled();
    expect(mockAIRecognizer.analyzeWithAI).not.toHaveBeenCalled();
    expect(result.suggestedComponents).toContainEqual(aiSuggestions.componentSuggestions![0]);
  });

  it('should fallback to rule-based results if AI analysis returns an error object', async () => {
    mockMemCacheManager.retrieve.mockResolvedValue(undefined); // Cache miss
    mockAIRecognizer.analyzeWithAI.mockResolvedValue({ error: 'AI failed', rawResponse: "Failure details" });

    const result = await engineWithAICapableRecognizer.analyzeDataStructure({ data: 'test' });

    expect(mockAIRecognizer.analyzeWithAI).toHaveBeenCalled();
    expect(result.suggestedComponents).toEqual(ruleBasedResult.suggestedComponents); // Only rule-based components
    expect(result.patterns).toEqual(expect.arrayContaining([ // Should still indicate AI was attempted
        expect.objectContaining({ name: 'RulePattern' }),
        expect.objectContaining({ name: 'AIAnalysed', details: "AI analysis attempted" })
    ]));
  });

  it('should fallback to rule-based results if AI analysis returns no suggestions', async () => {
    mockMemCacheManager.retrieve.mockResolvedValue(undefined);
    mockAIRecognizer.analyzeWithAI.mockResolvedValue({ componentSuggestions: [], rawResponse: "Empty suggestions" });

    const result = await engineWithAICapableRecognizer.analyzeDataStructure({ data: 'test' });
    expect(result.suggestedComponents).toEqual(ruleBasedResult.suggestedComponents);
    expect(result.patterns).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'RulePattern' }),
        expect.objectContaining({ name: 'AIAnalysed', details: "AI analysis attempted" }) // Or "No suggestions from AI"
    ]));
  });

  it('should fallback to rule-based if AI throws an exception', async () => {
    mockMemCacheManager.retrieve.mockResolvedValue(undefined);
    mockAIRecognizer.analyzeWithAI.mockRejectedValue(new Error('Network Error'));

    const result = await engineWithAICapableRecognizer.analyzeDataStructure({ data: 'test' });
    expect(result.suggestedComponents).toEqual(ruleBasedResult.suggestedComponents);
     expect(result.patterns).toEqual(expect.arrayContaining([ // AI was attempted
        expect.objectContaining({ name: 'RulePattern' }),
        expect.objectContaining({ name: 'AIAnalysed', details: "AI analysis attempted" })
    ]));
  });

  // Test delegation of other methods
  ['recognizePatterns', 'inferDataTypes', 'findRelationships', 'suggestVisualizations'].forEach(rawMethodName => {
    it(`should delegate ${rawMethodName} to ruleBasedEngine`, () => {
      const methodName = rawMethodName as keyof RuleBasedDataAnalysisEngine & keyof HybridAnalysisEngine;
      (mockRuleBasedEngine[methodName] as jest.Mock).mockReturnValueOnce(`called ${methodName}` as any);
      const currentEngine = new HybridAnalysisEngine(mockRuleBasedEngine, mockAIRecognizer, mockMemCacheManager, true);

      let callArgs: any[] = [];
      if (methodName === 'suggestVisualizations') {
        callArgs = [ruleBasedResult]; // suggestVisualizations takes analysis
      } else {
        callArgs = [{data: 'test'}]; // others take data, potentially also a context
      }

      const result = (currentEngine[methodName] as Function).apply(currentEngine, callArgs);
      expect(mockRuleBasedEngine[methodName]).toHaveBeenCalledWith(...callArgs);
      expect(result).toBe(`called ${methodName}`);
    });
  });
});
