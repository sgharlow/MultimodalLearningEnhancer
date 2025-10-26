/**
 * Content Script - Main entry point for page injection
 * Handles extraction, transformation triggering, and messaging
 */

(function() {
  'use strict';

  // Initialize components
  let contentExtractor = null;
  let contentAnalyzer = null;
  let chromeAI = null;
  let textTransformer = null;
  let diagramGenerator = null;
  let visualEngine = null;
  let widget = null;
  let isInitialized = false;

  // State
  let lastExtraction = null;
  let isProcessing = false;

  /**
   * Initialize content script
   */
  async function initialize() {
    if (isInitialized) return;

    console.log('[MLE] Initializing Multimodal Learning Enhancer...');

    try {
      // Initialize components
      contentExtractor = new ContentExtractor();
      contentAnalyzer = new ContentAnalyzer();
      chromeAI = window.ChromeAI;

      // Check Chrome AI availability
      const availability = await chromeAI.checkAvailability();
      console.log('[MLE] Chrome AI availability:', availability);

      if (!availability.overall) {
        console.warn('[MLE] Chrome AI APIs not fully available');
        showAPIWarningNotification();
      }

      // Initialize text transformer
      textTransformer = new TextTransformer(chromeAI);

      // Initialize diagram components
      diagramGenerator = new DiagramGenerator(chromeAI);
      visualEngine = new VisualEngine();

      // Pre-initialize visual engine (loads Mermaid)
      visualEngine.initialize().catch(err => {
        console.warn('[MLE] Visual engine initialization delayed:', err.message);
      });

      // Initialize widget
      widget = new Widget();
      widget.init();

      isInitialized = true;
      console.log('[MLE] Initialization complete');

    } catch (error) {
      console.error('[MLE] Initialization failed:', error);
    }
  }

  /**
   * Handle messages from service worker and popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[MLE] Received message:', message.type);

    switch (message.type) {
      case 'TRANSFORM_CONTENT':
        handleTransformContent(message.payload)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response

      case 'GET_CURRENT_CONTENT':
        handleGetCurrentContent()
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

      case 'CHECK_INITIALIZATION':
        sendResponse({ initialized: isInitialized });
        break;

      default:
        console.warn('[MLE] Unknown message type:', message.type);
    }
  });

  /**
   * Handle content transformation request
   */
  async function handleTransformContent(payload) {
    if (isProcessing) {
      throw new Error('Transformation already in progress');
    }

    isProcessing = true;

    try {
      const { transformationType, sourceType, selectionText } = payload;

      console.log('[MLE] Starting transformation:', {
        type: transformationType,
        source: sourceType
      });

      // Extract content
      const extraction = await extractContent(sourceType, selectionText);

      // Analyze content
      const analysis = contentAnalyzer.analyze(extraction);

      // Store for potential reuse
      lastExtraction = { extraction, analysis };

      // Show loading notification
      showNotification('Transforming content...', 'info');

      // Perform transformation based on type
      let result;
      switch (transformationType) {
        case 'visual':
          result = await transformToVisual(extraction, analysis);
          break;
        case 'summary':
          result = await transformToSummary(extraction);
          break;
        case 'studynotes':
          result = await transformToStudyNotes(extraction, analysis);
          break;
        case 'cornell':
          result = await transformToCornellNotes(extraction, analysis);
          break;
        default:
          throw new Error('Unknown transformation type: ' + transformationType);
      }

      // Save to history
      await saveToHistory({
        type: transformationType,
        title: extraction.title,
        url: extraction.url,
        output: result,
        sourceType: extraction.sourceType
      });

      // Show results
      showTransformationResults(result, transformationType);

      // Success notification
      showNotification('Transformation complete!', 'success');

      return result;

    } catch (error) {
      console.error('[MLE] Transformation failed:', error);
      showNotification('Transformation failed: ' + error.message, 'error');
      throw error;
    } finally {
      isProcessing = false;
    }
  }

  /**
   * Extract content from page
   */
  async function extractContent(sourceType, selectionText) {
    try {
      // If selection text is provided, use it
      if (sourceType === 'selection') {
        if (!selectionText) {
          // Try to get current selection
          selectionText = contentExtractor.getSelection();
          if (!selectionText) {
            throw new Error('No text selected');
          }
        }
      }

      // Extract content
      const extraction = contentExtractor.extract({
        source: sourceType,
        selectionText: selectionText
      });

      console.log('[MLE] Content extracted:', {
        title: extraction.title,
        length: extraction.content.length,
        words: extraction.metadata.wordCount
      });

      return extraction;

    } catch (error) {
      console.error('[MLE] Content extraction failed:', error);

      // Provide specific guidance based on error
      if (error.message.includes('No text selected')) {
        throw new Error('No text selected. Please select some text on the page first, or use the "Transform entire page" option from the context menu.');
      }

      throw new Error('Failed to extract content from this page.\n\nThis may happen if:\n- The page has unusual formatting\n- The content is behind a login\n- The page is mostly images or videos\n\nTry:\n- Selecting specific text you want to transform\n- Refreshing the page\n- Using a different webpage');
    }
  }

  /**
   * Handle get current content request (for testing)
   */
  async function handleGetCurrentContent() {
    const extraction = contentExtractor.extract({ source: 'auto' });
    const analysis = contentAnalyzer.analyze(extraction);
    return { extraction, analysis };
  }

  /**
   * Transform content to visual diagram
   */
  async function transformToVisual(extraction, analysis) {
    console.log('[MLE] Visual transformation requested');
    console.log('Recommended diagram type:', analysis.recommendedDiagram);

    try {
      // Check API availability
      await diagramGenerator.checkAPIAvailable();

      // Generate diagram
      const result = await diagramGenerator.generate(extraction, analysis);

      // Render diagram to validate
      await visualEngine.renderDiagram(result.mermaidCode);

      console.log('[MLE] Visual diagram generated successfully:', {
        type: result.diagramType,
        lines: result.metadata.diagramLines,
        confidence: result.metadata.confidence
      });

      return result;

    } catch (error) {
      console.error('[MLE] Visual transformation failed:', error);
      throw error;
    }
  }

  /**
   * Transform content to summary (bullet points)
   */
  async function transformToSummary(extraction) {
    console.log('[MLE] Summary transformation requested');

    try {
      // Check API availability
      await textTransformer.checkAPIsAvailable();

      // Generate bullet points using Summarizer API
      const result = await textTransformer.generateBulletPoints(extraction, {
        length: 'medium'
      });

      console.log('[MLE] Summary generated successfully:', {
        points: result.content.split('\n').length,
        compression: result.metadata.compressionRatio
      });

      return result;

    } catch (error) {
      console.error('[MLE] Summary transformation failed:', error);
      throw error;
    }
  }

  /**
   * Transform content to study notes
   */
  async function transformToStudyNotes(extraction, analysis) {
    console.log('[MLE] Study notes transformation requested');

    try {
      // Check API availability
      await textTransformer.checkAPIsAvailable();

      // Generate structured study notes using Writer/Prompt API
      const result = await textTransformer.generateStudyNotes(extraction, analysis, {
        includeQuestions: false // Can enable later
      });

      console.log('[MLE] Study notes generated successfully:', {
        sections: result.structure.sections,
        length: result.metadata.notesLength
      });

      return result;

    } catch (error) {
      console.error('[MLE] Study notes transformation failed:', error);
      throw error;
    }
  }

  /**
   * Transform content to Cornell Notes format
   */
  async function transformToCornellNotes(extraction, analysis) {
    console.log('[MLE] Cornell Notes transformation requested');

    try {
      // Check API availability
      await textTransformer.checkAPIsAvailable();

      // Generate Cornell Notes using Prompt API
      const result = await textTransformer.generateCornellNotes(extraction, analysis, {});

      console.log('[MLE] Cornell Notes generated successfully:', {
        cuePairs: result.structure.cuePairs,
        hasSummary: result.structure.hasSummary,
        length: result.metadata.notesLength
      });

      return result;

    } catch (error) {
      console.error('[MLE] Cornell Notes transformation failed:', error);
      throw error;
    }
  }

  /**
   * Show transformation results in widget UI
   */
  function showTransformationResults(result, type) {
    // Ensure widget is initialized
    if (!widget) {
      widget = new Widget();
      widget.init();
    }

    // Display results in widget
    widget.displayResults(result, type);

    // Also log to console for debugging
    console.log('[MLE] Transformation Results:');
    console.log('─'.repeat(60));
    console.log(`Type: ${type.toUpperCase()}`);
    console.log(`Title: ${result.title || 'N/A'}`);
    console.log('─'.repeat(60));

    if (type === 'summary' || type === 'studynotes') {
      console.log('Metadata:', result.metadata);
      if (result.structure) {
        console.log('Structure:', result.structure);
      }
    } else if (type === 'visual') {
      console.log(`Diagram Type: ${result.diagramType}`);
      console.log('Metadata:', result.metadata);
    }

    console.log('─'.repeat(60));
    console.log('[MLE] Results displayed in widget!');
  }

  /**
   * Save transformation to history
   */
  async function saveToHistory(transformation) {
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_TRANSFORMATION',
        payload: { transformation }
      });
      console.log('[MLE] Saved to history');
    } catch (error) {
      console.error('[MLE] Failed to save to history:', error);
    }
  }

  /**
   * Show notification
   */
  function showNotification(message, type = 'info') {
    // Clean up message for display (remove excessive newlines for notification)
    const cleanMessage = message.replace(/\n{2,}/g, '\n').trim();

    // Truncate very long messages for notifications
    const displayMessage = cleanMessage.length > 300
      ? cleanMessage.substring(0, 300) + '...\n\nSee console for details (F12).'
      : cleanMessage;

    chrome.runtime.sendMessage({
      type: 'SHOW_NOTIFICATION',
      payload: { message: displayMessage, type }
    });

    // Always log detailed message to console
    if (type === 'error') {
      console.error('[MLE] Error:', message);
    } else if (type === 'warning') {
      console.warn('[MLE] Warning:', message);
    } else {
      console.log('[MLE]', message);
    }
  }

  /**
   * Show API warning notification
   */
  function showAPIWarningNotification() {
    const instructions = chromeAI.getEnableInstructions();
    console.warn('[MLE]', instructions.title);
    console.log('[MLE] See:', instructions.docsLink);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  console.log('[MLE] Content script loaded');

})();
