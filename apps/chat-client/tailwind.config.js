/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  darkMode: 'media',
  
  theme: {
    extend: {
      colors: {
        // Text colors
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'muted': 'var(--text-muted)',
        'inverse': 'var(--text-inverse)',
        
        // Background colors
        'base': 'var(--bg-base)',
        'card': 'var(--bg-card)',
        'subtle': 'var(--bg-subtle)',
        
        // Standard colors for compatibility
        blue: {
          50: 'var(--color-blue-50)',
          500: 'var(--color-blue-500)',
          600: 'var(--color-blue-600)',
          700: 'var(--color-blue-700)',
        },
        emerald: {
          500: 'var(--color-emerald-500)',
          600: 'var(--color-emerald-600)',
        },
        amber: {
          500: 'var(--color-amber-500)',
        },
        red: {
          500: 'var(--color-red-500)',
        },
        slate: {
          50: 'var(--color-slate-50)',
          100: 'var(--color-slate-100)',
          200: 'var(--color-slate-200)',
          300: 'var(--color-slate-300)',
          400: 'var(--color-slate-400)',
          500: 'var(--color-slate-500)',
          600: 'var(--color-slate-600)',
          700: 'var(--color-slate-700)',
          800: 'var(--color-slate-800)',
          900: 'var(--color-slate-900)',
        },
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        purple: {
          600: '#9333ea',
        },
        indigo: {
          600: '#4f46e5',
        },
      },
      
      backgroundColor: {
        'muted': 'var(--bg-muted)',
        'card': 'var(--bg-card)',
        'base': 'var(--bg-base)',
        'subtle': 'var(--bg-subtle)',
      },
      
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'muted': 'var(--text-muted)',
      },
      
      borderColor: {
        'base': 'var(--border-base)',
        'muted': 'var(--border-muted)',
        'strong': 'var(--border-strong)',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  
  plugins: [],
}