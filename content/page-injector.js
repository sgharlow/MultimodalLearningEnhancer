/**
 * Page Injector - Runs in PAGE context (not content script context)
 * This gives us access to window.ai which is not available in content scripts
 */

(function() {
  'use strict';

  console.log('[PageInjector] Initializing in page context...');

  // Expose Chrome AI APIs to content script via custom events
  window.addEventListener('MLE_CHECK_AI_AVAILABILITY', async (event) => {
    console.log('[PageInjector] Checking AI availability...');

    const availability = {
      promptAPI: false,
      summarizerAPI: false,
      writerAPI: false,
      rewriterAPI: false,
      overall: false
    };

    try {
      // Check Summarizer
      if (typeof Summarizer !== 'undefined') {
        try {
          const avail = await Summarizer.availability();
          availability.summarizerAPI = (avail === 'available' || avail === 'readily');
        } catch (e) {
          console.warn('[PageInjector] Summarizer check failed:', e);
        }
      }

      // Check Prompt API / Language Model
      // IMPORTANT: Use 'ai' not 'window.ai' - there's a difference in typeof behavior
      if (typeof ai !== 'undefined' && ai?.languageModel) {
        availability.promptAPI = true;
        console.log('[PageInjector] ✅ Prompt API (ai.languageModel) found!');
      } else {
        console.warn('[PageInjector] ❌ Prompt API not found. typeof ai:', typeof ai);
        if (typeof ai !== 'undefined') {
          console.warn('[PageInjector] ai exists but ai.languageModel:', ai?.languageModel);
        }
      }

      // Check Writer
      if (typeof Writer !== 'undefined') {
        try {
          const avail = await Writer.availability();
          availability.writerAPI = (avail === 'available' || avail === 'readily');
        } catch (e) {}
      } else if (typeof ai !== 'undefined' && ai?.writer) {
        availability.writerAPI = true;
      }

      // Check Rewriter
      if (typeof Rewriter !== 'undefined') {
        try {
          const avail = await Rewriter.availability();
          availability.rewriterAPI = (avail === 'available' || avail === 'readily');
        } catch (e) {}
      } else if (typeof ai !== 'undefined' && ai?.rewriter) {
        availability.rewriterAPI = true;
      }

      availability.overall = availability.summarizerAPI || availability.promptAPI;

      console.log('[PageInjector] Availability:', availability);

      // Send back to content script
      window.dispatchEvent(new CustomEvent('MLE_AI_AVAILABILITY_RESULT', {
        detail: availability
      }));

    } catch (error) {
      console.error('[PageInjector] Error checking availability:', error);
      window.dispatchEvent(new CustomEvent('MLE_AI_AVAILABILITY_RESULT', {
        detail: availability
      }));
    }
  });

  // Summarize text
  window.addEventListener('MLE_SUMMARIZE', async (event) => {
    const { text, options, requestId } = event.detail;
    console.log('[PageInjector] Summarize request:', requestId);

    try {
      const summarizer = await Summarizer.create({
        type: options.type || 'key-points',
        format: options.format || 'markdown',
        length: options.length || 'medium',
        sharedContext: 'en'
      });

      const result = await summarizer.summarize(text);

      if (summarizer.destroy) summarizer.destroy();

      window.dispatchEvent(new CustomEvent('MLE_SUMMARIZE_RESULT', {
        detail: { requestId, result, success: true }
      }));

    } catch (error) {
      console.error('[PageInjector] Summarize failed:', error);
      window.dispatchEvent(new CustomEvent('MLE_SUMMARIZE_RESULT', {
        detail: { requestId, error: error.message, success: false }
      }));
    }
  });

  // Prompt (Language Model)
  window.addEventListener('MLE_PROMPT', async (event) => {
    const { prompt, options, requestId } = event.detail;
    console.log('[PageInjector] Prompt request:', requestId);

    try {
      if (typeof ai === 'undefined' || !ai.languageModel) {
        throw new Error('Prompt API not available in page context');
      }

      const session = await ai.languageModel.create(options || {});
      const result = await session.prompt(prompt);

      if (session.destroy) session.destroy();

      window.dispatchEvent(new CustomEvent('MLE_PROMPT_RESULT', {
        detail: { requestId, result, success: true }
      }));

    } catch (error) {
      console.error('[PageInjector] Prompt failed:', error);
      window.dispatchEvent(new CustomEvent('MLE_PROMPT_RESULT', {
        detail: { requestId, error: error.message, success: false }
      }));
    }
  });

  console.log('[PageInjector] Ready - listening for requests');

  // Signal that injector is ready
  window.dispatchEvent(new CustomEvent('MLE_INJECTOR_READY'));

})();
