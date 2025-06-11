export interface AnalysisContext {
  userPreferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface FieldTypeMap {
  [field: string]: string;
}

export interface PatternMatch {
  name: string;
  confidence: number;
  details?: string;
}

export interface TypeInferenceResult {
  fieldTypes: FieldTypeMap;
  confidence: number;
}

export interface RelationshipMap {
  [key: string]: string[];
}

export interface VisualizationSuggestion {
  type: string;
  reason: string;
  confidence: number;
}

export interface ComponentProps {
  [key: string]: unknown;
}

export interface DetectedPattern {
  pattern: string;
  confidence: number;
  description?: string;
}

export interface ComponentSuggestion {
  component: 'table' | 'form' | 'chart' | 'card' | 'dashboard' | 'list';
  confidence: number;
  reasoning: string;
  props: ComponentProps;
  alternatives?: ComponentSuggestion[];
}

export interface DataStructureAnalysis {
  dataType: 'array' | 'object' | 'primitive';
  complexity: 'simple' | 'medium' | 'complex';
  recordCount: number;
  fieldTypes: FieldTypeMap;
  nestingLevel: number;
  patterns: DetectedPattern[];
  suggestedComponents: ComponentSuggestion[];
}

export interface DataAnalysisEngine {
  analyzeDataStructure(data: unknown): Promise<DataStructureAnalysis> | DataStructureAnalysis;
  recognizePatterns(data: unknown, context?: AnalysisContext): Promise<PatternMatch[]> | PatternMatch[];
  inferDataTypes(data: unknown): Promise<TypeInferenceResult> | TypeInferenceResult;
  findRelationships(data: unknown): Promise<RelationshipMap> | RelationshipMap;
  suggestVisualizations(analysis: DataStructureAnalysis): Promise<VisualizationSuggestion[]> | VisualizationSuggestion[];
}
