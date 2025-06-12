import { createHtmlResource } from '@mcp-ui/server';
import type { HtmlResourceBlock } from '@mcp-ui/server';
import type { DataAnalysisEngine, DataStructureAnalysis } from '@auto-ui/analyzer';
import type { UISchemaGenerator, UISchema, UIMetadata } from '@auto-ui/core';

/**
 * Basic AutoUIServer implementation that analyzes data and
 * generates a UI schema which is returned as an HtmlResourceBlock.
 */
export class AutoUIServer {
  constructor(
    private analyzer: DataAnalysisEngine,
    private generator: UISchemaGenerator,
  ) {}

  async generateAutoUI(
    data: unknown,
    metadata?: UIMetadata,
  ): Promise<HtmlResourceBlock> {
    const analysis: DataStructureAnalysis = await Promise.resolve(
      this.analyzer.analyzeDataStructure(data),
    );
    const schema: UISchema = await Promise.resolve(
      this.generator.generateSchema(analysis, metadata),
    );
    return createHtmlResource({
      uri: 'ui://auto-generated',
      content: { type: 'rawHtml', htmlString: JSON.stringify(schema) },
      delivery: 'text',
    });
  }
}

export default AutoUIServer;
