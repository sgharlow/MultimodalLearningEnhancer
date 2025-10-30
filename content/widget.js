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
          <h2 class="mle-widget-title">🧠 Learning Enhancer</h2>
          <button class="mle-close-btn" title="Close">×</button>
        </div>

        <div class="mle-widget-tabs">
          <button class="mle-tab" data-tab="summary">📝 Summary</button>
          <button class="mle-tab" data-tab="visual">📊 Diagram</button>
          <button class="mle-tab" data-tab="studynotes">🎯 Study Notes</button>
          <button class="mle-tab" data-tab="cornell">📔 Cornell Notes</button>
        </div>

        <div class="mle-widget-body">
          <div class="mle-tab-content" data-tab="summary">
            <div class="mle-empty-state">
              Generate a summary to see it here
            </div>
          </div>

          <div class="mle-tab-content" data-tab="visual" style="display: none;">
            <div class="mle-empty-state">
              Generate a diagram to see it here
            </div>
          </div>

          <div class="mle-tab-content" data-tab="studynotes" style="display: none;">
            <div class="mle-empty-state">
              Generate study notes to see them here
            </div>
          </div>

          <div class="mle-tab-content" data-tab="cornell" style="display: none;">
            <div class="mle-empty-state">
              Generate Cornell notes to see them here
            </div>
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

    // Tab buttons
    this.container.querySelectorAll('.mle-tab').forEach(tab => {
      tab.onclick = () => {
        this.switchTab(tab.dataset.tab);
      };
    });

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
   * Switch tab
   */
  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    this.container.querySelectorAll('.mle-tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update tab content
    this.container.querySelectorAll('.mle-tab-content').forEach(content => {
      if (content.dataset.tab === tabName) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });

    console.log('[Widget] Switched to tab:', tabName);
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

    // Get tab content container
    const tabContent = this.container.querySelector(`[data-tab="${normalizedType}"]`);
    console.log('[Widget] Tab content found:', !!tabContent, 'for type:', normalizedType);

    if (!tabContent) {
      console.error('[Widget] Could not find tab content for:', normalizedType);
      console.error('[Widget] Container:', this.container);
      console.error('[Widget] All tabs:', this.container.querySelectorAll('.mle-tab-content'));
      return;
    }

    // Build content based on type
    try {
      let content;

      switch (normalizedType) {
        case 'visual':
          content = await this.buildVisualContent(result);
          break;
        case 'summary':
          console.log('[Widget] Building summary, result.content:', result.content?.substring(0, 100));
          content = this.buildSummaryContent(result);
          console.log('[Widget] Summary HTML built, length:', content?.length);
          break;
        case 'studynotes':
          content = this.buildStudyNotesContent(result);
          break;
        case 'cornell':
          content = this.buildCornellNotesContent(result);
          break;
        default:
          content = '<div class="mle-error">Unknown result type</div>';
      }

      console.log('[Widget] Setting innerHTML, content length:', content?.length);
      tabContent.innerHTML = content;
      console.log('[Widget] innerHTML set, tabContent.innerHTML length:', tabContent.innerHTML.length);

      // Set up copy button if needed
      if (this._setupCopyButton) {
        this._setupCopyButton();
        this._setupCopyButton = null;
      }

      // If visual, initialize interactivity
      if (normalizedType === 'visual') {
        await this.initializeInteractiveDiagram(tabContent, result.mermaidCode);
      }

      // Switch to this tab and show widget
      console.log('[Widget] Switching to tab and showing widget');
      this.switchTab(normalizedType);
      this.show();
      console.log('[Widget] Display complete');

    } catch (error) {
      console.error('[Widget] Failed to display results:', error, error.stack);
      tabContent.innerHTML = `
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
    const { mermaidCode, diagramType, metadata } = result;
    const contentId = `mle-content-${Date.now()}`;

    const isDemo = metadata && metadata.source === 'demo-mode';

    const html = `
      <div class="mle-content-header">
        <span class="mle-word-count">${diagramType}${isDemo ? ' (Demo)' : ''}</span>
        <button class="mle-copy-btn-mini" onclick="navigator.clipboard.writeText(\`${mermaidCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`).then(() => { this.textContent='✅'; setTimeout(()=>this.textContent='📋',2000); })" title="Copy code">📋</button>
      </div>
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
    const { content, metadata } = result;

    // Store content for copy button
    const contentId = `mle-content-${Date.now()}`;

    // Clean, minimal design - just the content
    const html = `
      <div class="mle-content-header">
        <span class="mle-word-count">${metadata?.wordCount || 'N/A'} words</span>
        <button class="mle-copy-btn-mini" data-content-id="${contentId}" title="Copy to clipboard">📋</button>
      </div>
      <div class="mle-text-content" id="${contentId}">
        ${this.formatMarkdown(content)}
      </div>
    `;

    // Store original content for copying
    this._setupCopyButton = () => {
      const copyBtn = this.container.querySelector(`[data-content-id="${contentId}"]`);
      if (copyBtn && !copyBtn.onclick) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(content).then(() => {
            copyBtn.textContent = '✅';
            setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
          }).catch(err => {
            console.error('[Widget] Copy failed:', err);
            copyBtn.textContent = '❌';
            setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
          });
        };
      }
    };

    return html;
  }

  /**
   * Build study notes content
   */
  buildStudyNotesContent(result) {
    const { content, metadata } = result;
    const contentId = `mle-content-${Date.now()}`;

    const html = `
      <div class="mle-content-header">
        <span class="mle-word-count">${metadata?.wordCount || 'N/A'} words</span>
        <button class="mle-copy-btn-mini" data-content-id="${contentId}" title="Copy to clipboard">📋</button>
      </div>
      <div class="mle-text-content mle-study-notes" id="${contentId}">
        ${this.formatMarkdown(content)}
      </div>
    `;

    this._setupCopyButton = () => {
      const copyBtn = this.container.querySelector(`[data-content-id="${contentId}"]`);
      if (copyBtn && !copyBtn.onclick) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(content).then(() => {
            copyBtn.textContent = '✅';
            setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
          });
        };
      }
    };

    return html;
  }

  /**
   * Build Cornell Notes content
   */
  buildCornellNotesContent(result) {
    const { content, metadata } = result;
    const contentId = `mle-content-${Date.now()}`;

    const html = `
      <div class="mle-content-header">
        <span class="mle-word-count">${metadata?.wordCount || 'N/A'} words</span>
        <button class="mle-copy-btn-mini" data-content-id="${contentId}" title="Copy to clipboard">📋</button>
      </div>
      <div class="mle-text-content mle-cornell-notes" id="${contentId}">
        ${this.formatMarkdown(content)}
      </div>
    `;

    this._setupCopyButton = () => {
      const copyBtn = this.container.querySelector(`[data-content-id="${contentId}"]`);
      if (copyBtn && !copyBtn.onclick) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(content).then(() => {
            copyBtn.textContent = '✅';
            setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
          });
        };
      }
    };

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
   * Show loading state (can be called with tab type or container)
   */
  showLoading(typeOrContainer) {
    const loadingHTML = `
      <div class="mle-loading">
        <div class="mle-spinner"></div>
        <p>Generating...</p>
      </div>
    `;

    // If called with a DOM element (container)
    if (typeOrContainer instanceof HTMLElement) {
      typeOrContainer.innerHTML = loadingHTML;
      return;
    }

    // If called with a type string, show widget with loading state
    const type = typeOrContainer;
    const normalizedType = type === 'cornell-notes' ? 'cornell' : type;
    const tabContent = this.container?.querySelector(`[data-tab="${normalizedType}"]`);

    if (tabContent) {
      tabContent.innerHTML = loadingHTML;
      this.switchTab(normalizedType);
      this.show();
    }
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

    this.container.querySelectorAll('.mle-tab-content').forEach(content => {
      content.innerHTML = '<div class="mle-empty-state">Generate content to see it here</div>';
    });

    console.log('[Widget] Results cleared');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Widget = Widget;
}
