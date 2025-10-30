/**
 * VisualEngine - Render and display Mermaid diagrams
 * Handles Mermaid.js integration and diagram display
 */

class VisualEngine {
  constructor() {
    this.mermaid = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize Mermaid.js
   */
  async initialize() {
    if (this.isInitialized) return true;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._loadMermaid();
    return this.initPromise;
  }

  /**
   * Load Mermaid.js library
   * Tries local file first (for offline mode), then falls back to CDN
   */
  async _loadMermaid() {
    try {
      console.log('[VisualEngine] Loading Mermaid.js...');

      // Check if Mermaid is already loaded
      if (typeof window.mermaid !== 'undefined') {
        this.mermaid = window.mermaid;
        this._configureMermaid();
        this.isInitialized = true;
        console.log('[VisualEngine] Mermaid.js already loaded');
        return true;
      }

      // Try to load from local file first (for offline mode)
      const localLoaded = await this._tryLoadLocal();

      if (localLoaded) {
        console.log('[VisualEngine] Mermaid.js loaded from local file (offline mode enabled)');
      } else {
        // Fallback to CDN if local file not available
        console.log('[VisualEngine] Local file not found, loading from CDN...');
        await this._loadFromCDN();
        console.log('[VisualEngine] Mermaid.js loaded from CDN (requires internet)');
      }

      // Wait a bit for mermaid to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      if (typeof window.mermaid === 'undefined') {
        throw new Error('Mermaid.js loaded but not accessible');
      }

      this.mermaid = window.mermaid;
      this._configureMermaid();
      this.isInitialized = true;

      console.log('[VisualEngine] Mermaid.js initialized successfully');
      return true;

    } catch (error) {
      console.error('[VisualEngine] Failed to load Mermaid.js:', error);
      throw new Error(`Mermaid initialization failed: ${error.message}. Please check internet connection or see OFFLINE_SETUP.md for offline mode.`);
    }
  }

  /**
   * Try to load Mermaid from local extension file
   * Returns true if successful, false if file not found
   */
  async _tryLoadLocal() {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('lib/mermaid.min.js');
      // Don't use type="module" - we need global window.mermaid

      await new Promise((resolve, reject) => {
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false); // Don't reject, just return false
        document.head.appendChild(script);
      });

      return typeof window.mermaid !== 'undefined';
    } catch (error) {
      console.log('[VisualEngine] Local Mermaid.js not available:', error.message);
      return false;
    }
  }

  /**
   * Load Mermaid from CDN (fallback)
   */
  async _loadFromCDN() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    // Don't use type="module" - we need global window.mermaid

    await new Promise((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Mermaid.js from CDN. Check internet connection.'));
      document.head.appendChild(script);
    });
  }

  /**
   * Configure Mermaid settings
   */
  _configureMermaid() {
    try {
      this.mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        },
        mindmap: {
          useMaxWidth: true
        },
        timeline: {
          useMaxWidth: true
        }
      });
      console.log('[VisualEngine] Mermaid configured');
    } catch (error) {
      console.error('[VisualEngine] Failed to configure Mermaid:', error);
    }
  }

  /**
   * Render Mermaid diagram
   */
  async renderDiagram(mermaidCode, containerId = null) {
    try {
      // Ensure Mermaid is loaded
      await this.initialize();

      // Generate unique ID for this diagram
      const diagramId = containerId || `mermaid-diagram-${Date.now()}`;

      console.log('[VisualEngine] Rendering diagram:', diagramId);

      // Render diagram
      const { svg, bindFunctions } = await this.mermaid.render(diagramId, mermaidCode);

      console.log('[VisualEngine] Diagram rendered successfully');

      return {
        svg: svg,
        id: diagramId,
        mermaidCode: mermaidCode,
        success: true
      };

    } catch (error) {
      console.error('[VisualEngine] Diagram rendering failed:', error);

      // Try to provide helpful error message
      if (error.message.includes('Parse error') || error.message.includes('syntax')) {
        throw new Error(`Mermaid syntax error: ${error.message}. The generated diagram code may be invalid.`);
      }

      throw new Error(`Diagram rendering failed: ${error.message}`);
    }
  }

  /**
   * Render diagram to HTML string (for console display)
   */
  async renderToHTML(mermaidCode, title = '') {
    try {
      const { svg } = await this.renderDiagram(mermaidCode);

      const html = `
        <div class="mle-diagram-container">
          ${title ? `<h3 class="mle-diagram-title">${title}</h3>` : ''}
          <div class="mle-diagram">
            ${svg}
          </div>
        </div>
      `;

      return html;

    } catch (error) {
      console.error('[VisualEngine] Failed to render to HTML:', error);
      return `
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
   * Create diagram display element
   */
  async createDiagramElement(mermaidCode, title = '', options = {}) {
    try {
      const { svg } = await this.renderDiagram(mermaidCode);

      const container = document.createElement('div');
      container.className = 'mle-diagram-container';

      if (title) {
        const titleEl = document.createElement('h3');
        titleEl.className = 'mle-diagram-title';
        titleEl.textContent = title;
        container.appendChild(titleEl);
      }

      const diagramDiv = document.createElement('div');
      diagramDiv.className = 'mle-diagram';
      diagramDiv.innerHTML = svg;
      container.appendChild(diagramDiv);

      // Add controls if requested
      if (options.addControls) {
        const controls = this.createControls(svg, mermaidCode);
        container.appendChild(controls);
      }

      return container;

    } catch (error) {
      console.error('[VisualEngine] Failed to create diagram element:', error);

      const errorDiv = document.createElement('div');
      errorDiv.className = 'mle-error';
      errorDiv.innerHTML = `
        <p>Failed to render diagram: ${error.message}</p>
        <details>
          <summary>Mermaid Code</summary>
          <pre>${mermaidCode}</pre>
        </details>
      `;

      return errorDiv;
    }
  }

  /**
   * Create control buttons for diagram
   */
  createControls(svg, mermaidCode) {
    const controls = document.createElement('div');
    controls.className = 'mle-diagram-controls';

    // Download SVG button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'mle-diagram-btn';
    downloadBtn.textContent = '💾 Download SVG';
    downloadBtn.onclick = () => this.downloadSVG(svg, 'diagram.svg');

    // Copy Mermaid code button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'mle-diagram-btn';
    copyBtn.textContent = '📋 Copy Code';
    copyBtn.onclick = () => this.copyMermaidCode(mermaidCode);

    controls.appendChild(downloadBtn);
    controls.appendChild(copyBtn);

    return controls;
  }

  /**
   * Download SVG
   */
  downloadSVG(svgContent, filename = 'diagram.svg') {
    try {
      // Extract just the SVG element if it's wrapped in HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'text/html');
      const svgEl = doc.querySelector('svg');

      const svgData = svgEl ? svgEl.outerHTML : svgContent;

      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);

      console.log('[VisualEngine] SVG downloaded');
    } catch (error) {
      console.error('[VisualEngine] Failed to download SVG:', error);
    }
  }

  /**
   * Copy Mermaid code to clipboard
   */
  async copyMermaidCode(mermaidCode) {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      console.log('[VisualEngine] Mermaid code copied to clipboard');

      // Could show a toast notification here
    } catch (error) {
      console.error('[VisualEngine] Failed to copy code:', error);
    }
  }

  /**
   * Validate Mermaid code by attempting to render it
   */
  async validate(mermaidCode) {
    try {
      await this.renderDiagram(mermaidCode);
      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get diagram info
   */
  async getDiagramInfo(mermaidCode) {
    const info = {
      type: 'unknown',
      nodeCount: 0,
      valid: false
    };

    // Detect type
    if (mermaidCode.includes('graph')) {
      info.type = 'flowchart';
      info.nodeCount = (mermaidCode.match(/\w+\[/g) || []).length;
    } else if (mermaidCode.includes('mindmap')) {
      info.type = 'mindmap';
      info.nodeCount = (mermaidCode.match(/^\s+\w+/gm) || []).length;
    } else if (mermaidCode.includes('timeline')) {
      info.type = 'timeline';
      info.nodeCount = (mermaidCode.match(/:/g) || []).length;
    }

    // Validate
    const validation = await this.validate(mermaidCode);
    info.valid = validation.valid;
    info.error = validation.error;

    return info;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.VisualEngine = VisualEngine;
}
