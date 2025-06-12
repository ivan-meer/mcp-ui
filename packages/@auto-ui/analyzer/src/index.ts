import type {
  DataAnalysisEngine,
  DataStructureAnalysis,
  FieldTypeMap,
  DetectedPattern,
  ComponentSuggestion,
  PatternMatch,
  TypeInferenceResult,
  RelationshipMap,
  VisualizationSuggestion,
  AnalysisContext,
  ComponentProps,
  ComponentType
} from '@auto-ui/core';

export class RuleBasedDataAnalysisEngine implements DataAnalysisEngine {
  async analyzeDataStructure(data: any, _context?: AnalysisContext): Promise<DataStructureAnalysis> {
    // TODO: Use context if available for more nuanced rule-based analysis in future
    const dataType = this.determineDataType(data);
    let fieldTypes: FieldTypeMap = {};
    let nestingLevel = 0;
    let recordCount = 0;
    let patterns: DetectedPattern[] = [];
    let suggestedComponents: ComponentSuggestion[] = [];

    if (dataType === 'array') {
      recordCount = data.length;
      if (data.length > 0) {
        // Analyze the first item to infer structure, assuming homogeneity for now
        const firstItemAnalysis = await this.analyzeDataStructure(data[0], _context);
        // Now that firstItemAnalysis is awaited, its properties can be accessed.
        fieldTypes = firstItemAnalysis.fieldTypes;
        nestingLevel = firstItemAnalysis.nestingLevel;

        // Simple pattern: if all items are objects with similar keys
        if (data.every((item: any) => typeof item === 'object' && item !== null)) {
            patterns.push({ name: 'ListOfObjects', confidence: 0.7 });
            suggestedComponents.push({
                component: 'AutoTable',
                confidence: 0.8,
                reasoning: 'Data is an array of objects.',
                props: { data } as ComponentProps // Type assertion
            });
        } else {
            // If it's an array but not of objects (e.g., array of primitives)
            patterns.push({ name: 'ListOfPrimitives', confidence: 0.7 });
            suggestedComponents.push({
                component: 'AutoList' as ComponentType, // Suggest a list for arrays of primitives
                confidence: 0.8,
                reasoning: 'Data is an array of primitives.',
                props: { items: data } as ComponentProps
            });
        }
      }
    } else if (dataType === 'object') {
      fieldTypes = this.inferObjectFieldTypes(data);
      nestingLevel = this.calculateObjectNestingLevel(data, 1);
      patterns.push({ name: 'SimpleObject', confidence: 0.7 });
      suggestedComponents.push({
        component: 'AutoForm', // Suggest a form for a single object
        confidence: 0.7,
        reasoning: 'Data is a single object, suitable for a form or detail view.',
        props: { initialData: data } as ComponentProps // Type assertion
      });
    } else if (dataType === 'primitive') {
      fieldTypes = { value: { type: typeof data } };
      nestingLevel = 0;
      patterns.push({ name: 'PrimitiveValue', confidence: 0.9 });
       suggestedComponents.push({
        component: 'DisplayValue' as ComponentType, // Assuming a generic display component
        confidence: 0.7,
        reasoning: 'Data is a primitive value.',
        props: { value: data } as ComponentProps
      });
    }

    return {
      dataType,
      complexity: this.determineComplexity(recordCount, Object.keys(fieldTypes).length, nestingLevel),
      recordCount,
      fieldTypes,
      nestingLevel,
      patterns,
      suggestedComponents,
    };
  }

  recognizePatterns(data: any, _context?: AnalysisContext): PatternMatch[] {
    const matches: PatternMatch[] = [];
    if (Array.isArray(data) && data.length > 0) {
      if (data.every(item => typeof item === 'object' && item !== null && item.hasOwnProperty('id') && item.hasOwnProperty('name'))) {
        matches.push({
          patternName: 'ListOfIdentifiableNamedObjects',
          confidence: 0.7,
          matchedData: data.slice(0, 5), // Example subset
          suggestedInterpretation: 'Likely a list of entities for display in a table or list.'
        });
      }
    }
    // Add more rule-based pattern recognitions here
    return matches;
  }

  inferDataTypes(data: any): TypeInferenceResult {
    const result: TypeInferenceResult = {};
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
              let inferredType: string = typeof value;
          let confidence = 0.7; // Base confidence for typeof

              if (value === null) inferredType = 'null';
          else if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z?$/.test(value)) {
                  inferredType = 'date'; // More specific: 'datetime-iso'
              confidence = 0.9;
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                  inferredType = 'date';
              confidence = 0.9;
            }
          }
              result[key] = { type: inferredType, confidence };
        }
      }
    }
    return result;
  }

  findRelationships(_data: any): RelationshipMap {
    // Basic placeholder: In a real scenario, this would involve analyzing keys,
    // naming conventions (e.g., customerId referencing a Customer entity), etc.
    return {};
  }

  suggestVisualizations(analysis: DataStructureAnalysis): VisualizationSuggestion[] {
    const suggestions: VisualizationSuggestion[] = [];
    if (analysis.dataType === 'array' && analysis.recordCount > 0) {
      // Check if there are numeric fields suitable for a chart
      const numericFields = Object.entries(analysis.fieldTypes)
        .filter(([_key, value]) => value.type === 'number')
        .map(([key, _value]) => key);

      if (numericFields.length > 0) {
        suggestions.push({
          chartType: 'bar', // Default suggestion
          dataMapping: {
            // Attempt to map first string field as x-axis and first numeric as y-axis
            xAxis: Object.keys(analysis.fieldTypes).find(key => analysis.fieldTypes[key].type === 'string'),
            yAxis: numericFields[0]
          },
          confidence: 0.6,
          reasoning: 'Array data with numeric fields can be visualized as a bar chart.'
        });
        suggestions.push({
          chartType: 'line',
          dataMapping: {
            xAxis: Object.keys(analysis.fieldTypes).find(key => analysis.fieldTypes[key].type === 'string'),
            yAxis: numericFields[0]
          },
          confidence: 0.5,
          reasoning: 'Array data with numeric fields can also be visualized as a line chart.'
        });
      }
       if (analysis.suggestedComponents.some(c => c.component === 'AutoTable')) {
         suggestions.push({
            chartType: 'table',
            dataMapping: {}, // Table typically shows all data
            confidence: 0.9,
            reasoning: 'Data is suitable for a table display.'
         });
       }
    }
    return suggestions;
  }

  // --- Helper methods ---
  private determineDataType(data: any): 'array' | 'object' | 'primitive' {
    if (Array.isArray(data)) return 'array';
    if (typeof data === 'object' && data !== null) return 'object';
    return 'primitive';
  }

  private inferObjectFieldTypes(obj: object): FieldTypeMap {
    const fieldTypes: FieldTypeMap = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as any)[key];
            let determinedType = this.determineDataType(value);
            let finalType: string;
            if (determinedType === 'primitive') {
              finalType = typeof value as string; // Get specific primitive type
            } else {
              finalType = determinedType;
        }
            fieldTypes[key] = { type: finalType };
      }
    }
    return fieldTypes;
  }

  private calculateObjectNestingLevel(obj: any, currentLevel: number): number {
    let maxLevel = currentLevel;
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    maxLevel = Math.max(maxLevel, this.calculateObjectNestingLevel(obj[key], currentLevel + 1));
                }
            }
        }
    } else if (Array.isArray(obj) && obj.length > 0) {
         // If it's an array, check nesting of its elements
         for (const item of obj) {
            maxLevel = Math.max(maxLevel, this.calculateObjectNestingLevel(item, currentLevel +1));
         }
    }
    return maxLevel;
  }

  private determineComplexity(recordCount: number, fieldCount: number, nestingLevel: number): 'simple' | 'medium' | 'complex' {
    if (nestingLevel > 3 || fieldCount > 20 || recordCount > 1000) return 'complex';
    if (nestingLevel > 1 || fieldCount > 10 || recordCount > 100) return 'medium';
    return 'simple';
  }
}

export * from './ai/openai_service';
export * from './ai/AIPatternRecognizerService';
export * from './cache/redis_cache_manager';
export * from './HybridAnalysisEngine'; // Add this line
