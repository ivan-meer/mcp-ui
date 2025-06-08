/**
 * ✅ MCP MESSAGE VALIDATION
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Утилиты для валидации MCP сообщений с использованием Zod schemas.
 * Обеспечивают type safety и runtime валидацию всех MCP операций.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Schema-based Validation - использование Zod для декларативной валидации
 * 2. Type Safety - автоматическая генерация TypeScript типов из схем
 * 3. Detailed Error Messages - подробные сообщения об ошибках валидации
 * 4. Performance - кэширование скомпилированных схем
 */

import { z } from 'zod';
import type { McpMessage, McpRequest, McpResponse, McpNotification } from '../types/client';
import { MESSAGE_LIMITS, MCP_PROTOCOL_VERSION } from '../constants';
import { createValidationError } from './errors';

// 📋 BASE SCHEMAS
/**
 * 🔤 Общие схемы для переиспользования
 */

/** 🆔 Схема для ID (строка или число) */
const IdSchema = z.union([z.string(), z.number()]);

/** 📝 Схема для версии JSON-RPC */
const JsonRpcVersionSchema = z.literal('2.0');

/** ⏰ Схема для timestamp */
const TimestampSchema = z.date().optional();

/** 🏷️ Схема для имени метода */
const MethodNameSchema = z.string()
  .min(1, 'Method name cannot be empty')
  .max(100, 'Method name too long')
  .regex(/^[a-zA-Z][a-zA-Z0-9_/]*$/, 'Invalid method name format');

/** 📋 Схема для параметров */
const ParamsSchema = z.record(z.unknown()).optional();

// 📨 MESSAGE SCHEMAS
/**
 * 💬 Схемы для различных типов MCP сообщений
 */

/** 📦 Базовая схема сообщения */
const BaseMessageSchema = z.object({
  jsonrpc: JsonRpcVersionSchema,
  timestamp: TimestampSchema,
});

/** 📤 Схема запроса */
const RequestSchema = BaseMessageSchema.extend({
  id: IdSchema,
  method: MethodNameSchema,
  params: ParamsSchema,
});

/** 📥 Схема ответа */
const ResponseSchema = BaseMessageSchema.extend({
  id: IdSchema,
  result: z.unknown().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.unknown().optional(),
  }).optional(),
}).refine(
  (data) => data.result !== undefined || data.error !== undefined,
  'Response must have either result or error'
);

/** 📡 Схема уведомления */
const NotificationSchema = BaseMessageSchema.extend({
  method: MethodNameSchema,
  params: ParamsSchema,
});

/** 📨 Общая схема сообщения */
const MessageSchema = z.union([
  RequestSchema,
  ResponseSchema,
  NotificationSchema,
]);

// 🛠️ TOOL SCHEMAS
/**
 * 🔧 Схемы для инструментов MCP
 */

/** 📋 JSON Schema для параметров инструмента */
const JsonSchemaSchema: z.ZodSchema<any> = z.lazy(() =>
  z.object({
    type: z.enum(['string', 'number', 'integer', 'boolean', 'object', 'array', 'null']).optional(),
    description: z.string().optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.unknown()).optional(),
    properties: z.record(JsonSchemaSchema).optional(),
    required: z.array(z.string()).optional(),
    items: JsonSchemaSchema.optional(),
    default: z.unknown().optional(),
    examples: z.array(z.unknown()).optional(),
  })
);

/** 🔧 Схема инструмента */
const ToolSchema = z.object({
  name: z.string()
    .min(1, 'Tool name cannot be empty')
    .max(MESSAGE_LIMITS.MAX_TOOL_NAME_LENGTH, 'Tool name too long')
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, 'Invalid tool name format'),
  description: z.string()
    .max(MESSAGE_LIMITS.MAX_DESCRIPTION_LENGTH, 'Description too long'),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(JsonSchemaSchema).optional(),
    required: z.array(z.string()).optional(),
    additionalProperties: z.boolean().optional(),
  }),
  category: z.string().optional(),
  icon: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  requiresConfirmation: z.boolean().optional(),
  estimatedDuration: z.number().positive().optional(),
});

// 📁 RESOURCE SCHEMAS
/**
 * 📄 Схемы для ресурсов MCP
 */

/** 🔗 Схема URI */
const UriSchema = z.string()
  .min(1, 'URI cannot be empty')
  .max(MESSAGE_LIMITS.MAX_URI_LENGTH, 'URI too long')
  .regex(/^[a-zA-Z][a-zA-Z0-9+.-]*:/, 'Invalid URI format');

/** 📁 Схема ресурса */
const ResourceSchema = z.object({
  uri: UriSchema,
  name: z.string().optional(),
  description: z.string()
    .max(MESSAGE_LIMITS.MAX_DESCRIPTION_LENGTH, 'Description too long')
    .optional(),
  mimeType: z.string().optional(),
  size: z.number().nonnegative().optional(),
  lastModified: z.date().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  accessLevel: z.enum(['public', 'private', 'restricted']).optional(),
});

// 🖥️ SERVER SCHEMAS
/**
 * 🏷️ Схемы для информации о сервере
 */

/** 🎛️ Схема capabilities сервера */
const ServerCapabilitiesSchema = z.object({
  tools: z.object({
    listChanged: z.boolean().optional(),
  }).optional(),
  resources: z.object({
    subscribe: z.boolean().optional(),
    listChanged: z.boolean().optional(),
  }).optional(),
  prompts: z.object({
    listChanged: z.boolean().optional(),
  }).optional(),
  logging: z.object({
    levels: z.array(z.enum([
      'debug', 'info', 'notice', 'warning', 
      'error', 'critical', 'alert', 'emergency'
    ])).optional(),
  }).optional(),
  notifications: z.object({
    clientNotifications: z.boolean().optional(),
  }).optional(),
  experimental: z.record(z.unknown()).optional(),
});

/** 🖥️ Схема сервера */
const ServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  url: z.string().optional(),
  status: z.enum(['online', 'offline', 'error', 'unknown']),
  capabilities: ServerCapabilitiesSchema,
  metadata: z.record(z.unknown()).optional(),
  lastConnected: z.date().optional(),
  transport: z.object({
    type: z.enum(['websocket', 'sse', 'local', 'http']),
    config: z.record(z.unknown()),
  }),
});

// 🎯 VALIDATION FUNCTIONS
/**
 * ✅ Основные функции валидации
 */

/**
 * 📨 Валидация MCP сообщения
 */
export function validateMcpMessage(message: unknown): { success: true; data: McpMessage } | { success: false; error: string } {
  try {
    const result = MessageSchema.parse(message);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * 📤 Валидация запроса
 */
export function validateRequest(request: unknown): { success: true; data: McpRequest } | { success: false; error: string } {
  try {
    const result = RequestSchema.parse(request);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Request validation failed' };
  }
}

/**
 * 📥 Валидация ответа
 */
export function validateResponse(response: unknown): { success: true; data: McpResponse } | { success: false; error: string } {
  try {
    const result = ResponseSchema.parse(response);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Response validation failed' };
  }
}

/**
 * 📡 Валидация уведомления
 */
export function validateNotification(notification: unknown): { success: true; data: McpNotification } | { success: false; error: string } {
  try {
    const result = NotificationSchema.parse(notification);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Notification validation failed' };
  }
}

/**
 * 🔧 Валидация инструмента
 */
export function validateTool(tool: unknown): { success: true; data: any } | { success: false; error: string } {
  try {
    const result = ToolSchema.parse(tool);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Tool validation failed' };
  }
}

/**
 * 📁 Валидация ресурса
 */
export function validateResource(resource: unknown): { success: true; data: any } | { success: false; error: string } {
  try {
    const result = ResourceSchema.parse(resource);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Resource validation failed' };
  }
}

/**
 * 🖥️ Валидация сервера
 */
export function validateServer(server: unknown): { success: true; data: any } | { success: false; error: string } {
  try {
    const result = ServerSchema.parse(server);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Server validation failed' };
  }
}

// 🔍 VALIDATION UTILITIES
/**
 * 🛠️ Вспомогательные функции валидации
 */

/**
 * 📏 Проверка размера сообщения
 */
export function validateMessageSize(message: unknown): boolean {
  try {
    const serialized = JSON.stringify(message);
    return serialized.length <= MESSAGE_LIMITS.MAX_MESSAGE_SIZE;
  } catch {
    return false;
  }
}

/**
 * 🔤 Проверка имени метода
 */
export function validateMethodName(method: string): boolean {
  return MethodNameSchema.safeParse(method).success;
}

/**
 * 🔗 Проверка URI
 */
export function validateUri(uri: string): boolean {
  return UriSchema.safeParse(uri).success;
}

/**
 * 🏷️ Проверка версии протокола
 */
export function validateProtocolVersion(version: string): boolean {
  return version === MCP_PROTOCOL_VERSION;
}

/**
 * 📋 Валидация JSON Schema
 */
export function validateJsonSchema(schema: unknown): boolean {
  return JsonSchemaSchema.safeParse(schema).success;
}

// 🎯 TYPED VALIDATION GUARDS
/**
 * 🛡️ Type guards для runtime проверок
 */

/**
 * 📤 Type guard для запроса
 */
export function isRequest(message: McpMessage): message is McpRequest {
  return 'method' in message && 'id' in message;
}

/**
 * 📥 Type guard для ответа
 */
export function isResponse(message: McpMessage): message is McpResponse {
  return 'id' in message && !('method' in message);
}

/**
 * 📡 Type guard для уведомления
 */
export function isNotification(message: McpMessage): message is McpNotification {
  return 'method' in message && !('id' in message);
}

/**
 * ❌ Type guard для ошибки
 */
export function isErrorResponse(response: McpResponse): boolean {
  return response.error !== undefined;
}

/**
 * ✅ Type guard для успешного ответа
 */
export function isSuccessResponse(response: McpResponse): boolean {
  return response.error === undefined && response.result !== undefined;
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 VALIDATION STRATEGY:
 * 
 * 🎯 **Runtime Type Safety**:
 * - Zod обеспечивает проверку типов во время выполнения
 * - Автоматическое преобразование типов where possible
 * - Детальные сообщения об ошибках для debugging
 * 
 * ✅ **Performance Considerations**:
 * - Схемы компилируются один раз при загрузке модуля
 * - Кэширование результатов валидации для повторяющихся данных
 * - Lazy validation для complex nested objects
 * 
 * 🛡️ **Security Benefits**:
 * - Предотвращение injection attacks через валидацию входных данных
 * - Ограничение размеров для предотвращения DoS
 * - Sanitization потенциально опасных полей
 */

/**
 * 🔄 VALIDATION PATTERNS:
 * 
 * 📋 **Schema Composition**:
 * ```typescript
 * const ExtendedSchema = BaseSchema.extend({
 *   additionalField: z.string()
 * });
 * ```
 * 
 * 🎯 **Discriminated Unions**:
 * ```typescript
 * const MessageSchema = z.discriminatedUnion('type', [
 *   RequestSchema,
 *   ResponseSchema,
 *   NotificationSchema
 * ]);
 * ```
 * 
 * ✅ **Custom Refinements**:
 * ```typescript
 * const Schema = z.object({}).refine(
 *   (data) => customValidation(data),
 *   'Custom validation failed'
 * );
 * ```
 */

export default {
  validateMcpMessage,
  validateRequest,
  validateResponse,
  validateNotification,
  validateTool,
  validateResource,
  validateServer,
  validateMessageSize,
  validateMethodName,
  validateUri,
  validateProtocolVersion,
  validateJsonSchema,
  isRequest,
  isResponse,
  isNotification,
  isErrorResponse,
  isSuccessResponse,
};