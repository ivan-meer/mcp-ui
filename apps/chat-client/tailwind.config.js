/** @type {import('tailwindcss').Config} */

// 🎨 ТЕМНАЯ ТЕМА КАК БАЗОВАЯ
// 
// 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА: 
// Настраиваем Tailwind для dark-first подхода
// Это означает, что все стили сначала оптимизируются для темной темы,
// а светлая тема добавляется через модификаторы

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // 🔗 Включаем все UI пакеты для правильной работы purging
    "../../packages/chat-ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-renderer/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/server-manager/src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // 🌙 DARK MODE STRATEGY
  darkMode: 'class', // Используем class-based dark mode для точного контроля
  
  theme: {
    extend: {
      // 🎨 CUSTOM COLOR PALETTE FOR DARK THEME
      colors: {
        // 🌙 Background colors (от самого темного к светлому)
        bg: {
          primary: '#0f0f23',    // Основной фон приложения
          secondary: '#1a1a2e',  // Карточки, панели  
          tertiary: '#16213e',   // Поля ввода, селекты
          elevated: '#1e293b',   // Модальные окна, попаперы
          hover: '#374151',      // Hover состояния
        },
        
        // 📝 Text colors
        text: {
          primary: '#f1f5f9',    // Основной текст
          secondary: '#94a3b8',  // Вторичный текст
          muted: '#64748b',      // Приглушенный текст (placeholder)
          inverse: '#0f172a',    // Для светлых фонов
        },
        
        // 🎯 Accent colors (семантические цвета)
        accent: {
          primary: '#3b82f6',    // Основной акцент (кнопки)
          secondary: '#8b5cf6',  // Вторичный акцент
          success: '#10b981',    // Успешные действия
          warning: '#f59e0b',    // Предупреждения
          error: '#ef4444',      // Ошибки
          info: '#06b6d4',       // Информационные сообщения
        },
        
        // 🔲 Border colors
        border: {
          primary: '#334155',    // Основные границы
          secondary: '#475569',  // Выделенные границы  
          muted: '#1e293b',      // Тонкие границы
          focus: '#3b82f6',      // Focus ring
        },
        
        // 💬 Chat-specific colors
        chat: {
          user: '#1e40af',       // Сообщения пользователя
          assistant: '#059669',  // Сообщения ассистента  
          system: '#7c3aed',     // Системные сообщения
          ui: '#dc2626',         // UI компоненты
        }
      },
      
      // 🔤 Typography improvements
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system', 
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',  
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'monospace'
        ],
      },
      
      // 📏 Spacing improvements
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px - для sidebar
        '128': '32rem',   // 512px - для широких контейнеров
      },
      
      // 🌊 Animation improvements 
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // 📱 Responsive breakpoints для чата
      screens: {
        'xs': '475px',    // Мобильные устройства
        'chat': '768px',  // Когда sidebar становится видимым
        'wide': '1440px', // Широкие экраны
      },
      
      // 🎭 Custom utilities
      blur: {
        xs: '2px',
      },
      
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  
  plugins: [
    // 🎨 Tailwind plugins для расширенной функциональности
    
    // 📝 Typography plugin для лучшей типографики
    require('@tailwindcss/typography'),
    
    // 📋 Forms plugin для стилизации форм
    require('@tailwindcss/forms'),
    
    // 🎯 Custom plugin для chat-specific utilities
    function({ addUtilities, theme }) {
      addUtilities({
        // 💬 Chat message utilities
        '.message-user': {
          backgroundColor: theme('colors.chat.user'),
          color: theme('colors.text.primary'),
          marginLeft: 'auto',
          borderRadius: '1rem 1rem 0.25rem 1rem',
        },
        '.message-assistant': {
          backgroundColor: theme('colors.bg.secondary'),
          color: theme('colors.text.primary'),
          marginRight: 'auto', 
          borderRadius: '1rem 1rem 1rem 0.25rem',
        },
        '.message-system': {
          backgroundColor: theme('colors.bg.tertiary'),
          color: theme('colors.text.secondary'),
          textAlign: 'center',
          borderRadius: '0.5rem',
        },
        
        // 🌟 Glow effects
        '.glow-blue': {
          boxShadow: `0 0 20px ${theme('colors.accent.primary')}40`,
        },
        '.glow-green': {
          boxShadow: `0 0 20px ${theme('colors.accent.success')}40`,
        },
        
        // 🎭 Glass morphism effects
        '.glass': {
          backgroundColor: `${theme('colors.bg.secondary')}80`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme('colors.border.muted')}`,
        },
      });
    },
  ],
}

// 🎯 СЛЕДУЮЩИЕ ШАГИ:
// TODO: Добавить поддержку светлой темы через CSS variables
// TODO: Настроить автоматическое переключение тем по системным настройкам  
// FIXME: Тестировать контрастность для соответствия WCAG AA
// HACK: Временно используем fixed colors, позже переведем на CSS custom properties