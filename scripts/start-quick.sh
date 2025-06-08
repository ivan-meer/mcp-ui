#!/bin/bash

# 🚀 Quick Start Script - Только чат-клиент
# Быстрый запуск чат-клиента без демо-сервера

set -e

# Подключаем утилиты
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/process-manager.sh"

# Конфигурация
CHAT_CLIENT_PORT=3001
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Заголовок
echo "========================================"
echo "   💬 MCP Chat Client Only"
echo "========================================"
echo ""

log "INFO" "Быстрый запуск чат-клиента"

# Проверка зависимостей
if ! check_dependency "pnpm" "npm install -g pnpm"; then
    exit 1
fi

# Проверка порта
if check_port $CHAT_CLIENT_PORT; then
    log "WARNING" "Порт $CHAT_CLIENT_PORT занят"
    get_port_info $CHAT_CLIENT_PORT
    
    read -p "Остановить процесс? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port $CHAT_CLIENT_PORT
        wait_for_port_free $CHAT_CLIENT_PORT
    else
        log "ERROR" "Невозможно продолжить"
        exit 1
    fi
fi

# Переход в директорию и запуск
cd "$PROJECT_ROOT/apps/chat-client"

log "INFO" "Установка зависимостей..."
pnpm install --silent

echo ""
log "SUCCESS" "🎯 Чат-клиент готов!"
echo ""
echo "📊 Доступные возможности:"
echo "  • 🤖 AI провайдеры: OpenAI, Anthropic, Ollama"
echo "  • 🔌 MCP серверы: WebSocket, SSE подключения"
echo "  • 🛠️ Инструменты: выполнение и мониторинг"
echo "  • 📁 Ресурсы: просмотр и загрузка"
echo ""
echo "🌐 Откроется: http://localhost:$CHAT_CLIENT_PORT"
echo ""
echo "💡 Для демо-сервера используйте: ./scripts/start-with-demo.sh"
echo ""

log "INFO" "Запуск чат-клиента..."
pnpm dev