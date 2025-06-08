#!/bin/bash
# 💬 CHAT CLIENT START SCRIPT
# 🎯 Назначение: Простой запуск чат-клиента для пользователей
# 🚀 Использование: ./scripts/user/start-chat-client.sh

set -euo pipefail

# 🎨 Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 📝 Функции логирования
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 🎯 Переменные
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CHAT_PORT=${CHAT_CLIENT_PORT:-3000}
AUTO_OPEN=${AUTO_OPEN_BROWSER:-true}

# 📋 Показать приветствие
show_welcome() {
    echo -e "${PURPLE}"
    echo "💬 MCP Chat Client"
    echo "=================="
    echo -e "${NC}"
    echo "🎯 Добро пожаловать в Model Context Protocol Chat Client!"
    echo "🚀 Этот инструмент позволяет общаться с MCP серверами через удобный интерфейс."
    echo
}

# ✅ Быстрая проверка
quick_check() {
    log_step "Проверка готовности..."
    
    # Проверяем что мы в правильной директории
    if [ ! -f "$ROOT_DIR/package.json" ]; then
        log_error "Не найден package.json. Убедитесь что вы запускаете скрипт из корня проекта MCP-UI"
        exit 1
    fi
    
    # Проверяем Node.js
    if ! command -v node >/dev/null 2>&1; then
        log_error "Node.js не найден. Пожалуйста установите Node.js 18+ с https://nodejs.org"
        exit 1
    fi
    
    # Проверяем pnpm
    if ! command -v pnpm >/dev/null 2>&1; then
        log_warn "pnpm не найден. Устанавливаем pnpm..."
        npm install -g pnpm || {
            log_error "Не удалось установить pnpm. Установите его вручную: npm install -g pnpm"
            exit 1
        }
    fi
    
    log_success "Базовые требования выполнены"
}

# 📦 Автоматическая настройка
auto_setup() {
    log_step "Подготовка чат-клиента..."
    
    cd "$ROOT_DIR"
    
    # Устанавливаем зависимости если нужно
    if [ ! -d "node_modules" ]; then
        log_info "Первый запуск - установка зависимостей..."
        pnpm install || {
            log_error "Ошибка установки зависимостей"
            exit 1
        }
    fi
    
    # Проверяем сборку пакетов
    if [ ! -d "packages/shared/dist" ] || [ ! -d "packages/chat-ui/dist" ]; then
        log_info "Сборка необходимых компонентов..."
        pnpm build || {
            log_error "Ошибка сборки компонентов"
            exit 1
        }
    fi
    
    log_success "Подготовка завершена"
}

# 🔍 Проверка порта
check_port() {
    log_step "Проверка порта $CHAT_PORT..."
    
    if command -v lsof >/dev/null 2>&1 && lsof -i ":$CHAT_PORT" >/dev/null 2>&1; then
        log_warn "Порт $CHAT_PORT уже используется"
        
        # Предлагаем альтернативы
        for port in 3001 3002 3003 8000 8080; do
            if ! lsof -i ":$port" >/dev/null 2>&1; then
                log_info "Используем свободный порт $port"
                CHAT_PORT=$port
                break
            fi
        done
    fi
    
    log_success "Порт $CHAT_PORT свободен"
}

# 🌐 Создание пользовательской конфигурации
create_user_config() {
    log_step "Создание пользовательской конфигурации..."
    
    cd "$ROOT_DIR"
    
    # Создаем .env для пользователя если его нет
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
# 💬 MCP Chat Client - Пользовательская конфигурация
# Создано $(date)

# 🌐 Сетевые настройки
CHAT_CLIENT_PORT=$CHAT_PORT
AUTO_OPEN_BROWSER=$AUTO_OPEN

# 🎨 Интерфейс
THEME=dark
LANGUAGE=ru

# 🔌 MCP Серверы (добавьте свои)
# MCP_SERVER_1=ws://localhost:3001
# MCP_SERVER_2=http://example.com/mcp

# 📁 Пользовательские данные
USER_DATA_DIR=~/.mcp-chat-client
CHAT_HISTORY_ENABLED=true
AUTO_SAVE_SETTINGS=true

# 🛡️ Безопасность
ALLOW_EXTERNAL_SERVERS=true
REQUIRE_SERVER_AUTH=false

EOF
        log_info "Создан файл .env.local с пользовательскими настройками"
    fi
    
    log_success "Конфигурация готова"
}

# 🚀 Запуск чат-клиента
start_client() {
    log_step "Запуск MCP Chat Client..."
    
    cd "$ROOT_DIR/apps/chat-client"
    
    # Экспортируем переменные
    export NODE_ENV=production
    export PORT=$CHAT_PORT
    export BROWSER=$AUTO_OPEN
    
    echo
    log_success "🎉 MCP Chat Client запускается!"
    echo
    echo -e "${CYAN}🌐 Адрес:${NC} http://localhost:$CHAT_PORT"
    echo -e "${CYAN}🎨 Тема:${NC} Темная"
    echo -e "${CYAN}🔌 Статус:${NC} Готов к подключению к MCP серверам"
    echo
    
    if [ "$AUTO_OPEN" = "true" ]; then
        log_info "Браузер откроется автоматически..."
    else
        log_info "Откройте http://localhost:$CHAT_PORT в браузере"
    fi
    
    echo
    echo -e "${YELLOW}💡 Совет:${NC} Для остановки нажмите Ctrl+C"
    echo
    
    # Запускаем клиент
    pnpm start || pnpm dev || {
        log_error "Не удалось запустить чат-клиент"
        log_info "Попробуйте запустить в режиме разработки:"
        log_info "./scripts/development/dev-start.sh --chat-only"
        exit 1
    }
}

# 📊 Показать помощь
show_help() {
    cat << EOF
💬 MCP Chat Client - Простой запуск

🎯 НАЗНАЧЕНИЕ:
   Запускает готовый к использованию чат-клиент для общения с MCP серверами

🚀 ИСПОЛЬЗОВАНИЕ:
   $0

🔧 НАСТРОЙКИ:
   Редактируйте файл .env.local для изменения настроек:
   - CHAT_CLIENT_PORT=3000    # Порт веб-интерфейса  
   - AUTO_OPEN_BROWSER=true   # Автооткрытие браузера
   - THEME=dark               # Тема интерфейса

📚 ПЕРВЫЕ ШАГИ:
   1. Запустите этот скрипт
   2. Откройте веб-интерфейс в браузере  
   3. Добавьте MCP сервер через настройки
   4. Начните общение!

🆘 ПОМОЩЬ:
   - Документация: docs/DEMO_GUIDE.md
   - Примеры: examples/
   - Проблемы: scripts/utils/troubleshoot.sh

EOF
}

# 🎯 Основная функция
main() {
    # Проверяем аргументы
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --version|-v)
            echo "MCP Chat Client v1.0.0"
            exit 0
            ;;
    esac
    
    show_welcome
    quick_check
    auto_setup
    check_port
    create_user_config
    start_client
}

# 🎯 Запуск
main "$@"