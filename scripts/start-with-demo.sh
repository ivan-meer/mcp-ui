#!/bin/bash

# 🚀 MCP UI Complete Startup Script
# Запускает чат-клиент с демо-сервером

set -e

# Подключаем утилиты
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/process-manager.sh"

# Конфигурация
CHAT_CLIENT_PORT=3001
DEMO_SERVER_PORT=8081
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Заголовок
echo "========================================"
echo "   🚀 MCP UI Complete Stack"
echo "========================================"
echo ""

log "INFO" "Запуск полного стека MCP UI"
log "INFO" "Корневая директория: $PROJECT_ROOT"

# Проверка зависимостей
log "INFO" "Проверка зависимостей..."

if ! check_dependency "node" "Установите Node.js: https://nodejs.org/"; then
    exit 1
fi

if ! check_dependency "pnpm" "npm install -g pnpm"; then
    exit 1
fi

# Проверка и остановка запущенных процессов
log "INFO" "Проверка запущенных процессов..."

if check_port $CHAT_CLIENT_PORT; then
    log "WARNING" "Порт $CHAT_CLIENT_PORT занят:"
    get_port_info $CHAT_CLIENT_PORT
    
    read -p "Остановить процесс на порту $CHAT_CLIENT_PORT? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port $CHAT_CLIENT_PORT
        wait_for_port_free $CHAT_CLIENT_PORT
    else
        log "ERROR" "Невозможно продолжить с занятым портом $CHAT_CLIENT_PORT"
        exit 1
    fi
fi

if check_port $DEMO_SERVER_PORT; then
    log "WARNING" "Порт $DEMO_SERVER_PORT занят:"
    get_port_info $DEMO_SERVER_PORT
    
    read -p "Остановить процесс на порту $DEMO_SERVER_PORT? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port $DEMO_SERVER_PORT
        wait_for_port_free $DEMO_SERVER_PORT
    else
        log "ERROR" "Невозможно продолжить с занятым портом $DEMO_SERVER_PORT"
        exit 1
    fi
fi

# Установка зависимостей для демо-сервера
log "INFO" "Установка зависимостей демо-сервера..."
cd "$SCRIPT_DIR/demo"

if [ ! -f "package-lock.json" ] && [ ! -f "node_modules/.package-lock.json" ]; then
    log "INFO" "Первоначальная установка зависимостей..."
    npm install
else
    log "INFO" "Зависимости уже установлены"
fi

# Запуск демо-сервера в фоне
log "INFO" "Запуск MCP Demo Server на порту $DEMO_SERVER_PORT..."

# Создаем временный файл для логов
DEMO_LOG_FILE="/tmp/mcp-demo-server.log"

# Запускаем сервер
nohup node mcp-demo-server.js > "$DEMO_LOG_FILE" 2>&1 &
DEMO_PID=$!

create_pidfile "demo-server" $DEMO_PID

log "INFO" "Демо-сервер запущен (PID: $DEMO_PID)"
log "INFO" "Логи сервера: $DEMO_LOG_FILE"

# Ждем запуска демо-сервера
if wait_for_port_ready $DEMO_SERVER_PORT 30; then
    log "SUCCESS" "MCP Demo Server готов!"
else
    log "ERROR" "Не удалось запустить демо-сервер"
    kill $DEMO_PID 2>/dev/null || true
    remove_pidfile "demo-server"
    exit 1
fi

# Установка зависимостей чат-клиента
log "INFO" "Установка зависимостей чат-клиента..."
cd "$PROJECT_ROOT/apps/chat-client"

log "INFO" "Выполняем pnpm install..."
pnpm install --silent

# Функция очистки при выходе
cleanup() {
    log "INFO" "Остановка сервисов..."
    
    # Остановка демо-сервера
    if check_pidfile "demo-server"; then
        local demo_pid=$(cat "/tmp/mcp-ui-demo-server.pid" 2>/dev/null)
        if [ ! -z "$demo_pid" ] && kill -0 $demo_pid 2>/dev/null; then
            log "INFO" "Остановка демо-сервера (PID: $demo_pid)"
            kill $demo_pid
            wait $demo_pid 2>/dev/null || true
        fi
        remove_pidfile "demo-server"
    fi
    
    # Остановка процессов на портах
    kill_port $CHAT_CLIENT_PORT true
    kill_port $DEMO_SERVER_PORT true
    
    log "SUCCESS" "Все сервисы остановлены"
}

# Регистрируем обработчик сигналов
trap cleanup EXIT INT TERM

# Информация о запуске
echo ""
log "SUCCESS" "🎯 Все сервисы готовы!"
echo ""
echo "📊 Статус сервисов:"
echo "  🚀 Chat Client:  http://localhost:$CHAT_CLIENT_PORT"
echo "  🔧 Demo Server:  ws://localhost:$DEMO_SERVER_PORT"
echo ""
echo "🎯 Быстрый старт:"
echo "  1. Откройте http://localhost:$CHAT_CLIENT_PORT в браузере"
echo "  2. Перейдите в таб '🔌 MCP Серверы'"
echo "  3. Нажмите '+ Добавить' и введите:"
echo "     - Название: Demo Server"
echo "     - Тип: WebSocket"
echo "     - URL: ws://localhost:$DEMO_SERVER_PORT"
echo "  4. Нажмите 'Подключить' и исследуйте инструменты!"
echo ""
echo "📚 Доступные демо-инструменты:"
echo "  • 🌤️  get_weather - Получение погоды"
echo "  • 🧮 calculate - Математические вычисления"
echo "  • 🆔 generate_uuid - Генерация UUID"
echo "  • 🔄 encode_decode - Кодирование/декодирование"
echo "  • 🎲 random_data - Случайные данные"
echo ""
echo "📁 Доступные ресурсы:"
echo "  • 📊 demo://server-info - Информация о сервере"
echo "  • 📋 demo://sample-data - Примеры данных"
echo "  • 📖 demo://readme - Документация"
echo "  • 📝 demo://logs - Логи сервера"
echo ""
echo "🛑 Для остановки нажмите Ctrl+C"
echo ""

# Запуск чат-клиента
log "INFO" "Запуск чат-клиента..."
log "INFO" "Открывается на http://localhost:$CHAT_CLIENT_PORT"

pnpm dev