/**
 * DiagramGenerator - Generate Mermaid diagrams using Chrome AI
 * Creates flowcharts, mind maps, and timelines
 */

class DiagramGenerator {
  constructor(chromeAI) {
    this.chromeAI = chromeAI;
    this.prompts = window.DiagramPrompts;
  }

  /**
   * Generate diagram based on content and analysis
   */
  async generate(extraction, analysis, options = {}) {
    try {
      const { content, title } = extraction;
      const diagramType = options.diagramType || analysis.recommendedDiagram || 'flowchart';

      console.log(`[DiagramGenerator] Generating ${diagramType} diagram...`);

      // Prepare content for diagram generation
      const preparedContent = await this.prepareContent(content, diagramType);

      // Generate Mermaid code
      const mermaidCode = await this.generateMermaidCode(
        preparedContent,
        diagramType,
        analysis
      );

      // Validate and fix syntax
      const validatedCode = this.validateAndFix(mermaidCode, diagramType);

      // Simplify if too complex
      const finalCode = this.prompts.simplifyDiagram(validatedCode);

      const result = {
        type: 'visual',
        diagramType: diagramType,
        title: title,
        mermaidCode: finalCode,
        metadata: {
          originalLength: content.length,
          diagramLines: finalCode.split('\n').length,
          diagramType: diagramType,
          confidence: analysis.diagramConfidence || 0.5,
          generatedAt: Date.now()
        }
      };

      console.log('[DiagramGenerator] Diagram generated successfully:', {
        type: diagramType,
        lines: result.metadata.diagramLines
      });

      return result;

    } catch (error) {
      console.error('[DiagramGenerator] Failed to generate diagram:', error);

      // Provide helpful context based on error type
      if (error.message.includes('API')) {
        throw error; // Re-throw API errors with their detailed messages
      }

      throw new Error(`Diagram generation failed: ${error.message}\n\nThis may happen if:\n- The content structure is incompatible with the selected diagram type\n- The AI model is busy\n- The content is too complex\n\nTry:\n- Refreshing the page and trying again\n- Selecting different content\n- Using a different transformation type (like Summary or Study Notes)`);
    }
  }

  /**
   * Prepare content for diagram generation
   * Summarize if too long
   */
  async prepareContent(content, diagramType) {
    // If content is very long, summarize first
    if (content.length > 5000) {
      console.log('[DiagramGenerator] Content too long, summarizing first...');

      try {
        const summary = await this.chromeAI.summarize(content, {
          type: 'key-points',
          length: 'medium'
        });
        return summary;
      } catch (error) {
        console.warn('[DiagramGenerator] Summarization failed, using truncated content');
        return content.substring(0, 5000) + '...';
      }
    }

    return content;
  }

  /**
   * Generate Mermaid code using Prompt API
   */
  async generateMermaidCode(content, diagramType, analysis) {
    try {
      // Get appropriate prompt
      const { systemPrompt, userPrompt } = this.prompts.getPrompt(
        diagramType,
        content,
        analysis
      );

      console.log(`[DiagramGenerator] Prompting AI for ${diagramType}...`);

      // Generate using Prompt API
      const response = await this.chromeAI.prompt(userPrompt, {
        systemPrompt: systemPrompt,
        temperature: 0.5 // Lower temperature for more structured output
      });

      // Extract Mermaid code from response
      const mermaidCode = this.prompts.extractMermaidCode(response);

      if (!mermaidCode || mermaidCode.length < 20) {
        throw new Error('Generated diagram is too short or empty');
      }

      return mermaidCode;

    } catch (error) {
      console.error('[DiagramGenerator] Mermaid generation failed:', error);

      // Fallback to simpler prompt
      console.log('[DiagramGenerator] Attempting fallback generation...');
      return await this.generateFallback(diagramType, analysis);
    }
  }

  /**
   * Fallback diagram generation
   */
  async generateFallback(diagramType, analysis) {
    try {
      const fallbackPrompt = this.prompts.getFallbackPrompt(diagramType, analysis);

      const response = await this.chromeAI.prompt(fallbackPrompt, {
        temperature: 0.3
      });

      return this.prompts.extractMermaidCode(response);

    } catch (error) {
      console.error('[DiagramGenerator] Fallback also failed:', error);

      // Last resort: create basic diagram manually
      return this.createBasicDiagram(diagramType, analysis);
    }
  }

  /**
   * Create basic diagram manually (last resort)
   */
  createBasicDiagram(diagramType, analysis) {
    console.log('[DiagramGenerator] Creating basic diagram manually...');

    switch (diagramType) {
      case 'flowchart':
        return this.createBasicFlowchart(analysis);

      case 'mindmap':
        return this.createBasicMindmap(analysis);

      case 'timeline':
        return this.createBasicTimeline(analysis);

      default:
        return this.createBasicFlowchart(analysis);
    }
  }

  /**
   * Create basic flowchart
   */
  createBasicFlowchart(analysis) {
    const topics = analysis.mainTopics || ['Start', 'Process', 'End'];

    let flowchart = 'graph TD\n';
    flowchart += `    A([${topics[0] || 'Start'}])\n`;

    topics.slice(1).forEach((topic, index) => {
      const nodeId = String.fromCharCode(66 + index); // B, C, D, etc.
      const prevNodeId = String.fromCharCode(65 + index); // A, B, C, etc.

      if (index === topics.length - 2) {
        // Last node
        flowchart += `    ${prevNodeId} --> ${nodeId}([${topic}])\n`;
      } else {
        flowchart += `    ${prevNodeId} --> ${nodeId}[${topic}]\n`;
      }
    });

    return flowchart;
  }

  /**
   * Create basic mind map
   */
  createBasicMindmap(analysis) {
    const mainTopic = analysis.mainTopics?.[0] || 'Main Topic';
    const concepts = analysis.concepts || ['Concept 1', 'Concept 2', 'Concept 3'];

    let mindmap = 'mindmap\n';
    mindmap += `  root((${mainTopic}))\n`;

    concepts.slice(0, 6).forEach(concept => {
      mindmap += `    ${concept}\n`;
    });

    return mindmap;
  }

  /**
   * Create basic timeline
   */
  createBasicTimeline(analysis) {
    const markers = analysis.temporalMarkers || [];

    let timeline = 'timeline\n';
    timeline += '    title Timeline\n';
    timeline += '    section Events\n';

    if (markers.length > 0) {
      markers.slice(0, 10).forEach(marker => {
        timeline += `      ${marker.value} : Event\n`;
      });
    } else {
      timeline += '      2024 : Event 1\n';
      timeline += '      2025 : Event 2\n';
    }

    return timeline;
  }

  /**
   * Validate and fix Mermaid syntax
   */
  validateAndFix(mermaidCode, expectedType) {
    // Validate syntax
    const isValid = this.prompts.validateSyntax(mermaidCode, expectedType);

    if (!isValid) {
      console.warn('[DiagramGenerator] Invalid Mermaid syntax detected, attempting to fix...');
      return this.prompts.fixCommonErrors(mermaidCode);
    }

    return mermaidCode;
  }

  /**
   * Check if Prompt API is available
   */
  async checkAPIAvailable() {
    const availability = await this.chromeAI.checkAvailability();

    if (!availability.promptAPI) {
      throw new Error('Chrome AI Prompt API is required for diagram generation.\n\nPlease ensure:\n1. You are using Chrome Dev/Canary (v128+)\n2. You have enabled chrome://flags/#prompt-api-for-gemini-nano\n3. You have downloaded the Gemini Nano model\n4. You have restarted Chrome\n\nFor detailed instructions, see docs/API_ENABLE_INSTRUCTIONS.md in the extension folder.');
    }

    return true;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.DiagramGenerator = DiagramGenerator;
}
