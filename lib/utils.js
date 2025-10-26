/**
 * Shared utility functions for Multimodal Learning Enhancer
 */

const Utils = {
  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Clean and normalize text content
   */
  cleanText(text) {
    if (!text) return '';

    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim();
  },

  /**
   * Truncate text to specified length
   */
  truncate(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Estimate reading time in minutes
   */
  estimateReadingTime(text, wordsPerMinute = 200) {
    if (!text) return 0;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  },

  /**
   * Calculate word count
   */
  wordCount(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  },

  /**
   * Format timestamp to readable string
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  },

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Wait for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Retry async function with exponential backoff
   */
  async retry(fn, maxAttempts = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await this.sleep(delayMs * attempt);
      }
    }
  },

  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  },

  /**
   * Sanitize HTML to prevent XSS
   */
  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  /**
   * Create DOM element from HTML string
   */
  createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback method
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  },

  /**
   * Download content as file
   */
  downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Check if element is visible in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Scroll element into view smoothly
   */
  scrollIntoView(element, options = {}) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      ...options
    });
  },

  /**
   * Show loading spinner
   */
  showLoading(container, message = 'Loading...') {
    const loader = this.createElementFromHTML(`
      <div class="mle-loader">
        <div class="mle-spinner"></div>
        <p>${message}</p>
      </div>
    `);
    container.innerHTML = '';
    container.appendChild(loader);
    return loader;
  },

  /**
   * Show error message
   */
  showError(container, message, details = null) {
    const error = this.createElementFromHTML(`
      <div class="mle-error">
        <div class="mle-error-icon">⚠️</div>
        <h3>Error</h3>
        <p>${message}</p>
        ${details ? `<details><summary>Details</summary><pre>${details}</pre></details>` : ''}
      </div>
    `);
    container.innerHTML = '';
    container.appendChild(error);
    return error;
  },

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
};

// Make Utils available globally for content scripts
if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
