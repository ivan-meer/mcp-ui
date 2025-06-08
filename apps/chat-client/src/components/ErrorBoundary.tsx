/**
 * 🛡️ ERROR BOUNDARY COMPONENT
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * React Error Boundary для graceful обработки JavaScript ошибок в дереве компонентов.
 * Показывает fallback UI вместо белого экрана смерти.
 */

import React, { Component, ReactNode } from 'react';

// 📝 Типы пропсов
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// 📝 Типы состояния
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * 🛡️ Error Boundary компонент
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // 🎯 Ловим ошибки и обновляем состояние
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  // 📝 Логируем детали ошибки
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 📊 Обновляем состояние с информацией об ошибке
    this.setState({
      errorInfo,
    });

    // 📝 Логируем ошибку
    console.error('🛡️ Error Boundary поймал ошибку:', error);
    console.error('📋 Component Stack:', errorInfo.componentStack);

    // 🔔 Уведомляем родительский компонент
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 📊 В production можно отправлять ошибки в сервис мониторинга
    if (process.env.NODE_ENV === 'production') {
      // Например: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  // 🔄 Метод для сброса ошибки
  handleResetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  // 🖥️ Рендер
  render() {
    // ❌ Если есть ошибка, показываем fallback UI
    if (this.state.hasError) {
      // 🎨 Кастомный fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 🎨 Дефолтный fallback UI
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg-secondary rounded-lg border border-border-primary p-6 text-center">
            {/* 🚨 Иконка ошибки */}
            <div className="text-6xl mb-4">🚨</div>
            
            {/* 📋 Заголовок */}
            <h1 className="text-xl font-bold text-text-primary mb-2">
              Что-то пошло не так
            </h1>
            
            {/* 📝 Описание */}
            <p className="text-text-muted mb-4">
              Произошла неожиданная ошибка. Мы сохранили информацию для исправления.
            </p>
            
            {/* 🔍 Детали ошибки (только в development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-accent-warning hover:text-accent-warning/80 text-sm mb-2">
                  🔍 Показать детали ошибки
                </summary>
                <div className="bg-bg-tertiary rounded p-3 text-xs font-mono">
                  <div className="text-accent-error mb-2">
                    <strong>Ошибка:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="text-text-muted">
                      <strong>Stack trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className="text-text-muted mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            {/* 🔧 Действия */}
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleResetError}
                className="bg-accent-primary hover:bg-accent-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Попробовать снова
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-bg-hover hover:bg-bg-elevated text-text-primary px-4 py-2 rounded-lg transition-colors"
              >
                🔃 Перезагрузить страницу
              </button>
            </div>
            
            {/* 📞 Помощь */}
            <div className="mt-4 pt-4 border-t border-border-muted">
              <p className="text-xs text-text-muted">
                Если проблема повторяется, пожалуйста{' '}
                <a 
                  href="https://github.com/ivan-meer/mcp-ui/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline"
                >
                  сообщите о баге
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ✅ Если ошибок нет, рендерим детей
    return this.props.children;
  }
}

// 🎓 ОБРАЗОВАТЕЛЬНЫЕ ЗАМЕТКИ:

/**
 * 💡 ERROR BOUNDARY PATTERNS:
 * 
 * 🛡️ **Error Catching**:
 * - getDerivedStateFromError: обновляет состояние
 * - componentDidCatch: логирует ошибки
 * - Ловит только JavaScript ошибки в дереве компонентов
 * 
 * ❌ **What Error Boundaries DON'T Catch**:
 * - Event handlers (используйте try/catch)
 * - Async code (setTimeout, promises)
 * - Server-side rendering
 * - Errors thrown in error boundary itself
 * 
 * 🎯 **Best Practices**:
 * - Размещайте на разных уровнях приложения
 * - Предоставляйте осмысленные fallback UI
 * - Логируйте ошибки для мониторинга
 * - Предоставляйте способы восстановления
 */

/**
 * 🔧 RECOVERY STRATEGIES:
 * 
 * 🔄 **Reset Methods**:
 * - Local reset: handleResetError
 * - Full reload: window.location.reload()
 * - Navigation: router.push('/')
 * 
 * 📊 **Error Reporting**:
 * - Development: подробные стек трейсы
 * - Production: user-friendly сообщения
 * - Analytics: отправка в сервис мониторинга
 * 
 * 🎨 **Fallback UI Design**:
 * - Consistent с общим дизайном
 * - Информативные сообщения
 * - Четкие действия для пользователя
 * - Опциональные детали для debugging
 */

export default ErrorBoundary;