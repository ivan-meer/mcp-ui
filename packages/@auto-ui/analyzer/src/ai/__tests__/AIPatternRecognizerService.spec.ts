// packages/@auto-ui/analyzer/src/ai/__tests__/AIPatternRecognizerService.spec.ts
import { AIPatternRecognizerService } from '../AIPatternRecognizerService';
import type { AIComponentAnalysisResult } from '../AIPatternRecognizerService'; // Import local if not from core yet
import { OpenAIGPTService, AIServiceClient, AI_PROMPTS } from '../openai_service'; // Correctly import AI_PROMPTS
import type { UserFeedback, UISchema } from '@auto-ui/core';

// Mock OpenAIGPTService
jest.mock('../openai_service', () => {
  const originalModule = jest.requireActual('../openai_service');
  return {
    ...originalModule, // Keep AI_PROMPTS and other exports
    OpenAIGPTService: jest.fn().mockImplementation(() => ({
      isConfigured: jest.fn(() => true), // Default to configured
      getCompletion: jest.fn(),
    })),
  };
});

describe('AIPatternRecognizerService', () => {
  let recognizer: AIPatternRecognizerService;
  let mockAIServiceClient: jest.Mocked<AIServiceClient>;

  beforeEach(() => {
    // Manually create a mock object that satisfies jest.Mocked<AIServiceClient>
    mockAIServiceClient = {
      getCompletion: jest.fn(),
    } as jest.Mocked<AIServiceClient>;
    recognizer = new AIPatternRecognizerService(mockAIServiceClient);
  });

  describe('analyzeWithAI', () => {
    const testData = { key: 'value' };

    it('should return component suggestions on successful AI response', async () => {
      const mockResponse = {
        componentSuggestions: [{ component: 'AutoCard', confidence: 0.9, reasoning: 'AI says so', props: {} }],
      };
      mockAIServiceClient.getCompletion.mockResolvedValue(JSON.stringify(mockResponse));
      // The analyzeWithAI in AIPatternRecognizerService.ts returns Promise<AIComponentAnalysisResult>
      // AIComponentAnalysisResult is defined locally in that file.
      const result: AIComponentAnalysisResult = await recognizer.analyzeWithAI(testData);

      // getCompletion is called with (promptTemplate, data, schemaContext)
      // For DATA_ANALYSIS, schemaContext is null
      expect(mockAIServiceClient.getCompletion).toHaveBeenCalledWith(AI_PROMPTS.DATA_ANALYSIS, testData, null);
      expect(result.componentSuggestions).toEqual(mockResponse.componentSuggestions);
      expect(result.error).toBeUndefined();
    });

    it('should return error if AI service returns null', async () => {
      mockAIServiceClient.getCompletion.mockResolvedValue(null);
      const result = await recognizer.analyzeWithAI(testData);
      expect(result.error).toContain('Failed to get a valid string response');
    });

    it('should return error if AI response is unparsable JSON', async () => {
      mockAIServiceClient.getCompletion.mockResolvedValue("not json");
      const result = await recognizer.analyzeWithAI(testData);
      expect(result.error).toContain('Failed to parse AI response as JSON');
      expect(result.rawResponse).toBe("not json");
    });

    it('should return error if AI response JSON does not match expected structure', async () => {
      mockAIServiceClient.getCompletion.mockResolvedValue(JSON.stringify({ wrongKey: [] }));
      const result = await recognizer.analyzeWithAI(testData);
      expect(result.error).toContain('AI response for component suggestions was not in the expected format');
    });

    it('should filter out malformed suggestions', async () => {
      const mockResponse = {
        componentSuggestions: [
          { component: 'AutoTable', confidence: 0.8, reasoning: 'Good one', props: {} }, // Valid
          { component: 'AutoList', confidence: 'high', reasoning: 'Typo in confidence', props: {} } // Invalid
        ],
      };
      mockAIServiceClient.getCompletion.mockResolvedValue(JSON.stringify(mockResponse));
      const result = await recognizer.analyzeWithAI(testData);
      expect(result.componentSuggestions?.length).toBe(1);
      expect(result.componentSuggestions?.[0].component).toBe('AutoTable');
    });
  });

  describe('placeholder methods', () => {
    it('classifyDataPattern should return default placeholder', async () => {
      // classifyDataPattern is async in implementation, matching core interface
      const result = await recognizer.classifyDataPattern({});
      expect(result.patternName).toBe('unknown_tfjs_not_implemented');
    });
    it('learnFromFeedback should resolve', async () => {
      const feedback: UserFeedback = { timestamp: new Date().toISOString(), uiSchemaIdentifier: { version: "1" } };
      await expect(recognizer.learnFromFeedback(feedback)).resolves.toBeUndefined();
    });
    it('runABTest should return default placeholder', async () => {
      const result = await recognizer.runABTest({}, []);
      expect(result.winner).toBeUndefined();
    });
  });
});
