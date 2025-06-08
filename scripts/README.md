# 🚀 MCP UI Scripts Collection

Коллекция полезных скриптов для разработчиков и пользователей MCP Chat Client.

## 📂 Структура папки

```
scripts/
├── 🚀 development/     # Скрипты для разработки
├── 🏭 build/          # Скрипты сборки и деплоя
├── 🧪 testing/        # Скрипты тестирования
├── 🛠️ utils/          # Утилиты и хелперы
├── 📱 user/           # Скрипты для пользователей
└── 🔧 setup/          # Скрипты настройки окружения
```

## 🚀 Быстрый старт

### 🎯 Для пользователей:
```bash
# Запуск чат-клиента
./scripts/user/start-chat-client.sh

# Подключение к демо серверу
./scripts/user/connect-demo-server.sh
```

### 👨‍💻 Для разработчиков:
```bash
# Настройка окружения разработки
./scripts/setup/dev-environment.sh

# Запуск в режиме разработки
./scripts/development/dev-start.sh

# Запуск всех тестов
./scripts/testing/run-all-tests.sh
```

## 📋 Полный список скриптов

### 🚀 Development Scripts
- `dev-start.sh` - Запуск всех пакетов в dev режиме
- `dev-chat-only.sh` - Запуск только чат-клиента
- `dev-with-server.sh` - Запуск с демо MCP сервером
- `watch-types.sh` - Мониторинг TypeScript типов
- `hot-reload.sh` - Hot reload для быстрой разработки

### 🏭 Build Scripts
- `build-all.sh` - Сборка всех пакетов
- `build-production.sh` - Production сборка
- `build-docker.sh` - Docker образы
- `bundle-analyze.sh` - Анализ размера бандлов
- `clean-build.sh` - Очистка и пересборка

### 🧪 Testing Scripts
- `run-all-tests.sh` - Все тесты (unit + integration)
- `test-watch.sh` - Тесты в watch режиме
- `test-coverage.sh` - Отчет покрытия
- `test-e2e.sh` - End-to-end тесты
- `test-performance.sh` - Тесты производительности

### 🛠️ Utility Scripts
- `lint-fix.sh` - Автофикс линтинга
- `format-code.sh` - Форматирование кода
- `update-deps.sh` - Обновление зависимостей
- `check-health.sh` - Проверка здоровья проекта
- `generate-types.sh` - Генерация типов

### 📱 User Scripts
- `start-chat-client.sh` - Запуск чат-клиента
- `connect-demo-server.sh` - Подключение к демо
- `backup-config.sh` - Backup конфигурации
- `reset-settings.sh` - Сброс настроек
- `export-chat-history.sh` - Экспорт истории

### 🔧 Setup Scripts
- `dev-environment.sh` - Настройка dev окружения
- `install-deps.sh` - Установка зависимостей
- `setup-hooks.sh` - Настройка git hooks
- `configure-ide.sh` - Настройка IDE
- `check-requirements.sh` - Проверка требований

## ⚙️ Конфигурация

Скрипты используют переменные окружения из файла `.env`:

```bash
# Копируем пример конфигурации
cp .env.example .env

# Редактируем под свои нужды
nano .env
```

## 🎯 Основные переменные:

- `NODE_ENV` - Окружение (development/production)
- `MCP_SERVER_URL` - URL демо MCP сервера
- `CHAT_CLIENT_PORT` - Порт чат-клиента
- `DEBUG_MODE` - Режим отладки
- `AUTO_OPEN_BROWSER` - Автооткрытие браузера

## 🚨 Troubleshooting

### Проблема: Скрипт не запускается
```bash
# Дайте права на выполнение
chmod +x scripts/**/*.sh
```

### Проблема: Не найдены зависимости
```bash
# Запустите установку
./scripts/setup/install-deps.sh
```

### Проблема: Порт занят
```bash
# Проверьте и освободите порт
./scripts/utils/check-ports.sh
```

## 📝 Создание собственных скриптов

Шаблон для нового скрипта:

```bash
#!/bin/bash
# 📝 Описание скрипта
# 🎯 Назначение: что делает скрипт
# 🚀 Использование: ./script-name.sh [options]

set -euo pipefail  # Безопасный режим

# 🎨 Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 📝 Функция логирования
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 🚀 Основная логика скрипта
main() {
    log_info "Запуск скрипта..."
    
    # Ваш код здесь
    
    log_info "Скрипт завершен ✅"
}

# 🎯 Запуск main функции
main "$@"
```

## 🤝 Участие в разработке

1. Добавляйте новые скрипты в соответствующие папки
2. Документируйте назначение и использование
3. Используйте единый стиль и цветовое оформление
4. Тестируйте скрипты на разных системах
5. Добавляйте обработку ошибок

## 📚 Полезные ссылки

- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)
- [Shell Check](https://www.shellcheck.net/) - линтер для shell скриптов
- [PNPM Scripts](https://pnpm.io/cli/run) - документация по PNPM скриптам

---

💡 **Совет**: Добавьте `scripts/` в PATH для глобального доступа к скриптам:

```bash
export PATH="$PATH:$(pwd)/scripts"
```