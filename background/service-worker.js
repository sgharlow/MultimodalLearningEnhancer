/**
 * Service Worker for Multimodal Learning Enhancer
 * Handles extension lifecycle, context menus, and message routing
 */

// Import storage manager (absolute path from extension root)
importScripts('/lib/storage.js');

// Context menu IDs
const CONTEXT_MENU_IDS = {
  TRANSFORM_VISUAL: 'transform-visual',
  TRANSFORM_SUMMARY: 'transform-summary',
  TRANSFORM_STUDY: 'transform-study',
  TRANSFORM_CORNELL: 'transform-cornell',
  SEPARATOR: 'separator'
};

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Multimodal Learning Enhancer installed:', details.reason);

  // Verify StorageManager loaded
  console.log('[ServiceWorker] StorageManager type:', typeof StorageManager);
  console.log('[ServiceWorker] StorageManager.initialize type:', typeof StorageManager?.initialize);

  // Initialize storage (if method exists)
  if (StorageManager && typeof StorageManager.initialize === 'function') {
    await StorageManager.initialize();
  } else {
    console.warn('[ServiceWorker] StorageManager.initialize not available, skipping initialization');
  }

  // Create context menus
  createContextMenus();

  // Open welcome page on first install
  if (details.reason === 'install') {
    // Could open a welcome/setup page here
    console.log('First time installation - welcome!');
  }
});

/**
 * Create right-click context menus
 */
function createContextMenus() {
  // Remove existing menus first
  chrome.contextMenus.removeAll(() => {
    // Main parent menu
    chrome.contextMenus.create({
      id: 'mle-parent',
      title: 'Transform with Learning Enhancer',
      contexts: ['selection', 'page']
    });

    // Visual transformation
    chrome.contextMenus.create({
      id: CONTEXT_MENU_IDS.TRANSFORM_VISUAL,
      parentId: 'mle-parent',
      title: '📊 Generate Diagram',
      contexts: ['selection', 'page']
    });

    // Summary transformation
    chrome.contextMenus.create({
      id: CONTEXT_MENU_IDS.TRANSFORM_SUMMARY,
      parentId: 'mle-parent',
      title: '📝 Create Summary (Bullet Points)',
      contexts: ['selection', 'page']
    });

    // Study notes transformation
    chrome.contextMenus.create({
      id: CONTEXT_MENU_IDS.TRANSFORM_STUDY,
      parentId: 'mle-parent',
      title: '🎯 Create Study Notes',
      contexts: ['selection', 'page']
    });

    // Cornell notes transformation
    chrome.contextMenus.create({
      id: CONTEXT_MENU_IDS.TRANSFORM_CORNELL,
      parentId: 'mle-parent',
      title: '📔 Create Cornell Notes',
      contexts: ['selection', 'page']
    });
  });
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);

  // Determine transformation type
  let transformationType;
  switch (info.menuItemId) {
    case CONTEXT_MENU_IDS.TRANSFORM_VISUAL:
      transformationType = 'visual';
      break;
    case CONTEXT_MENU_IDS.TRANSFORM_SUMMARY:
      transformationType = 'summary';
      break;
    case CONTEXT_MENU_IDS.TRANSFORM_STUDY:
      transformationType = 'studynotes';
      break;
    case CONTEXT_MENU_IDS.TRANSFORM_CORNELL:
      transformationType = 'cornell';
      break;
    default:
      return;
  }

  // Send message to content script to trigger transformation
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'TRANSFORM_CONTENT',
      payload: {
        transformationType,
        sourceType: info.selectionText ? 'selection' : 'auto',
        selectionText: info.selectionText || null
      }
    });
  } catch (error) {
    console.error('Error sending message to content script:', error);
    // Content script might not be ready, show notification
    showNotification('Please refresh the page and try again');
  }
});

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service worker received message:', message.type);

  switch (message.type) {
    case 'CHECK_API_AVAILABILITY':
      handleApiAvailabilityCheck(sendResponse);
      return true; // Keep channel open for async response

    case 'SAVE_TRANSFORMATION':
      handleSaveTransformation(message.payload, sendResponse);
      return true;

    case 'GET_HISTORY':
      handleGetHistory(sendResponse);
      return true;

    case 'CLEAR_HISTORY':
      handleClearHistory(sendResponse);
      return true;

    case 'DELETE_TRANSFORMATION':
      handleDeleteTransformation(message.payload, sendResponse);
      return true;

    case 'SEARCH_HISTORY':
      handleSearchHistory(message.payload, sendResponse);
      return true;

    case 'FILTER_HISTORY':
      handleFilterHistory(message.payload, sendResponse);
      return true;

    case 'EXPORT_HISTORY':
      handleExportHistory(sendResponse);
      return true;

    case 'IMPORT_HISTORY':
      handleImportHistory(message.payload, sendResponse);
      return true;

    case 'GET_STATS':
      handleGetStats(sendResponse);
      return true;

    case 'GET_STORAGE_INFO':
      handleGetStorageInfo(sendResponse);
      return true;

    case 'SHOW_NOTIFICATION':
      showNotification(message.payload.message, message.payload.type);
      sendResponse({ success: true });
      break;

    default:
      console.warn('Unknown message type:', message.type);
  }
});

/**
 * Check Chrome AI API availability
 * This runs in the service worker context
 */
async function handleApiAvailabilityCheck(sendResponse) {
  try {
    const availability = {
      promptAPI: false,
      summarizerAPI: false,
      writerAPI: false,
      rewriterAPI: false,
      overall: false
    };

    // Check each API
    // Note: In service worker, we might not have direct access to these APIs
    // We'll need to check from the content script context instead
    // For now, we'll return a signal to check from content script

    sendResponse({
      success: true,
      checkFromContentScript: true
    });
  } catch (error) {
    console.error('Error checking API availability:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Save transformation to storage
 */
async function handleSaveTransformation(payload, sendResponse) {
  try {
    const { transformation } = payload;
    const result = await StorageManager.saveTransformation(transformation);
    sendResponse(result);
  } catch (error) {
    console.error('Error saving transformation:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get transformation history
 */
async function handleGetHistory(sendResponse) {
  try {
    const transformations = await StorageManager.getTransformations();
    sendResponse({
      success: true,
      transformations
    });
  } catch (error) {
    console.error('Error getting history:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Clear transformation history
 */
async function handleClearHistory(sendResponse) {
  try {
    const result = await StorageManager.clearTransformations();
    sendResponse(result);
  } catch (error) {
    console.error('Error clearing history:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Delete a single transformation
 */
async function handleDeleteTransformation(payload, sendResponse) {
  try {
    const { id } = payload;
    const result = await StorageManager.deleteTransformation(id);
    sendResponse(result);
  } catch (error) {
    console.error('Error deleting transformation:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Search history
 */
async function handleSearchHistory(payload, sendResponse) {
  try {
    const { query } = payload;
    const results = await StorageManager.searchTransformations(query);
    sendResponse({
      success: true,
      transformations: results
    });
  } catch (error) {
    console.error('Error searching history:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Filter history by type
 */
async function handleFilterHistory(payload, sendResponse) {
  try {
    const { type } = payload;
    const results = await StorageManager.filterTransformationsByType(type);
    sendResponse({
      success: true,
      transformations: results
    });
  } catch (error) {
    console.error('Error filtering history:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Export history
 */
async function handleExportHistory(sendResponse) {
  try {
    const result = await StorageManager.exportTransformations();
    sendResponse(result);
  } catch (error) {
    console.error('Error exporting history:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Import history
 */
async function handleImportHistory(payload, sendResponse) {
  try {
    const { jsonData } = payload;
    const result = await StorageManager.importTransformations(jsonData);
    sendResponse(result);
  } catch (error) {
    console.error('Error importing history:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get statistics
 */
async function handleGetStats(sendResponse) {
  try {
    const stats = await StorageManager.getStats();
    sendResponse({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get storage info
 */
async function handleGetStorageInfo(sendResponse) {
  try {
    const info = await StorageManager.getStorageInfo();
    sendResponse({
      success: true,
      info
    });
  } catch (error) {
    console.error('Error getting storage info:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Show browser notification
 */
function showNotification(message, type = 'info') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../assets/icons/icon128.png',
    title: 'Learning Enhancer',
    message: message,
    priority: type === 'error' ? 2 : 1
  });
}

/**
 * Handle extension icon click (opens popup automatically via manifest)
 */

console.log('Service worker initialized');
