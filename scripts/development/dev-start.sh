#!/bin/bash
# 🚀 DEV START SCRIPT
# 🎯 Назначение: Запуск всех пакетов в режиме разработки
# 🚀 Использование: ./scripts/development/dev-start.sh [--chat-only|--full]

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
MODE="full"
AUTO_OPEN=${AUTO_OPEN_BROWSER:-true}
CHAT_PORT=${CHAT_CLIENT_PORT:-3000}
DEMO_SERVER_PORT=${DEMO_SERVER_PORT:-3001}

# 📋 Функция помощи
show_help() {
    cat << EOF
🚀 MCP Chat Client Development Server

🎯 НАЗНАЧЕНИЕ:
   Запускает все необходимые сервисы для разработки MCP Chat Client

🚀 ИСПОЛЬЗОВАНИЕ:
   $0 [options]

📋 ОПЦИИ:
   --chat-only     Запустить только чат-клиент (без demo сервера)
   --full          Запустить полную среду разработки (по умолчанию)
   --no-browser    Не открывать браузер автоматически
   --port PORT     Порт для чат-клиента (по умолчанию: 3000)
   --help          Показать эту справку

🌍 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ:
   NODE_ENV                Окружение (development)
   CHAT_CLIENT_PORT        Порт чат-клиента (3000)
   DEMO_SERVER_PORT        Порт демо сервера (3001)
   AUTO_OPEN_BROWSER       Автооткрытие браузера (true)
   DEBUG_MODE              Режим отладки (false)

📋 ПРИМЕРЫ:
   $0                      # Полный запуск
   $0 --chat-only          # Только чат-клиент
   $0 --port 8080          # На порту 8080
   $0 --no-browser         # Без автооткрытия браузера

EOF
}

# 🔧 Парсинг аргументов
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --chat-only)
                MODE="chat-only"
                shift
                ;;
            --full)
                MODE="full"
                shift
                ;;
            --no-browser)
                AUTO_OPEN=false
                shift
                ;;
            --port)
                CHAT_PORT="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Неизвестная опция: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# ✅ Проверка требований
check_requirements() {
    log_step "Проверка требований системы..."
    
    # Проверяем Node.js
    if ! command -v node >/dev/null 2>&1; then
        log_error "Node.js не найден. Установите Node.js 18+ и повторите попытку"
        exit 1
    fi
    
    # Проверяем pnpm
    if ! command -v pnpm >/dev/null 2>&1; then
        log_error "pnpm не найден. Установите pnpm: npm install -g pnpm"
        exit 1
    fi
    
    # Проверяем версию Node.js
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Требуется Node.js 18+, найдена версия: $(node --version)"
        exit 1
    fi
    
    log_success "Все требования выполнены"
}

# 📦 Установка зависимостей
install_dependencies() {
    log_step "Проверка и установка зависимостей..."
    
    cd "$ROOT_DIR"
    
    # Проверяем наличие node_modules
    if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
        log_info "Установка зависимостей..."
        pnpm install
    else
        log_info "Зависимости уже установлены"
    fi
    
    log_success "Зависимости готовы"
}

# 🏗️ Сборка пакетов
build_packages() {
    log_step "Сборка необходимых пакетов..."
    
    cd "$ROOT_DIR"
    
    # Собираем shared типы
    log_info "Сборка @mcp-ui/shared..."
    pnpm --filter @mcp-ui/shared build
    
    # Собираем mcp-connector
    log_info "Сборка @mcp-ui/mcp-connector..."
    pnpm --filter @mcp-ui/mcp-connector build
    
    # Собираем chat-ui компоненты
    log_info "Сборка @mcp-ui/chat-ui..."
    pnpm --filter @mcp-ui/chat-ui build
    
    log_success "Пакеты собраны"
}

# 🔍 Проверка портов
check_ports() {
    log_step "Проверка доступности портов..."
    
    # Проверяем порт чат-клиента
    if lsof -i ":$CHAT_PORT" >/dev/null 2>&1; then
        log_warn "Порт $CHAT_PORT занят. Пробуем найти свободный..."
        for port in $(seq $((CHAT_PORT + 1)) $((CHAT_PORT + 10))); do
            if ! lsof -i ":$port" >/dev/null 2>&1; then
                CHAT_PORT=$port
                log_info "Будем использовать порт $CHAT_PORT"
                break
            fi
        done
    fi
    
    # Проверяем порт демо сервера (если нужен)
    if [ "$MODE" = "full" ]; then
        if lsof -i ":$DEMO_SERVER_PORT" >/dev/null 2>&1; then
            log_warn "Порт $DEMO_SERVER_PORT занят. Пробуем найти свободный..."
            for port in $(seq $((DEMO_SERVER_PORT + 1)) $((DEMO_SERVER_PORT + 10))); do
                if ! lsof -i ":$port" >/dev/null 2>&1; then
                    DEMO_SERVER_PORT=$port
                    log_info "Демо сервер будет на порту $DEMO_SERVER_PORT"
                    break
                fi
            done
        fi
    fi
    
    log_success "Порты проверены"
}

# 🎯 Создание .env файла для разработки
create_env_file() {
    log_step "Создание конфигурации для разработки..."
    
    cd "$ROOT_DIR"
    
    # Создаем .env для разработки
    cat > .env.development << EOF
# 🚀 MCP Chat Client Development Configuration
# Создано автоматически $(date)

# 🌍 Environment
NODE_ENV=development
DEBUG_MODE=true

# 🔌 Network Configuration
CHAT_CLIENT_PORT=$CHAT_PORT
DEMO_SERVER_PORT=$DEMO_SERVER_PORT
MCP_SERVER_URL=ws://localhost:$DEMO_SERVER_PORT

# 🎨 UI Configuration
AUTO_OPEN_BROWSER=$AUTO_OPEN
THEME=dark
DEV_OVERLAY=true

# 📊 Development Features
HOT_RELOAD=true
TYPE_CHECKING=true
DETAILED_ERRORS=true
PERFORMANCE_MONITORING=true

# 🧪 Testing
ENABLE_TEST_TOOLS=true
MOCK_DATA=true

# 📝 Logging
LOG_LEVEL=debug
CONSOLE_LOGGING=true
FILE_LOGGING=false

EOF
    
    log_success "Конфигурация создана: .env.development"
}

# 🚀 Запуск чат-клиента
start_chat_client() {
    log_step "Запуск MCP Chat Client..."
    
    cd "$ROOT_DIR/apps/chat-client"
    
    # Экспортируем переменные окружения
    export NODE_ENV=development
    export PORT=$CHAT_PORT
    export BROWSER=$AUTO_OPEN
    
    log_info "🌐 Chat Client будет доступен на: http://localhost:$CHAT_PORT"
    
    # Запускаем в фоне если нужен full режим
    if [ "$MODE" = "full" ]; then
        pnpm dev &
        CHAT_PID=$!
        echo $CHAT_PID > /tmp/mcp-chat-client.pid
        log_info "Chat Client запущен в фоне (PID: $CHAT_PID)"
    else
        exec pnpm dev
    fi
}

# 🧪 Запуск демо сервера
start_demo_server() {
    log_step "Запуск Demo MCP Server..."
    
    cd "$ROOT_DIR/examples/demo-server"
    
    # Экспортируем переменные окружения
    export NODE_ENV=development
    export PORT=$DEMO_SERVER_PORT
    
    log_info "🖥️  Demo Server будет доступен на: ws://localhost:$DEMO_SERVER_PORT"
    
    # Запускаем в фоне
    pnpm dev &
    SERVER_PID=$!
    echo $SERVER_PID > /tmp/mcp-demo-server.pid
    log_info "Demo Server запущен в фоне (PID: $SERVER_PID)"
}

# 📊 Показать статус
show_status() {
    echo
    log_success "🎉 MCP Chat Client Development Environment запущен!"
    echo
    echo -e "${CYAN}📊 СТАТУС СЕРВИСОВ:${NC}"
    echo -e "   💬 Chat Client:  ${GREEN}http://localhost:$CHAT_PORT${NC}"
    
    if [ "$MODE" = "full" ]; then
        echo -e "   🖥️  Demo Server:   ${GREEN}ws://localhost:$DEMO_SERVER_PORT${NC}"
    fi
    
    echo
    echo -e "${CYAN}🛠️  ПОЛЕЗНЫЕ КОМАНДЫ:${NC}"
    echo -e "   📊 Остановить:    ${YELLOW}./scripts/development/dev-stop.sh${NC}"
    echo -e "   📝 Логи:          ${YELLOW}./scripts/development/dev-logs.sh${NC}"
    echo -e "   🔄 Перезапуск:    ${YELLOW}./scripts/development/dev-restart.sh${NC}"
    echo -e "   🧪 Тесты:         ${YELLOW}./scripts/testing/test-watch.sh${NC}"
    
    echo
    echo -e "${CYAN}🎯 РЕЖИМ:${NC} $MODE"
    echo -e "${CYAN}🌍 ENV:${NC} development"
    echo -e "${CYAN}🔧 DEBUG:${NC} enabled"
    echo
}

# 🚨 Обработка сигналов завершения
cleanup() {
    log_info "Завершение работы..."
    
    # Убиваем процессы если они есть
    if [ -f /tmp/mcp-chat-client.pid ]; then
        CHAT_PID=$(cat /tmp/mcp-chat-client.pid)
        kill $CHAT_PID 2>/dev/null || true
        rm -f /tmp/mcp-chat-client.pid
    fi
    
    if [ -f /tmp/mcp-demo-server.pid ]; then
        SERVER_PID=$(cat /tmp/mcp-demo-server.pid)
        kill $SERVER_PID 2>/dev/null || true
        rm -f /tmp/mcp-demo-server.pid
    fi
    
    log_success "Cleanup завершен"
    exit 0
}

# 🎯 Основная функция
main() {
    # Обработка сигналов
    trap cleanup SIGINT SIGTERM
    
    echo -e "${PURPLE}"
    echo "🚀 MCP Chat Client Development Server"
    echo "======================================"
    echo -e "${NC}"
    
    parse_args "$@"
    check_requirements
    install_dependencies
    check_ports
    create_env_file
    build_packages
    
    # Запуск в зависимости от режима
    if [ "$MODE" = "full" ]; then
        start_demo_server
        sleep 3  # Даем серверу время запуститься
        start_chat_client
        show_status
        
        # Ждем завершения
        wait
    else
        start_chat_client
    fi
}

# 🎯 Запуск
main "$@"