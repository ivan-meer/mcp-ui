#!/bin/bash

# 🚀 MCP Chat Client Startup Script
# Запускает полнофункциональный чат-клиент с AI интеграцией

echo "================================"
echo "   🤖 MCP AI Chat Client"
echo "================================"
echo ""

# Проверяем наличие pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm не найден. Установите pnpm: npm install -g pnpm"
    exit 1
fi

# Переходим в директорию chat-client
cd apps/chat-client

echo "📦 Устанавливаем зависимости..."
pnpm install

echo ""
echo "🎨 Функции AI Chat Client:"
echo "  • 🤖 Интеграция с OpenAI (GPT-4, GPT-3.5)"
echo "  • 🧠 Интеграция с Anthropic (Claude 3.5)"
echo "  • 🏠 Поддержка локальных моделей (Ollama)"
echo "  • 💬 Потоковая генерация ответов"
echo "  • ⚙️ Удобная настройка провайдеров"
echo "  • 📱 Адаптивный интерфейс"
echo ""

echo "🚀 Запускаем чат-клиент..."
echo "📍 URL: http://localhost:3000"
echo ""
echo "🔧 Инструкция по настройке:"
echo "  1. Откройте http://localhost:3000 в браузере"
echo "  2. Нажмите '⚙️ Configure AI' в правом верхнем углу"
echo "  3. Выберите провайдер (OpenAI, Anthropic или Ollama)"
echo "  4. Введите API ключ или настройте локальную модель"
echo "  5. Начните общение с AI!"
echo ""

# Запускаем dev сервер
pnpm dev