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
      // Initialize components with detailed error checking
      console.log('[MLE] Creating ContentExtractor...');
      contentExtractor = new ContentExtractor();

      console.log('[MLE] Creating ContentAnalyzer...');
      contentAnalyzer = new ContentAnalyzer();

      console.log('[MLE] Loading ChromeAI...');
      chromeAI = window.ChromeAI;

      if (!chromeAI) {
        throw new Error('ChromeAI not loaded - chrome-ai-apis-v143.js may have failed to load');
      }

      // Check Chrome AI availability
      console.log('[MLE] Checking Chrome AI availability...');
      const availability = await chromeAI.checkAvailability();
      console.log('[MLE] Chrome AI availability:', availability);

      if (!availability.overall) {
        console.warn('[MLE] Chrome AI APIs not fully available');
        showAPIWarningNotification();
      }

      // Initialize text transformer
      console.log('[MLE] Creating TextTransformer...');
      textTransformer = new TextTransformer(chromeAI);

      // Initialize diagram components
      console.log('[MLE] Creating DiagramGenerator...');
      diagramGenerator = new DiagramGenerator(chromeAI);

      console.log('[MLE] Creating VisualEngine...');
      visualEngine = new VisualEngine();

      // Don't pre-load Mermaid - load it only when needed for diagrams
      // This speeds up initial page load significantly

      // Initialize widget
      console.log('[MLE] Creating Widget...');
      widget = new Widget();
      widget.init();

      isInitialized = true;
      console.log('[MLE] ✅ Initialization complete - Extension ready');

      // Expose transformation trigger for widget buttons
      window.triggerWidgetTransformation = async (transformationType) => {
        console.log('[MLE] Widget triggered transformation:', transformationType);
        return await handleTransformContent({
          transformationType,
          sourceType: 'widget'
        });
      };

    } catch (error) {
      console.error('[MLE] ❌ Initialization failed:', error);
      console.error('[MLE] Stack trace:', error.stack);

      // Show user-friendly error notification
      try {
        chrome.runtime.sendMessage({
          type: 'SHOW_NOTIFICATION',
          payload: {
            message: 'Extension initialization failed. Please reload the page.',
            type: 'error'
          }
        });
      } catch (notifError) {
        console.error('[MLE] Could not send notification:', notifError);
      }
    }
  }

  /**
   * Handle messages from service worker and popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[MLE] Received message:', message.type);

    // Check if extension is initialized for content operations
    if (message.type === 'TRANSFORM_CONTENT' || message.type === 'GET_CURRENT_CONTENT') {
      if (!isInitialized) {
        console.error('[MLE] Extension not initialized yet');
        sendResponse({
          success: false,
          error: 'Extension is still initializing. Please wait a moment and try again.'
        });
        return false;
      }
    }

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

      // Show widget with loading state IMMEDIATELY
      showLoadingState(transformationType);

      // Extract content
      const extraction = await extractContent(sourceType, selectionText);

      // Analyze content
      const analysis = contentAnalyzer.analyze(extraction);

      // Store for potential reuse
      lastExtraction = { extraction, analysis };

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

      // Generate diagram with real AI
      const result = await diagramGenerator.generate(extraction, analysis);

      console.log('[MLE] Visual diagram generated successfully:', {
        type: result.diagramType,
        source: result.metadata?.source || 'chrome-ai',
        lines: result.metadata?.diagramLines,
        confidence: result.metadata?.confidence
      });

      return result;

    } catch (error) {
      console.error('[MLE] Visual transformation failed:', error);

      // Fallback to demo mode
      if (DemoMode && DemoMode.isEnabled()) {
        console.log('[MLE] Using demo mode for diagram generation');
        const mermaidCode = DemoMode.getMockDiagram(extraction.content);
        const diagramType = analysis.recommendedDiagram || 'flowchart';

        return {
          type: 'visual',
          diagramType: diagramType,
          title: extraction.title,
          mermaidCode: mermaidCode,
          metadata: {
            originalLength: extraction.content.length,
            diagramLines: mermaidCode.split('\n').length,
            diagramType: diagramType,
            confidence: 0.8,
            source: 'demo-mode',
            generatedAt: Date.now()
          }
        };
      }

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

      // Fallback to demo mode (only if Summarizer API fails)
      if (DemoMode && DemoMode.isEnabled()) {
        console.log('[MLE] Using demo mode for summary generation');
        const mockSummary = DemoMode.getMockSummary(extraction.content);

        return {
          type: 'bullet-points',
          title: extraction.title,
          content: mockSummary,
          metadata: {
            originalLength: extraction.content.length,
            summaryLength: mockSummary.length,
            compressionRatio: (mockSummary.length / extraction.content.length).toFixed(2),
            wordCount: Utils.wordCount(mockSummary),
            readingTime: Utils.estimateReadingTime(mockSummary),
            source: 'demo-mode',
            generatedAt: Date.now()
          }
        };
      }

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

      // Fallback to demo mode
      if (DemoMode && DemoMode.isEnabled()) {
        console.log('[MLE] Using demo mode for study notes generation');
        const mockNotes = DemoMode.getMockStudyNotes(extraction.content);

        return {
          type: 'study-notes',
          title: extraction.title,
          content: mockNotes,
          metadata: {
            originalLength: extraction.content.length,
            notesLength: mockNotes.length,
            wordCount: Utils.wordCount(mockNotes),
            readingTime: Utils.estimateReadingTime(mockNotes),
            source: 'demo-mode',
            generatedAt: Date.now()
          },
          structure: {
            sections: 4,
            subsections: 0,
            lists: 10,
            hasOverview: true,
            hasKeyConcepts: true,
            hasKeyTerms: true
          }
        };
      }

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

      // Fallback to demo mode
      if (DemoMode && DemoMode.isEnabled()) {
        console.log('[MLE] Using demo mode for Cornell notes generation');
        const mockNotes = DemoMode.getMockCornellNotes(extraction.content);

        return {
          type: 'cornell-notes',
          title: extraction.title,
          content: mockNotes,
          metadata: {
            originalLength: extraction.content.length,
            notesLength: mockNotes.length,
            wordCount: Utils.wordCount(mockNotes),
            readingTime: Utils.estimateReadingTime(mockNotes),
            source: 'demo-mode',
            generatedAt: Date.now()
          },
          structure: {
            cuePairs: 7,
            hasSummary: true
          }
        };
      }

      throw error;
    }
  }

  /**
   * Show loading state in widget immediately
   */
  function showLoadingState(type) {
    if (!widget) {
      widget = new Widget();
      widget.init();
    }
    widget.showLoading(type);
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
    console.log('[MLE] ═══════════════ RESULTS ═══════════════');
    console.log(`[MLE] Type: ${type.toUpperCase()}`);
    console.log(`[MLE] Title: ${result.title || 'N/A'}`);
    console.log('[MLE] ════════════════════════════════════════');

    if (type === 'summary' || type === 'studynotes' || type === 'cornell') {
      console.log('[MLE] Content:');
      console.log(result.content);
      console.log('[MLE] ────────────────────────────────────────');
      console.log('[MLE] Metadata:', result.metadata);
      if (result.structure) {
        console.log('[MLE] Structure:', result.structure);
      }
    } else if (type === 'visual') {
      console.log(`[MLE] Diagram Type: ${result.diagramType}`);
      console.log('[MLE] Mermaid Code:');
      console.log(result.mermaidCode);
      console.log('[MLE] ────────────────────────────────────────');
      console.log('[MLE] Metadata:', result.metadata);
    }

    console.log('[MLE] ════════════════════════════════════════');
    console.log('[MLE] ✅ Widget should be visible in top-right corner');
    console.log('[MLE] ════════════════════════════════════════');
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
