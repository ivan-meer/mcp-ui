/**
 * 🏷️ SERVER MANAGER TYPES
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Типы для системы управления MCP серверами.
 * Покрывают discovery, connection management, monitoring и configuration.
 */

import type { McpServer, McpServerConfig } from '@mcp-ui/mcp-connector';

// 🛠️ SERVER MANAGER CONFIGURATION
/**
 * ⚙️ Конфигурация менеджера серверов
 */
export interface ServerManagerConfig {
  /** 🔍 Настройки автоматического обнаружения */
  discovery?: {
    enabled: boolean;
    interval: number;
    methods: DiscoveryMethod[];
    scanPorts?: number[];
    networkInterfaces?: string[];
  };
  
  /** 🏊 Настройки пула подключений */
  connectionPool?: {
    maxConnections: number;
    maxPerServer: number;
    idleTimeout: number;
    healthCheckInterval: number;
  };
  
  /** 📊 Настройки мониторинга */
  monitoring?: {
    enabled: boolean;
    interval: number;
    metrics: string[];
    alertThresholds: Record<string, number>;
  };
  
  /** 💾 Настройки хранения */
  storage?: {
    type: 'memory' | 'file' | 'database';
    path?: string;
    autoSave: boolean;
    backupCount: number;
  };
  
  /** 📝 Настройки логирования */
  logging?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    file?: string;
  };
}

// 🔍 DISCOVERY TYPES
/**
 * 🕵️ Методы обнаружения серверов
 */
export type DiscoveryMethod = 
  | 'filesystem'    // 📁 Поиск в файловой системе
  | 'network'       // 🌐 Сканирование сети
  | 'registry'      // 📋 Системный реестр
  | 'config'        // ⚙️ Файлы конфигурации
  | 'environment'   // 🌍 Переменные окружения
  | 'manual';       // 👤 Ручное добавление

/**
 * 🔍 Опции обнаружения
 */
export interface DiscoveryOptions {
  /** 🎯 Методы для использования */
  methods: DiscoveryMethod[];
  
  /** ⏱️ Таймаут для каждого метода */
  timeout: number;
  
  /** 🔄 Интервал между сканированиями */
  interval: number;
  
  /** 🏷️ Фильтры для результатов */
  filters?: {
    name?: RegExp;
    version?: string;
    capabilities?: string[];
    tags?: string[];
  };
  
  /** 📋 Дополнительные параметры */
  options?: Record<string, unknown>;
}

/**
 * 🎯 Результат обнаружения
 */
export interface DiscoveryResult {
  /** 🖥️ Найденные серверы */
  servers: McpServerConfig[];
  
  /** 🕰️ Время сканирования */
  timestamp: Date;
  
  /** 🔍 Использованные методы */
  methods: DiscoveryMethod[];
  
  /** ❌ Ошибки при обнаружении */
  errors: Array<{
    method: DiscoveryMethod;
    error: string;
  }>;
  
  /** 📊 Статистика */
  stats: {
    duration: number;
    serversFound: number;
    methodsUsed: number;
  };
}

// 🔗 CONNECTION TYPES
/**
 * 🔌 Подключение к серверу
 */
export interface ServerConnection {
  /** 🆔 Уникальный идентификатор */
  id: string;
  
  /** 🖥️ Информация о сервере */
  server: McpServer;
  
  /** 🔌 MCP клиент */
  client: any; // TODO: Import IMcpClient when available
  
  /** 📊 Статус подключения */
  status: ConnectionStatus;
  
  /** ⏰ Время подключения */
  connectedAt: Date;
  
  /** ⏰ Последняя активность */
  lastActivity: Date;
  
  /** 📊 Метрики подключения */
  metrics: ConnectionMetrics;
  
  /** 🏷️ Метаданные */
  metadata?: Record<string, unknown>;
}

/**
 * 📊 Статус подключения
 */
export type ConnectionStatus = 
  | 'connecting'    // 🔄 Подключение
  | 'connected'     // ✅ Подключен
  | 'disconnecting' // 🔄 Отключение
  | 'disconnected'  // ❌ Отключен
  | 'error'         // 🚨 Ошибка
  | 'idle';         // 💤 Ожидание

/**
 * 📈 Метрики подключения
 */
export interface ConnectionMetrics {
  /** 📤 Отправленных сообщений */
  messagesSent: number;
  
  /** 📥 Получено сообщений */
  messagesReceived: number;
  
  /** 📊 Средняя задержка (мс) */
  averageLatency: number;
  
  /** ❌ Количество ошибок */
  errorCount: number;
  
  /** 🔄 Количество переподключений */
  reconnectCount: number;
  
  /** 📊 Использование пропускной способности */
  bandwidth: {
    sent: number;
    received: number;
  };
}

// 🏥 HEALTH MONITORING
/**
 * 🩺 Состояние здоровья сервера
 */
export interface ServerHealth {
  /** 🆔 ID сервера */
  serverId: string;
  
  /** 🩺 Общий статус здоровья */
  status: HealthStatus;
  
  /** ⏰ Время последней проверки */
  lastCheck: Date;
  
  /** ⏱️ Время отклика (мс) */
  responseTime: number;
  
  /** 📊 Проверки компонентов */
  checks: HealthCheck[];
  
  /** 📈 Метрики производительности */
  metrics: ServerMetrics;
  
  /** 📝 Дополнительная информация */
  details?: Record<string, unknown>;
}

/**
 * 🩺 Статус здоровья
 */
export type HealthStatus = 
  | 'healthy'   // 💚 Здоров
  | 'degraded'  // 🟡 Работает с проблемами
  | 'unhealthy' // 🔴 Не работает
  | 'unknown';  // ❓ Статус неизвестен

/**
 * 🔍 Проверка здоровья
 */
export interface HealthCheck {
  /** 🏷️ Название проверки */
  name: string;
  
  /** ✅ Результат проверки */
  passed: boolean;
  
  /** 📝 Описание */
  description?: string;
  
  /** ⏱️ Время выполнения (мс) */
  duration: number;
  
  /** 📊 Значение метрики */
  value?: number;
  
  /** 🎯 Пороговое значение */
  threshold?: number;
  
  /** ❌ Ошибка (если есть) */
  error?: string;
}

/**
 * 📊 Метрики сервера
 */
export interface ServerMetrics {
  /** 💽 Использование CPU (%) */
  cpuUsage?: number;
  
  /** 💾 Использование памяти */
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  
  /** 💿 Использование диска */
  diskUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  
  /** 🌐 Сетевые метрики */
  network?: {
    connectionsActive: number;
    connectionsTotal: number;
    bytesIn: number;
    bytesOut: number;
  };
  
  /** 🛠️ Метрики приложения */
  application?: {
    toolsAvailable: number;
    resourcesAvailable: number;
    requestsPerMinute: number;
    averageResponseTime: number;
  };
  
  /** ⏰ Время работы (мс) */
  uptime?: number;
  
  /** 📊 Кастомные метрики */
  custom?: Record<string, number>;
}

// 🎛️ MONITORING CONFIGURATION
/**
 * 📊 Конфигурация мониторинга
 */
export interface MonitoringConfig {
  /** ✅ Включен ли мониторинг */
  enabled: boolean;
  
  /** ⏱️ Интервал проверок (мс) */
  interval: number;
  
  /** 🔄 Таймаут проверки (мс) */
  timeout: number;
  
  /** 📋 Проверки для выполнения */
  checks: Array<{
    name: string;
    type: 'ping' | 'http' | 'tcp' | 'custom';
    config: Record<string, unknown>;
    threshold?: number;
  }>;
  
  /** 🚨 Настройки оповещений */
  alerts?: {
    enabled: boolean;
    channels: Array<{
      type: 'console' | 'file' | 'webhook' | 'email';
      config: Record<string, unknown>;
    }>;
    rules: Array<{
      condition: string;
      severity: 'info' | 'warning' | 'error' | 'critical';
      message: string;
    }>;
  };
}

// 📋 REGISTRY TYPES
/**
 * 📚 Запись в реестре серверов
 */
export interface ServerRegistryEntry {
  /** 🆔 Уникальный идентификатор */
  id: string;
  
  /** ⚙️ Конфигурация сервера */
  config: McpServerConfig;
  
  /** 📊 Статус регистрации */
  status: 'registered' | 'active' | 'inactive' | 'error';
  
  /** ⏰ Время регистрации */
  registeredAt: Date;
  
  /** ⏰ Последнее обновление */
  updatedAt: Date;
  
  /** 🏷️ Теги для категоризации */
  tags: string[];
  
  /** 🩺 Последнее состояние здоровья */
  lastHealth?: ServerHealth;
  
  /** 📊 Статистика использования */
  usage?: {
    connectionsTotal: number;
    lastConnectedAt?: Date;
    totalUptime: number;
  };
  
  /** 📝 Заметки пользователя */
  notes?: string;
  
  /** 📊 Метаданные */
  metadata?: Record<string, unknown>;
}

// 📡 EVENT TYPES
/**
 * 🎯 События менеджера серверов
 */
export interface ServerManagerEvents {
  /** 🔍 Обнаружен новый сервер */
  serverDiscovered: {
    server: McpServerConfig;
    method: DiscoveryMethod;
    timestamp: Date;
  };
  
  /** 📋 Сервер зарегистрирован */
  serverRegistered: {
    entry: ServerRegistryEntry;
    timestamp: Date;
  };
  
  /** 🔗 Установлено подключение */
  serverConnected: {
    connection: ServerConnection;
    timestamp: Date;
  };
  
  /** 💔 Подключение разорвано */
  serverDisconnected: {
    serverId: string;
    reason?: string;
    timestamp: Date;
  };
  
  /** 🩺 Изменение состояния здоровья */
  healthChanged: {
    serverId: string;
    oldStatus: HealthStatus;
    newStatus: HealthStatus;
    health: ServerHealth;
    timestamp: Date;
  };
  
  /** ❌ Ошибка */
  error: {
    error: Error;
    context?: string;
    serverId?: string;
    timestamp: Date;
  };
  
  /** 📊 Обновление метрик */
  metricsUpdated: {
    serverId: string;
    metrics: ServerMetrics;
    timestamp: Date;
  };
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 SERVER MANAGEMENT PATTERNS:
 * 
 * 🏭 **Registry Pattern**:
 * - Центральный реестр всех серверов
 * - Единый источник истины для конфигураций
 * - Persistence для сохранения состояния
 * 
 * 🔍 **Discovery Pattern**:
 * - Автоматическое обнаружение серверов
 * - Множественные методы discovery
 * - Filtering и validation результатов
 * 
 * 🏊 **Connection Pool Pattern**:
 * - Эффективное использование ресурсов
 * - Ограничение количества подключений
 * - Automatic cleanup неиспользуемых подключений
 * 
 * 📊 **Health Check Pattern**:
 * - Проактивный мониторинг состояния
 * - Cascade health checks (app → service → infrastructure)
 * - Alerting при деградации
 */

/**
 * 🔄 LIFECYCLE MANAGEMENT:
 * 
 * 📋 **Server Registration**:
 * 1. Discovery или manual addition
 * 2. Validation конфигурации
 * 3. Registration в реестре
 * 4. Initial health check
 * 
 * 🔗 **Connection Management**:
 * 1. Pool allocation
 * 2. Connection establishment
 * 3. Heartbeat monitoring
 * 4. Automatic reconnection
 * 5. Graceful shutdown
 * 
 * 🩺 **Health Monitoring**:
 * 1. Periodic health checks
 * 2. Metrics collection
 * 3. Alert generation
 * 4. Recovery actions
 */

export default ServerManagerConfig;