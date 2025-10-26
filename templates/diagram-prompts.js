/**
 * Diagram Prompt Templates for Visual Generation
 * Optimized for generating Mermaid.js syntax
 */

const DiagramPrompts = {
  /**
   * Flowchart generation prompts
   * For processes, algorithms, step-by-step content
   */
  flowchart: {
    systemPrompt: 'You are an expert at creating clear, logical flowcharts using Mermaid.js syntax. Your flowcharts help users understand processes and algorithms visually.',

    template: (content, analysis) => `
Create a flowchart diagram in Mermaid.js syntax from this content.

CONTENT:
${content}

REQUIREMENTS:
- Use Mermaid flowchart syntax (graph TD or graph LR)
- Include all major steps or decision points
- Use appropriate shapes:
  - Rectangles [text] for processes
  - Diamonds{text} for decisions
  - Rounded rectangles([text]) for start/end
- Connect nodes with arrows -->
- Keep labels concise but clear
- Maximum 15 nodes for readability
- Use logical flow (top-to-bottom or left-to-right)

OUTPUT ONLY VALID MERMAID CODE, NO EXPLANATION.

Example format:
graph TD
    A([Start]) --> B[Step 1]
    B --> C{Decision?}
    C -->|Yes| D[Action A]
    C -->|No| E[Action B]
    D --> F([End])
    E --> F
    `.trim(),

    fallbackTemplate: (keyPoints) => `
Create a simple flowchart showing these key steps:
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

Use Mermaid flowchart syntax (graph TD).
Output only the Mermaid code.
    `.trim()
  },

  /**
   * Mind map / Concept map generation prompts
   * For hierarchical and interconnected concepts
   */
  mindmap: {
    systemPrompt: 'You are an expert at creating mind maps that show relationships between concepts using Mermaid.js syntax. Your mind maps help users understand how ideas connect.',

    template: (content, analysis) => `
Create a mind map diagram in Mermaid.js syntax from this content.

CONTENT:
${content}

KEY CONCEPTS IDENTIFIED:
${analysis.concepts ? analysis.concepts.slice(0, 10).join(', ') : 'Not specified'}

REQUIREMENTS:
- Use Mermaid mindmap syntax
- Start with central topic/concept
- Branch into main categories
- Include sub-concepts and details
- Show hierarchical relationships
- Maximum 20 nodes total
- Keep labels short and clear
- Organize logically by topic

OUTPUT ONLY VALID MERMAID CODE, NO EXPLANATION.

Example format:
mindmap
  root((Central Topic))
    Main Category 1
      Sub-concept A
      Sub-concept B
    Main Category 2
      Sub-concept C
        Detail 1
        Detail 2
    Main Category 3
      Sub-concept D
    `.trim(),

    fallbackTemplate: (mainTopics, concepts) => `
Create a mind map with:
- Central topic: ${mainTopics[0] || 'Main Topic'}
- Main branches: ${mainTopics.slice(1, 5).join(', ')}
- Sub-concepts: ${concepts.slice(0, 8).join(', ')}

Use Mermaid mindmap syntax.
Output only the Mermaid code.
    `.trim()
  },

  /**
   * Timeline generation prompts
   * For historical, sequential, chronological content
   */
  timeline: {
    systemPrompt: 'You are an expert at creating timelines that show chronological events using Mermaid.js syntax. Your timelines help users understand historical progression and sequences.',

    template: (content, analysis) => `
Create a timeline diagram in Mermaid.js syntax from this content.

CONTENT:
${content}

TEMPORAL MARKERS FOUND:
${analysis.temporalMarkers ? analysis.temporalMarkers.slice(0, 10).map(m => m.value).join(', ') : 'Extract from content'}

REQUIREMENTS:
- Use Mermaid timeline syntax
- Extract chronological events or periods
- Include dates/years when available
- Order events chronologically
- Maximum 15 events
- Keep descriptions concise
- Group related events in sections if applicable

OUTPUT ONLY VALID MERMAID CODE, NO EXPLANATION.

Example format:
timeline
    title Historical Timeline
    section Period 1
      1900 : Event description
      1905 : Another event
    section Period 2
      1910 : Major event
      1915 : Important milestone
    `.trim(),

    fallbackTemplate: (temporalMarkers) => `
Create a timeline from these chronological markers:
${temporalMarkers.map(m => `${m.value}: Event`).join('\n')}

Use Mermaid timeline syntax.
Output only the Mermaid code.
    `.trim()
  },

  /**
   * Get appropriate prompt based on diagram type
   */
  getPrompt(diagramType, content, analysis) {
    const prompts = {
      flowchart: this.flowchart,
      mindmap: this.mindmap,
      timeline: this.timeline
    };

    const selected = prompts[diagramType] || prompts.flowchart;

    return {
      systemPrompt: selected.systemPrompt,
      userPrompt: selected.template(content, analysis)
    };
  },

  /**
   * Get fallback prompt when main generation fails
   */
  getFallbackPrompt(diagramType, analysis) {
    switch (diagramType) {
      case 'flowchart':
        const points = analysis.mainTopics || ['Step 1', 'Step 2', 'Step 3'];
        return this.flowchart.fallbackTemplate(points);

      case 'mindmap':
        const topics = analysis.mainTopics || ['Main Topic'];
        const concepts = analysis.concepts || ['Concept 1', 'Concept 2'];
        return this.mindmap.fallbackTemplate(topics, concepts);

      case 'timeline':
        const markers = analysis.temporalMarkers || [{value: '2024'}];
        return this.timeline.fallbackTemplate(markers);

      default:
        return this.flowchart.fallbackTemplate(['Start', 'Process', 'End']);
    }
  },

  /**
   * Common Mermaid syntax patterns for validation
   */
  syntaxPatterns: {
    flowchart: /^graph\s+(TD|LR|TB|RL)/m,
    mindmap: /^mindmap/m,
    timeline: /^timeline/m
  },

  /**
   * Validate Mermaid syntax
   */
  validateSyntax(mermaidCode, expectedType) {
    const pattern = this.syntaxPatterns[expectedType];
    if (!pattern) return true; // Unknown type, assume valid

    return pattern.test(mermaidCode);
  },

  /**
   * Fix common Mermaid syntax errors
   */
  fixCommonErrors(mermaidCode) {
    let fixed = mermaidCode;

    // Remove markdown code fences if present
    fixed = fixed.replace(/```mermaid\n?/g, '');
    fixed = fixed.replace(/```\n?/g, '');

    // Remove extra whitespace
    fixed = fixed.trim();

    // Ensure graph type is specified for flowcharts
    if (fixed.includes('-->') && !fixed.match(/^graph\s+/m)) {
      fixed = 'graph TD\n' + fixed;
    }

    // Fix common node syntax issues
    // Ensure brackets are balanced
    fixed = fixed.replace(/\[([^\]]+)$/gm, '[$1]');
    fixed = fixed.replace(/\{([^\}]+)$/gm, '{$1}');
    fixed = fixed.replace(/\(([^\)]+)$/gm, '($1)');

    return fixed;
  },

  /**
   * Extract Mermaid code from AI response
   */
  extractMermaidCode(response) {
    // If response contains code fences, extract content
    const codeBlockMatch = response.match(/```(?:mermaid)?\n?([\s\S]+?)\n?```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Otherwise, return as-is
    return response.trim();
  },

  /**
   * Simplify diagram if too complex
   */
  simplifyDiagram(mermaidCode, maxNodes = 15) {
    const lines = mermaidCode.split('\n');
    const headerLines = lines.filter(line =>
      line.trim().startsWith('graph') ||
      line.trim().startsWith('mindmap') ||
      line.trim().startsWith('timeline') ||
      line.trim().startsWith('title') ||
      line.trim().startsWith('section')
    );

    const contentLines = lines.filter(line =>
      !headerLines.includes(line) && line.trim()
    );

    // If not too many lines, return as-is
    if (contentLines.length <= maxNodes) {
      return mermaidCode;
    }

    // Take header + first maxNodes content lines
    const simplified = [
      ...headerLines,
      ...contentLines.slice(0, maxNodes)
    ].join('\n');

    return simplified;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.DiagramPrompts = DiagramPrompts;
}

// Also export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagramPrompts;
}
