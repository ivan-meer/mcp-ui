// packages/@auto-ui/analyzer/src/cache/redis_cache_manager.ts
import type { CacheManager } from '@auto-ui/core'; // Import CacheManager from core
import Redis, { Redis as RedisClient } from 'ioredis';
import dotenv from 'dotenv';
import path from 'path'; // For resolving .env path

if (process.env.NODE_ENV !== 'production') {
  // Try to load .env from the package's root directory if it exists there for local dev
  dotenv.config({ path: path.resolve(process.cwd(), 'packages', '@auto-ui', 'analyzer', '.env') });
  // Fallback to root .env if not found in package, or let global .env take precedence
  if (!process.env.REDIS_URL && !process.env.OPENAI_API_KEY) { // Check if vars are set
      dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  }
}

export class RedisCacheManager implements CacheManager {
  private client: RedisClient;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;


  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL;
    if (!url) {
      console.warn(
        'RedisCacheManager: Redis URL is not configured. RedisCacheManager will operate in a disconnected state. ' +
        'Set REDIS_URL environment variable or pass redisUrl to constructor.'
      );
      this.client = new Redis({ lazyConnect: true, enableOfflineQueue: false });
      return;
    }

    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true, // Important: connect will be called explicitly or by first command
      enableOfflineQueue: false // Don't queue commands if not connected
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('RedisCacheManager: Connected to Redis.');
    });

    this.client.on('error', (err) => {
      // isConnected will be set by 'close' or 'reconnecting' events typically
      console.error('RedisCacheManager: Redis connection error:', err.message);
    });

    this.client.on('end', () => {
        this.isConnected = false;
        console.log('RedisCacheManager: Connection to Redis ended.');
    });

    this.client.on('close', () => {
        this.isConnected = false;
        console.log('RedisCacheManager: Connection to Redis closed.');
    });

    this.client.on('reconnecting', () => {
        this.isConnected = false; // Or a specific 'reconnecting' state if needed
        console.log('RedisCacheManager: Reconnecting to Redis...');
    });

    // Initial connection attempt is deferred until first operation or explicit call
  }

  private async connectClient(): Promise<void> {
    if (this.client.status === 'ready' || this.client.status === 'connect') {
        this.isConnected = true;
        return;
    }
    if (this.client.status === 'end' || this.client.status === 'close') {
        // If client is explicitly closed or ended, try to reconnect by creating a new connection promise
        this.connectionPromise = this.client.connect().catch(err => {
            this.isConnected = false;
            console.error('RedisCacheManager: Reconnect failed in connectClient:', err);
            this.connectionPromise = null; // Reset promise on failure to allow retry
            throw err; // Rethrow to fail the operation that triggered connect
        });
        await this.connectionPromise;
        return;
    }

    // If already connecting or reconnecting, await the existing promise
    if (this.connectionPromise) {
        await this.connectionPromise;
        return;
    }

    // Start a new connection attempt
    this.connectionPromise = this.client.connect().catch(err => {
        this.isConnected = false;
        console.error('RedisCacheManager: Initial connect failed in connectClient:', err);
        this.connectionPromise = null; // Reset promise on failure
        throw err;
    });
    await this.connectionPromise;
  }


  public async isReady(): Promise<boolean> {
    if (!this.client || !this.client.options.host) { // No URL was ever provided
        return false;
    }
    if (this.client.status === 'ready') {
        this.isConnected = true;
        return true;
    }
    try {
        await this.connectClient(); // Ensure connection attempt logic is run
        // Ping is a good way to ensure the connection is truly live
        await this.client.ping();
        this.isConnected = true; // If ping succeeds
        return true;
    } catch (error) {
        this.isConnected = false;
        // console.error("RedisCacheManager: isReady check failed (ping or connect)", error);
        return false;
    }
  }

  async store(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!await this.isReady()) {
      console.warn('RedisCacheManager: Not connected, skipping store operation for key:', key);
      return;
    }
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, stringValue, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      console.error(`RedisCacheManager: Error storing key "${key}":`, error);
    }
  }

  async retrieve<T = any>(key: string): Promise<T | undefined> {
    if (!await this.isReady()) {
      console.warn('RedisCacheManager: Not connected, skipping retrieve operation for key:', key);
      return undefined;
    }
    try {
      const stringValue = await this.client.get(key);
      if (stringValue === null) {
        return undefined;
      }
      return JSON.parse(stringValue) as T;
    } catch (error) {
      console.error(`RedisCacheManager: Error retrieving key "${key}":`, error);
      return undefined;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!await this.isReady()) {
      console.warn('RedisCacheManager: Not connected, skipping delete operation for key:', key);
      return false;
    }
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`RedisCacheManager: Error deleting key "${key}":`, error);
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    if (!await this.isReady()) {
      console.warn('RedisCacheManager: Not connected, skipping has operation for key:', key);
      return false;
    }
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`RedisCacheManager: Error checking key "${key}":`, error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.client.status !== 'end' && this.client.status !== 'close') {
        try {
            await this.client.quit();
            this.isConnected = false; // quit sets status to 'end'
            console.log("RedisCacheManager: Disconnected from Redis.");
        } catch (error) {
            console.error("RedisCacheManager: Error during disconnect (quit):", error);
            // Fallback to forceful disconnect if quit fails
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
    this.connectionPromise = null; // Clear any pending connection promise
  }
}
