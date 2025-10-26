/**
 * Chrome Built-in AI APIs Wrapper
 * Provides unified interface for Prompt, Summarizer, Writer, and Rewriter APIs
 */

class ChromeAI {
  constructor() {
    this.availability = {
      promptAPI: false,
      summarizerAPI: false,
      writerAPI: false,
      rewriterAPI: false,
      overall: false
    };

    this.sessions = {
      languageModel: null,
      summarizer: null,
      writer: null,
      rewriter: null
    };
  }

  /**
   * Check availability of all Chrome AI APIs
   */
  async checkAvailability() {
    try {
      // Check if AI object exists
      if (typeof ai === 'undefined') {
        console.warn('Chrome AI APIs not available - ai object is undefined');
        return this.availability;
      }

      // Check Prompt API (Language Model)
      if (ai.languageModel) {
        const promptCaps = await ai.languageModel.capabilities();
        this.availability.promptAPI = promptCaps.available === 'readily';
      }

      // Check Summarizer API
      if (ai.summarizer) {
        const summarizerCaps = await ai.summarizer.capabilities();
        this.availability.summarizerAPI = summarizerCaps.available === 'readily';
      }

      // Check Writer API
      if (ai.writer) {
        const writerCaps = await ai.writer.capabilities();
        this.availability.writerAPI = writerCaps.available === 'readily';
      }

      // Check Rewriter API
      if (ai.rewriter) {
        const rewriterCaps = await ai.rewriter.capabilities();
        this.availability.rewriterAPI = rewriterCaps.available === 'readily';
      }

      // Overall availability: at least Prompt + Summarizer should be available
      this.availability.overall =
        this.availability.promptAPI && this.availability.summarizerAPI;

      console.log('Chrome AI API availability:', this.availability);
      return this.availability;
    } catch (error) {
      console.error('Error checking Chrome AI API availability:', error);
      return this.availability;
    }
  }

  /**
   * Get detailed capabilities for all APIs
   */
  async getCapabilities() {
    const capabilities = {};

    try {
      if (ai.languageModel) {
        capabilities.promptAPI = await ai.languageModel.capabilities();
      }
      if (ai.summarizer) {
        capabilities.summarizerAPI = await ai.summarizer.capabilities();
      }
      if (ai.writer) {
        capabilities.writerAPI = await ai.writer.capabilities();
      }
      if (ai.rewriter) {
        capabilities.rewriterAPI = await ai.rewriter.capabilities();
      }
    } catch (error) {
      console.error('Error getting capabilities:', error);
    }

    return capabilities;
  }

  /**
   * Create or get Language Model session (Prompt API)
   */
  async getLanguageModel(options = {}) {
    if (this.sessions.languageModel) {
      return this.sessions.languageModel;
    }

    try {
      this.sessions.languageModel = await ai.languageModel.create({
        systemPrompt: options.systemPrompt || 'You are a helpful AI assistant specialized in educational content transformation.',
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        ...options
      });

      return this.sessions.languageModel;
    } catch (error) {
      console.error('Error creating language model session:', error);

      // Provide actionable error message
      if (error.message.includes('not available') || error.message.includes('undefined')) {
        throw new Error('Chrome AI Prompt API is not available. Please ensure you have:\n1. Chrome Dev/Canary (v128+)\n2. Enabled chrome://flags/#prompt-api-for-gemini-nano\n3. Downloaded Gemini Nano model\n4. Restarted Chrome\n\nSee docs/API_ENABLE_INSTRUCTIONS.md for detailed setup.');
      }

      throw new Error(`Language model creation failed: ${error.message}. Try refreshing the page or restarting Chrome.`);
    }
  }

  /**
   * Prompt the language model
   */
  async prompt(text, options = {}) {
    try {
      const model = await this.getLanguageModel(options);
      const response = await model.prompt(text);
      return response;
    } catch (error) {
      console.error('Error prompting language model:', error);
      throw error;
    }
  }

  /**
   * Stream prompt response
   */
  async *promptStream(text, options = {}) {
    try {
      const model = await this.getLanguageModel(options);
      const stream = model.promptStreaming(text);

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      console.error('Error streaming prompt:', error);
      throw error;
    }
  }

  /**
   * Create or get Summarizer session
   */
  async getSummarizer(options = {}) {
    if (this.sessions.summarizer) {
      return this.sessions.summarizer;
    }

    try {
      this.sessions.summarizer = await ai.summarizer.create({
        type: options.type || 'key-points', // 'tl;dr', 'key-points', 'teaser', 'headline'
        format: options.format || 'markdown',
        length: options.length || 'medium', // 'short', 'medium', 'long'
        ...options
      });

      return this.sessions.summarizer;
    } catch (error) {
      console.error('Error creating summarizer session:', error);

      // Provide actionable error message
      if (error.message.includes('not available') || error.message.includes('undefined')) {
        throw new Error('Chrome AI Summarizer API is not available. Please ensure you have:\n1. Chrome Dev/Canary (v128+)\n2. Enabled chrome://flags/#summarization-api-for-gemini-nano\n3. Downloaded Gemini Nano model\n4. Restarted Chrome\n\nSee docs/API_ENABLE_INSTRUCTIONS.md for detailed setup.');
      }

      throw new Error(`Summarizer creation failed: ${error.message}. Try refreshing the page or restarting Chrome.`);
    }
  }

  /**
   * Summarize text
   */
  async summarize(text, options = {}) {
    try {
      // For different summarization needs, create new sessions
      const summarizer = await ai.summarizer.create({
        type: options.type || 'key-points',
        format: options.format || 'markdown',
        length: options.length || 'medium',
        ...options
      });

      const summary = await summarizer.summarize(text);
      summarizer.destroy(); // Clean up
      return summary;
    } catch (error) {
      console.error('Error summarizing text:', error);
      throw error;
    }
  }

  /**
   * Stream summarization
   */
  async *summarizeStream(text, options = {}) {
    try {
      const summarizer = await ai.summarizer.create({
        type: options.type || 'key-points',
        format: options.format || 'markdown',
        length: options.length || 'medium',
        ...options
      });

      const stream = summarizer.summarizeStreaming(text);

      for await (const chunk of stream) {
        yield chunk;
      }

      summarizer.destroy();
    } catch (error) {
      console.error('Error streaming summary:', error);
      throw error;
    }
  }

  /**
   * Create or get Writer session
   */
  async getWriter(options = {}) {
    if (this.sessions.writer) {
      return this.sessions.writer;
    }

    try {
      this.sessions.writer = await ai.writer.create({
        tone: options.tone || 'neutral', // 'formal', 'neutral', 'casual'
        format: options.format || 'markdown',
        length: options.length || 'medium',
        ...options
      });

      return this.sessions.writer;
    } catch (error) {
      console.error('Error creating writer session:', error);
      throw new Error(`Failed to create writer: ${error.message}`);
    }
  }

  /**
   * Write content based on prompt
   */
  async write(prompt, options = {}) {
    try {
      const writer = await ai.writer.create({
        tone: options.tone || 'neutral',
        format: options.format || 'markdown',
        length: options.length || 'medium',
        ...options
      });

      const content = await writer.write(prompt);
      writer.destroy();
      return content;
    } catch (error) {
      console.error('Error writing content:', error);
      throw error;
    }
  }

  /**
   * Stream written content
   */
  async *writeStream(prompt, options = {}) {
    try {
      const writer = await ai.writer.create({
        tone: options.tone || 'neutral',
        format: options.format || 'markdown',
        length: options.length || 'medium',
        ...options
      });

      const stream = writer.writeStreaming(prompt);

      for await (const chunk of stream) {
        yield chunk;
      }

      writer.destroy();
    } catch (error) {
      console.error('Error streaming write:', error);
      throw error;
    }
  }

  /**
   * Create or get Rewriter session
   */
  async getRewriter(options = {}) {
    if (this.sessions.rewriter) {
      return this.sessions.rewriter;
    }

    try {
      this.sessions.rewriter = await ai.rewriter.create({
        tone: options.tone || 'as-is', // 'as-is', 'more-formal', 'more-casual'
        format: options.format || 'as-is',
        length: options.length || 'as-is',
        ...options
      });

      return this.sessions.rewriter;
    } catch (error) {
      console.error('Error creating rewriter session:', error);
      throw new Error(`Failed to create rewriter: ${error.message}`);
    }
  }

  /**
   * Rewrite text
   */
  async rewrite(text, options = {}) {
    try {
      const rewriter = await ai.rewriter.create({
        tone: options.tone || 'as-is',
        format: options.format || 'as-is',
        length: options.length || 'as-is',
        ...options
      });

      const rewritten = await rewriter.rewrite(text);
      rewriter.destroy();
      return rewritten;
    } catch (error) {
      console.error('Error rewriting text:', error);
      throw error;
    }
  }

  /**
   * Stream rewritten content
   */
  async *rewriteStream(text, options = {}) {
    try {
      const rewriter = await ai.rewriter.create({
        tone: options.tone || 'as-is',
        format: options.format || 'as-is',
        length: options.length || 'as-is',
        ...options
      });

      const stream = rewriter.rewriteStreaming(text);

      for await (const chunk of stream) {
        yield chunk;
      }

      rewriter.destroy();
    } catch (error) {
      console.error('Error streaming rewrite:', error);
      throw error;
    }
  }

  /**
   * Destroy all active sessions
   */
  destroyAllSessions() {
    try {
      if (this.sessions.languageModel) {
        this.sessions.languageModel.destroy();
        this.sessions.languageModel = null;
      }
      if (this.sessions.summarizer) {
        this.sessions.summarizer.destroy();
        this.sessions.summarizer = null;
      }
      if (this.sessions.writer) {
        this.sessions.writer.destroy();
        this.sessions.writer = null;
      }
      if (this.sessions.rewriter) {
        this.sessions.rewriter.destroy();
        this.sessions.rewriter = null;
      }
    } catch (error) {
      console.error('Error destroying sessions:', error);
    }
  }

  /**
   * Get fallback instructions for enabling APIs
   */
  getEnableInstructions() {
    return {
      title: 'Chrome AI APIs Not Available',
      message: 'This extension requires Chrome\'s Built-in AI APIs. Please follow these steps:',
      steps: [
        '1. Use Chrome Dev or Canary (version 128+)',
        '2. Enable flags at chrome://flags:',
        '   - #prompt-api-for-gemini-nano',
        '   - #summarization-api-for-gemini-nano',
        '   - #writer-api-for-gemini-nano',
        '   - #rewriter-api-for-gemini-nano',
        '   - #optimization-guide-on-device-model (set to "Enabled BypassPerfRequirement")',
        '3. Restart Chrome',
        '4. Download Gemini Nano model:',
        '   Open DevTools Console and run:',
        '   await ai.languageModel.create();',
        '5. Wait for download to complete (~1.7 GB)',
        '6. Refresh this page'
      ],
      docsLink: chrome.runtime.getURL('docs/API_ENABLE_INSTRUCTIONS.md')
    };
  }
}

// Create singleton instance
const chromeAI = new ChromeAI();

// Make available globally
if (typeof window !== 'undefined') {
  window.ChromeAI = chromeAI;
}
