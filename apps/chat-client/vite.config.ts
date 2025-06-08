/**
 * ⚡ VITE CONFIGURATION
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Конфигурация Vite для MCP Chat Client с оптимизациями для разработки и production.
 * Настроена для работы с TypeScript, React, Tailwind CSS и монорепо структурой.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// 🎯 Экспорт конфигурации
export default defineConfig({
  // 🔌 Плагины
  plugins: [
    react({
      // 🔥 Fast Refresh для React
      fastRefresh: true,
      // 📝 JSX runtime (automatic для React 17+)
      jsxRuntime: 'automatic',
    }),
  ],

  // 📁 Разрешение путей
  resolve: {
    alias: {
      // 📦 Алиасы для удобного импорта
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'), 
      '@store': resolve(__dirname, './src/store'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },

  // 🖥️ Настройки dev сервера
  server: {
    port: Number(process.env.PORT) || 3000,
    host: true, // 🌐 Доступ с других устройств в сети
    open: process.env.AUTO_OPEN_BROWSER !== 'false',
    cors: true,
    // 🔄 Proxy для MCP серверов (если нужен)
    proxy: {
      '/api/mcp': {
        target: process.env.MCP_SERVER_URL || 'ws://localhost:3001',
        ws: true, // 📡 WebSocket proxy
        changeOrigin: true,
      },
    },
  },

  // 📦 Настройки сборки
  build: {
    // 🎯 Таргет для современных браузеров
    target: 'esnext',
    
    // 📊 Размер чанков
    rollupOptions: {
      output: {
        // 📦 Оптимальная разбивка чанков
        manualChunks: {
          // 🔧 Vendor чанк для внешних библиотек
          vendor: ['react', 'react-dom'],
          // 📡 MCP чанк для MCP связанных модулей
          mcp: ['@mcp-ui/mcp-connector', '@mcp-ui/server-manager'],
          // 🎨 UI чанк для UI компонентов
          ui: ['@mcp-ui/chat-ui', '@mcp-ui/ui-renderer'],
        },
      },
    },
    
    // 📈 Анализ размера бандла
    reportCompressedSize: true,
    
    // 🧹 Очистка dist папки
    emptyOutDir: true,
    
    // 📁 Директория вывода
    outDir: 'dist',
    
    // 📊 Source maps для production debugging
    sourcemap: process.env.NODE_ENV === 'development',
  },

  // 🧪 Настройки тестирования
  test: {
    // 🌐 Среда выполнения тестов
    environment: 'jsdom',
    
    // ⚙️ Setup файлы
    setupFiles: ['./src/test/setup.ts'],
    
    // 📊 Покрытие кода
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
    
    // 🔧 Global API (describe, it, expect)
    globals: true,
  },

  // 🔧 Оптимизации
  optimizeDeps: {
    // 📦 Принудительная оптимизация зависимостей
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'clsx',
    ],
    
    // ❌ Исключения из оптимизации
    exclude: [
      // 🔧 Локальные workspace пакеты
      '@mcp-ui/chat-ui',
      '@mcp-ui/mcp-connector', 
      '@mcp-ui/server-manager',
      '@mcp-ui/shared',
    ],
  },

  // 📝 TypeScript настройки
  esbuild: {
    // 🗑️ Удаление console.log в production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    
    // 📋 JSX настройки
    jsx: 'automatic',
  },

  // 🌍 Переменные окружения
  define: {
    // 🎯 Глобальные переменные для приложения
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __NODE_ENV__: JSON.stringify(process.env.NODE_ENV || 'development'),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },

  // 💾 CSS настройки
  css: {
    // 🎨 PostCSS конфигурация (Tailwind обрабатывается автоматически)
    postcss: './postcss.config.js',
    
    // 🔧 CSS модули (если используются)
    modules: {
      localsConvention: 'camelCase',
    },
    
    // 🗜️ Минификация CSS в production
    devSourcemap: process.env.NODE_ENV === 'development',
  },

  // 🔍 Логирование
  logLevel: process.env.VITE_LOG_LEVEL || 'info',
  
  // 🧹 Очистка консоли при изменениях
  clearScreen: false,
});

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 VITE CONFIGURATION BEST PRACTICES:
 * 
 * ⚡ **Performance Optimizations**:
 * - Manual chunks для оптимального кэширования
 * - Optimized dependencies для быстрого холодного старта
 * - Tree-shaking включен по умолчанию
 * 
 * 🔧 **Development Experience**:
 * - Hot Module Replacement (HMR) для React
 * - Path aliases для чистых импортов
 * - TypeScript поддержка из коробки
 * - Source maps для debugging
 * 
 * 📦 **Bundle Optimization**:
 * - Vendor chunking для лучшего кэширования
 * - Code splitting по функциональности
 * - Compression и minification в production
 * 
 * 🧪 **Testing Integration**:
 * - Vitest конфигурация для unit тестов
 * - jsdom для React Testing Library
 * - Coverage reports
 */

/**
 * 🎯 MONOREPO CONSIDERATIONS:
 * 
 * 📁 **Workspace Dependencies**:
 * - Исключаем локальные пакеты из optimizeDeps
 * - Правильная работа с symlinks
 * - Hot reload для изменений в workspace пакетах
 * 
 * 🔄 **Development Workflow**:
 * - Proxy настройки для MCP серверов
 * - Environment variables для разных стадий
 * - Build optimization для production deployment
 */