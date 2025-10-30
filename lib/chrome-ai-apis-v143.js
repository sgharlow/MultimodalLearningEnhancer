/**
 * Chrome Built-in AI APIs Wrapper - Chrome 143+ Compatible
 * Supports both Chrome 143 (direct globals) and older versions (window.ai)
 * Integrates with demo mode for unavailable APIs
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

    this.chrome143Mode = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.availabilityChecked = false; // Cache flag

    // Listen for responses from page injector
    this._setupInjectorListeners();
  }

  /**
   * Setup listeners for page injector responses
   */
  _setupInjectorListeners() {
    window.addEventListener('MLE_AI_AVAILABILITY_RESULT', (event) => {
      const callback = this.pendingRequests.get('availability');
      if (callback) {
        callback(event.detail);
        this.pendingRequests.delete('availability');
      }
    });

    window.addEventListener('MLE_SUMMARIZE_RESULT', (event) => {
      const { requestId, result, error, success } = event.detail;
      const callback = this.pendingRequests.get(`summarize_${requestId}`);
      if (callback) {
        if (success) {
          callback.resolve(result);
        } else {
          callback.reject(new Error(error));
        }
        this.pendingRequests.delete(`summarize_${requestId}`);
      }
    });

    window.addEventListener('MLE_PROMPT_RESULT', (event) => {
      const { requestId, result, error, success } = event.detail;
      const callback = this.pendingRequests.get(`prompt_${requestId}`);
      if (callback) {
        if (success) {
          callback.resolve(result);
        } else {
          callback.reject(new Error(error));
        }
        this.pendingRequests.delete(`prompt_${requestId}`);
      }
    });
  }

  /**
   * Check availability of all Chrome AI APIs via page injector
   * Cached after first check for performance
   */
  async checkAvailability() {
    // Return cached result if already checked
    if (this.availabilityChecked) {
      return this.availability;
    }

    return new Promise((resolve) => {
      // Store callback for when page injector responds
      this.pendingRequests.set('availability', (availability) => {
        this.availability = availability;
        this.availabilityChecked = true; // Mark as checked
        resolve(this.availability);
      });

      // Request availability check from page injector
      window.dispatchEvent(new CustomEvent('MLE_CHECK_AI_AVAILABILITY'));

      // Timeout after 1 second (reduced from 2)
      setTimeout(() => {
        if (this.pendingRequests.has('availability')) {
          this.pendingRequests.delete('availability');
          this.availabilityChecked = true;
          resolve(this.availability);
        }
      }, 1000);
    });
  }

  /**
   * Create Summarizer session
   * Compatible with Chrome 143+ and older versions
   */
  async getSummarizer(options = {}) {
    try {
      // Default options for Chrome 143
      const defaultOptions = {
        type: 'key-points',
        format: 'markdown',
        length: 'medium',
        language: 'en', // Required in Chrome 143
        ...options
      };

      // Chrome 143: Direct global
      if (typeof Summarizer !== 'undefined') {
        console.log('[ChromeAI] Creating Summarizer (Chrome 143)...', defaultOptions);
        this.sessions.summarizer = await Summarizer.create(defaultOptions);
        console.log('[ChromeAI] Summarizer created successfully');
        return this.sessions.summarizer;
      }

      // Fallback to old API
      if (typeof ai !== 'undefined' && ai.summarizer) {
        console.log('[ChromeAI] Creating Summarizer (legacy)...', defaultOptions);
        this.sessions.summarizer = await ai.summarizer.create(defaultOptions);
        console.log('[ChromeAI] Summarizer created successfully');
        return this.sessions.summarizer;
      }

      throw new Error('Summarizer API not available');
    } catch (error) {
      console.error('[ChromeAI] Error creating Summarizer:', error);
      throw error;
    }
  }

  /**
   * Create Language Model session (Prompt API)
   */
  async getLanguageModel(options = {}) {
    try {
      // Try real API
      if (typeof ai !== 'undefined' && ai.languageModel) {
        console.log('[ChromeAI] Creating Language Model session with options:', options);
        this.sessions.languageModel = await ai.languageModel.create(options);
        console.log('[ChromeAI] Language Model session created successfully');
        return this.sessions.languageModel;
      }

      throw new Error('Prompt API (window.ai.languageModel) not available');
    } catch (error) {
      console.error('[ChromeAI] Error creating Language Model:', error);
      throw error;
    }
  }

  /**
   * Use Prompt API to generate text
   */
  async prompt(text, options = {}) {
    try {
      const session = await this.getLanguageModel(options);
      const response = await session.prompt(text);

      // Clean up if not keeping session
      if (!options.keepSession && session.destroy) {
        session.destroy();
      }

      return response;
    } catch (error) {
      console.error('[ChromeAI] Prompt failed:', error);
      throw error;
    }
  }

  /**
   * Summarize text using Summarizer API via page injector
   */
  async summarize(text, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Truncate if too long
        const MAX_CHARS = 20000;
        let workingText = text;

        if (text.length > MAX_CHARS) {
          console.warn(`[ChromeAI] Content too long (${text.length} chars), truncating to ${MAX_CHARS} chars`);
          workingText = text.substring(0, MAX_CHARS) + '\n\n[Content truncated]';
        }

        const requestId = ++this.requestId;

        // Store callback
        this.pendingRequests.set(`summarize_${requestId}`, { resolve, reject });

        // Send request to page injector
        window.dispatchEvent(new CustomEvent('MLE_SUMMARIZE', {
          detail: { text: workingText, options, requestId }
        }));

        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.pendingRequests.has(`summarize_${requestId}`)) {
            this.pendingRequests.delete(`summarize_${requestId}`);
            reject(new Error('Summarize request timed out'));
          }
        }, 30000);

      } catch (error) {
        console.error('[ChromeAI] Summarize failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Use Prompt API via page injector
   */
  async prompt(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const requestId = ++this.requestId;

        // Store callback
        this.pendingRequests.set(`prompt_${requestId}`, { resolve, reject });

        // Send request to page injector
        window.dispatchEvent(new CustomEvent('MLE_PROMPT', {
          detail: { prompt, options, requestId }
        }));

        // Timeout after 60 seconds (prompts can take longer)
        setTimeout(() => {
          if (this.pendingRequests.has(`prompt_${requestId}`)) {
            this.pendingRequests.delete(`prompt_${requestId}`);
            reject(new Error('Prompt request timed out'));
          }
        }, 60000);

      } catch (error) {
        console.error('[ChromeAI] Prompt failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Destroy all active sessions
   */
  async destroyAllSessions() {
    try {
      if (this.sessions.summarizer && this.sessions.summarizer.destroy) {
        await this.sessions.summarizer.destroy();
        console.log('[ChromeAI] Summarizer session destroyed');
      }
      if (this.sessions.languageModel && this.sessions.languageModel.destroy) {
        await this.sessions.languageModel.destroy();
        console.log('[ChromeAI] Language Model session destroyed');
      }
      if (this.sessions.writer && this.sessions.writer.destroy) {
        await this.sessions.writer.destroy();
        console.log('[ChromeAI] Writer session destroyed');
      }
      if (this.sessions.rewriter && this.sessions.rewriter.destroy) {
        await this.sessions.rewriter.destroy();
        console.log('[ChromeAI] Rewriter session destroyed');
      }

      this.sessions = {
        languageModel: null,
        summarizer: null,
        writer: null,
        rewriter: null
      };
    } catch (error) {
      console.error('[ChromeAI] Error destroying sessions:', error);
    }
  }

  /**
   * Check if demo mode should be used
   */
  shouldUseDemoMode() {
    return (
      typeof DemoMode !== 'undefined' &&
      DemoMode.isEnabled() &&
      !this.availability.promptAPI
    );
  }
}

// Create singleton instance and export
const chromeAIInstance = new ChromeAI();

// Export instance for use in extension
if (typeof window !== 'undefined') {
  window.ChromeAI = chromeAIInstance;
  // Also export the class in case it's needed
  window.ChromeAIClass = ChromeAI;
}

console.log('[ChromeAI] Chrome 143-compatible API wrapper loaded and instance created');
