#!/usr/bin/env node

/**
 * 🚀 MCP Demo Server
 * Демонстрационный сервер с тестовыми инструментами и ресурсами
 */

import { WebSocketServer } from 'ws';
import { createReadStream, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Конфигурация сервера
const PORT = process.env.MCP_DEMO_PORT || 8081;
const HOST = process.env.MCP_DEMO_HOST || 'localhost';

// MCP протокол версия
const PROTOCOL_VERSION = '2024-11-05';

// Данные сервера
const SERVER_INFO = {
  name: 'MCP Demo Server',
  version: '1.0.0',
  protocolVersion: PROTOCOL_VERSION,
  capabilities: {
    tools: { listChanged: true },
    resources: { subscribe: true, listChanged: true },
    prompts: { listChanged: true },
    logging: {}
  },
  description: 'Демонстрационный MCP сервер с примерами инструментов и ресурсов'
};

// Демо инструменты
const DEMO_TOOLS = [
  {
    name: 'get_weather',
    description: 'Получает текущую погоду для указанного города',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'Название города для получения погоды'
        },
        units: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Единицы измерения температуры',
          default: 'celsius'
        }
      },
      required: ['city']
    }
  },
  {
    name: 'calculate',
    description: 'Выполняет математические вычисления',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Математическое выражение для вычисления (например: 2 + 2 * 3)'
        }
      },
      required: ['expression']
    }
  },
  {
    name: 'generate_uuid',
    description: 'Генерирует уникальный идентификатор UUID',
    inputSchema: {
      type: 'object',
      properties: {
        version: {
          type: 'number',
          enum: [1, 4],
          description: 'Версия UUID для генерации',
          default: 4
        },
        count: {
          type: 'number',
          description: 'Количество UUID для генерации',
          minimum: 1,
          maximum: 10,
          default: 1
        }
      }
    }
  },
  {
    name: 'encode_decode',
    description: 'Кодирует или декодирует текст в различных форматах',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Текст для обработки'
        },
        operation: {
          type: 'string',
          enum: ['base64_encode', 'base64_decode', 'url_encode', 'url_decode', 'html_encode', 'html_decode'],
          description: 'Операция кодирования/декодирования'
        }
      },
      required: ['text', 'operation']
    }
  },
  {
    name: 'random_data',
    description: 'Генерирует случайные данные различных типов',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['number', 'string', 'boolean', 'color', 'name', 'email'],
          description: 'Тип случайных данных'
        },
        count: {
          type: 'number',
          description: 'Количество элементов для генерации',
          minimum: 1,
          maximum: 20,
          default: 1
        }
      },
      required: ['type']
    }
  }
];

// Демо ресурсы
const DEMO_RESOURCES = [
  {
    uri: 'demo://server-info',
    name: 'Информация о сервере',
    description: 'Подробная информация о демо-сервере',
    mimeType: 'application/json'
  },
  {
    uri: 'demo://sample-data',
    name: 'Примеры данных',
    description: 'Набор примеров данных для тестирования',
    mimeType: 'application/json'
  },
  {
    uri: 'demo://readme',
    name: 'README',
    description: 'Документация по использованию демо-сервера',
    mimeType: 'text/markdown'
  },
  {
    uri: 'demo://logs',
    name: 'Логи сервера',
    description: 'Последние логи работы сервера',
    mimeType: 'text/plain'
  }
];

// Демо промпты
const DEMO_PROMPTS = [
  {
    name: 'weather_report',
    description: 'Создает подробный отчет о погоде',
    arguments: [
      {
        name: 'city',
        description: 'Город для отчета о погоде',
        required: true
      },
      {
        name: 'format',
        description: 'Формат отчета (краткий/подробный)',
        required: false
      }
    ]
  },
  {
    name: 'data_analysis',
    description: 'Анализирует предоставленные данные',
    arguments: [
      {
        name: 'data',
        description: 'Данные для анализа (JSON)',
        required: true
      },
      {
        name: 'analysis_type',
        description: 'Тип анализа (статистический/трендовый)',
        required: false
      }
    ]
  }
];

// Логи сервера
const serverLogs = [];

function log(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  console.log(logEntry);
  serverLogs.push(logEntry);
  
  // Ограничиваем размер логов
  if (serverLogs.length > 100) {
    serverLogs.shift();
  }
}

// Реализация инструментов
const toolImplementations = {
  get_weather: async (args) => {
    const { city, units = 'celsius' } = args;
    
    // Симуляция погодных данных
    const temperatures = {
      celsius: Math.round(Math.random() * 40 - 10),
      fahrenheit: Math.round(Math.random() * 72 + 32)
    };
    
    const conditions = ['Солнечно', 'Облачно', 'Дождь', 'Снег', 'Туман'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    const humidity = Math.round(Math.random() * 100);
    const windSpeed = Math.round(Math.random() * 30);
    
    return {
      content: [{
        type: 'text',
        text: `🌤️ Погода в городе ${city}:
        
📊 Температура: ${temperatures[units]}°${units === 'celsius' ? 'C' : 'F'}
☁️ Условия: ${condition}
💧 Влажность: ${humidity}%
💨 Скорость ветра: ${windSpeed} км/ч
⏰ Время обновления: ${new Date().toLocaleString('ru-RU')}`
      }]
    };
  },

  calculate: async (args) => {
    const { expression } = args;
    
    try {
      // Простая безопасная оценка математических выражений
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      if (sanitized !== expression) {
        throw new Error('Недопустимые символы в выражении');
      }
      
      const result = eval(sanitized);
      
      return {
        content: [{
          type: 'text',
          text: `🧮 Результат вычисления:

Выражение: ${expression}
Результат: ${result}

💡 Поддерживаются операции: +, -, *, /, (), десятичные числа`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Ошибка вычисления: ${error.message}`
        }],
        isError: true
      };
    }
  },

  generate_uuid: async (args) => {
    const { version = 4, count = 1 } = args;
    
    function generateUUID() {
      if (version === 4) {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      } else if (version === 1) {
        // Упрощенная версия UUID v1
        const timestamp = Date.now();
        return `${timestamp.toString(16)}-xxxx-1xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    }
    
    const uuids = Array.from({ length: count }, generateUUID);
    
    return {
      content: [{
        type: 'text',
        text: `🆔 Сгенерированные UUID (версия ${version}):

${uuids.map((uuid, i) => `${i + 1}. ${uuid}`).join('\n')}

💡 UUID используются для уникальной идентификации объектов`
      }]
    };
  },

  encode_decode: async (args) => {
    const { text, operation } = args;
    
    try {
      let result;
      
      switch (operation) {
        case 'base64_encode':
          result = Buffer.from(text, 'utf8').toString('base64');
          break;
        case 'base64_decode':
          result = Buffer.from(text, 'base64').toString('utf8');
          break;
        case 'url_encode':
          result = encodeURIComponent(text);
          break;
        case 'url_decode':
          result = decodeURIComponent(text);
          break;
        case 'html_encode':
          result = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          break;
        case 'html_decode':
          result = text
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
          break;
        default:
          throw new Error('Неподдерживаемая операция');
      }
      
      return {
        content: [{
          type: 'text',
          text: `🔄 Результат операции ${operation}:

Исходный текст: ${text}
Результат: ${result}

💡 Длина исходного текста: ${text.length}
💡 Длина результата: ${result.length}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Ошибка ${operation}: ${error.message}`
        }],
        isError: true
      };
    }
  },

  random_data: async (args) => {
    const { type, count = 1 } = args;
    
    function generateRandom(dataType) {
      switch (dataType) {
        case 'number':
          return Math.floor(Math.random() * 1000);
        case 'string':
          return Math.random().toString(36).substring(2, 12);
        case 'boolean':
          return Math.random() > 0.5;
        case 'color':
          return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        case 'name':
          const names = ['Алексей', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Анна', 'Владимир', 'Ольга'];
          return names[Math.floor(Math.random() * names.length)];
        case 'email':
          const domains = ['example.com', 'test.org', 'demo.net'];
          const username = Math.random().toString(36).substring(2, 8);
          return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
        default:
          return 'unknown';
      }
    }
    
    const data = Array.from({ length: count }, () => generateRandom(type));
    
    return {
      content: [{
        type: 'text',
        text: `🎲 Случайные данные (тип: ${type}):

${data.map((item, i) => `${i + 1}. ${item}`).join('\n')}

💡 Сгенерировано ${count} элемент(ов) типа "${type}"`
      }]
    };
  }
};

// Реализация ресурсов
const resourceImplementations = {
  'demo://server-info': () => ({
    contents: [{
      type: 'text',
      text: JSON.stringify({
        server: SERVER_INFO,
        runtime: {
          nodeVersion: process.version,
          platform: process.platform,
          architecture: process.arch,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        },
        statistics: {
          toolsAvailable: DEMO_TOOLS.length,
          resourcesAvailable: DEMO_RESOURCES.length,
          promptsAvailable: DEMO_PROMPTS.length,
          connectionsActive: 0 // Будет обновляться
        }
      }, null, 2)
    }]
  }),

  'demo://sample-data': () => ({
    contents: [{
      type: 'text',
      text: JSON.stringify({
        users: [
          { id: 1, name: 'Алексей Петров', email: 'alex@example.com', active: true },
          { id: 2, name: 'Мария Иванова', email: 'maria@example.com', active: true },
          { id: 3, name: 'Дмитрий Сидоров', email: 'dmitry@example.com', active: false }
        ],
        products: [
          { id: 101, name: 'Ноутбук', price: 45000, category: 'Электроника' },
          { id: 102, name: 'Мышь', price: 1500, category: 'Периферия' },
          { id: 103, name: 'Клавиатура', price: 3000, category: 'Периферия' }
        ],
        metrics: {
          sales: [120, 150, 180, 200, 170],
          visitors: [1500, 1800, 2100, 1900, 2200],
          conversion: [0.08, 0.083, 0.086, 0.079, 0.091]
        }
      }, null, 2)
    }]
  }),

  'demo://readme': () => ({
    contents: [{
      type: 'text',
      text: `# MCP Demo Server

Это демонстрационный сервер для Model Context Protocol (MCP).

## Доступные инструменты

1. **get_weather** - Получение информации о погоде
2. **calculate** - Математические вычисления
3. **generate_uuid** - Генерация UUID
4. **encode_decode** - Кодирование/декодирование текста
5. **random_data** - Генерация случайных данных

## Доступные ресурсы

- **demo://server-info** - Информация о сервере
- **demo://sample-data** - Примеры данных
- **demo://readme** - Этот документ
- **demo://logs** - Логи сервера

## Использование

Подключитесь к серверу через WebSocket:
\`\`\`
ws://localhost:${PORT}
\`\`\`

Отправьте MCP-сообщение для инициализации:
\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "${PROTOCOL_VERSION}",
    "capabilities": {},
    "clientInfo": {"name": "Test Client", "version": "1.0.0"}
  }
}
\`\`\`
`
    }]
  }),

  'demo://logs': () => ({
    contents: [{
      type: 'text',
      text: serverLogs.slice(-20).join('\n')
    }]
  })
};

// WebSocket сервер
const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on('listening', () => {
  log('INFO', `🚀 MCP Demo Server запущен на ws://${HOST}:${PORT}`);
  log('INFO', `📚 Доступно инструментов: ${DEMO_TOOLS.length}`);
  log('INFO', `📁 Доступно ресурсов: ${DEMO_RESOURCES.length}`);
  log('INFO', `💬 Доступно промптов: ${DEMO_PROMPTS.length}`);
});

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  log('INFO', `🔗 Новое подключение от ${clientIP}`);

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      log('INFO', `📨 Получено сообщение: ${message.method || 'response'}`);

      const response = await handleMessage(message);
      if (response) {
        ws.send(JSON.stringify(response));
        log('INFO', `📤 Отправлен ответ на ${message.method}`);
      }
    } catch (error) {
      log('ERROR', `❌ Ошибка обработки сообщения: ${error.message}`);
      
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
          data: error.message
        }
      };
      
      ws.send(JSON.stringify(errorResponse));
    }
  });

  ws.on('close', () => {
    log('INFO', `🔌 Соединение с ${clientIP} закрыто`);
  });

  ws.on('error', (error) => {
    log('ERROR', `❌ Ошибка WebSocket: ${error.message}`);
  });
});

// Обработка MCP сообщений
async function handleMessage(message) {
  const { jsonrpc, id, method, params } = message;

  if (jsonrpc !== '2.0') {
    throw new Error('Неподдерживаемая версия JSON-RPC');
  }

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          serverInfo: SERVER_INFO,
          capabilities: SERVER_INFO.capabilities
        }
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: DEMO_TOOLS
        }
      };

    case 'tools/call':
      const { name, arguments: args } = params;
      
      if (!toolImplementations[name]) {
        throw new Error(`Неизвестный инструмент: ${name}`);
      }
      
      const result = await toolImplementations[name](args);
      
      return {
        jsonrpc: '2.0',
        id,
        result
      };

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources: DEMO_RESOURCES
        }
      };

    case 'resources/read':
      const { uri } = params;
      
      if (!resourceImplementations[uri]) {
        throw new Error(`Неизвестный ресурс: ${uri}`);
      }
      
      const resourceResult = resourceImplementations[uri]();
      
      return {
        jsonrpc: '2.0',
        id,
        result: resourceResult
      };

    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          prompts: DEMO_PROMPTS
        }
      };

    case 'prompts/get':
      const { name: promptName, arguments: promptArgs } = params;
      
      const prompt = DEMO_PROMPTS.find(p => p.name === promptName);
      if (!prompt) {
        throw new Error(`Неизвестный промпт: ${promptName}`);
      }
      
      let promptText = '';
      if (promptName === 'weather_report') {
        const city = promptArgs?.city || 'Неизвестный город';
        const format = promptArgs?.format || 'краткий';
        promptText = `Создай ${format} отчет о погоде для города ${city}. Включи температуру, влажность, осадки и рекомендации.`;
      } else if (promptName === 'data_analysis') {
        const analysisType = promptArgs?.analysis_type || 'статистический';
        promptText = `Проведи ${analysisType} анализ предоставленных данных. Выдели ключевые метрики, тренды и рекомендации.`;
      }
      
      return {
        jsonrpc: '2.0',
        id,
        result: {
          description: prompt.description,
          messages: [{
            role: 'user',
            content: {
              type: 'text',
              text: promptText
            }
          }]
        }
      };

    default:
      throw new Error(`Неизвестный метод: ${method}`);
  }
}

// Обработка завершения процесса
process.on('SIGINT', () => {
  log('INFO', '🛑 Получен сигнал SIGINT, завершаем работу сервера');
  wss.close(() => {
    log('INFO', '✅ Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('INFO', '🛑 Получен сигнал SIGTERM, завершаем работу сервера');
  wss.close(() => {
    log('INFO', '✅ Сервер остановлен');
    process.exit(0);
  });
});

export { wss, DEMO_TOOLS, DEMO_RESOURCES, DEMO_PROMPTS };