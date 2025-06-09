/**
 * 🗄️ INDEXEDDB SERVICE
 * 
 * Secure local database service for storing API keys and configuration
 * Uses IndexedDB with encryption for sensitive data storage
 */

interface StorageItem {
  id: string;
  data: any;
  encrypted: boolean;
  created: Date;
  updated: Date;
}

interface ApiKeyData {
  provider: string;
  key: string;
  name?: string;
  isActive: boolean;
}

class IndexedDBService {
  private dbName = 'mcp-chat-client';
  private version = 1;
  private db: IDBDatabase | null = null;
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('apiKeys')) {
          const apiKeyStore = db.createObjectStore('apiKeys', { keyPath: 'id' });
          apiKeyStore.createIndex('provider', 'provider', { unique: false });
          apiKeyStore.createIndex('isActive', 'isActive', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('mcpServers')) {
          const mcpStore = db.createObjectStore('mcpServers', { keyPath: 'id' });
          mcpStore.createIndex('name', 'name', { unique: false });
          mcpStore.createIndex('type', 'type', { unique: false });
        }

        console.log('📦 IndexedDB object stores created');
      };
    });
  }

  /**
   * Get or create encryption key for local data
   */
  private getOrCreateEncryptionKey(): string {
    const storageKey = 'mcp-client-key';
    let key = localStorage.getItem(storageKey);
    
    if (!key) {
      // Generate a simple encryption key (for demo purposes)
      key = btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
      localStorage.setItem(storageKey, key);
    }
    
    return key;
  }

  /**
   * Simple encryption for API keys (Base64 + XOR)
   */
  private encrypt(data: string): string {
    const key = this.encryptionKey;
    let encrypted = '';
    
    for (let i = 0; i < data.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const dataChar = data.charCodeAt(i);
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    
    return btoa(encrypted);
  }

  /**
   * Simple decryption for API keys
   */
  private decrypt(encryptedData: string): string {
    const key = this.encryptionKey;
    const data = atob(encryptedData);
    let decrypted = '';
    
    for (let i = 0; i < data.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const dataChar = data.charCodeAt(i);
      decrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    
    return decrypted;
  }

  /**
   * Store API key securely
   */
  async storeApiKey(provider: string, key: string, name?: string): Promise<void> {
    if (!this.db) await this.init();
    
    const encryptedKey = this.encrypt(key);
    const apiKeyData: StorageItem & ApiKeyData = {
      id: `${provider}-${Date.now()}`,
      provider,
      key: encryptedKey,
      name: name || provider,
      isActive: true,
      data: null,
      encrypted: true,
      created: new Date(),
      updated: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiKeys'], 'readwrite');
      const store = transaction.objectStore('apiKeys');
      
      const request = store.add(apiKeyData);
      
      request.onsuccess = () => {
        console.log(`🔐 API key stored for ${provider}`);
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to store API key for ${provider}`));
      };
    });
  }

  /**
   * Retrieve API key for provider
   */
  async getApiKey(provider: string): Promise<string | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiKeys'], 'readonly');
      const store = transaction.objectStore('apiKeys');
      const index = store.index('provider');
      
      const request = index.getAll(provider);
      
      request.onsuccess = () => {
        const results = request.result as (StorageItem & ApiKeyData)[];
        const activeKey = results.find(item => item.isActive);
        
        if (activeKey) {
          const decryptedKey = this.decrypt(activeKey.key);
          resolve(decryptedKey);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to retrieve API key for ${provider}`));
      };
    });
  }

  /**
   * List all stored API keys (without exposing the actual keys)
   */
  async listApiKeys(): Promise<Array<{ id: string; provider: string; name: string; isActive: boolean; created: Date }>> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiKeys'], 'readonly');
      const store = transaction.objectStore('apiKeys');
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result as (StorageItem & ApiKeyData)[];
        const keyList = results.map(item => ({
          id: item.id,
          provider: item.provider,
          name: item.name || item.provider,
          isActive: item.isActive,
          created: item.created
        }));
        
        resolve(keyList);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to list API keys'));
      };
    });
  }

  /**
   * Delete API key
   */
  async deleteApiKey(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiKeys'], 'readwrite');
      const store = transaction.objectStore('apiKeys');
      
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log(`🗑️ API key deleted: ${id}`);
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to delete API key: ${id}`));
      };
    });
  }

  /**
   * Update API key active status
   */
  async setApiKeyActive(id: string, isActive: boolean): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiKeys'], 'readwrite');
      const store = transaction.objectStore('apiKeys');
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result as StorageItem & ApiKeyData;
        if (item) {
          item.isActive = isActive;
          item.updated = new Date();
          
          const putRequest = store.put(item);
          
          putRequest.onsuccess = () => {
            console.log(`🔄 API key ${isActive ? 'activated' : 'deactivated'}: ${id}`);
            resolve();
          };
          
          putRequest.onerror = () => {
            reject(new Error(`Failed to update API key: ${id}`));
          };
        } else {
          reject(new Error(`API key not found: ${id}`));
        }
      };
      
      getRequest.onerror = () => {
        reject(new Error(`Failed to retrieve API key: ${id}`));
      };
    });
  }

  /**
   * Store general settings
   */
  async storeSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    
    const settingData: StorageItem = {
      id: key,
      data: value,
      encrypted: false,
      created: new Date(),
      updated: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      
      const request = store.put(settingData);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to store setting: ${key}`));
      };
    });
  }

  /**
   * Retrieve setting
   */
  async getSetting(key: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result as StorageItem;
        resolve(result ? result.data : null);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to retrieve setting: ${key}`));
      };
    });
  }

  /**
   * Clear all data (for reset/logout)
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    const storeNames = ['apiKeys', 'settings', 'mcpServers'];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      
      let completed = 0;
      const total = storeNames.length;
      
      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log('🧹 All IndexedDB data cleared');
            resolve();
          }
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to clear store: ${storeName}`));
        };
      });
    });
  }

  /**
   * Get database usage statistics
   */
  async getStats(): Promise<{ apiKeys: number; settings: number; mcpServers: number }> {
    if (!this.db) await this.init();
    
    const storeNames = ['apiKeys', 'settings', 'mcpServers'];
    const stats: any = {};
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readonly');
      
      let completed = 0;
      const total = storeNames.length;
      
      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => {
          stats[storeName] = request.result;
          completed++;
          
          if (completed === total) {
            resolve(stats);
          }
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to get count for store: ${storeName}`));
        };
      });
    });
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();
export default indexedDBService;