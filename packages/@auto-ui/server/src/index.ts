// packages/@auto-ui/server/src/index.ts

// Core types (ensure these are correctly imported or aliased)
import type {
  DataAnalysisEngine,
  UISchemaGenerator, // This will now be satisfied by BasicUISchemaGenerator
  UISchema,
  UIMetadata as CoreUIMetadata, // Using the one from @auto-ui/core
  ComponentType,
  LayoutPreferences,
  DataStructureAnalysis,
  ComponentSuggestion,
  // ... any other necessary types from @auto-ui/core
} from '@auto-ui/core';

// Actual implementations
import { HybridAnalysisEngine } from '@auto-ui/analyzer'; // Import HybridAnalysisEngine
import { BasicUISchemaGenerator } from '@auto-ui/generators'; // Import the actual generator

// Server-specific types and mock TaskManagerServer (keep these as they were)

export class TaskManagerServer {
    protected resources: Map<string, any>;
    constructor() {
        this.resources = new Map();
    }
    protected createHtmlResource(content: string | UISchema, id?: string): HtmlResourceBlock {
        const blockId = id || `res_${Math.random().toString(36).substr(2, 9)}`;
        const isSchema = typeof content !== 'string';
        const resource: HtmlResourceBlock = {
            id: blockId,
            type: isSchema ? 'ui_schema' : 'html_string', // Clarified type based on content
            content: isSchema ? JSON.stringify(content, null, 2) : content,
            metadata: {
                createdAt: new Date().toISOString(),
                generator: '@auto-ui/server',
                schemaVersion: isSchema ? (content as UISchema).version : undefined
            }
        };
        this.resources.set(blockId, resource);
        return resource;
    }
}
export interface HtmlResourceBlock {
    id: string;
    type: 'html_string' | 'ui_schema' | string; // Clarified html to html_string
    content: string;
    metadata?: { [key: string]: any; createdAt?: string; generator?: string; schemaVersion?: string; };
    dependencies?: string[];
}

// Server-specific UIMetadata for tool configuration.
// It can be similar to CoreUIMetadata or diverge if needed.
// For now, aligning more closely with CoreUIMetadata for consistency.
export interface UIMetadata {
  title?: string;
  description?: string;
  preferredComponents?: ComponentType[]; // Aligned with CoreUIMetadata
  layoutPreferences?: LayoutPreferences; // Aligned with CoreUIMetadata
  businessRules?: BusinessRule[];
  userPermissions?: Permission[];
  customizations?: CustomizationRule[];
}

export interface BusinessRule { id: string; name: string; condition: string; action: string; params?: any; }
export interface Permission { role: string; resource: string; level: 'read' | 'write' | 'execute' | 'none'; }
export interface CustomizationRule { id: string; target: { componentId?: string; componentType?: ComponentType; dataPath?: string; }; property: string; value: any; condition?: string; }
export interface GenerationContext { userId?: string; sessionId?: string; clientInfo?: { userAgent?: string; ipAddress?: string; }; [key: string]: any; }
// CacheManager interface is now imported from @auto-ui/core
import type { CacheManager } from '@auto-ui/core';

export class MemoryCacheManager implements CacheManager {
    private cache: Map<string, { value: any, expiresAt?: number }> = new Map();
    async isReady(): Promise<boolean> { return true; } // Memory cache is always ready
    async store(key: string, value: any, ttl?: number): Promise<void> { const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined; this.cache.set(key, { value, expiresAt }); }
    async retrieve<T = any>(key: string): Promise<T | undefined> { const entry = this.cache.get(key); if (!entry) return undefined; if (entry.expiresAt && entry.expiresAt < Date.now()) { this.cache.delete(key); return undefined; } return entry.value as T; }
    async delete(key: string): Promise<boolean> { return this.cache.delete(key); }
    async has(key: string): Promise<boolean> { const entry = this.cache.get(key); if (!entry) return false; if (entry.expiresAt && entry.expiresAt < Date.now()) { this.cache.delete(key); return false; } return true; }
}
 export interface AutoUIToolConfig { toolId: string; description?: string; defaultMetadata?: UIMetadata; [key: string]: any; } // Uses server UIMetadata
 export interface GenerationMetrics {
  totalGenerations: number;
  successfulGenerations: number; // Added for clarity
  failedGenerations: number;   // Added for clarity
  averageTimeMs: number;       // Average time for successful generations

  // Cache metrics for final UISchema results (already implicitly covered by AutoUIServer's cache)
  uiSchemaCacheHits: number;
  uiSchemaCacheMisses: number;

  // New AI-specific metrics
  aiAnalysisAttempts: number;    // Number of times AI analysis was attempted
  aiAnalysisSuccesses: number; // Number of successful AI analyses (got a usable response)
  aiAnalysisFailures: number;  // Number of AI analyses that failed or returned unusable response
  averageAIAnalysisTimeMs?: number; // Average time for successful AI analyses
  aiAnalysisCacheHits: number;   // For AI-specific cache (e.g., Redis)
  aiAnalysisCacheMisses: number; // For AI-specific cache

  // Breakdown of component suggestions
  ruleBasedSuggestionsCount?: number;
  aiSuggestionsCount?: number;
  mergedSuggestionsCount?: number; // Total after merging
}


// --- AutoUIServer implementation ---
export class AutoUIServer extends TaskManagerServer {
  private analyzer: DataAnalysisEngine;
  private generator: UISchemaGenerator; // This type is from @auto-ui/core
  private cache: CacheManager;

  constructor(
    analyzer?: DataAnalysisEngine,
    generator?: UISchemaGenerator, // Type from @auto-ui/core
    cacheManager?: CacheManager
  ) {
    super();
    this.analyzer = analyzer || new HybridAnalysisEngine();
    // Use the actual BasicUISchemaGenerator from @auto-ui/generators
    this.generator = generator || new BasicUISchemaGenerator();
    this.cache = cacheManager || new MemoryCacheManager();
  }

  async generateAutoUI(
    data: any,
    metadata?: CoreUIMetadata, // Use UIMetadata from @auto-ui/core for this method
    context?: GenerationContext
  ): Promise<HtmlResourceBlock> {
    const cacheKeyObject = { data, metadata, context }; // Consider more stable stringification for data object
    const cacheKey = `auto-ui-schema:${JSON.stringify(cacheKeyObject)}`;

    try {
      const cachedSchema = await this.cache.retrieve<UISchema>(cacheKey);
      if (cachedSchema) {
        // console.log("AutoUIServer: Returning cached UI schema");
        return this.createHtmlResource(cachedSchema, `res_cached_${Date.now()}`);
      }

      // console.log("AutoUIServer: Analyzing data structure...");
      const analysis = await this.analyzer.analyzeDataStructure(data, context);

      // console.log("AutoUIServer: Generating UI schema with BasicUISchemaGenerator...");
      const schema = this.generator.generateSchema(analysis, metadata);

      // console.log("AutoUIServer: Storing UI schema in cache...");
      await this.cache.store(cacheKey, schema, 3600); // Cache for 1 hour

      return this.createHtmlResource(schema, `res_new_${Date.now()}`);
    } catch (error) {
      console.error("Error during AutoUI generation:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.createHtmlResource(
        JSON.stringify({ error: "Failed to generate UI", details: errorMessage }),
        `res_error_${Date.now()}` // This will be 'html_string' type
      );
    }
  }

  // registerAutoUITool and other methods remain the same
  registerAutoUITool(toolName: string, config: AutoUIToolConfig): void { // AutoUIToolConfig uses server UIMetadata
    console.log(`Registering AutoUI tool: ${toolName}`, config);
  }

  enableRealTimeUpdates(toolName: string): void {
    console.log(`Enabling real-time updates for: ${toolName}`);
  }

  getGenerationMetrics(): GenerationMetrics {
    // console.log("Retrieving generation metrics (now with AI placeholders)...");
    // This is still a placeholder. Actual implementation requires tracking these values.
    return {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageTimeMs: 0,
      uiSchemaCacheHits: 0,
      uiSchemaCacheMisses: 0,
      aiAnalysisAttempts: 0,
      aiAnalysisSuccesses: 0,
      aiAnalysisFailures: 0,
      averageAIAnalysisTimeMs: 0,
      aiAnalysisCacheHits: 0,
      aiAnalysisCacheMisses: 0,
      ruleBasedSuggestionsCount: 0,
      aiSuggestionsCount: 0,
      mergedSuggestionsCount: 0,
    };
  }
}
