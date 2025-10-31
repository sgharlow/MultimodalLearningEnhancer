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
      // CRITICAL: Check Prompt API in content script context FIRST
      // Prompt API is available here but NOT in page context
      if (typeof ai !== 'undefined' && ai.languageModel) {
        console.log('[ChromeAI] ✅ Prompt API available in content script context');
        this.availability.promptAPI = true;
      } else {
        console.log('[ChromeAI] ❌ Prompt API not available in content script context');
      }

      // Store callback for when page injector responds (for other APIs)
      this.pendingRequests.set('availability', (pageAvailability) => {
        // Merge: Use our content script check for Prompt API, page injector for others
        this.availability = {
          ...pageAvailability,
          promptAPI: this.availability.promptAPI, // Keep our check, not page injector's
          overall: this.availability.promptAPI || pageAvailability.summarizerAPI
        };
        this.availabilityChecked = true;
        console.log('[ChromeAI] Final availability (merged):', this.availability);
        resolve(this.availability);
      });

      // Request availability check from page injector (for Summarizer, Writer, Rewriter)
      window.dispatchEvent(new CustomEvent('MLE_CHECK_AI_AVAILABILITY'));

      // Timeout after 1 second
      setTimeout(() => {
        if (this.pendingRequests.has('availability')) {
          this.pendingRequests.delete('availability');
          this.availability.overall = this.availability.promptAPI || this.availability.summarizerAPI;
          this.availabilityChecked = true;
          console.log('[ChromeAI] Availability check timed out, using:', this.availability);
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
        sharedContext: 'en', // Output language for Chrome 143+
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
   * Use Prompt API - tries direct access first (content script context), then falls back to page injector
   */
  async prompt(prompt, options = {}) {
    // CRITICAL FIX: Try direct access first - Prompt API is available in content script context
    // but NOT in page context. Page injector will always fail for Prompt API.
    if (typeof ai !== 'undefined' && ai.languageModel) {
      try {
        console.log('[ChromeAI] Using Prompt API directly from content script context');
        const session = await ai.languageModel.create(options);
        const result = await session.prompt(prompt);
        if (session.destroy) await session.destroy();
        return result;
      } catch (error) {
        console.warn('[ChromeAI] Direct Prompt API failed, trying page injector:', error.message);
        // Fall through to page injector attempt
      }
    }

    // Fallback: Try page injector (will likely fail for Prompt API, but kept for compatibility)
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

  /**
   * Get instructions for enabling Chrome AI APIs
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

// Create singleton instance and export
const chromeAIInstance = new ChromeAI();

// Export instance for use in extension
if (typeof window !== 'undefined') {
  window.ChromeAI = chromeAIInstance;
  // Also export the class in case it's needed
  window.ChromeAIClass = ChromeAI;
}

console.log('[ChromeAI] Chrome 143-compatible API wrapper loaded and instance created');
