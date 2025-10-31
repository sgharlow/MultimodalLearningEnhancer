/**
 * Floating Widget UI for Multimodal Learning Enhancer
 * Displays transformation results with tabs and interactive features
 */

class Widget {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.currentTab = 'summary'; // Changed from 'visual' to 'summary'
    this.results = {
      visual: null,
      summary: null,
      studynotes: null,
      cornell: null
    };
    this.position = { x: 20, y: 100 }; // Default position
  }

  /**
   * Initialize widget
   */
  init() {
    if (this.container) return; // Already initialized

    console.log('[Widget] Initializing...');

    this.createWidget();
    this.attachEventListeners();

    console.log('[Widget] Initialized successfully');
  }

  /**
   * Create widget DOM structure
   */
  createWidget() {
    this.container = document.createElement('div');
    this.container.className = 'mle-widget';
    this.container.style.cssText = `
      position: fixed;
      right: ${this.position.x}px;
      top: ${this.position.y}px;
      z-index: 2147483647;
      display: none;
    `;

    this.container.innerHTML = `
      <div class="mle-widget-container">
        <div class="mle-widget-header">
          <h2 class="mle-widget-title">
            <img src="${chrome.runtime.getURL('assets/icons/icon-512.png')}" class="mle-title-icon" alt="">
            Learning Enhancer
          </h2>
          <button class="mle-close-btn" title="Close">×</button>
        </div>

        <div class="mle-widget-body">
          <div class="mle-content-area">
            <div class="mle-empty-state">
              Select content and right-click to generate transformations
            </div>
          </div>
        </div>

        <div class="mle-widget-footer">
          <div class="mle-footer-left">
            <span class="mle-word-count">0 words</span>
            <button class="mle-copy-all-btn" title="Copy all content to clipboard">📋 Copy</button>
          </div>
          <div class="mle-action-buttons">
            <button class="mle-action-btn" data-action="summary" title="Generate Summary">
              📝 Summary
            </button>
            <button class="mle-action-btn" data-action="visual" title="Generate Diagram">
              📊 Diagram
            </button>
            <button class="mle-action-btn" data-action="studynotes" title="Study Notes">
              🎯 Study Notes
            </button>
            <button class="mle-action-btn" data-action="cornell" title="Cornell Notes">
              📔 Cornell Notes
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    this.container.querySelector('.mle-close-btn').onclick = () => {
      this.hide();
    };

    // Action buttons at the bottom
    this.container.querySelectorAll('.mle-action-btn').forEach(btn => {
      btn.onclick = async () => {
        const action = btn.dataset.action;
        await this.triggerAction(action);
      };
    });

    // Copy all button
    const copyBtn = this.container.querySelector('.mle-copy-all-btn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        this.copyCurrentContent();
      };
    }

    // Make header draggable
    this.makeDraggable();
  }

  /**
   * Make widget draggable
   */
  makeDraggable() {
    const header = this.container.querySelector('.mle-widget-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.style.cursor = 'move';

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('mle-close-btn')) return;

      isDragging = true;
      initialX = e.clientX - this.position.x;
      initialY = e.clientY - this.position.y;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        // Keep widget within viewport
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;

        this.position.x = Math.max(0, Math.min(currentX, maxX));
        this.position.y = Math.max(0, Math.min(currentY, maxY));

        this.container.style.left = `${this.position.x}px`;
        this.container.style.top = `${this.position.y}px`;
        this.container.style.right = 'auto';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  /**
   * Show widget
   */
  show() {
    if (!this.container) this.init();

    this.container.style.display = 'block';
    this.container.style.opacity = '1';
    this.container.style.transform = 'scale(1)';
    this.isVisible = true;

    console.log('[Widget] Shown');
  }

  /**
   * Hide widget
   */
  hide() {
    if (!this.container) return;

    this.container.style.opacity = '0';
    this.container.style.transform = 'scale(0.9)';

    setTimeout(() => {
      this.container.style.display = 'none';
      this.isVisible = false;
    }, 200);

    console.log('[Widget] Hidden');
  }

  /**
   * Trigger action (toggle between transformations)
   */
  async triggerAction(action) {
    console.log('[Widget] Triggering action:', action);

    const normalizedType = action === 'cornell-notes' ? 'cornell' : action;

    // If we already have this transformation cached, just switch to it
    if (this.results[normalizedType]) {
      console.log('[Widget] Switching to cached transformation:', normalizedType);
      await this.displayResults(this.results[normalizedType], normalizedType);
      this.updateButtonStates();
      return;
    }

    // Otherwise, trigger a new generation
    console.log('[Widget] Generating new transformation:', normalizedType);
    try {
      // Show loading state
      this.showLoading(normalizedType);

      // Call the global transformation function exposed by content script
      if (window.triggerWidgetTransformation) {
        await window.triggerWidgetTransformation(action);
      } else {
        console.error('[Widget] triggerWidgetTransformation not found - content script may not be loaded');
        throw new Error('Content script not ready');
      }
    } catch (error) {
      console.error('[Widget] Failed to trigger action:', error);
      const contentArea = this.container?.querySelector('.mle-content-area');
      if (contentArea) {
        contentArea.innerHTML = `<div class="mle-error"><p>Failed to generate transformation: ${error.message}</p></div>`;
      }
    }
  }

  /**
   * Update button states to show active and available transformations
   */
  updateButtonStates() {
    if (!this.container) return;

    const buttons = this.container.querySelectorAll('.mle-action-btn');
    buttons.forEach(btn => {
      const action = btn.dataset.action;
      const normalizedType = action === 'cornell-notes' ? 'cornell' : action;

      // Remove all state classes
      btn.classList.remove('active', 'available');

      // Add appropriate state class
      if (normalizedType === this.currentTab) {
        btn.classList.add('active');
      } else if (this.results[normalizedType]) {
        btn.classList.add('available');
      }
    });
  }

  /**
   * Display transformation results
   */
  async displayResults(result, type) {
    console.log('[Widget] displayResults called with type:', type, 'result:', result);

    // Normalize type (handle both 'cornell' and 'cornell-notes')
    const normalizedType = type === 'cornell-notes' ? 'cornell' : type;

    // Store results
    this.results[normalizedType] = result;
    this.currentTab = normalizedType;

    // Get content area container
    const contentArea = this.container.querySelector('.mle-content-area');
    console.log('[Widget] Content area found:', !!contentArea);

    if (!contentArea) {
      console.error('[Widget] Could not find content area');
      return;
    }

    // Build content based on type
    try {
      let content;
      let title = '';

      switch (normalizedType) {
        case 'visual':
          content = await this.buildVisualContent(result);
          title = result.title || result.metadata?.title || 'Diagram';
          break;
        case 'summary':
          console.log('[Widget] Building summary, result.content:', result.content?.substring(0, 100));
          content = this.buildSummaryContent(result);
          title = result.title || result.metadata?.title || 'Summary';
          console.log('[Widget] Summary HTML built, length:', content?.length);
          break;
        case 'studynotes':
          content = this.buildStudyNotesContent(result);
          title = result.title || result.metadata?.title || 'Study Notes';
          break;
        case 'cornell':
          content = this.buildCornellNotesContent(result);
          title = result.title || result.metadata?.title || 'Cornell Notes';
          break;
        default:
          content = '<div class="mle-error">Unknown result type</div>';
          title = 'Error';
      }

      console.log('[Widget] Setting innerHTML, content length:', content?.length);
      contentArea.innerHTML = `
        <div class="mle-content-title">${title}</div>
        <div class="mle-content-body">
          ${content}
        </div>
      `;
      console.log('[Widget] innerHTML set');

      // Update word count in footer
      const wordCountEl = this.container.querySelector('.mle-word-count');
      if (wordCountEl && result.metadata?.wordCount) {
        wordCountEl.textContent = `${result.metadata.wordCount} words`;
      }

      // Set up copy button if needed
      if (this._setupCopyButton) {
        this._setupCopyButton();
        this._setupCopyButton = null;
      }

      // If visual, initialize interactivity
      if (normalizedType === 'visual') {
        const diagramWrapper = contentArea.querySelector('.mle-diagram-wrapper');
        if (diagramWrapper) {
          await this.initializeInteractiveDiagram(diagramWrapper, result.mermaidCode);
        }
      }

      // Update button states
      this.updateButtonStates();

      // Show widget
      console.log('[Widget] Showing widget');
      this.show();
      console.log('[Widget] Display complete');

    } catch (error) {
      console.error('[Widget] Failed to display results:', error, error.stack);
      contentArea.innerHTML = `
        <div class="mle-error">
          <p>Failed to display results: ${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Build visual content (diagram)
   */
  async buildVisualContent(result) {
    const { mermaidCode, metadata } = result;
    const isDemo = metadata && metadata.source === 'demo-mode';

    const html = `
      ${isDemo ? '<div class="mle-demo-badge">Demo Mode - AI APIs not available</div>' : ''}
      <div class="mle-diagram-wrapper">
        <pre style="background: #f7fafc; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.4; border: 1px solid #e2e8f0; margin: 0;"><code>${this.escapeHtml(mermaidCode)}</code></pre>
        <p style="color: var(--mle-text-secondary); margin: 10px 0 0 0; font-size: 12px;">
          💡 Paste into <a href="https://mermaid.live" target="_blank" style="color: var(--mle-primary);">mermaid.live</a> to visualize
        </p>
      </div>
    `;

    return html;
  }

  /**
   * Build summary content
   */
  buildSummaryContent(result) {
    const { content } = result;

    // Clean, minimal design - just the formatted content
    const html = `
      <div class="mle-text-content">
        ${this.formatMarkdown(content)}
      </div>
    `;

    return html;
  }

  /**
   * Build study notes content
   */
  buildStudyNotesContent(result) {
    const { content } = result;

    const html = `
      <div class="mle-text-content mle-study-notes">
        ${this.formatMarkdown(content)}
      </div>
    `;

    return html;
  }

  /**
   * Build Cornell Notes content
   */
  buildCornellNotesContent(result) {
    const { content } = result;

    const html = `
      <div class="mle-text-content mle-cornell-notes">
        ${this.formatMarkdown(content)}
      </div>
    `;

    return html;
  }

  /**
   * Initialize interactive diagram
   */
  async initializeInteractiveDiagram(container, mermaidCode) {
    try {
      const wrapper = container.querySelector('.mle-diagram-wrapper');
      if (!wrapper) return;

      const interactive = new InteractiveDiagram(wrapper, mermaidCode);
      await interactive.initialize();

      console.log('[Widget] Interactive diagram initialized');
    } catch (error) {
      console.error('[Widget] Failed to initialize interactive diagram:', error);
    }
  }

  /**
   * Format markdown content to HTML
   */
  formatMarkdown(text) {
    if (!text) return '';

    // Process line by line to properly handle different elements
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let currentParagraph = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Empty line - close current paragraph or list
      if (!line) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        if (currentParagraph) {
          html += `<p>${currentParagraph}</p>`;
          currentParagraph = '';
        }
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (currentParagraph) { html += `<p>${currentParagraph}</p>`; currentParagraph = ''; }
        html += `<h4>${line.substring(4)}</h4>`;
      } else if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (currentParagraph) { html += `<p>${currentParagraph}</p>`; currentParagraph = ''; }
        html += `<h3>${line.substring(3)}</h3>`;
      } else if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (currentParagraph) { html += `<p>${currentParagraph}</p>`; currentParagraph = ''; }
        html += `<h2>${line.substring(2)}</h2>`;
      }
      // List items
      else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
        if (currentParagraph) { html += `<p>${currentParagraph}</p>`; currentParagraph = ''; }
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        const content = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `<li>${content}</li>`;
      }
      // Horizontal rule
      else if (line === '---' || line === '***') {
        if (inList) { html += '</ul>'; inList = false; }
        if (currentParagraph) { html += `<p>${currentParagraph}</p>`; currentParagraph = ''; }
        html += '<hr style="margin: 20px 0; border: none; border-top: 1px solid var(--mle-border-color);">';
      }
      // Regular paragraph text
      else {
        if (inList) { html += '</ul>'; inList = false; }
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (currentParagraph) {
          currentParagraph += ' ' + formatted;
        } else {
          currentParagraph = formatted;
        }
      }
    }

    // Close any open tags
    if (inList) html += '</ul>';
    if (currentParagraph) html += `<p>${currentParagraph}</p>`;

    return html;
  }

  /**
   * Escape HTML to prevent XSS and display code properly
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show loading state
   */
  showLoading(type) {
    const loadingHTML = `
      <div class="mle-loading">
        <div class="mle-spinner"></div>
        <p>Generating...</p>
      </div>
    `;

    const contentArea = this.container?.querySelector('.mle-content-area');
    if (contentArea) {
      contentArea.innerHTML = loadingHTML;
      this.show();
    }
  }

  /**
   * Copy current content to clipboard
   */
  copyCurrentContent() {
    const currentResult = this.results[this.currentTab];

    if (!currentResult) {
      console.warn('[Widget] No content to copy');
      return;
    }

    let textToCopy = '';
    const copyBtn = this.container?.querySelector('.mle-copy-all-btn');

    // Get the appropriate content based on type
    if (currentResult.content) {
      textToCopy = currentResult.content;
    } else if (currentResult.mermaidCode) {
      textToCopy = currentResult.mermaidCode;
    }

    if (!textToCopy) {
      console.warn('[Widget] No text content found to copy');
      return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        console.log('[Widget] Content copied to clipboard');

        // Visual feedback
        if (copyBtn) {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '✅ Copied!';
          copyBtn.style.background = 'var(--mle-success)';
          copyBtn.style.color = 'white';
          copyBtn.style.borderColor = 'var(--mle-success)';

          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
            copyBtn.style.borderColor = '';
          }, 2000);
        }
      })
      .catch(err => {
        console.error('[Widget] Failed to copy content:', err);

        // Error feedback
        if (copyBtn) {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '❌ Failed';

          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 2000);
        }
      });
  }

  /**
   * Clear results
   */
  clearResults() {
    this.results = {
      visual: null,
      summary: null,
      studynotes: null,
      cornell: null
    };

    const contentArea = this.container?.querySelector('.mle-content-area');
    if (contentArea) {
      contentArea.innerHTML = '<div class="mle-empty-state">Select content and right-click to generate transformations</div>';
    }

    const wordCountEl = this.container?.querySelector('.mle-word-count');
    if (wordCountEl) {
      wordCountEl.textContent = '0 words';
    }

    console.log('[Widget] Results cleared');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Widget = Widget;
}
