// packages/@auto-ui/analyzer/src/HybridAnalysisEngine.ts
import type {
  DataAnalysisEngine,
  DataStructureAnalysis,
  ComponentSuggestion,
  PatternMatch,
  TypeInferenceResult,
  RelationshipMap,
  VisualizationSuggestion,
  AnalysisContext
} from '@auto-ui/core';
import { RuleBasedDataAnalysisEngine } from './index'; // Use barrel export
import { AIPatternRecognizerService, AIComponentAnalysisResult } from './ai/AIPatternRecognizerService';
import { RedisCacheManager } from './cache/redis_cache_manager';
import { MemoryCacheManager } from '@auto-ui/server'; // Keep MemoryCacheManager from server for now
import type { CacheManager } from '@auto-ui/core'; // Import CacheManager from core

export class HybridAnalysisEngine implements DataAnalysisEngine {
  private ruleBasedEngine: RuleBasedDataAnalysisEngine;
  private aiRecognizer?: AIPatternRecognizerService;
  private aiCacheManager: CacheManager; // Initialized with a default
  private useAI: boolean;
  private aiCacheManagerReady: Promise<boolean>; // Tracks readiness of preferred cache


  constructor(
      ruleBasedEngine?: RuleBasedDataAnalysisEngine,
      aiRecognizer?: AIPatternRecognizerService,
      aiCacheManager?: CacheManager,
      forceEnableAI: boolean = true // Allow forcing AI on/off for testing/config
    ) {
    this.ruleBasedEngine = ruleBasedEngine || new RuleBasedDataAnalysisEngine();

    // Initialize AI Recognizer, it will internally handle OpenAIGPTService
    this.aiRecognizer = aiRecognizer || new AIPatternRecognizerService();

    // Initialize with a default cache manager synchronously
    this.aiCacheManager = new MemoryCacheManager(); // Default to memory cache
    console.log("HybridAnalysisEngine: Initialized with MemoryCacheManager for AI results.");

    if (aiCacheManager) { // If a cache manager is injected, use it
        this.aiCacheManager = aiCacheManager;
        this.aiCacheManagerReady = (this.aiCacheManager as any)?.isReady?.() || Promise.resolve(true);
        console.log("HybridAnalysisEngine: Using injected AI CacheManager.");
    } else if (process.env.REDIS_URL) { // Only try Redis if REDIS_URL is set
        const redisCacheInstance = new RedisCacheManager();
        this.aiCacheManagerReady = redisCacheInstance.isReady().then(isRedisReady => {
            if (isRedisReady) {
                console.log("HybridAnalysisEngine: Switched to RedisCacheManager for AI results.");
                this.aiCacheManager = redisCacheInstance; // Switch to Redis
                return true;
            } else {
                console.log("HybridAnalysisEngine: Redis not available/configured, staying with MemoryCacheManager for AI results.");
                redisCacheInstance.disconnect().catch(err => console.error("Error disconnecting standby Redis:", err));
                return true; // Stays with MemoryCacheManager which is ready
            }
        }).catch(error => {
            console.error("HybridAnalysisEngine: Error during Redis readiness check. Staying with MemoryCacheManager.", error);
            return true; // Stays with MemoryCacheManager which is ready
        });
    } else {
        // No injected cache manager and no REDIS_URL, already using MemoryCacheManager
        this.aiCacheManagerReady = Promise.resolve(true);
    }

    // Determine if AI should be used. This relies on the AI Recognizer's service client being configured.
    // The actual OpenAIGPTService has an isConfigured method.
    // We need to ensure aiRecognizer and its potential internal client are initialized before this check.
    // For simplicity, assuming aiRecognizer.aiServiceClient.isConfigured() is accessible and works.
    // This check might need to be async if isConfigured itself becomes async.
    if (this.aiRecognizer && typeof (this.aiRecognizer as any).aiServiceClient?.isConfigured === 'function') {
        this.useAI = forceEnableAI && (this.aiRecognizer as any).aiServiceClient.isConfigured();
    } else {
        // If aiRecognizer or its service client structure is not as expected, disable AI.
        this.useAI = false;
    }

    if (forceEnableAI && !this.useAI) {
        console.warn("HybridAnalysisEngine: AI was requested, but AI Recognizer or its OpenAI service client is not configured. AI features will be disabled.");
    } else if (this.useAI) {
        console.log("HybridAnalysisEngine: AI features are enabled.");
    } else {
        console.log("HybridAnalysisEngine: AI features are disabled (no recognizer, or OpenAI service not configured/requested).");
    }
  }

  async analyzeDataStructure(data: any, _context?: AnalysisContext): Promise<DataStructureAnalysis> {
    console.log("HybridAnalysisEngine: Starting analysis."); // General log
    const ruleBasedAnalysis = await this.ruleBasedEngine.analyzeDataStructure(data, _context); // Await this call

    if (!this.useAI || !this.aiRecognizer) {
      console.log("HybridAnalysisEngine: AI disabled or not configured, returning rule-based analysis.");
      return ruleBasedAnalysis;
    }

    await this.aiCacheManagerReady; // Ensure cache manager selection is complete

    const dataSampleForCacheKey = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const aiCacheKey = `ai-analysis:${dataSampleForCacheKey.substring(0, 2000)}`;
    let statAiCacheHit = false; // For conceptual metric tracking

    try {
      const cachedAIResult = await this.aiCacheManager.retrieve<AIComponentAnalysisResult>(aiCacheKey);
      if (cachedAIResult) {
        console.log(`HybridAnalysisEngine: AI analysis result found in cache for key: ${aiCacheKey}`);
        statAiCacheHit = true;
        // METRIC_POINT: Increment aiAnalysisCacheHits
        return this.mergeAnalyses(ruleBasedAnalysis, cachedAIResult);
      }
    } catch (cacheError) {
        console.error("HybridAnalysisEngine: Error retrieving from AI cache for key:", aiCacheKey, cacheError);
    }

    // METRIC_POINT: Increment aiAnalysisCacheMisses if !statAiCacheHit (conceptual location)
    if (!statAiCacheHit) {
        console.log(`HybridAnalysisEngine: AI analysis result not in cache for key: ${aiCacheKey}. Calling AI.`);
        // METRIC_POINT: Increment aiAnalysisAttempts (conceptual location)
    }


    if (this.aiRecognizer) {
        const startTime = Date.now();
        try {
            // METRIC_POINT: Increment aiAnalysisAttempts (actual location if not cached)
            console.log("HybridAnalysisEngine: Calling AI for enhanced analysis (attempt)...");
            const aiAnalysisResult = await this.aiRecognizer.analyzeWithAI(data);
            const duration = Date.now() - startTime;
            // METRIC_POINT: Record AIAnalysisTimeMs = duration

            if (aiAnalysisResult && !aiAnalysisResult.error && aiAnalysisResult.componentSuggestions && aiAnalysisResult.componentSuggestions.length > 0) {
                // METRIC_POINT: Increment aiAnalysisSuccesses
                console.log(`HybridAnalysisEngine: AI analysis successful (took ${duration}ms). Caching result.`);
                await this.aiCacheManager.store(aiCacheKey, aiAnalysisResult, 3600 * 24); // Cache for 24 hours
                return this.mergeAnalyses(ruleBasedAnalysis, aiAnalysisResult);
            } else {
                // METRIC_POINT: Increment aiAnalysisFailures
                console.warn(`HybridAnalysisEngine: AI analysis did not return valid suggestions or had an error (took ${duration}ms). Error: ${aiAnalysisResult?.error || "No suggestions returned"}`);
            }
        } catch (aiError) {
            // METRIC_POINT: Increment aiAnalysisFailures
            const duration = Date.now() - startTime;
            console.error(`HybridAnalysisEngine: Error during AI analysis (took ${duration}ms):`, aiError);
        }
    }
    // Fallback
    console.log("HybridAnalysisEngine: Fallback to rule-based analysis after AI attempt.");
    return ruleBasedAnalysis;
  }

  private mergeAnalyses(
    ruleBased: DataStructureAnalysis,
    aiResult: AIComponentAnalysisResult
  ): DataStructureAnalysis {
    let mergedSuggestions = [...ruleBased.suggestedComponents];

    if (aiResult.componentSuggestions && aiResult.componentSuggestions.length > 0) {
      const ruleBasedComponentTypes = new Set(ruleBased.suggestedComponents.map(c => c.component));
      aiResult.componentSuggestions.forEach(aiSuggestion => {
        if (!ruleBasedComponentTypes.has(aiSuggestion.component)) {
          mergedSuggestions.push(aiSuggestion);
        } else {
          console.log(`HybridAnalysisEngine: AI suggested existing component type "${aiSuggestion.component}", rule-based version kept.`);
        }
      });
    }

    return {
      ...ruleBased,
      suggestedComponents: mergedSuggestions,
      patterns: [...ruleBased.patterns, { name: 'AIAnalysed', confidence: 0.9, details: aiResult.rawResponse ? "AI analysis contributed" : "AI analysis attempted" }],
    };
  }

  recognizePatterns(data: any, context?: AnalysisContext): PatternMatch[] {
    return this.ruleBasedEngine.recognizePatterns(data, context);
  }

  inferDataTypes(data: any): TypeInferenceResult {
    return this.ruleBasedEngine.inferDataTypes(data);
  }

  findRelationships(data: any): RelationshipMap {
    return this.ruleBasedEngine.findRelationships(data);
  }

  suggestVisualizations(analysis: DataStructureAnalysis): VisualizationSuggestion[] {
    return this.ruleBasedEngine.suggestVisualizations(analysis);
  }
}
