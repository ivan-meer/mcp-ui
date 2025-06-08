/**
 * ❌ MCP CLIENT ERRORS
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Кастомные классы ошибок для MCP клиента с типизированными кодами ошибок
 * и контекстной информацией для лучшего debugging.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Error Hierarchy - наследование от базового Error класса
 * 2. Error Codes - стандартизированные коды для программной обработки
 * 3. Context Data - дополнительная информация для debugging
 * 4. Stack Preservation - сохранение call stack для трассировки
 */

import { MCP_ERROR_CODES } from '../constants';

// 🚨 BASE ERROR CLASS
/**
 * 🔴 Базовый класс ошибок MCP клиента
 * 
 * 🎯 ВОЗМОЖНОСТИ:
 * - Типизированные коды ошибок
 * - Контекстная информация
 * - Сохранение оригинального stack trace
 * - JSON сериализация для логирования
 */
export class McpClientError extends Error {
  /** 🏷️ Тип ошибки для runtime проверок */
  public readonly type = 'McpClientError';
  
  /** 🔢 Код ошибки */
  public readonly code: string;
  
  /** 📊 Дополнительные данные */
  public readonly data?: unknown;
  
  /** ⏰ Время возникновения ошибки */
  public readonly timestamp: Date;
  
  /** 🔗 Оригинальная ошибка (если есть) */
  public readonly cause?: Error;
  
  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    data?: unknown,
    cause?: Error
  ) {
    super(message);
    
    // 🏷️ Устанавливаем имя для правильного отображения
    this.name = 'McpClientError';
    
    this.code = code;
    this.data = data;
    this.timestamp = new Date();
    this.cause = cause;
    
    // 🛡️ Сохраняем stack trace если возможно
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, McpClientError);
    }
    
    // 🔗 Добавляем cause в stack если есть
    if (cause && cause.stack) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }
  
  /**
   * 📄 Сериализация в JSON для логирования
   */
  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      name: this.name,
      message: this.message,
      code: this.code,
      data: this.data,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
      } : undefined,
    };
  }
  
  /**
   * 🎯 Проверка типа ошибки
   */
  static isInstance(error: unknown): error is McpClientError {
    return error instanceof Error && 
           (error as any).type === 'McpClientError';
  }
}

// 🔌 TRANSPORT ERRORS
/**
 * 📡 Ошибки транспортного слоя
 */
export class TransportError extends McpClientError {
  public readonly type = 'TransportError';
  
  constructor(message: string, code: string, data?: unknown, cause?: Error) {
    super(message, code, data, cause);
    this.name = 'TransportError';
  }
}

// 📋 PROTOCOL ERRORS
/**
 * 📨 Ошибки протокола MCP
 */
export class ProtocolError extends McpClientError {
  public readonly type = 'ProtocolError';
  
  constructor(message: string, code: string, data?: unknown, cause?: Error) {
    super(message, code, data, cause);
    this.name = 'ProtocolError';
  }
}

// 🛠️ TOOL ERRORS
/**
 * 🔧 Ошибки при работе с инструментами
 */
export class ToolError extends McpClientError {
  public readonly type = 'ToolError';
  
  constructor(message: string, code: string, data?: unknown, cause?: Error) {
    super(message, code, data, cause);
    this.name = 'ToolError';
  }
}

// 📁 RESOURCE ERRORS
/**
 * 📄 Ошибки при работе с ресурсами
 */
export class ResourceError extends McpClientError {
  public readonly type = 'ResourceError';
  
  constructor(message: string, code: string, data?: unknown, cause?: Error) {
    super(message, code, data, cause);
    this.name = 'ResourceError';
  }
}

// 🔐 AUTHENTICATION ERRORS
/**
 * 🛡️ Ошибки аутентификации
 */
export class AuthenticationError extends McpClientError {
  public readonly type = 'AuthenticationError';
  
  constructor(message: string, code: string = 'AUTH_FAILED', data?: unknown, cause?: Error) {
    super(message, code, data, cause);
    this.name = 'AuthenticationError';
  }
}

// ⏱️ TIMEOUT ERRORS
/**
 * 🕒 Ошибки таймаута
 */
export class TimeoutError extends McpClientError {
  public readonly type = 'TimeoutError';
  
  constructor(message: string, timeoutMs: number, operation?: string) {
    super(
      message, 
      'TIMEOUT',
      { timeoutMs, operation }
    );
    this.name = 'TimeoutError';
  }
}

// 🔄 RETRY ERRORS
/**
 * 🔁 Ошибки при исчерпании попыток
 */
export class RetryError extends McpClientError {
  public readonly type = 'RetryError';
  
  constructor(message: string, attempts: number, lastError?: Error) {
    super(
      message,
      'MAX_RETRIES_EXCEEDED',
      { attempts },
      lastError
    );
    this.name = 'RetryError';
  }
}

// 📏 VALIDATION ERRORS
/**
 * ✅ Ошибки валидации
 */
export class ValidationError extends McpClientError {
  public readonly type = 'ValidationError';
  
  constructor(message: string, field?: string, value?: unknown) {
    super(
      message,
      'VALIDATION_FAILED',
      { field, value }
    );
    this.name = 'ValidationError';
  }
}

// 🏭 ERROR FACTORY FUNCTIONS
/**
 * 🔧 Фабричные функции для создания типизированных ошибок
 */

/**
 * 🔌 Создать ошибку подключения
 */
export function createConnectionError(
  message: string, 
  url?: string, 
  cause?: Error
): TransportError {
  return new TransportError(
    message,
    MCP_ERROR_CODES.CONNECTION_FAILED.toString(),
    { url },
    cause
  );
}

/**
 * ⏱️ Создать ошибку таймаута
 */
export function createTimeoutError(
  operation: string,
  timeoutMs: number
): TimeoutError {
  return new TimeoutError(
    `${operation} timed out after ${timeoutMs}ms`,
    timeoutMs,
    operation
  );
}

/**
 * 🛠️ Создать ошибку инструмента
 */
export function createToolError(
  toolName: string,
  message: string,
  cause?: Error
): ToolError {
  return new ToolError(
    `Tool '${toolName}': ${message}`,
    MCP_ERROR_CODES.TOOL_EXECUTION_FAILED.toString(),
    { toolName },
    cause
  );
}

/**
 * 📁 Создать ошибку ресурса
 */
export function createResourceError(
  uri: string,
  message: string,
  cause?: Error
): ResourceError {
  return new ResourceError(
    `Resource '${uri}': ${message}`,
    MCP_ERROR_CODES.RESOURCE_NOT_FOUND.toString(),
    { uri },
    cause
  );
}

/**
 * 📨 Создать ошибку протокола
 */
export function createProtocolError(
  message: string,
  messageData?: unknown
): ProtocolError {
  return new ProtocolError(
    message,
    MCP_ERROR_CODES.PROTOCOL_ERROR.toString(),
    { messageData }
  );
}

/**
 * ✅ Создать ошибку валидации
 */
export function createValidationError(
  field: string,
  value: unknown,
  constraint: string
): ValidationError {
  return new ValidationError(
    `Validation failed for field '${field}': ${constraint}`,
    field,
    value
  );
}

// 🔍 ERROR ANALYSIS UTILITIES
/**
 * 🕵️ Утилиты для анализа ошибок
 */

/**
 * 🔄 Проверить, является ли ошибка восстанавливаемой
 */
export function isRecoverableError(error: Error): boolean {
  if (McpClientError.isInstance(error)) {
    // 🔌 Проблемы с сетью обычно восстанавливаемы
    if (error.code.includes('CONNECTION') || error.code.includes('TIMEOUT')) {
      return true;
    }
    
    // 🚫 Ошибки валидации и аутентификации - нет
    if (error.code.includes('VALIDATION') || error.code.includes('AUTH')) {
      return false;
    }
    
    // 🖥️ Серверные ошибки могут быть временными
    if (error.code.startsWith('5')) {
      return true;
    }
  }
  
  return false;
}

/**
 * 📊 Получить категорию ошибки
 */
export function getErrorCategory(error: Error): string {
  if (McpClientError.isInstance(error)) {
    const code = parseInt(error.code);
    
    if (code >= 1000 && code < 2000) return 'transport';
    if (code >= 2000 && code < 3000) return 'protocol';
    if (code >= 3000 && code < 4000) return 'application';
    if (code >= 4000 && code < 5000) return 'client';
    if (code >= 5000 && code < 6000) return 'server';
  }
  
  return 'unknown';
}

/**
 * 🎯 Получить severity ошибки
 */
export function getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
  const category = getErrorCategory(error);
  
  switch (category) {
    case 'transport':
      return 'medium'; // 🔌 Сетевые проблемы - средняя важность
    case 'protocol':
      return 'high';   // 📨 Проблемы протокола - высокая важность
    case 'application':
      return 'high';   // 🎯 Проблемы приложения - высокая важность
    case 'client':
      return 'low';    // 👤 Ошибки клиента - низкая важность
    case 'server':
      return 'critical'; // 🖥️ Серверные ошибки - критическая важность
    default:
      return 'medium';
  }
}

/**
 * 📝 Форматировать ошибку для логирования
 */
export function formatErrorForLogging(error: Error): string {
  if (McpClientError.isInstance(error)) {
    const category = getErrorCategory(error);
    const severity = getErrorSeverity(error);
    
    return `[${severity.toUpperCase()}][${category}] ${error.code}: ${error.message}`;
  }
  
  return `[UNKNOWN] ${error.name}: ${error.message}`;
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 ERROR HANDLING BEST PRACTICES:
 * 
 * ✅ **Specific Error Types**:
 * - Разные классы для разных категорий ошибок
 * - Типизированные коды для программной обработки
 * - Контекстная информация для debugging
 * 
 * ✅ **Error Recovery**:
 * - Определение восстанавливаемых ошибок
 * - Appropriate retry strategies
 * - Circuit breaker patterns для предотвращения cascading failures
 * 
 * ✅ **Error Reporting**:
 * - Structured logging с JSON serialization
 * - Error categorization для метрик
 * - Severity levels для alerting
 */

/**
 * 🔄 ERROR PROPAGATION PATTERNS:
 * 
 * 🎯 **Catch and Wrap**:
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   throw new McpClientError('Operation failed', 'OP_FAILED', { context }, error);
 * }
 * ```
 * 
 * 🎯 **Fail Fast**:
 * - Валидация параметров на раннем этапе
 * - Немедленный fail при критических ошибках
 * 
 * 🎯 **Graceful Degradation**:
 * - Fallback значения при non-critical ошибках
 * - Partial functionality вместо complete failure
 */

export default {
  McpClientError,
  TransportError,
  ProtocolError,
  ToolError,
  ResourceError,
  AuthenticationError,
  TimeoutError,
  RetryError,
  ValidationError,
  createConnectionError,
  createTimeoutError,
  createToolError,
  createResourceError,
  createProtocolError,
  createValidationError,
  isRecoverableError,
  getErrorCategory,
  getErrorSeverity,
  formatErrorForLogging,
};