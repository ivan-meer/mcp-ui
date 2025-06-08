/**
 * 🚀 MAIN ENTRY POINT
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Точка входа в MCP Chat Client приложение.
 * Настраивает React, провайдеры состояния, error boundary и базовую структуру.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 🎨 Стили
import '@/styles/globals.css';

// 📱 Главный компонент приложения
import App from './App';

// 🔧 Провайдеры и настройки
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DevTools } from '@/components/DevTools';

// 📝 Логирование старта приложения
console.log('🚀 Запуск MCP Chat Client...');
console.log('📊 Версия:', __APP_VERSION__);
console.log('🌍 Окружение:', __NODE_ENV__);
console.log('⏰ Время сборки:', __BUILD_TIME__);

// 🎯 Получаем root элемент
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('❌ Root элемент не найден! Проверьте index.html');
}

// ⚡ Создаем React root
const root = ReactDOM.createRoot(rootElement);

// 🎨 Рендерим приложение
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        {/* 🛠️ DevTools только в development режиме */}
        {__DEV__ && <DevTools />}
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// 🔥 Hot Module Replacement для разработки
if (__DEV__ && import.meta.hot) {
  import.meta.hot.accept();
}

// 📊 Performance monitoring (disabled for now)
// if (__DEV__) {
//   // 📈 Web Vitals для мониторинга производительности
//   import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
//     onCLS(console.log);
//     onFID(console.log);
//     onFCP(console.log);
//     onLCP(console.log);
//     onTTFB(console.log);
//   });
// }

// 🌐 Service Worker регистрация (для PWA в будущем)
if ('serviceWorker' in navigator && __NODE_ENV__ === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW зарегистрирован:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ SW регистрация не удалась:', error);
      });
  });
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 REACT 18 FEATURES:
 * 
 * ⚡ **Concurrent Features**:
 * - Automatic batching для лучшей производительности
 * - Suspense для async компонентов
 * - useTransition для non-blocking updates
 * 
 * 🔧 **StrictMode Benefits**:
 * - Обнаружение side effects
 * - Предупреждения о устаревших API
 * - Проверка на memory leaks
 * 
 * 🎯 **createRoot API**:
 * - Новый API для React 18
 * - Включает concurrent features
 * - Лучшая производительность
 */

/**
 * 🛡️ ERROR HANDLING STRATEGY:
 * 
 * 📦 **Error Boundary**:
 * - Ловит JavaScript ошибки в дереве компонентов
 * - Показывает fallback UI вместо краша
 * - Логирует ошибки для debugging
 * 
 * 🔍 **Development Tools**:
 * - DevTools компонент для debugging
 * - Web Vitals для performance monitoring
 * - Console логирование в development
 * 
 * 🚀 **Production Optimizations**:
 * - Service Worker для PWA
 * - Удаление debug кода
 * - Оптимизированная сборка
 */