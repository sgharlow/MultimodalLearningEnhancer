/**
 * ContentExtractor - Extracts clean content from web pages
 * Supports both auto-detection and text selection modes
 */

class ContentExtractor {
  constructor() {
    this.selectors = {
      // Primary content containers (in priority order)
      article: ['article', 'main', '[role="main"]', '.article', '.post', '.content'],

      // Elements to exclude
      exclude: [
        'nav', 'header', 'footer', 'aside',
        '.nav', '.navigation', '.sidebar', '.menu',
        '.ad', '.ads', '.advertisement', '.promo',
        '.social', '.share', '.comments', '.related',
        'script', 'style', 'iframe', 'noscript'
      ]
    };

    this.minContentLength = 100; // Minimum characters for valid content
  }

  /**
   * Main extraction method
   * @param {Object} options - Extraction options
   * @returns {Object} Extracted content with metadata
   */
  extract(options = {}) {
    const { source = 'auto', selectionText = null } = options;

    const extraction = {
      title: '',
      content: '',
      url: window.location.href,
      domain: this.extractDomain(),
      timestamp: Date.now(),
      sourceType: source,
      metadata: {}
    };

    try {
      // Handle different extraction modes
      if (source === 'selection' && selectionText) {
        extraction.content = this.cleanText(selectionText);
        extraction.title = this.generateTitleFromContent(extraction.content);
      } else {
        // Auto-detect and extract main content
        const articleContent = this.extractArticle();
        extraction.content = articleContent.content;
        extraction.title = articleContent.title;
        extraction.metadata = articleContent.metadata;
      }

      // Validate extracted content
      if (extraction.content.length < this.minContentLength) {
        throw new Error('Extracted content is too short');
      }

      // Add additional metadata
      extraction.metadata.wordCount = Utils.wordCount(extraction.content);
      extraction.metadata.readingTime = Utils.estimateReadingTime(extraction.content);
      extraction.metadata.contentLength = extraction.content.length;

      console.log('Content extracted successfully:', {
        title: extraction.title,
        length: extraction.content.length,
        wordCount: extraction.metadata.wordCount
      });

      return extraction;

    } catch (error) {
      console.error('Content extraction failed:', error);
      throw new Error(`Failed to extract content: ${error.message}`);
    }
  }

  /**
   * Extract article content using smart detection
   * @returns {Object} Article content with title and metadata
   */
  extractArticle() {
    const result = {
      content: '',
      title: '',
      metadata: {
        author: '',
        date: '',
        description: ''
      }
    };

    // Try to find main content container
    let mainContainer = this.findMainContainer();

    if (!mainContainer) {
      // Fallback to heuristic extraction
      console.warn('No main container found, using heuristic extraction');
      mainContainer = this.heuristicExtraction();
    }

    if (mainContainer) {
      // Clone container to avoid modifying the page
      const cloned = mainContainer.cloneNode(true);

      // Clean the cloned content
      this.removeUnwantedElements(cloned);

      // Extract text content
      result.content = this.cleanText(cloned.textContent);
    }

    // Extract title
    result.title = this.extractTitle();

    // Extract metadata
    result.metadata = this.extractMetadata();

    return result;
  }

  /**
   * Find main content container
   * @returns {Element|null} Main content element
   */
  findMainContainer() {
    // Try each selector in order
    for (const selector of this.selectors.article) {
      const element = document.querySelector(selector);
      if (element && this.isValidContentContainer(element)) {
        console.log('Found main container:', selector);
        return element;
      }
    }
    return null;
  }

  /**
   * Heuristic extraction - find element with most paragraphs
   * @returns {Element|null} Best content container
   */
  heuristicExtraction() {
    const candidates = document.querySelectorAll('div, section, article');
    let bestContainer = null;
    let maxScore = 0;

    candidates.forEach(container => {
      const score = this.scoreContentContainer(container);
      if (score > maxScore) {
        maxScore = score;
        bestContainer = container;
      }
    });

    if (bestContainer) {
      console.log('Heuristic extraction found container with score:', maxScore);
    }

    return bestContainer;
  }

  /**
   * Score a container based on content quality indicators
   * @param {Element} container - Element to score
   * @returns {number} Score (higher is better)
   */
  scoreContentContainer(container) {
    let score = 0;

    // Count paragraphs (main indicator)
    const paragraphs = container.querySelectorAll('p');
    score += paragraphs.length * 10;

    // Count text length
    const textLength = container.textContent.length;
    score += Math.min(textLength / 100, 50); // Cap at 50 points

    // Bonus for semantic elements
    score += container.querySelectorAll('h1, h2, h3').length * 5;
    score += container.querySelectorAll('ul, ol').length * 3;
    score += container.querySelectorAll('blockquote').length * 2;

    // Penalty for unwanted elements
    score -= container.querySelectorAll('nav, aside, .ad').length * 10;

    // Penalty if container is too shallow
    const depth = this.getElementDepth(container);
    if (depth < 2) score -= 20;

    return score;
  }

  /**
   * Check if element is a valid content container
   * @param {Element} element - Element to check
   * @returns {boolean} True if valid
   */
  isValidContentContainer(element) {
    if (!element) return false;

    const text = element.textContent.trim();
    const paragraphs = element.querySelectorAll('p').length;

    return (
      text.length >= this.minContentLength &&
      paragraphs >= 2
    );
  }

  /**
   * Remove unwanted elements from container
   * @param {Element} container - Container to clean
   */
  removeUnwantedElements(container) {
    this.selectors.exclude.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Remove elements with low text density (likely ads/widgets)
    const allDivs = container.querySelectorAll('div');
    allDivs.forEach(div => {
      const textLength = div.textContent.trim().length;
      const childCount = div.children.length;

      // If has many children but little text, likely a widget
      if (childCount > 5 && textLength < 100) {
        div.remove();
      }
    });

    // Remove hidden elements
    const allElements = container.querySelectorAll('*');
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        el.remove();
      }
    });
  }

  /**
   * Extract page title
   * @returns {string} Page title
   */
  extractTitle() {
    // Try multiple sources for title
    const sources = [
      // OpenGraph title
      () => document.querySelector('meta[property="og:title"]')?.content,
      // Twitter title
      () => document.querySelector('meta[name="twitter:title"]')?.content,
      // First H1
      () => document.querySelector('h1')?.textContent,
      // Document title
      () => document.title,
      // Fallback
      () => 'Untitled'
    ];

    for (const source of sources) {
      const title = source();
      if (title && title.trim()) {
        return this.cleanText(title.trim());
      }
    }

    return 'Untitled';
  }

  /**
   * Extract page metadata
   * @returns {Object} Metadata
   */
  extractMetadata() {
    return {
      author: this.extractAuthor(),
      date: this.extractDate(),
      description: this.extractDescription(),
      keywords: this.extractKeywords()
    };
  }

  /**
   * Extract author name
   * @returns {string} Author name
   */
  extractAuthor() {
    const sources = [
      document.querySelector('meta[name="author"]')?.content,
      document.querySelector('meta[property="article:author"]')?.content,
      document.querySelector('.author')?.textContent,
      document.querySelector('.byline')?.textContent
    ];

    return sources.find(s => s && s.trim()) || '';
  }

  /**
   * Extract publication date
   * @returns {string} Publication date
   */
  extractDate() {
    const sources = [
      document.querySelector('meta[property="article:published_time"]')?.content,
      document.querySelector('time')?.getAttribute('datetime'),
      document.querySelector('.date')?.textContent,
      document.querySelector('.published')?.textContent
    ];

    return sources.find(s => s && s.trim()) || '';
  }

  /**
   * Extract description
   * @returns {string} Description
   */
  extractDescription() {
    const sources = [
      document.querySelector('meta[name="description"]')?.content,
      document.querySelector('meta[property="og:description"]')?.content,
      document.querySelector('meta[name="twitter:description"]')?.content
    ];

    return sources.find(s => s && s.trim()) || '';
  }

  /**
   * Extract keywords
   * @returns {string} Keywords
   */
  extractKeywords() {
    return document.querySelector('meta[name="keywords"]')?.content || '';
  }

  /**
   * Generate title from content (for selections)
   * @param {string} content - Content text
   * @returns {string} Generated title
   */
  generateTitleFromContent(content) {
    // Take first sentence or first 60 characters
    const firstSentence = content.split(/[.!?]/)[0];
    const title = firstSentence.length > 60
      ? firstSentence.substring(0, 60) + '...'
      : firstSentence;
    return title.trim() || 'Selected Text';
  }

  /**
   * Clean text content
   * @param {string} text - Raw text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return '';

    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Extract domain from current URL
   * @returns {string} Domain name
   */
  extractDomain() {
    try {
      const url = new URL(window.location.href);
      return url.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get element depth in DOM tree
   * @param {Element} element - Element to measure
   * @returns {number} Depth level
   */
  getElementDepth(element) {
    let depth = 0;
    let current = element;
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }

  /**
   * Get current text selection
   * @returns {string|null} Selected text
   */
  getSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    return text.length > 0 ? text : null;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ContentExtractor = ContentExtractor;
}
