/**
 * TextTransformer - Transform content into summaries and study notes
 * Uses Chrome AI APIs (Summarizer, Writer, Rewriter)
 */

class TextTransformer {
  constructor(chromeAI) {
    this.chromeAI = chromeAI;
    this.prompts = window.TextPrompts;
  }

  /**
   * Generate bullet point summary
   * Uses Summarizer API for quick, structured summaries
   */
  async generateBulletPoints(extraction, options = {}) {
    try {
      console.log('[TextTransformer] Generating bullet points...');

      const { content, title, metadata } = extraction;

      // Use Summarizer API for bullet points
      const summary = await this.chromeAI.summarize(content, {
        type: 'key-points',
        format: 'markdown',
        length: options.length || 'medium',
        context: title
      });

      // Format as bullet points
      const formatted = this.prompts.formatBulletPoints(summary);

      const result = {
        type: 'bullet-points',
        title: title,
        content: formatted,
        metadata: {
          originalLength: content.length,
          summaryLength: formatted.length,
          compressionRatio: (formatted.length / content.length).toFixed(2),
          wordCount: Utils.wordCount(formatted),
          readingTime: Utils.estimateReadingTime(formatted),
          generatedAt: Date.now()
        }
      };

      console.log('[TextTransformer] Bullet points generated:', {
        points: formatted.split('\n').length,
        compression: result.metadata.compressionRatio
      });

      return result;

    } catch (error) {
      console.error('[TextTransformer] Failed to generate bullet points:', error);

      // Provide helpful context
      if (error.message.includes('API')) {
        throw error; // Re-throw API errors with their detailed messages
      }

      throw new Error(`Bullet point generation failed: ${error.message}\n\nThis may happen if the content is too short, too long, or the AI model is busy. Try:\n- Selecting different content\n- Refreshing the page\n- Waiting a moment and trying again`);
    }
  }

  /**
   * Generate comprehensive study notes
   * Uses Writer API with custom prompt for structured notes
   */
  async generateStudyNotes(extraction, analysis, options = {}) {
    try {
      console.log('[TextTransformer] Generating study notes...');

      const { content, title, metadata } = extraction;

      // First, create a summary to work with (if content is very long)
      let workingContent = content;
      if (content.length > 10000) {
        console.log('[TextTransformer] Content too long, summarizing first...');
        const summary = await this.chromeAI.summarize(content, {
          type: 'key-points',
          length: 'long'
        });
        workingContent = summary;
      }

      // Use Prompt API (Language Model) for structured study notes
      // Writer API is better for creative writing, Prompt API for structured output
      const prompt = this.prompts.studyNotes.template(workingContent, {
        title,
        wordCount: metadata?.wordCount,
        readingTime: metadata?.readingTime
      });

      const notes = await this.chromeAI.prompt(prompt, {
        systemPrompt: this.prompts.studyNotes.systemPrompt,
        temperature: 0.7
      });

      // Format and clean notes
      const formatted = this.prompts.formatStudyNotes(notes);

      // Add key terms section if we have analysis
      let enhancedNotes = formatted;
      if (analysis && analysis.keyTerms && analysis.keyTerms.length > 0) {
        enhancedNotes += '\n\n## 🔑 Key Terms\n';
        enhancedNotes += analysis.keyTerms.slice(0, 8).map(term => `- **${term}**`).join('\n');
      }

      const result = {
        type: 'study-notes',
        title: title,
        content: enhancedNotes,
        metadata: {
          originalLength: content.length,
          notesLength: enhancedNotes.length,
          wordCount: Utils.wordCount(enhancedNotes),
          readingTime: Utils.estimateReadingTime(enhancedNotes),
          keyTermsIncluded: analysis?.keyTerms?.length || 0,
          generatedAt: Date.now()
        },
        structure: this.analyzeNotesStructure(enhancedNotes)
      };

      console.log('[TextTransformer] Study notes generated:', {
        sections: result.structure.sections,
        length: result.metadata.notesLength
      });

      return result;

    } catch (error) {
      console.error('[TextTransformer] Failed to generate study notes:', error);

      // Fallback to simpler approach
      console.log('[TextTransformer] Attempting fallback study notes generation...');
      return await this.generateStudyNotesFallback(extraction, analysis);
    }
  }

  /**
   * Fallback study notes generation using Summarizer API
   */
  async generateStudyNotesFallback(extraction, analysis) {
    try {
      const { content, title } = extraction;

      // Use summarizer for overview
      const overview = await this.chromeAI.summarize(content, {
        type: 'key-points',
        length: 'medium'
      });

      // Build basic structured notes
      let notes = `## 📚 Overview\n${overview}\n\n`;

      // Add key concepts if available
      if (analysis.concepts && analysis.concepts.length > 0) {
        notes += '## 🎯 Key Concepts\n';
        notes += analysis.concepts.slice(0, 8).map(concept => `- ${concept}`).join('\n');
        notes += '\n\n';
      }

      // Add key terms
      if (analysis.keyTerms && analysis.keyTerms.length > 0) {
        notes += '## 🔑 Key Terms\n';
        notes += analysis.keyTerms.slice(0, 8).map(term => `- **${term}**`).join('\n');
      }

      return {
        type: 'study-notes',
        title: title,
        content: notes,
        metadata: {
          originalLength: content.length,
          notesLength: notes.length,
          wordCount: Utils.wordCount(notes),
          readingTime: Utils.estimateReadingTime(notes),
          generatedAt: Date.now(),
          fallback: true
        },
        structure: this.analyzeNotesStructure(notes)
      };

    } catch (error) {
      console.error('[TextTransformer] Fallback also failed:', error);
      throw new Error('Unable to generate study notes. Both primary and fallback generation methods failed.\n\nThis usually means:\n- The AI model is unavailable or busy\n- The content format is incompatible\n- The page needs to be refreshed\n\nTry refreshing the page and selecting different content.');
    }
  }

  /**
   * Generate Cornell Notes format
   * Popular note-taking system for students with cue column and summary
   */
  async generateCornellNotes(extraction, analysis, options = {}) {
    try {
      console.log('[TextTransformer] Generating Cornell Notes...');

      const { content, title, metadata } = extraction;

      // Summarize first if content is very long
      let workingContent = content;
      if (content.length > 10000) {
        console.log('[TextTransformer] Content too long, summarizing first...');
        const summary = await this.chromeAI.summarize(content, {
          type: 'key-points',
          length: 'long'
        });
        workingContent = summary;
      }

      // Use Prompt API for Cornell Notes structure
      const prompt = this.prompts.cornellNotes.template(workingContent, {
        title,
        wordCount: metadata?.wordCount,
        readingTime: metadata?.readingTime
      });

      const notes = await this.chromeAI.prompt(prompt, {
        systemPrompt: this.prompts.cornellNotes.systemPrompt,
        temperature: 0.7
      });

      // Format Cornell notes
      const formatted = this.prompts.formatCornellNotes(notes);

      const result = {
        type: 'cornell-notes',
        title: title,
        content: formatted,
        metadata: {
          originalLength: content.length,
          notesLength: formatted.length,
          wordCount: Utils.wordCount(formatted),
          readingTime: Utils.estimateReadingTime(formatted),
          generatedAt: Date.now()
        },
        structure: this.analyzeCornellStructure(formatted)
      };

      console.log('[TextTransformer] Cornell Notes generated:', {
        cuePairs: result.structure.cuePairs,
        hasSummary: result.structure.hasSummary
      });

      return result;

    } catch (error) {
      console.error('[TextTransformer] Failed to generate Cornell Notes:', error);

      // Fallback to simplified Cornell format
      console.log('[TextTransformer] Attempting fallback Cornell Notes generation...');
      return await this.generateCornellNotesFallback(extraction, analysis);
    }
  }

  /**
   * Fallback Cornell Notes generation
   */
  async generateCornellNotesFallback(extraction, analysis) {
    try {
      const { content, title } = extraction;

      // Use simpler prompt for fallback
      const fallbackPrompt = this.prompts.cornellNotes.fallbackPrompt(content);
      const notes = await this.chromeAI.prompt(fallbackPrompt, {
        temperature: 0.7
      });

      const formatted = this.prompts.formatCornellNotes(notes);

      return {
        type: 'cornell-notes',
        title: title,
        content: formatted,
        metadata: {
          originalLength: content.length,
          notesLength: formatted.length,
          wordCount: Utils.wordCount(formatted),
          readingTime: Utils.estimateReadingTime(formatted),
          generatedAt: Date.now(),
          fallback: true
        },
        structure: this.analyzeCornellStructure(formatted)
      };

    } catch (error) {
      console.error('[TextTransformer] Fallback Cornell Notes failed:', error);
      throw new Error('Unable to generate Cornell Notes. Both primary and fallback generation methods failed.\n\nThis usually means:\n- The AI model is unavailable or busy\n- The Prompt API is not enabled (required for Cornell Notes)\n- The content format is incompatible\n\nTry:\n1. Refreshing the page\n2. Ensuring chrome://flags/#prompt-api-for-gemini-nano is enabled\n3. Selecting different content');
    }
  }

  /**
   * Analyze structure of Cornell Notes
   */
  analyzeCornellStructure(notes) {
    const structure = {
      cuePairs: 0,
      hasSummary: false
    };

    // Count cue/note pairs (look for | separator)
    const pairMatches = notes.match(/\*\*[^*]+\*\*\s*\|/g);
    structure.cuePairs = pairMatches ? pairMatches.length : 0;

    // Check for summary section
    structure.hasSummary = notes.includes('Summary') || notes.includes('📌');

    return structure;
  }

  /**
   * Generate summary (generic wrapper)
   */
  async generateSummary(extraction, options = {}) {
    try {
      console.log('[TextTransformer] Generating summary...');

      const { content, title } = extraction;
      const length = options.length || 'standard';

      const summaryOptions = this.prompts.summary[length] || this.prompts.summary.standard;

      const summary = await this.chromeAI.summarize(content, {
        type: summaryOptions.type,
        length: summaryOptions.length,
        context: title
      });

      return {
        type: 'summary',
        title: title,
        content: summary,
        metadata: {
          originalLength: content.length,
          summaryLength: summary.length,
          compressionRatio: (summary.length / content.length).toFixed(2),
          wordCount: Utils.wordCount(summary),
          readingTime: Utils.estimateReadingTime(summary),
          level: length,
          generatedAt: Date.now()
        }
      };

    } catch (error) {
      console.error('[TextTransformer] Failed to generate summary:', error);
      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehension questions (bonus feature)
   */
  async generateComprehensionQuestions(summary, level = 'intermediate') {
    try {
      const prompt = this.prompts.comprehensionQuestions.template(summary, level);

      const questions = await this.chromeAI.prompt(prompt, {
        temperature: 0.8 // Higher temperature for more varied questions
      });

      return questions;

    } catch (error) {
      console.error('[TextTransformer] Failed to generate questions:', error);
      return null; // Non-critical failure
    }
  }

  /**
   * Analyze structure of generated notes
   */
  analyzeNotesStructure(notes) {
    const structure = {
      sections: 0,
      subsections: 0,
      lists: 0,
      hasOverview: false,
      hasKeyConcepts: false,
      hasKeyTerms: false
    };

    // Count headers
    structure.sections = (notes.match(/^## /gm) || []).length;
    structure.subsections = (notes.match(/^### /gm) || []).length;

    // Count lists
    structure.lists = (notes.match(/^[-*•]/gm) || []).length;

    // Check for specific sections
    structure.hasOverview = /overview/i.test(notes);
    structure.hasKeyConcepts = /key concepts?|main (?:ideas?|points?)/i.test(notes);
    structure.hasKeyTerms = /key terms?|vocabulary|definitions?/i.test(notes);

    return structure;
  }

  /**
   * Transform content to specific reading level
   * Uses Rewriter API to adjust complexity
   */
  async adaptToLevel(content, targetLevel = 'undergraduate') {
    try {
      const levelOptions = this.prompts.adaptToLevel[targetLevel] || this.prompts.adaptToLevel.undergraduate;

      const adapted = await this.chromeAI.rewrite(content, {
        tone: levelOptions.tone,
        format: levelOptions.format
      });

      return adapted;

    } catch (error) {
      console.error('[TextTransformer] Failed to adapt level:', error);
      return content; // Return original if adaptation fails
    }
  }

  /**
   * Extract key terms and definitions
   */
  async extractKeyTerms(content) {
    try {
      const prompt = this.prompts.keyTerms.template(content);
      const terms = await this.chromeAI.prompt(prompt);
      return terms;
    } catch (error) {
      console.error('[TextTransformer] Failed to extract key terms:', error);
      return null;
    }
  }

  /**
   * Validate API availability before transforming
   */
  async checkAPIsAvailable() {
    const availability = await this.chromeAI.checkAvailability();

    if (!availability.summarizerAPI) {
      throw new Error('Chrome AI Summarizer API is required for text transformations.\n\nPlease ensure:\n1. You are using Chrome Dev/Canary (v128+)\n2. You have enabled chrome://flags/#summarization-api-for-gemini-nano\n3. You have downloaded the Gemini Nano model\n4. You have restarted Chrome\n\nFor detailed instructions, see docs/API_ENABLE_INSTRUCTIONS.md in the extension folder.');
    }

    if (!availability.promptAPI) {
      console.warn('[TextTransformer] Prompt API not available. Some features may be limited. Study Notes and Cornell Notes require the Prompt API.');
    }

    return availability;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.TextTransformer = TextTransformer;
}
