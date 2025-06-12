// packages/@auto-ui/analyzer/src/cache/__tests__/RedisCacheManager.spec.ts
import { RedisCacheManager } from '../redis_cache_manager';

// Mock ioredis
const mockRedisStore = new Map<string, string>();
let mockStatus = 'ready'; // To simulate different connection statuses

const mockRedisClient = {
  get: jest.fn(async (key: string) => mockRedisStore.get(key) || null),
  set: jest.fn(async (key: string, value: string, ...args: any[]) => {
    mockRedisStore.set(key, value);
    if (args.includes('EX') && args.length >= 2) {
        const ttlSeconds = args[args.indexOf('EX') + 1];
        // console.log(`Mock Redis: SET ${key} with TTL ${ttlSeconds}s`);
    }
    return 'OK';
  }),
  del: jest.fn(async (key: string) => {
    const deleted = mockRedisStore.delete(key);
    return deleted ? 1 : 0;
  }),
  exists: jest.fn(async (key: string | Buffer | number) => (mockRedisStore.has(key.toString()) ? 1 : 0)),
  on: jest.fn((event, callback) => {
    // Simulate 'connect' event if status is initially 'ready' or 'connect'
    if ((event === 'connect' || event === 'ready') && (mockStatus === 'ready' || mockStatus === 'connect')) {
      // This callback should set isConnected = true in the real class
      // For the mock, we don't need to call it if Redis constructor handles it
    }
  }),
  connect: jest.fn().mockImplementation(async () => {
    mockStatus = 'ready'; // Simulate successful connection
    // Find and call the 'connect' event handler if attached by RedisCacheManager
    const connectCallback = mockRedisClient.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    if (connectCallback) connectCallback();
    return Promise.resolve();
  }),
  quit: jest.fn().mockImplementation(async () => {
    mockStatus = 'end';
    const endCallback = mockRedisClient.on.mock.calls.find(call => call[0] === 'end')?.[1];
    if (endCallback) endCallback();
    return Promise.resolve('OK');
  }),
  disconnect: jest.fn().mockImplementation(() => { // disconnect is synchronous in ioredis
    mockStatus = 'close';
    const closeCallback = mockRedisClient.on.mock.calls.find(call => call[0] === 'close')?.[1];
    if (closeCallback) closeCallback();
  }),
  ping: jest.fn().mockImplementation(async () => {
    if (mockStatus === 'ready' || mockStatus === 'connect') return 'PONG';
    throw new Error('Mock: Not connected');
  }),
  status: mockStatus, // Initial status
  options: { host: 'mockhost', port: 6379 } // Mock options to indicate it was configured
};

// Update status property dynamically
Object.defineProperty(mockRedisClient, 'status', {
  get: () => mockStatus,
  configurable: true
});


jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

// Mock dotenv to prevent actual .env loading during tests
jest.mock('dotenv', () => ({ config: jest.fn() }));


describe('RedisCacheManager', () => {
  let cacheManager: RedisCacheManager;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Clears cache for modules, re-imports with fresh mocks
    process.env = { ...OLD_ENV, REDIS_URL: 'redis://mockhost:6379' };
    mockRedisStore.clear();
    mockRedisClient.get.mockClear();
    mockRedisClient.set.mockClear();
    mockRedisClient.del.mockClear();
    mockRedisClient.exists.mockClear();
    mockRedisClient.connect.mockClear();
    mockRedisClient.ping.mockClear();
    mockRedisClient.on.mockClear(); // Clear event listener mocks
    mockStatus = 'ready'; // Reset status for each test

    cacheManager = new RedisCacheManager();
    // Call connect on the actual instance to trigger event listener setup
    // Simulating how the real class would try to connect.
    // Our mock's connect() will resolve and set status to 'ready'.
    return (cacheManager as any).connectClient().catch(() => {}); // Ensure initial connection attempt for tests
  });

  afterEach(async () => {
    await cacheManager.disconnect(); // Ensure client is quit after each test
  });
   afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should store and retrieve a value', async () => {
    const key = 'testKey';
    const value = { data: 'some data' };
    await cacheManager.store(key, value);
    const retrieved = await cacheManager.retrieve(key);
    expect(retrieved).toEqual(value);
    expect(mockRedisClient.set).toHaveBeenCalledWith(key, JSON.stringify(value));
  });

  it('should return undefined for a non-existent key', async () => {
    const retrieved = await cacheManager.retrieve('nonExistentKey');
    expect(retrieved).toBeUndefined();
  });

  it('should delete a key', async () => {
    const key = 'deleteKey';
    await cacheManager.store(key, { data: 'to delete' });
    const deleted = await cacheManager.delete(key);
    expect(deleted).toBe(true);
    const retrievedAfterDelete = await cacheManager.retrieve(key);
    expect(retrievedAfterDelete).toBeUndefined();
  });

  it('should check if a key exists', async () => {
    const key = 'existsKey';
    await cacheManager.store(key, { data: 'exists' });
    let hasKey = await cacheManager.has(key);
    expect(hasKey).toBe(true);
    await cacheManager.delete(key);
    hasKey = await cacheManager.has(key);
    expect(hasKey).toBe(false);
  });

  it('should correctly use TTL when storing a value', async () => {
    const key = 'ttlKey';
    const value = { data: 'ttl data' };
    const ttl = 3600; // 1 hour
    await cacheManager.store(key, value, ttl);
    expect(mockRedisClient.set).toHaveBeenCalledWith(key, JSON.stringify(value), 'EX', ttl);
    // Note: Actual TTL expiry simulation is complex and typically not done in unit tests with mocks.
  });

  it('should return false from isReady if REDIS_URL is not set and not passed to constructor', async () => {
    process.env.REDIS_URL = ''; // Unset REDIS_URL
    const newCacheManager = new RedisCacheManager(); // No URL passed
    // Access internal client options to check if host is undefined (meaning no URL was processed)
    expect((newCacheManager as any).client.options.host).toBeUndefined();
    expect(await newCacheManager.isReady()).toBe(false);
  });

  it('should attempt to connect and become ready if configured', async () => {
    // beforeEach already creates a configured instance and tries to connect
    expect(await cacheManager.isReady()).toBe(true);
    expect(mockRedisClient.ping).toHaveBeenCalled(); // isReady calls ping
  });

  it('should handle operations gracefully when not connected (after failing isReady)', async () => {
    mockStatus = 'unready'; // Simulate a state where ping would fail
    mockRedisClient.ping.mockRejectedValueOnce(new Error('Ping failed'));

    expect(await cacheManager.isReady()).toBe(false); // isReady should now be false

    const key = 'testKey';
    const value = { data: 'some data' };

    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    await cacheManager.store(key, value);
    expect(mockRedisClient.set).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith('RedisCacheManager: Not connected, skipping store operation for key:', key);

    const retrieved = await cacheManager.retrieve(key);
    expect(retrieved).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith('RedisCacheManager: Not connected, skipping retrieve operation for key:', key);

    consoleWarnSpy.mockRestore();
  });
});
