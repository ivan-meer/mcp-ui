/**
 * 🖥️ MCP SERVER TYPES
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Типы для описания MCP серверов, их возможностей и ресурсов.
 * Основаны на официальной спецификации MCP протокола.
 * 
 * 🎯 НАЗНАЧЕНИЕ: Строгая типизация всех элементов MCP экосистемы
 */

// 🖥️ SERVER DEFINITION
/**
 * 🏷️ Информация о MCP сервере
 */
export interface McpServer {
  /** 🆔 Уникальный идентификатор сервера */
  id: string;
  
  /** 📝 Имя сервера */
  name: string;
  
  /** 📄 Описание сервера */
  description?: string;
  
  /** 🏷️ Версия сервера */
  version?: string;
  
  /** 🔗 URL для подключения */
  url?: string;
  
  /** 📊 Статус сервера */
  status: 'online' | 'offline' | 'error' | 'unknown';
  
  /** 🎛️ Поддерживаемые возможности */
  capabilities: McpServerCapabilities;
  
  /** 📊 Метаданные */
  metadata?: Record<string, unknown>;
  
  /** ⏰ Время последнего подключения */
  lastConnected?: Date;
  
  /** 🚀 Транспорт для подключения */
  transport: {
    type: 'websocket' | 'sse' | 'local' | 'http';
    config: Record<string, unknown>;
  };
}

// 🎛️ SERVER CAPABILITIES
/**
 * 🔧 Возможности MCP сервера
 */
export interface McpServerCapabilities {
  /** 🛠️ Поддержка инструментов */
  tools?: {
    /** 📝 Может предоставлять список инструментов */
    listChanged?: boolean;
  };
  
  /** 📁 Поддержка ресурсов */
  resources?: {
    /** 📝 Поддержка подписки на изменения */
    subscribe?: boolean;
    /** 📝 Может предоставлять список ресурсов */
    listChanged?: boolean;
  };
  
  /** 📝 Поддержка промптов */
  prompts?: {
    /** 📝 Может предоставлять список промптов */
    listChanged?: boolean;
  };
  
  /** 📊 Поддержка логирования */
  logging?: {
    /** 📊 Уровни логирования */
    levels?: ('debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency')[];
  };
  
  /** 🔔 Поддержка уведомлений */
  notifications?: {
    /** 📤 Может отправлять уведомления клиенту */
    clientNotifications?: boolean;
  };
  
  /** 🎯 Экспериментальные возможности */
  experimental?: Record<string, unknown>;
}

// 🛠️ TOOL DEFINITION
/**
 * 🔧 Определение MCP инструмента
 */
export interface McpTool {
  /** 🆔 Имя инструмента */
  name: string;
  
  /** 📝 Описание инструмента */
  description: string;
  
  /** 📋 JSON Schema для параметров */
  inputSchema: {
    type: 'object';
    properties?: Record<string, McpJsonSchema>;
    required?: string[];
    additionalProperties?: boolean;
  };
  
  /** 🏷️ Категория инструмента */
  category?: string;
  
  /** 🎨 Иконка для отображения */
  icon?: string;
  
  /** 📊 Метаданные */
  metadata?: Record<string, unknown>;
  
  /** ⚠️ Требует подтверждения пользователя */
  requiresConfirmation?: boolean;
  
  /** 🕒 Примерное время выполнения (мс) */
  estimatedDuration?: number;
}

// 📁 RESOURCE DEFINITION
/**
 * 📄 Определение MCP ресурса
 */
export interface McpResource {
  /** 🔗 URI ресурса */
  uri: string;
  
  /** 📝 Имя ресурса */
  name?: string;
  
  /** 📄 Описание ресурса */
  description?: string;
  
  /** 📎 MIME тип */
  mimeType?: string;
  
  /** 📊 Размер в байтах */
  size?: number;
  
  /** ⏰ Время последнего изменения */
  lastModified?: Date;
  
  /** 🏷️ Теги для категоризации */
  tags?: string[];
  
  /** 📊 Метаданные */
  metadata?: Record<string, unknown>;
  
  /** 🔐 Уровень доступа */
  accessLevel?: 'public' | 'private' | 'restricted';
}

// 📝 PROMPT DEFINITION
/**
 * 💭 Определение MCP промпта
 */
export interface McpPrompt {
  /** 🆔 Имя промпта */
  name: string;
  
  /** 📝 Описание промпта */
  description?: string;
  
  /** 📋 Аргументы промпта */
  arguments?: McpPromptArgument[];
  
  /** 🏷️ Категория промпта */
  category?: string;
  
  /** 📊 Метаданные */
  metadata?: Record<string, unknown>;
}

/**
 * 📝 Аргумент промпта
 */
export interface McpPromptArgument {
  /** 🆔 Имя аргумента */
  name: string;
  
  /** 📄 Описание аргумента */
  description?: string;
  
  /** ✅ Обязательный аргумент */
  required?: boolean;
  
  /** 🎯 Тип аргумента */
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  
  /** 💫 Значение по умолчанию */
  default?: unknown;
}

// 📊 JSON SCHEMA SUPPORT
/**
 * 📋 Упрощенная JSON Schema для MCP
 */
export interface McpJsonSchema {
  /** 🎯 Тип значения */
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
  
  /** 📝 Описание поля */
  description?: string;
  
  /** 🔢 Для чисел - минимум */
  minimum?: number;
  
  /** 🔢 Для чисел - максимум */
  maximum?: number;
  
  /** 📏 Для строк - минимальная длина */
  minLength?: number;
  
  /** 📏 Для строк - максимальная длина */
  maxLength?: number;
  
  /** 🎯 Для строк - паттерн */
  pattern?: string;
  
  /** 📋 Для enum - возможные значения */
  enum?: unknown[];
  
  /** 🏗️ Для объектов - свойства */
  properties?: Record<string, McpJsonSchema>;
  
  /** ✅ Для объектов - обязательные поля */
  required?: string[];
  
  /** 📦 Для массивов - тип элементов */
  items?: McpJsonSchema;
  
  /** 💫 Значение по умолчанию */
  default?: unknown;
  
  /** 📋 Примеры значений */
  examples?: unknown[];
}

// 🎛️ SERVER CONFIGURATION
/**
 * ⚙️ Конфигурация MCP сервера
 */
export interface McpServerConfig {
  /** 🆔 Идентификатор сервера */
  id: string;
  
  /** 📝 Имя сервера */
  name: string;
  
  /** 🔗 URL или путь к серверу */
  url: string;
  
  /** 🚀 Тип транспорта */
  transport: {
    type: 'websocket' | 'sse' | 'local' | 'http';
    config: Record<string, unknown>;
  };
  
  /** 🔐 Настройки аутентификации */
  auth?: {
    type: 'none' | 'bearer' | 'basic' | 'custom';
    credentials?: Record<string, string>;
  };
  
  /** ⏱️ Настройки таймаутов */
  timeouts?: {
    connect?: number;
    response?: number;
    idle?: number;
  };
  
  /** 🔄 Настройки переподключения */
  retry?: {
    enabled?: boolean;
    maxAttempts?: number;
    backoffStrategy?: 'linear' | 'exponential' | 'fixed';
    initialDelay?: number;
    maxDelay?: number;
  };
  
  /** 🎛️ Дополнительные параметры */
  options?: Record<string, unknown>;
  
  /** 🏷️ Теги для группировки */
  tags?: string[];
  
  /** 📊 Метаданные */
  metadata?: Record<string, unknown>;
}

// 📊 SERVER STATS
/**
 * 📈 Статистика MCP сервера
 */
export interface McpServerStats {
  /** ⏱️ Время работы */
  uptime: number;
  
  /** 📤 Запросов обработано */
  requestsProcessed: number;
  
  /** ❌ Количество ошибок */
  errors: number;
  
  /** ⏱️ Среднее время ответа (мс) */
  averageResponseTime: number;
  
  /** 🛠️ Количество доступных инструментов */
  toolsCount: number;
  
  /** 📁 Количество доступных ресурсов */
  resourcesCount: number;
  
  /** 💾 Использование памяти */
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  
  /** 💽 Использование CPU */
  cpuUsage?: number;
  
  /** 🌐 Активные подключения */
  activeConnections: number;
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 MCP ECOSYSTEM OVERVIEW:
 * 
 * 🖥️ **Servers** предоставляют функциональность через:
 * - 🛠️ **Tools** - функции для выполнения действий
 * - 📁 **Resources** - данные для чтения/анализа  
 * - 📝 **Prompts** - шаблоны для генерации промптов
 * 
 * 🔄 **Lifecycle**:
 * 1. 🔗 Client подключается к Server
 * 2. 📋 Client запрашивает capabilities
 * 3. 🛠️ Client получает список tools/resources
 * 4. ⚡ Client вызывает tools или запрашивает resources
 * 5. 📊 Server возвращает результаты
 */

/**
 * 🛠️ TOOL DESIGN PRINCIPLES:
 * 
 * ✅ **Single Responsibility**: Один инструмент = одна задача
 * ✅ **Idempotent**: Безопасно вызывать несколько раз
 * ✅ **Descriptive**: Четкое название и описание
 * ✅ **Validated**: Строгая валидация входных данных
 * ✅ **Documented**: JSON Schema для всех параметров
 * 
 * 📋 **Input Schema Best Practices**:
 * - Используйте описательные имена полей
 * - Добавляйте descriptions для всех полей
 * - Указывайте примеры в examples
 * - Используйте enum для ограниченного набора значений
 * - Валидируйте строки через pattern (regex)
 */

/**
 * 📁 RESOURCE ORGANIZATION:
 * 
 * 🏗️ **URI Structure**:
 * - `file:///path/to/file.txt` - локальные файлы
 * - `http://example.com/api/data` - HTTP ресурсы
 * - `mcp://server/resource` - MCP специфичные URI
 * - `custom://app/resource/123` - кастомные схемы
 * 
 * 🎯 **MIME Types**:
 * - `text/plain` - простой текст
 * - `application/json` - JSON данные
 * - `text/markdown` - Markdown документы
 * - `image/png` - изображения
 * - `application/pdf` - PDF документы
 */

export default McpServer;