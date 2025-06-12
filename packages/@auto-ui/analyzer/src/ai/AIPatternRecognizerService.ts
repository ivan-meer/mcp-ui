// packages/@auto-ui/analyzer/src/ai/AIPatternRecognizerService.ts
import type {
  AIPatternRecognizer,
  UISchema,
  ComponentSuggestion,
  UserFeedback, // Import the new UserFeedback type from core
  PatternClassification // Import PatternClassification from core
} from '@auto-ui/core';
// AIServiceClient.getCompletion signature was updated, so AI_PROMPTS is now the first arg
import { AIServiceClient, OpenAIGPTService, AI_PROMPTS } from './openai_service';
import * as tf from '@tensorflow/tfjs-node'; // Import TensorFlow.js


export interface AIComponentAnalysisResult {
  componentSuggestions?: ComponentSuggestion[];
  error?: string;
  rawResponse?: string | null;
}

// PatternClassification is now imported from @auto-ui/core.
// UserFeedback is now imported from @auto-ui/core.

export interface ABTestResult { // This could also be moved to core if it's a stable part of the interface
    variantAPerformance: any;
    variantBPerformance: any;
    winner?: 'A' | 'B';
}


export class AIPatternRecognizerService implements AIPatternRecognizer {
  private aiServiceClient: AIServiceClient;
  // private localModel: tf.LayersModel | tf.GraphModel | null = null; // Placeholder for a loaded model

  constructor(aiServiceClient?: AIServiceClient) {
    this.aiServiceClient = aiServiceClient || new OpenAIGPTService();
    // this.loadLocalModel(); // Potentially load model during construction
  }

  // analyzeWithAI updated to match interface:
  async analyzeWithAI(data: any, promptKey: string = 'DATA_ANALYSIS'): Promise<AIComponentAnalysisResult> {
    // Validate if promptKey is a known key
    if (!(promptKey in AI_PROMPTS)) {
      console.error(`AI Prompt for key "${promptKey}" not found or is not a valid predefined prompt key.`);
      return { error: `Prompt key "${promptKey}" not found or invalid.` };
    }
    const typedPromptKey = promptKey as keyof typeof AI_PROMPTS; // Cast to specific type after validation
    const promptTemplate = AI_PROMPTS[typedPromptKey];
    // No need to check promptTemplate again after 'in' operator check

    // The openai_service.getCompletion now handles placeholder substitution
    // For DATA_ANALYSIS prompt, only 'data' is needed.
    // For others like LAYOUT_OPTIMIZATION, 'schemaContext' would be passed instead of 'data'
    // or both if the prompt expects it.
    const rawResponse = await this.aiServiceClient.getCompletion(promptTemplate, data, null); // Pass null for schemaContext for DATA_ANALYSIS

    if (rawResponse === null || typeof rawResponse !== 'string') {
      return { error: "Failed to get a valid string response from AI service or service not configured.", rawResponse: rawResponse };
    }

    try {
      const parsedResponse = JSON.parse(rawResponse);

      if (parsedResponse && Array.isArray(parsedResponse.componentSuggestions)) {
        const validSuggestions = parsedResponse.componentSuggestions.filter(
          (sug: any): sug is ComponentSuggestion =>
            sug &&
            typeof sug.component === 'string' &&
            typeof sug.confidence === 'number' && (sug.confidence >= 0 && sug.confidence <=1) &&
            typeof sug.reasoning === 'string' &&
            typeof sug.props === 'object' // Basic check for props object
            // Optionally, validate sug.alternatives if present
        );
        if (validSuggestions.length !== parsedResponse.componentSuggestions.length) {
            console.warn("AIPatternRecognizerService: Some AI component suggestions were malformed or incomplete and filtered out.");
        }
        return { componentSuggestions: validSuggestions, rawResponse };
      } else {
        console.warn("AIPatternRecognizerService: AI response for component suggestions was not in the expected format (e.g., missing 'componentSuggestions' array). Raw response:", rawResponse);
        return { error: "AI response for component suggestions was not in the expected format.", rawResponse };
      }
    } catch (error) {
      console.error("AIPatternRecognizerService: Failed to parse AI response as JSON. Raw response:", rawResponse, error);
      return { error: "Failed to parse AI response as JSON.", rawResponse };
    }
  }

  // learnFromFeedback and runABTest remain the same as updated in previous step
  async learnFromFeedback(feedback: UserFeedback): Promise<void> {
    console.log("AIPatternRecognizerService: Received user feedback:", JSON.stringify(feedback, null, 2));
    return Promise.resolve();
  }

  async runABTest(data: any, variants: UISchema[]): Promise<ABTestResult> {
    console.warn("AIPatternRecognizerService: runABTest is not implemented yet.", { data, variants });
    return Promise.resolve({
        variantAPerformance: { score: 0, details: "Variant A (not implemented)" },
        variantBPerformance: { score: 0, details: "Variant B (not implemented)" },
        winner: undefined
    });
  }

  // Updated classifyDataPattern
  async classifyDataPattern(data: any): Promise<PatternClassification> {
    console.log("AIPatternRecognizerService: classifyDataPattern called.", data);

    // Conceptual TensorFlow.js integration:
    // if (!this.localModel) {
    //   console.warn("Local TF.js model not loaded. Skipping TF.js classification.");
    //   return { patternName: 'unknown_tfjs_model_not_loaded', confidence: 0, modelUsed: 'none' };
    // }
    // try {
    //   // 1. Preprocess 'data' into a tensor suitable for the model
    //   // const inputTensor = tf.tensor(preprocessData(data)); // Example
    //   // 2. Make a prediction
    //   // const prediction = this.localModel.predict(inputTensor) as tf.Tensor;
    //   // const predictionData = await prediction.data();
    //   // 3. Postprocess the prediction to PatternClassification format
    //   // const result = postprocessPrediction(predictionData);
    //   // tf.dispose([inputTensor, prediction]); // Dispose tensors
    //   // return { ...result, modelUsed: 'tfjs' };
    //   console.log("TF.js model prediction would happen here.");
    // } catch (error) {
    //   console.error("Error during TF.js pattern classification:", error);
    //   return { patternName: 'error_tfjs_classification', confidence: 0, details: (error as Error).message, modelUsed: 'tfjs' };
    // }

    // Fallback or default behavior if no TF.js model is used/successful
    return {
      patternName: 'unknown_tfjs_not_implemented',
      confidence: 0,
      details: 'Local TF.js classification logic is a placeholder.',
      modelUsed: 'none',
    };
  }

  // private async loadLocalModel(): Promise<void> {
  //   try {
  //     // Example: Load a pre-trained model (replace with actual path/URL)
  //     // this.localModel = await tf.loadLayersModel('file://path/to/your/model.json');
  //     // Or: this.localModel = await tf.loadGraphModel('file://path/to/your/model.json');
  //     console.log("Local TF.js model would be loaded here.");
  //   } catch (error) {
  //     console.error("Failed to load local TF.js model:", error);
  //     this.localModel = null;
  //   }
  // }
}
