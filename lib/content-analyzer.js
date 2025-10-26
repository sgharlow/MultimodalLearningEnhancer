/**
 * ContentAnalyzer - Analyzes content structure and type
 * Determines optimal diagram type and extracts key concepts
 */

class ContentAnalyzer {
  constructor() {
    // Keywords and patterns for content type detection
    this.patterns = {
      // Sequential/process indicators
      sequential: [
        /step \d+/i,
        /first(ly)?[,\s]/i,
        /second(ly)?[,\s]/i,
        /third(ly)?[,\s]/i,
        /then[,\s]/i,
        /next[,\s]/i,
        /finally[,\s]/i,
        /process/i,
        /procedure/i,
        /algorithm/i,
        /how to/i,
        /tutorial/i
      ],

      // Temporal/historical indicators
      temporal: [
        /\d{4}/,  // Years
        /in \d{4}/i,
        /century/i,
        /timeline/i,
        /history/i,
        /historical/i,
        /era/i,
        /period/i,
        /before/i,
        /after/i,
        /during/i,
        /evolution/i,
        /development/i
      ],

      // Hierarchical/concept indicators
      hierarchical: [
        /concept/i,
        /theory/i,
        /principle/i,
        /philosophy/i,
        /relationship/i,
        /connected/i,
        /related/i,
        /depends/i,
        /hierarchy/i,
        /structure/i,
        /overview/i,
        /introduction/i
      ],

      // Code/technical indicators
      technical: [
        /code/i,
        /function/i,
        /class/i,
        /method/i,
        /api/i,
        /programming/i,
        /syntax/i,
        /implementation/i
      ]
    };
  }

  /**
   * Analyze content and determine optimal visualization
   * @param {Object} extraction - Extracted content object
   * @returns {Object} Analysis results
   */
  analyze(extraction) {
    const { content, title, metadata } = extraction;

    const analysis = {
      // Content characteristics
      contentType: this.determineContentType(content, title),
      complexity: this.assessComplexity(content),
      structure: this.analyzeStructure(content),

      // Diagram recommendation
      recommendedDiagram: null,
      diagramConfidence: 0,

      // Key elements
      mainTopics: this.extractMainTopics(content),
      keyTerms: this.extractKeyTerms(content),
      concepts: this.extractConcepts(content),

      // Temporal elements
      hasTemporalElements: this.detectTemporalElements(content),
      temporalMarkers: this.extractTemporalMarkers(content),

      // Structural features
      hasSequentialSteps: this.detectSequentialSteps(content),
      hasHierarchy: this.detectHierarchy(content),
      hasComparisons: this.detectComparisons(content),

      // Technical features
      hasTechnicalContent: this.detectTechnicalContent(content),
      codeBlocksCount: 0
    };

    // Determine optimal diagram type
    const diagramRecommendation = this.recommendDiagramType(analysis);
    analysis.recommendedDiagram = diagramRecommendation.type;
    analysis.diagramConfidence = diagramRecommendation.confidence;

    console.log('Content analysis complete:', {
      type: analysis.contentType,
      diagram: analysis.recommendedDiagram,
      confidence: analysis.diagramConfidence
    });

    return analysis;
  }

  /**
   * Determine content type
   * @param {string} content - Content text
   * @param {string} title - Content title
   * @returns {string} Content type
   */
  determineContentType(content, title) {
    const combined = (title + ' ' + content).toLowerCase();

    const scores = {
      tutorial: 0,
      historical: 0,
      conceptual: 0,
      technical: 0,
      general: 0
    };

    // Check for tutorial indicators
    if (this.matchesPatterns(combined, this.patterns.sequential)) {
      scores.tutorial += 3;
    }

    // Check for historical indicators
    if (this.matchesPatterns(combined, this.patterns.temporal)) {
      scores.historical += 3;
    }

    // Check for conceptual indicators
    if (this.matchesPatterns(combined, this.patterns.hierarchical)) {
      scores.conceptual += 2;
    }

    // Check for technical indicators
    if (this.matchesPatterns(combined, this.patterns.technical)) {
      scores.technical += 2;
    }

    // Return highest scoring type
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'general';

    return Object.entries(scores)
      .find(([type, score]) => score === maxScore)[0];
  }

  /**
   * Check if text matches any patterns
   * @param {string} text - Text to check
   * @param {Array} patterns - Array of regex patterns
   * @returns {number} Number of matches
   */
  matchesPatterns(text, patterns) {
    return patterns.reduce((count, pattern) => {
      return count + (pattern.test(text) ? 1 : 0);
    }, 0);
  }

  /**
   * Assess content complexity
   * @param {string} content - Content text
   * @returns {string} Complexity level (simple, medium, complex)
   */
  assessComplexity(content) {
    const wordCount = Utils.wordCount(content);
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentences;

    // Simple heuristics
    if (wordCount < 300 || avgWordsPerSentence < 15) {
      return 'simple';
    } else if (wordCount < 1000 || avgWordsPerSentence < 25) {
      return 'medium';
    } else {
      return 'complex';
    }
  }

  /**
   * Analyze content structure
   * @param {string} content - Content text
   * @returns {string} Structure type
   */
  analyzeStructure(content) {
    if (this.detectSequentialSteps(content)) {
      return 'sequential';
    } else if (this.detectHierarchy(content)) {
      return 'hierarchical';
    } else if (this.detectTemporalElements(content)) {
      return 'temporal';
    } else {
      return 'flat';
    }
  }

  /**
   * Detect sequential steps in content
   * @param {string} content - Content text
   * @returns {boolean} True if sequential
   */
  detectSequentialSteps(content) {
    const sequentialMarkers = [
      /step \d+/i,
      /\d+\.\s/,  // Numbered lists
      /first[,\s]/i,
      /then[,\s]/i,
      /next[,\s]/i,
      /finally[,\s]/i
    ];

    const matches = sequentialMarkers.reduce((count, pattern) => {
      const found = content.match(pattern);
      return count + (found ? found.length : 0);
    }, 0);

    return matches >= 3;
  }

  /**
   * Detect temporal/historical elements
   * @param {string} content - Content text
   * @returns {boolean} True if temporal
   */
  detectTemporalElements(content) {
    const yearMatches = content.match(/\b\d{4}\b/g);
    const temporalWords = this.matchesPatterns(content.toLowerCase(), this.patterns.temporal);

    return (yearMatches && yearMatches.length >= 3) || temporalWords >= 5;
  }

  /**
   * Detect hierarchical structure
   * @param {string} content - Content text
   * @returns {boolean} True if hierarchical
   */
  detectHierarchy(content) {
    // Look for nested concepts, definitions, relationships
    const hierarchyIndicators = [
      /consists? of/i,
      /includes?/i,
      /contains?/i,
      /composed of/i,
      /made up of/i,
      /subdivided into/i,
      /category/i,
      /type of/i
    ];

    return this.matchesPatterns(content, hierarchyIndicators) >= 3;
  }

  /**
   * Detect comparisons in content
   * @param {string} content - Content text
   * @returns {boolean} True if has comparisons
   */
  detectComparisons(content) {
    const comparisonWords = [
      /versus/i,
      /vs\.?/i,
      /compared to/i,
      /in contrast/i,
      /whereas/i,
      /however/i,
      /on the other hand/i,
      /unlike/i,
      /similar to/i,
      /different from/i
    ];

    return this.matchesPatterns(content, comparisonWords) >= 3;
  }

  /**
   * Detect technical/code content
   * @param {string} content - Content text
   * @returns {boolean} True if technical
   */
  detectTechnicalContent(content) {
    return this.matchesPatterns(content.toLowerCase(), this.patterns.technical) >= 3;
  }

  /**
   * Extract temporal markers (years, dates, events)
   * @param {string} content - Content text
   * @returns {Array} Array of temporal markers
   */
  extractTemporalMarkers(content) {
    const markers = [];

    // Extract years
    const years = content.match(/\b\d{4}\b/g);
    if (years) {
      markers.push(...years.map(year => ({ type: 'year', value: year })));
    }

    // Extract date-like phrases
    const datePatterns = [
      /in \d{4}/gi,
      /during the \w+/gi,
      /\w+ century/gi
    ];

    datePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        markers.push(...matches.map(m => ({ type: 'date', value: m })));
      }
    });

    return markers;
  }

  /**
   * Extract main topics from content
   * @param {string} content - Content text
   * @returns {Array} Array of main topics
   */
  extractMainTopics(content) {
    // Simple extraction: look for capitalized phrases and repeated terms
    const sentences = content.split(/[.!?]+/);

    // Get first few sentences (likely contain main topics)
    const introSentences = sentences.slice(0, 3).join('. ');

    // Extract capitalized phrases (potential topics)
    const capitalizedPhrases = introSentences.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];

    // Get unique topics
    const topics = [...new Set(capitalizedPhrases)]
      .filter(phrase => phrase.length > 3)
      .slice(0, 5);

    return topics;
  }

  /**
   * Extract key terms from content
   * @param {string} content - Content text
   * @returns {Array} Array of key terms
   */
  extractKeyTerms(content) {
    // Extract words that appear multiple times and are significant
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 5); // Only longer words

    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get top 10 most frequent terms
    const keyTerms = Object.entries(frequency)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return keyTerms;
  }

  /**
   * Extract concepts from content
   * @param {string} content - Content text
   * @returns {Array} Array of concepts
   */
  extractConcepts(content) {
    // Look for patterns that indicate definitions or concepts
    const conceptPatterns = [
      /(\w+) is (?:a|an|the) /gi,
      /(\w+) refers to/gi,
      /(\w+) means/gi,
      /the concept of (\w+)/gi
    ];

    const concepts = [];

    conceptPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 3) {
          concepts.push(match[1]);
        }
      }
    });

    // Return unique concepts
    return [...new Set(concepts)].slice(0, 10);
  }

  /**
   * Recommend diagram type based on analysis
   * @param {Object} analysis - Content analysis
   * @returns {Object} Diagram recommendation with confidence
   */
  recommendDiagramType(analysis) {
    const scores = {
      flowchart: 0,
      mindmap: 0,
      timeline: 0
    };

    // Flowchart scoring
    if (analysis.hasSequentialSteps) scores.flowchart += 40;
    if (analysis.hasTechnicalContent) scores.flowchart += 30;
    if (analysis.structure === 'sequential') scores.flowchart += 20;
    if (analysis.contentType === 'tutorial') scores.flowchart += 30;

    // Timeline scoring
    if (analysis.hasTemporalElements) scores.timeline += 50;
    if (analysis.temporalMarkers.length >= 3) scores.timeline += 30;
    if (analysis.contentType === 'historical') scores.timeline += 40;
    if (analysis.structure === 'temporal') scores.timeline += 20;

    // Mind map scoring
    if (analysis.hasHierarchy) scores.mindmap += 30;
    if (analysis.concepts.length >= 5) scores.mindmap += 30;
    if (analysis.contentType === 'conceptual') scores.mindmap += 30;
    if (analysis.structure === 'hierarchical') scores.mindmap += 20;
    if (analysis.hasComparisons) scores.mindmap += 20;

    // Default to mindmap if no clear winner
    if (Math.max(...Object.values(scores)) === 0) {
      scores.mindmap = 50;
    }

    // Get highest scoring type
    const maxScore = Math.max(...Object.values(scores));
    const recommended = Object.entries(scores)
      .find(([type, score]) => score === maxScore);

    return {
      type: recommended[0],
      confidence: Math.min(maxScore / 100, 1.0), // Normalize to 0-1
      scores: scores
    };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ContentAnalyzer = ContentAnalyzer;
}
