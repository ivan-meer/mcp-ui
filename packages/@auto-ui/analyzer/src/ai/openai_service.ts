// packages/@auto-ui/analyzer/src/ai/openai_service.ts
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path'; // For resolving .env path

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  // Try to load .env from the package's root directory if it exists there for local dev
  dotenv.config({ path: path.resolve(process.cwd(), 'packages', '@auto-ui', 'analyzer', '.env') });
  // Fallback to root .env if not found in package, or let global .env take precedence
  if (!process.env.REDIS_URL && !process.env.OPENAI_API_KEY) { // Check if vars are set
      dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  }
}

export interface AIServiceClient {
  // Added schemaContext to the signature for prompts that might need it
  getCompletion(promptTemplate: string, data?: any, schemaContext?: any): Promise<string | null>;
}

export const AI_PROMPTS = {
  DATA_ANALYSIS: `
    Analyze the provided JSON data structure and suggest optimal UI components.
    Your response MUST be a valid JSON object.
    The JSON object should have a single root key "componentSuggestions".
    The value of "componentSuggestions" should be an array of objects.
    Each object in the "componentSuggestions" array must represent a UI component suggestion and include the following fields:
    - "component": string (A valid component type, e.g., "AutoTable", "AutoForm", "AutoCard", "AutoList", "DisplayValue", "AutoChart").
    - "confidence": number (A value between 0 and 1 indicating your confidence in the suggestion).
    - "reasoning": string (A brief explanation for why this component is suggested).
    - "props": object (Suggested initial props for the component. For example, for an "AutoTable", you might suggest a "dataKey" if the primary data is nested. For "AutoForm", suggest field definitions if inferable. For "AutoChart", suggest "chartType" and basic "dataMapping").
    - "alternatives": array (Optional. An array of alternative component suggestion objects, following the same structure).

    Consider data relationships, data types, array vs. object structures, potential user workflows, and opportunities for data visualization.
    Prioritize suggestions that are directly actionable and align with common UI patterns.
    For example, an array of objects typically maps to a table. A single complex object might map to a form or a detail card.
    An array of simple values might map to a list.
    Numerical data might suggest charts.

    Here is the JSON data to analyze:
    ---
    [DATA_PLACEHOLDER]
    ---
    Remember, your entire output must be a single, valid JSON object starting with { and ending with }.
  `,
  LAYOUT_OPTIMIZATION: `
    Given this UI schema (JSON format), optimize the layout for usability and accessibility.
    Consider: mobile-first design, information hierarchy, user flow, grouping of related items, and overall visual balance.
    Return your response as a valid JSON object with a root key "layoutSuggestions".
    The "layoutSuggestions" object should describe changes to the input UI schema's layout section or suggest new layout structures.
    It can include fields like:
    - "updatedLayout": object (The modified layout definition from the input schema).
    - "rationale": string (Explanation of the optimization choices).
    - "warnings": array (Optional. Potential issues with the proposed layout).

    UI Schema to optimize:
    ---
    [SCHEMA_PLACEHOLDER]
    ---
    Your entire output must be a single, valid JSON object.
  `,
  INTERACTION_DESIGN: `
    Design interaction patterns for the UI components described in the provided UI schema (JSON format), based on the underlying data structure.
    Consider actions like: filtering, searching, sorting, editing, pagination, drill-down, and bulk operations.
    Return your response as a valid JSON object with a root key "interactionSuggestions".
    The "interactionSuggestions" array should contain objects, each detailing an interaction:
    - "componentId": string (The ID of the component in the schema to apply this interaction to, or "global" for page-level interactions).
    - "interactionType": string (e.g., "filtering", "sorting", "pagination", "search").
    - "description": string (How the interaction should behave).
    - "suggestedControls": array (Optional. UI elements to trigger this interaction, e.g., a search input, sort buttons).
    - "affectedData": string (Optional. Which part of the data this interaction operates on).

    UI Schema and Data Context:
    ---
    Schema:
    [SCHEMA_PLACEHOLDER]
    Data (sample or structure summary):
    [DATA_PLACEHOLDER]
    ---
    Your entire output must be a single, valid JSON object.
  `,
};


export class OpenAIGPTService implements AIServiceClient {
  private openai: OpenAI;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn("OpenAI API key is not configured. AI Service will not function.");
    }
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  async getCompletion(promptTemplate: string, data?: any, schemaContext?: any): Promise<string | null> {
    if (!this.isConfigured()) {
      console.error("OpenAI Service is not configured with an API key.");
      return null;
    }

    let fullPrompt = promptTemplate;
    if (promptTemplate.includes("[DATA_PLACEHOLDER]")) {
        fullPrompt = fullPrompt.replace("[DATA_PLACEHOLDER]", data ? JSON.stringify(data, null, 2) : '{}');
    }
    if (promptTemplate.includes("[SCHEMA_PLACEHOLDER]")) {
        fullPrompt = fullPrompt.replace("[SCHEMA_PLACEHOLDER]", schemaContext ? JSON.stringify(schemaContext, null, 2) : '{}');
    }

    // Safety net if placeholders weren't in the template but data was provided for a generic prompt
    if (!promptTemplate.includes("[DATA_PLACEHOLDER]") && !promptTemplate.includes("[SCHEMA_PLACEHOLDER]") && data) {
         fullPrompt += `\n\nData context:\n${JSON.stringify(data, null, 2)}`;
    }

    const MAX_PROMPT_LENGTH = 15000;
    if (fullPrompt.length > MAX_PROMPT_LENGTH) {
        console.warn(`Prompt length (${fullPrompt.length}) exceeds max (${MAX_PROMPT_LENGTH}). Truncating.`);
        fullPrompt = fullPrompt.substring(0, MAX_PROMPT_LENGTH);
    }

    try {
      const chatCompletion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Or "gpt-4"
        messages: [{ role: "user", content: fullPrompt }],
        // For newer models that support it, to enforce JSON output:
        // response_format: { type: "json_object" },
      });
      return chatCompletion.choices[0]?.message?.content?.trim() || null;
    } catch (error: any) {
      if (error instanceof OpenAI.APIError) {
        console.error(`OpenAI API Error: ${error.status} ${error.name}`, error.message);
        console.error("Error details:", error.error);
      } else {
        console.error("Error calling OpenAI API:", error.message || error);
      }
      return null;
    }
  }
}
