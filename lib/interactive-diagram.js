/**
 * InteractiveDiagram - Add interactivity to Mermaid diagrams
 * Zoom, pan, download, and node interactions
 */

class InteractiveDiagram {
  constructor(container, mermaidCode) {
    this.container = container;
    this.mermaidCode = mermaidCode;
    this.svgElement = null;
    this.scale = 1;
    this.position = { x: 0, y: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
  }

  /**
   * Make diagram interactive
   */
  async initialize() {
    this.svgElement = this.container.querySelector('svg');

    if (!this.svgElement) {
      console.warn('[InteractiveDiagram] No SVG element found');
      return;
    }

    // Add interactive features
    this.addZoomControls();
    this.addPanControls();
    this.addNodeInteractions();
    this.addActionButtons();

    // Set initial styles
    this.svgElement.style.cursor = 'grab';
    this.svgElement.style.transition = 'transform 0.1s ease-out';

    console.log('[InteractiveDiagram] Initialized successfully');
  }

  /**
   * Add zoom controls (Ctrl+Scroll)
   */
  addZoomControls() {
    this.container.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.scale = Math.max(0.3, Math.min(3, this.scale + delta));

        this.updateTransform();
      }
    }, { passive: false });

    // Zoom buttons
    const zoomIn = () => {
      this.scale = Math.min(3, this.scale + 0.2);
      this.updateTransform();
    };

    const zoomOut = () => {
      this.scale = Math.max(0.3, this.scale - 0.2);
      this.updateTransform();
    };

    const resetZoom = () => {
      this.scale = 1;
      this.position = { x: 0, y: 0 };
      this.updateTransform();
    };

    // Store methods for button access
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.resetZoom = resetZoom;
  }

  /**
   * Add pan/drag controls
   */
  addPanControls() {
    this.svgElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.isDragging = true;
        this.dragStart = {
          x: e.clientX - this.position.x,
          y: e.clientY - this.position.y
        };
        this.svgElement.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.position = {
          x: e.clientX - this.dragStart.x,
          y: e.clientY - this.dragStart.y
        };
        this.updateTransform();
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.svgElement.style.cursor = 'grab';
      }
    });

    // Prevent text selection while dragging
    this.svgElement.addEventListener('selectstart', (e) => {
      if (this.isDragging) e.preventDefault();
    });
  }

  /**
   * Add node click interactions
   */
  addNodeInteractions() {
    // Add click handlers to nodes
    const nodes = this.svgElement.querySelectorAll('.node, .nodeLabel');

    nodes.forEach(node => {
      node.style.cursor = 'pointer';

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleNodeClick(node);
      });

      // Hover effect
      node.addEventListener('mouseenter', () => {
        node.style.opacity = '0.8';
      });

      node.addEventListener('mouseleave', () => {
        node.style.opacity = '1';
      });
    });
  }

  /**
   * Handle node click
   */
  handleNodeClick(node) {
    const label = node.textContent || node.querySelector('.nodeLabel')?.textContent || 'Node';

    console.log('[InteractiveDiagram] Node clicked:', label);

    // Highlight the node
    this.highlightNode(node);

    // Could show tooltip or details here
    // For now, just log
  }

  /**
   * Highlight a node
   */
  highlightNode(node) {
    // Remove previous highlights
    this.svgElement.querySelectorAll('.mle-highlighted').forEach(n => {
      n.classList.remove('mle-highlighted');
    });

    // Add highlight
    node.classList.add('mle-highlighted');

    // Add highlight style if not exists
    if (!document.getElementById('mle-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'mle-highlight-style';
      style.textContent = `
        .mle-highlighted {
          filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.8)) !important;
          transition: filter 0.2s ease !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Update SVG transform
   */
  updateTransform() {
    if (this.svgElement) {
      this.svgElement.style.transform =
        `translate(${this.position.x}px, ${this.position.y}px) scale(${this.scale})`;
    }
  }

  /**
   * Add action buttons
   */
  addActionButtons() {
    const controls = document.createElement('div');
    controls.className = 'mle-diagram-controls';
    controls.innerHTML = `
      <div class="mle-control-group">
        <button class="mle-control-btn" data-action="zoom-in" title="Zoom In">🔍+</button>
        <button class="mle-control-btn" data-action="zoom-out" title="Zoom Out">🔍-</button>
        <button class="mle-control-btn" data-action="reset" title="Reset View">↺</button>
      </div>
      <div class="mle-control-group">
        <button class="mle-control-btn" data-action="download" title="Download SVG">💾</button>
        <button class="mle-control-btn" data-action="copy" title="Copy Mermaid Code">📋</button>
      </div>
    `;

    // Add event listeners
    controls.querySelector('[data-action="zoom-in"]').onclick = () => this.zoomIn();
    controls.querySelector('[data-action="zoom-out"]').onclick = () => this.zoomOut();
    controls.querySelector('[data-action="reset"]').onclick = () => this.resetZoom();
    controls.querySelector('[data-action="download"]').onclick = () => this.downloadSVG();
    controls.querySelector('[data-action="copy"]').onclick = () => this.copyCode();

    this.container.appendChild(controls);
  }

  /**
   * Download SVG
   */
  downloadSVG() {
    try {
      const svgData = this.svgElement.outerHTML;
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram-${Date.now()}.svg`;
      a.click();

      URL.revokeObjectURL(url);

      console.log('[InteractiveDiagram] SVG downloaded');
    } catch (error) {
      console.error('[InteractiveDiagram] Download failed:', error);
    }
  }

  /**
   * Copy Mermaid code
   */
  async copyCode() {
    try {
      await navigator.clipboard.writeText(this.mermaidCode);
      console.log('[InteractiveDiagram] Code copied to clipboard');

      // Show feedback
      this.showFeedback('Code copied!');
    } catch (error) {
      console.error('[InteractiveDiagram] Copy failed:', error);
    }
  }

  /**
   * Show temporary feedback message
   */
  showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'mle-feedback';
    feedback.textContent = message;
    this.container.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }

  /**
   * Destroy and clean up
   */
  destroy() {
    // Remove event listeners
    // (In production, should track and remove all listeners)
    this.container.querySelector('.mle-diagram-controls')?.remove();
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.InteractiveDiagram = InteractiveDiagram;
}
