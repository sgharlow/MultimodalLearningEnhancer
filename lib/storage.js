/**
 * Storage Manager for Multimodal Learning Enhancer
 * Manages transformation history using chrome.storage.local
 */

class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      TRANSFORMATIONS: 'transformations',
      SETTINGS: 'settings',
      STATS: 'stats'
    };

    this.MAX_TRANSFORMATIONS = 100; // Increased from 50
    this.STORAGE_VERSION = '1.0.0';
  }

  /**
   * Initialize storage with default values
   */
  async initialize() {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEYS.SETTINGS]);

      if (!result[this.STORAGE_KEYS.SETTINGS]) {
        await this.saveSettings({
          version: this.STORAGE_VERSION,
          maxHistory: this.MAX_TRANSFORMATIONS,
          autoSave: true,
          notifications: true
        });
      }

      console.log('[Storage] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Storage] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Save a transformation to history
   */
  async saveTransformation(transformation) {
    try {
      const transformations = await this.getTransformations();

      // Create transformation object
      const newTransformation = {
        id: this.generateId(),
        type: transformation.type,
        title: transformation.title || 'Untitled',
        url: transformation.url || '',
        sourceType: transformation.sourceType || 'auto',
        output: transformation.output,
        created: Date.now(),
        metadata: {
          contentLength: transformation.output?.metadata?.originalLength || 0,
          diagramType: transformation.output?.diagramType || null
        }
      };

      // Add to beginning of array
      transformations.unshift(newTransformation);

      // Trim to max size
      const trimmed = transformations.slice(0, this.MAX_TRANSFORMATIONS);

      // Save to storage
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.TRANSFORMATIONS]: trimmed
      });

      // Update stats
      await this.incrementStat(transformation.type);

      console.log('[Storage] Transformation saved:', newTransformation.id);
      return { success: true, id: newTransformation.id, count: trimmed.length };
    } catch (error) {
      console.error('[Storage] Save failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all transformations
   */
  async getTransformations() {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEYS.TRANSFORMATIONS]);
      return result[this.STORAGE_KEYS.TRANSFORMATIONS] || [];
    } catch (error) {
      console.error('[Storage] Get transformations failed:', error);
      return [];
    }
  }

  /**
   * Get a single transformation by ID
   */
  async getTransformation(id) {
    try {
      const transformations = await this.getTransformations();
      return transformations.find(t => t.id === id) || null;
    } catch (error) {
      console.error('[Storage] Get transformation failed:', error);
      return null;
    }
  }

  /**
   * Delete a single transformation
   */
  async deleteTransformation(id) {
    try {
      const transformations = await this.getTransformations();
      const filtered = transformations.filter(t => t.id !== id);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.TRANSFORMATIONS]: filtered
      });

      console.log('[Storage] Transformation deleted:', id);
      return { success: true, count: filtered.length };
    } catch (error) {
      console.error('[Storage] Delete failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete multiple transformations
   */
  async deleteTransformations(ids) {
    try {
      const transformations = await this.getTransformations();
      const filtered = transformations.filter(t => !ids.includes(t.id));

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.TRANSFORMATIONS]: filtered
      });

      console.log('[Storage] Transformations deleted:', ids.length);
      return { success: true, count: filtered.length };
    } catch (error) {
      console.error('[Storage] Bulk delete failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all transformations
   */
  async clearTransformations() {
    try {
      await chrome.storage.local.remove([this.STORAGE_KEYS.TRANSFORMATIONS]);
      await this.resetStats();

      console.log('[Storage] All transformations cleared');
      return { success: true };
    } catch (error) {
      console.error('[Storage] Clear failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search transformations
   */
  async searchTransformations(query) {
    try {
      const transformations = await this.getTransformations();

      if (!query || query.trim() === '') {
        return transformations;
      }

      const lowerQuery = query.toLowerCase();
      return transformations.filter(t => {
        return (
          (t.title && t.title.toLowerCase().includes(lowerQuery)) ||
          (t.url && t.url.toLowerCase().includes(lowerQuery)) ||
          (t.type && t.type.toLowerCase().includes(lowerQuery))
        );
      });
    } catch (error) {
      console.error('[Storage] Search failed:', error);
      return [];
    }
  }

  /**
   * Filter transformations by type
   */
  async filterTransformationsByType(type) {
    try {
      const transformations = await this.getTransformations();

      if (!type || type === 'all') {
        return transformations;
      }

      return transformations.filter(t => t.type === type);
    } catch (error) {
      console.error('[Storage] Filter failed:', error);
      return [];
    }
  }

  /**
   * Get transformations by date range
   */
  async getTransformationsByDateRange(startDate, endDate) {
    try {
      const transformations = await this.getTransformations();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      return transformations.filter(t => {
        return t.created >= start && t.created <= end;
      });
    } catch (error) {
      console.error('[Storage] Date range filter failed:', error);
      return [];
    }
  }

  /**
   * Export transformations to JSON
   */
  async exportTransformations() {
    try {
      const transformations = await this.getTransformations();
      const stats = await this.getStats();
      const settings = await this.getSettings();

      const exportData = {
        version: this.STORAGE_VERSION,
        exported: new Date().toISOString(),
        transformations,
        stats,
        settings,
        count: transformations.length
      };

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
        filename: `learning-enhancer-export-${Date.now()}.json`
      };
    } catch (error) {
      console.error('[Storage] Export failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import transformations from JSON
   */
  async importTransformations(jsonData) {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.transformations || !Array.isArray(importData.transformations)) {
        throw new Error('Invalid import format');
      }

      // Get existing transformations
      const existing = await this.getTransformations();

      // Merge (newest first, no duplicates by ID)
      const existingIds = new Set(existing.map(t => t.id));
      const newTransformations = importData.transformations.filter(t => !existingIds.has(t.id));

      const merged = [...existing, ...newTransformations];
      const trimmed = merged.slice(0, this.MAX_TRANSFORMATIONS);

      // Save merged transformations
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.TRANSFORMATIONS]: trimmed
      });

      console.log('[Storage] Import successful:', newTransformations.length, 'new items');
      return {
        success: true,
        imported: newTransformations.length,
        total: trimmed.length
      };
    } catch (error) {
      console.error('[Storage] Import failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save settings
   */
  async saveSettings(settings) {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.SETTINGS]: settings
      });

      console.log('[Storage] Settings saved');
      return { success: true };
    } catch (error) {
      console.error('[Storage] Save settings failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get settings
   */
  async getSettings() {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEYS.SETTINGS]);
      return result[this.STORAGE_KEYS.SETTINGS] || {
        version: this.STORAGE_VERSION,
        maxHistory: this.MAX_TRANSFORMATIONS,
        autoSave: true,
        notifications: true
      };
    } catch (error) {
      console.error('[Storage] Get settings failed:', error);
      return {};
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEYS.STATS]);
      return result[this.STORAGE_KEYS.STATS] || {
        totalTransformations: 0,
        byType: {
          visual: 0,
          summary: 0,
          studynotes: 0
        },
        lastUsed: null
      };
    } catch (error) {
      console.error('[Storage] Get stats failed:', error);
      return {};
    }
  }

  /**
   * Increment stat counter
   */
  async incrementStat(type) {
    try {
      const stats = await this.getStats();

      stats.totalTransformations = (stats.totalTransformations || 0) + 1;
      stats.byType = stats.byType || {};
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.lastUsed = Date.now();

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.STATS]: stats
      });

      return { success: true };
    } catch (error) {
      console.error('[Storage] Increment stat failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset statistics
   */
  async resetStats() {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.STATS]: {
          totalTransformations: 0,
          byType: {
            visual: 0,
            summary: 0,
            studynotes: 0
          },
          lastUsed: null
        }
      });

      console.log('[Storage] Stats reset');
      return { success: true };
    } catch (error) {
      console.error('[Storage] Reset stats failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo() {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const transformations = await this.getTransformations();
      const quota = chrome.storage.local.QUOTA_BYTES || 10485760; // 10MB default

      return {
        bytesInUse,
        quota,
        percentUsed: ((bytesInUse / quota) * 100).toFixed(2),
        transformationCount: transformations.length,
        maxTransformations: this.MAX_TRANSFORMATIONS
      };
    } catch (error) {
      console.error('[Storage] Get storage info failed:', error);
      return null;
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean old transformations (older than X days)
   */
  async cleanOldTransformations(daysOld = 30) {
    try {
      const transformations = await this.getTransformations();
      const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

      const filtered = transformations.filter(t => t.created >= cutoffDate);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.TRANSFORMATIONS]: filtered
      });

      const removed = transformations.length - filtered.length;
      console.log('[Storage] Cleaned old transformations:', removed, 'removed');

      return { success: true, removed, remaining: filtered.length };
    } catch (error) {
      console.error('[Storage] Clean failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const storageManager = new StorageManager();

// Make available globally
if (typeof window !== 'undefined') {
  window.StorageManager = storageManager;
}

// Export for service worker
if (typeof self !== 'undefined' && self.registration) {
  self.StorageManager = storageManager;
}
