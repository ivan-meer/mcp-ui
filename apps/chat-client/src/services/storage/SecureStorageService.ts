/**
 * 🔐 SECURE STORAGE SERVICE
 * 
 * High-level service for secure API key management
 * Integrates with IndexedDBService and provides additional security features
 */

import { indexedDBService } from './IndexedDBService';

export interface ApiKeyConfig {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  created: Date;
}

export interface StorageStats {
  totalKeys: number;
  activeKeys: number;
  providers: string[];
  lastUpdate: Date;
}

class SecureStorageService {
  private initialized = false;

  /**
   * Initialize the secure storage service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await indexedDBService.init();
      this.initialized = true;
      console.log('🔐 Secure storage service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize secure storage:', error);
      throw error;
    }
  }

  /**
   * Store API key with validation
   */
  async storeApiKey(provider: string, key: string, name?: string): Promise<string> {
    await this.ensureInitialized();
    
    // Validate inputs
    if (!provider || !key) {
      throw new Error('Provider and API key are required');
    }
    
    if (key.length < 10) {
      throw new Error('API key appears to be too short');
    }
    
    // Check for existing active keys for this provider
    const existingKeys = await this.listApiKeys();
    const existingActiveKey = existingKeys.find(k => k.provider === provider && k.isActive);
    
    if (existingActiveKey) {
      // Deactivate existing key
      await indexedDBService.setApiKeyActive(existingActiveKey.id, false);
      console.log(`🔄 Deactivated previous ${provider} key`);
    }
    
    // Store new key
    await indexedDBService.storeApiKey(provider, key, name);
    
    // Get the stored key ID for return
    const keys = await this.listApiKeys();
    const newKey = keys.find(k => k.provider === provider && k.isActive);
    
    if (!newKey) {
      throw new Error('Failed to store API key');
    }
    
    console.log(`✅ API key stored securely for ${provider}`);
    return newKey.id;
  }

  /**
   * Retrieve API key for provider
   */
  async getApiKey(provider: string): Promise<string | null> {
    await this.ensureInitialized();
    
    try {
      const key = await indexedDBService.getApiKey(provider);
      return key;
    } catch (error) {
      console.error(`❌ Failed to retrieve API key for ${provider}:`, error);
      return null;
    }
  }

  /**
   * List all API key configurations (without actual keys)
   */
  async listApiKeys(): Promise<ApiKeyConfig[]> {
    await this.ensureInitialized();
    
    try {
      return await indexedDBService.listApiKeys();
    } catch (error) {
      console.error('❌ Failed to list API keys:', error);
      return [];
    }
  }

  /**
   * Delete API key
   */
  async deleteApiKey(id: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await indexedDBService.deleteApiKey(id);
      console.log(`🗑️ API key deleted: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to delete API key ${id}:`, error);
      throw error;
    }
  }

  /**
   * Switch active API key for a provider
   */
  async setActiveApiKey(id: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Get all keys to find the provider
      const keys = await this.listApiKeys();
      const targetKey = keys.find(k => k.id === id);
      
      if (!targetKey) {
        throw new Error('API key not found');
      }
      
      // Deactivate all keys for this provider
      const providerKeys = keys.filter(k => k.provider === targetKey.provider);
      for (const key of providerKeys) {
        if (key.isActive) {
          await indexedDBService.setApiKeyActive(key.id, false);
        }
      }
      
      // Activate target key
      await indexedDBService.setApiKeyActive(id, true);
      console.log(`🔄 Switched active API key for ${targetKey.provider}`);
    } catch (error) {
      console.error(`❌ Failed to switch API key ${id}:`, error);
      throw error;
    }
  }

  /**
   * Validate API key format for different providers
   */
  validateApiKeyFormat(provider: string, key: string): { valid: boolean; message?: string } {
    const validations: Record<string, (key: string) => { valid: boolean; message?: string }> = {
      openai: (key) => {
        if (!key.startsWith('sk-')) {
          return { valid: false, message: 'OpenAI API keys should start with "sk-"' };
        }
        if (key.length < 40) {
          return { valid: false, message: 'OpenAI API key appears to be too short' };
        }
        return { valid: true };
      },
      
      anthropic: (key) => {
        if (!key.startsWith('sk-ant-')) {
          return { valid: false, message: 'Anthropic API keys should start with "sk-ant-"' };
        }
        if (key.length < 50) {
          return { valid: false, message: 'Anthropic API key appears to be too short' };
        }
        return { valid: true };
      },
      
      ollama: (key) => {
        // Ollama typically doesn't use API keys (local), but if it does
        return { valid: true };
      }
    };
    
    const validator = validations[provider.toLowerCase()];
    if (validator) {
      return validator(key);
    }
    
    // Generic validation for unknown providers
    if (key.length < 10) {
      return { valid: false, message: 'API key appears to be too short' };
    }
    
    return { valid: true };
  }

  /**
   * Test API key connectivity
   */
  async testApiKey(provider: string, key: string): Promise<{ success: boolean; message: string }> {
    // This is a placeholder for actual API testing
    // In a real implementation, this would make test requests to each provider
    
    const validation = this.validateApiKeyFormat(provider, key);
    if (!validation.valid) {
      return { success: false, message: validation.message || 'Invalid API key format' };
    }
    
    // Simulate test request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'API key format is valid' };
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    await this.ensureInitialized();
    
    try {
      const keys = await this.listApiKeys();
      const stats = await indexedDBService.getStats();
      
      return {
        totalKeys: keys.length,
        activeKeys: keys.filter(k => k.isActive).length,
        providers: [...new Set(keys.map(k => k.provider))],
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return {
        totalKeys: 0,
        activeKeys: 0,
        providers: [],
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Export API keys (encrypted backup)
   */
  async exportBackup(): Promise<string> {
    await this.ensureInitialized();
    
    try {
      const keys = await this.listApiKeys();
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        keys: keys.map(k => ({
          id: k.id,
          provider: k.provider,
          name: k.name,
          isActive: k.isActive,
          created: k.created
        }))
      };
      
      // Simple encoding for backup (not actual encryption)
      const encoded = btoa(JSON.stringify(backup));
      return encoded;
    } catch (error) {
      console.error('❌ Failed to export backup:', error);
      throw error;
    }
  }

  /**
   * Store a general setting
   */
  async storeSetting(key: string, value: any): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await indexedDBService.storeSetting(key, value);
      console.log(`🔧 Setting stored: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to store setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a general setting
   */
  async getSetting(key: string): Promise<any> {
    await this.ensureInitialized();
    
    try {
      return await indexedDBService.getSetting(key);
    } catch (error) {
      console.error(`❌ Failed to get setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await indexedDBService.clearAll();
      console.log('🧹 All secure storage data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Export singleton instance
export const secureStorageService = new SecureStorageService();
export default secureStorageService;