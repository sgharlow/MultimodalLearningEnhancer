/**
 * Popup UI Logic for Multimodal Learning Enhancer
 */

// State
let currentFilter = 'all';
let currentSearchQuery = '';
let allTransformations = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
});

/**
 * Initialize popup interface
 */
async function initializePopup() {
  // Check API availability
  await checkAPIStatus();

  // Load statistics
  await loadStatistics();

  // Load history
  await loadHistory();

  // Load storage info
  await loadStorageInfo();

  // Attach event listeners
  attachEventListeners();
}

/**
 * Check Chrome AI API status
 */
async function checkAPIStatus() {
  try {
    // Inject script to check APIs in page context
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showAPIWarning(true);
      return;
    }

    // Execute check in page context
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        if (typeof ai === 'undefined') {
          return { available: false };
        }

        const status = {
          prompt: false,
          summarizer: false,
          writer: false,
          rewriter: false
        };

        try {
          if (ai.languageModel) {
            const caps = await ai.languageModel.capabilities();
            status.prompt = caps.available === 'readily';
          }
        } catch (e) { console.log('Prompt API check failed:', e); }

        try {
          if (ai.summarizer) {
            const caps = await ai.summarizer.capabilities();
            status.summarizer = caps.available === 'readily';
          }
        } catch (e) { console.log('Summarizer API check failed:', e); }

        try {
          if (ai.writer) {
            const caps = await ai.writer.capabilities();
            status.writer = caps.available === 'readily';
          }
        } catch (e) { console.log('Writer API check failed:', e); }

        try {
          if (ai.rewriter) {
            const caps = await ai.rewriter.capabilities();
            status.rewriter = caps.available === 'readily';
          }
        } catch (e) { console.log('Rewriter API check failed:', e); }

        return { available: true, status };
      }
    });

    if (results && results[0] && results[0].result) {
      const { available, status } = results[0].result;

      if (!available || !status) {
        showAPIWarning(true);
        updateStatusIndicators({
          prompt: false,
          summarizer: false,
          writer: false,
          rewriter: false
        });
        return;
      }

      updateStatusIndicators(status);

      // Check if all required APIs are available
      const allAvailable = status.prompt && status.summarizer;
      showAPIWarning(!allAvailable);

      // Enable action buttons if APIs are available
      if (allAvailable) {
        enableActionButtons();
      }
    } else {
      showAPIWarning(true);
    }
  } catch (error) {
    console.error('Error checking API status:', error);
    showAPIWarning(true);
  }
}

/**
 * Update status indicators
 */
function updateStatusIndicators(status) {
  const indicators = {
    prompt: document.querySelector('[data-api="prompt"] .status-indicator'),
    summarizer: document.querySelector('[data-api="summarizer"] .status-indicator'),
    writer: document.querySelector('[data-api="writer"] .status-indicator'),
    rewriter: document.querySelector('[data-api="rewriter"] .status-indicator')
  };

  Object.keys(status).forEach(api => {
    const indicator = indicators[api];
    if (indicator) {
      indicator.className = 'status-indicator ' + (status[api] ? 'available' : 'unavailable');
      indicator.title = status[api] ? 'Available' : 'Not available';
    }
  });
}

/**
 * Show or hide API warning
 */
function showAPIWarning(show) {
  const warning = document.getElementById('apiWarning');
  if (show) {
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }
}

/**
 * Enable action buttons
 */
function enableActionButtons() {
  const buttons = document.querySelectorAll('.action-btn');
  buttons.forEach(btn => {
    btn.disabled = false;
  });
}

/**
 * Load statistics
 */
async function loadStatistics() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_STATS'
    });

    if (response.success) {
      displayStatistics(response.stats);
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

/**
 * Display statistics
 */
function displayStatistics(stats) {
  const container = document.getElementById('statsGrid');

  if (!stats || stats.totalTransformations === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'grid';
  container.innerHTML = `
    <div class="stat-item">
      <div class="stat-value">${stats.totalTransformations || 0}</div>
      <div class="stat-label">Total</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.byType?.visual || 0}</div>
      <div class="stat-label">📊 Diagrams</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.byType?.summary || 0}</div>
      <div class="stat-label">📝 Summaries</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.byType?.studynotes || 0}</div>
      <div class="stat-label">🎯 Notes</div>
    </div>
  `;
}

/**
 * Load storage info
 */
async function loadStorageInfo() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_STORAGE_INFO'
    });

    if (response.success) {
      displayStorageInfo(response.info);
    }
  } catch (error) {
    console.error('Error loading storage info:', error);
  }
}

/**
 * Display storage info
 */
function displayStorageInfo(info) {
  const container = document.getElementById('storageInfo');

  if (!info) {
    container.style.display = 'none';
    return;
  }

  const percentUsed = parseFloat(info.percentUsed);
  const statusClass = percentUsed > 80 ? 'warning' : '';

  container.innerHTML = `
    <div class="storage-bar ${statusClass}">
      <div class="storage-fill" style="width: ${info.percentUsed}%"></div>
    </div>
    <p class="storage-text">
      ${info.transformationCount} / ${info.maxTransformations} transformations
      <span class="separator">•</span>
      ${info.percentUsed}% storage used
    </p>
  `;
}

/**
 * Load transformation history
 */
async function loadHistory() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_HISTORY'
    });

    if (response.success) {
      allTransformations = response.transformations;
      applyFiltersAndDisplay();
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

/**
 * Apply current filters and display
 */
function applyFiltersAndDisplay() {
  let filtered = allTransformations;

  // Apply type filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(t => t.type === currentFilter);
  }

  // Apply search filter
  if (currentSearchQuery) {
    const query = currentSearchQuery.toLowerCase();
    filtered = filtered.filter(t => {
      return (
        (t.title && t.title.toLowerCase().includes(query)) ||
        (t.url && t.url.toLowerCase().includes(query))
      );
    });
  }

  displayHistory(filtered);
}

/**
 * Display history items
 */
function displayHistory(transformations) {
  const container = document.getElementById('historyContainer');

  if (!transformations || transformations.length === 0) {
    if (currentSearchQuery || currentFilter !== 'all') {
      container.innerHTML = '<p class="empty-state">No transformations match your search/filter.</p>';
    } else {
      container.innerHTML = '<p class="empty-state">No transformations yet. Start by transforming some content!</p>';
    }
    return;
  }

  container.innerHTML = transformations.slice(0, 20).map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-icon">${getIconForType(item.type)}</div>
      <div class="history-details">
        <h3 class="history-title">${truncate(item.title || 'Untitled', 45)}</h3>
        <p class="history-meta">
          <span class="type">${formatType(item.type)}</span>
          <span class="separator">•</span>
          <span class="time">${formatTimestamp(item.created)}</span>
        </p>
        ${item.url ? `<p class="history-url">${truncate(item.url, 50)}</p>` : ''}
      </div>
      <button class="delete-btn" data-id="${item.id}" title="Delete">🗑️</button>
    </div>
  `).join('');

  // Add click handlers to history items
  container.querySelectorAll('.history-item').forEach(item => {
    const titleElement = item.querySelector('.history-title, .history-meta, .history-url');
    if (titleElement) {
      titleElement.style.cursor = 'pointer';
      titleElement.addEventListener('click', () => {
        const id = item.dataset.id;
        const transformation = allTransformations.find(t => t.id === id);
        if (transformation) {
          viewTransformation(transformation);
        }
      });
    }
  });

  // Add delete handlers
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirm('Delete this transformation?')) {
        await deleteTransformation(id);
      }
    });
  });
}

/**
 * Get icon for transformation type
 */
function getIconForType(type) {
  const icons = {
    visual: '📊',
    summary: '📝',
    studynotes: '🎯'
  };
  return icons[type] || '📄';
}

/**
 * Format transformation type
 */
function formatType(type) {
  const types = {
    visual: 'Diagram',
    summary: 'Summary',
    studynotes: 'Study Notes'
  };
  return types[type] || type;
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Truncate text
 */
function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Delete a transformation
 */
async function deleteTransformation(id) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'DELETE_TRANSFORMATION',
      payload: { id }
    });

    if (response.success) {
      // Reload history
      await loadHistory();
      await loadStatistics();
      await loadStorageInfo();
    }
  } catch (error) {
    console.error('Error deleting transformation:', error);
    alert('Failed to delete transformation');
  }
}

/**
 * Export history
 */
async function exportHistory() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'EXPORT_HISTORY'
    });

    if (response.success) {
      // Create download
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.filename;
      a.click();
      URL.revokeObjectURL(url);

      console.log('History exported successfully');
    }
  } catch (error) {
    console.error('Error exporting history:', error);
    alert('Failed to export history');
  }
}

/**
 * Import history
 */
async function importHistory() {
  const fileInput = document.getElementById('importFileInput');
  fileInput.click();
}

/**
 * Handle file import
 */
async function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const response = await chrome.runtime.sendMessage({
      type: 'IMPORT_HISTORY',
      payload: { jsonData: text }
    });

    if (response.success) {
      alert(`Successfully imported ${response.imported} transformations`);
      // Reload
      await loadHistory();
      await loadStatistics();
      await loadStorageInfo();
    } else {
      alert('Import failed: ' + response.error);
    }
  } catch (error) {
    console.error('Error importing history:', error);
    alert('Failed to import history');
  }

  // Reset input
  event.target.value = '';
}

/**
 * View transformation details
 */
function viewTransformation(transformation) {
  // Open the transformation's URL in a new tab
  if (transformation.url) {
    chrome.tabs.create({ url: transformation.url });
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      await triggerTransformation(action);
    });
  });

  // Search input
  const searchInput = document.getElementById('searchHistory');
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    applyFiltersAndDisplay();
  });

  // Filter select
  const filterSelect = document.getElementById('filterType');
  filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    applyFiltersAndDisplay();
  });

  // Export history
  document.getElementById('exportHistory').addEventListener('click', async () => {
    await exportHistory();
  });

  // Import history
  document.getElementById('importHistory').addEventListener('click', async () => {
    await importHistory();
  });

  // File input change
  document.getElementById('importFileInput').addEventListener('change', handleFileImport);

  // Clear history button
  document.getElementById('clearHistory').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
      await loadHistory();
      await loadStatistics();
      await loadStorageInfo();
    }
  });

  // Show instructions button
  document.getElementById('showInstructions').addEventListener('click', () => {
    showInstructionsModal();
  });

  // View docs link
  document.getElementById('viewDocs').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: chrome.runtime.getURL('docs/API_ENABLE_INSTRUCTIONS.md')
    });
  });

  // Modal close
  document.querySelector('.modal-close')?.addEventListener('click', () => {
    hideInstructionsModal();
  });

  // View full docs from modal
  document.getElementById('viewFullDocs')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: chrome.runtime.getURL('docs/API_ENABLE_INSTRUCTIONS.md')
    });
    hideInstructionsModal();
  });
}

/**
 * Trigger transformation on current tab
 */
async function triggerTransformation(type) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      alert('No active tab found');
      return;
    }

    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, {
      type: 'TRANSFORM_CONTENT',
      payload: {
        transformationType: type,
        sourceType: 'auto'
      }
    });

    // Close popup
    window.close();
  } catch (error) {
    console.error('Error triggering transformation:', error);
    alert('Error: ' + error.message);
  }
}

/**
 * Show instructions modal
 */
function showInstructionsModal() {
  document.getElementById('instructionsModal').classList.remove('hidden');
}

/**
 * Hide instructions modal
 */
function hideInstructionsModal() {
  document.getElementById('instructionsModal').classList.add('hidden');
}
