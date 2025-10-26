/**
 * Floating Widget UI for Multimodal Learning Enhancer
 * Displays transformation results with tabs and interactive features
 */

class Widget {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.currentTab = 'visual';
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
          <button class="mle-tab" data-tab="visual">📊 Diagram</button>
          <button class="mle-tab" data-tab="summary">📝 Summary</button>
          <button class="mle-tab" data-tab="studynotes">🎯 Study Notes</button>
          <button class="mle-tab" data-tab="cornell">📔 Cornell Notes</button>
        </div>

        <div class="mle-widget-body">
          <div class="mle-tab-content" data-tab="visual">
            <div class="mle-empty-state">
              Generate a diagram to see it here
            </div>
          </div>

          <div class="mle-tab-content" data-tab="summary" style="display: none;">
            <div class="mle-empty-state">
              Generate a summary to see it here
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

        <div class="mle-widget-footer">
          <button class="mle-footer-btn" data-action="new">✨ New Transformation</button>
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

    // New transformation button
    this.container.querySelector('[data-action="new"]').onclick = () => {
      this.clearResults();
    };

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
    this.isVisible = true;

    // Animate in
    this.container.style.opacity = '0';
    this.container.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.container.style.transition = 'all 0.2s ease';
      this.container.style.opacity = '1';
      this.container.style.transform = 'scale(1)';
    }, 10);

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
    console.log('[Widget] Displaying results:', type);

    // Normalize type (handle both 'cornell' and 'cornell-notes')
    const normalizedType = type === 'cornell-notes' ? 'cornell' : type;

    // Store results
    this.results[normalizedType] = result;

    // Get tab content container
    const tabContent = this.container.querySelector(`[data-tab="${normalizedType}"]`);

    // Show loading state
    this.showLoading(tabContent);

    // Build content based on type
    try {
      let content;

      switch (normalizedType) {
        case 'visual':
          content = await this.buildVisualContent(result);
          break;
        case 'summary':
          content = this.buildSummaryContent(result);
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

      tabContent.innerHTML = content;

      // If visual, initialize interactivity
      if (normalizedType === 'visual') {
        await this.initializeInteractiveDiagram(tabContent, result.mermaidCode);
      }

      // Switch to this tab
      this.switchTab(normalizedType);

      // Show widget
      this.show();

    } catch (error) {
      console.error('[Widget] Failed to display results:', error);
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
    const { title, mermaidCode, diagramType } = result;

    // Create container for diagram
    const diagramId = `mle-diagram-${Date.now()}`;

    try {
      // Use VisualEngine to render
      const visualEngine = new VisualEngine();
      await visualEngine.initialize();

      const { svg } = await visualEngine.renderDiagram(mermaidCode, diagramId);

      return `
        <div class="mle-result-header">
          <h3>${title || 'Diagram'}</h3>
          <span class="mle-badge">${diagramType}</span>
        </div>
        <div class="mle-diagram-wrapper" id="${diagramId}-wrapper">
          ${svg}
        </div>
      `;
    } catch (error) {
      console.error('[Widget] Diagram rendering failed:', error);
      return `
        <div class="mle-result-header">
          <h3>${title || 'Diagram'}</h3>
        </div>
        <div class="mle-error">
          <p>Failed to render diagram: ${error.message}</p>
          <details>
            <summary>Mermaid Code</summary>
            <pre>${mermaidCode}</pre>
          </details>
        </div>
      `;
    }
  }

  /**
   * Build summary content
   */
  buildSummaryContent(result) {
    const { title, content, metadata } = result;

    return `
      <div class="mle-result-header">
        <h3>${title || 'Summary'}</h3>
        <div class="mle-meta">
          <span>${metadata.wordCount} words</span>
          <span>•</span>
          <span>${metadata.readingTime} min read</span>
          <span>•</span>
          <span>${(metadata.compressionRatio * 100).toFixed(0)}% of original</span>
        </div>
      </div>
      <div class="mle-text-content">
        ${this.formatMarkdown(content)}
      </div>
      <div class="mle-actions">
        <button class="mle-action-btn" onclick="navigator.clipboard.writeText(\`${content.replace(/`/g, '\\`')}\`)">
          📋 Copy
        </button>
      </div>
    `;
  }

  /**
   * Build study notes content
   */
  buildStudyNotesContent(result) {
    const { title, content, metadata, structure } = result;

    return `
      <div class="mle-result-header">
        <h3>${title || 'Study Notes'}</h3>
        <div class="mle-meta">
          <span>${metadata.wordCount} words</span>
          <span>•</span>
          <span>${structure?.sections || 0} sections</span>
        </div>
      </div>
      <div class="mle-text-content mle-study-notes">
        ${this.formatMarkdown(content)}
      </div>
      <div class="mle-actions">
        <button class="mle-action-btn" onclick="navigator.clipboard.writeText(\`${content.replace(/`/g, '\\`')}\`)">
          📋 Copy
        </button>
      </div>
    `;
  }

  /**
   * Build Cornell Notes content
   */
  buildCornellNotesContent(result) {
    const { title, content, metadata, structure } = result;

    return `
      <div class="mle-result-header">
        <h3>${title || 'Cornell Notes'}</h3>
        <div class="mle-meta">
          <span>${metadata.wordCount} words</span>
          <span>•</span>
          <span>${structure?.cuePairs || 0} cue pairs</span>
          ${structure?.hasSummary ? '<span>•</span><span>✓ Summary</span>' : ''}
          ${metadata.fallback ? '<span>•</span><span class="mle-badge">Fallback</span>' : ''}
        </div>
      </div>
      <div class="mle-text-content mle-cornell-notes">
        ${this.formatMarkdown(content)}
      </div>
      <div class="mle-actions">
        <button class="mle-action-btn" onclick="navigator.clipboard.writeText(\`${content.replace(/`/g, '\\`')}\`)">
          📋 Copy
        </button>
      </div>
    `;
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

    // Simple markdown formatting
    let html = text
      // Headers
      .replace(/^### (.*?)$/gm, '<h4>$1</h4>')
      .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^# (.*?)$/gm, '<h2>$1</h2>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Lists
      .replace(/^[•\-\*] (.*)$/gm, '<li>$1</li>')
      // Wrap lists
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Paragraphs
      .split('\n\n')
      .map(para => para.trim() ? `<p>${para}</p>` : '')
      .join('');

    return html;
  }

  /**
   * Show loading state
   */
  showLoading(container) {
    container.innerHTML = `
      <div class="mle-loading">
        <div class="mle-spinner"></div>
        <p>Generating...</p>
      </div>
    `;
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
