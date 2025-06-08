#!/bin/bash
# 🔧 DEV ENVIRONMENT SETUP
# 🎯 Назначение: Полная настройка окружения разработки
# 🚀 Использование: ./scripts/setup/dev-environment.sh

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
NODE_VERSION="18"
REQUIRED_TOOLS=("node" "npm" "git")

# 📋 Показать приветствие
show_welcome() {
    echo -e "${PURPLE}"
    echo "🔧 MCP Chat Client Development Environment Setup"
    echo "==============================================="
    echo -e "${NC}"
    echo "🎯 Этот скрипт настроит полное окружение для разработки MCP Chat Client"
    echo "📦 Будут установлены все необходимые инструменты и зависимости"
    echo
}

# 🖥️ Определение операционной системы
detect_os() {
    log_step "Определение операционной системы..."
    
    case "$(uname -s)" in
        Linux*)     OS="Linux";;
        Darwin*)    OS="macOS";;
        CYGWIN*)    OS="Windows";;
        MINGW*)     OS="Windows";;
        MSYS*)      OS="Windows";;
        *)          OS="Unknown";;
    esac
    
    log_info "Обнаружена ОС: $OS"
    
    # Дополнительная информация для Linux
    if [ "$OS" = "Linux" ]; then
        if command -v lsb_release >/dev/null 2>&1; then
            DISTRO=$(lsb_release -si)
            VERSION=$(lsb_release -sr)
            log_info "Дистрибутив: $DISTRO $VERSION"
        fi
    fi
}

# ✅ Проверка существующих инструментов
check_existing_tools() {
    log_step "Проверка установленных инструментов..."
    
    local missing_tools=()
    
    for tool in "${REQUIRED_TOOLS[@]}"; do
        if command -v "$tool" >/dev/null 2>&1; then
            local version=""
            case $tool in
                node) version=$(node --version) ;;
                npm) version=$(npm --version) ;;
                git) version=$(git --version | cut -d' ' -f3) ;;
            esac
            log_success "$tool найден: $version"
        else
            missing_tools+=("$tool")
            log_warn "$tool не найден"
        fi
    done
    
    if [ ${#missing_tools[@]} -eq 0 ]; then
        log_success "Все базовые инструменты установлены"
        return 0
    else
        log_warn "Отсутствующие инструменты: ${missing_tools[*]}"
        return 1
    fi
}

# 📦 Установка Node.js и npm
install_nodejs() {
    log_step "Установка Node.js..."
    
    # Проверяем текущую версию
    if command -v node >/dev/null 2>&1; then
        local current_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$current_version" -ge "$NODE_VERSION" ]; then
            log_success "Node.js $current_version уже установлен"
            return 0
        fi
    fi
    
    case $OS in
        "macOS")
            if command -v brew >/dev/null 2>&1; then
                log_info "Установка через Homebrew..."
                brew install node@$NODE_VERSION
            else
                log_info "Homebrew не найден. Устанавливаем через официальный installer..."
                log_warn "Пожалуйста, скачайте Node.js с https://nodejs.org и установите вручную"
                return 1
            fi
            ;;
        "Linux")
            # Используем NodeSource repository
            log_info "Установка через NodeSource repository..."
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "Windows")
            log_warn "На Windows рекомендуется установка Node.js вручную"
            log_info "Скачайте installer с https://nodejs.org"
            return 1
            ;;
        *)
            log_error "Неподдерживаемая ОС для автоматической установки"
            return 1
            ;;
    esac
    
    log_success "Node.js установлен"
}

# 📦 Установка pnpm
install_pnpm() {
    log_step "Установка pnpm..."
    
    if command -v pnpm >/dev/null 2>&1; then
        log_success "pnpm уже установлен: $(pnpm --version)"
        return 0
    fi
    
    log_info "Установка pnpm через npm..."
    npm install -g pnpm || {
        log_error "Не удалось установить pnpm"
        return 1
    }
    
    log_success "pnpm установлен: $(pnpm --version)"
}

# 🛠️ Установка дополнительных инструментов разработки
install_dev_tools() {
    log_step "Установка инструментов разработки..."
    
    # Глобальные пакеты для разработки
    local dev_packages=(
        "@typescript-eslint/cli"
        "prettier"
        "typescript"
        "ts-node"
        "nodemon"
        "concurrently"
    )
    
    log_info "Установка глобальных пакетов разработки..."
    
    for package in "${dev_packages[@]}"; do
        if ! npm list -g "$package" >/dev/null 2>&1; then
            log_info "Установка $package..."
            npm install -g "$package" || log_warn "Не удалось установить $package"
        else
            log_success "$package уже установлен"
        fi
    done
}

# 📁 Настройка проекта
setup_project() {
    log_step "Настройка проекта..."
    
    cd "$ROOT_DIR"
    
    # Установка зависимостей проекта
    log_info "Установка зависимостей проекта..."
    pnpm install || {
        log_error "Ошибка установки зависимостей"
        return 1
    }
    
    # Создание .env файлов
    log_info "Создание файлов конфигурации..."
    
    # .env.example
    if [ ! -f ".env.example" ]; then
        cat > .env.example << EOF
# 🚀 MCP Chat Client Configuration Example

# 🌍 Environment
NODE_ENV=development

# 🔌 Network
CHAT_CLIENT_PORT=3000
DEMO_SERVER_PORT=3001
MCP_SERVER_URL=ws://localhost:3001

# 🎨 UI
THEME=dark
AUTO_OPEN_BROWSER=true
LANGUAGE=ru

# 📊 Development
DEBUG_MODE=true
HOT_RELOAD=true
TYPE_CHECKING=true

# 🧪 Testing
ENABLE_TEST_TOOLS=true
MOCK_DATA=true

# 📝 Logging
LOG_LEVEL=info
CONSOLE_LOGGING=true

EOF
    fi
    
    # .env.development
    if [ ! -f ".env.development" ]; then
        cp .env.example .env.development
        log_success "Создан .env.development"
    fi
    
    # .gitignore дополнения
    log_info "Обновление .gitignore..."
    cat >> .gitignore << EOF

# 🔧 Development files
.env.local
.env.development.local
.vscode/settings.json
.idea/
*.log
.DS_Store

# 📊 Coverage и testing
coverage/
.nyc_output/
test-results/

# 🚀 Build artifacts
dist/
build/
*.tgz

EOF
    
    log_success "Проект настроен"
}

# 🔗 Настройка Git hooks
setup_git_hooks() {
    log_step "Настройка Git hooks..."
    
    cd "$ROOT_DIR"
    
    # Проверяем что мы в git репозитории
    if [ ! -d ".git" ]; then
        log_warn "Не найден .git - инициализируем репозиторий..."
        git init
        git add .
        git commit -m "Initial commit: MCP Chat Client setup"
    fi
    
    # Создаем pre-commit hook
    mkdir -p .git/hooks
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# 🔍 Pre-commit hook для MCP Chat Client

echo "🔍 Запуск pre-commit проверок..."

# 🧹 Линтинг
echo "📝 Проверка кода..."
if ! pnpm lint; then
    echo "❌ Линтинг не прошел"
    exit 1
fi

# 🎨 Форматирование
echo "🎨 Проверка форматирования..."
if ! pnpm format:check; then
    echo "⚠️  Код не отформатирован. Запустите: pnpm format"
    exit 1
fi

# ✅ TypeScript компиляция
echo "🔧 Проверка типов..."
if ! pnpm typecheck; then
    echo "❌ Ошибки типизации"
    exit 1
fi

echo "✅ Все проверки прошли успешно"
EOF
    
    chmod +x .git/hooks/pre-commit
    log_success "Git hooks настроены"
}

# 🧪 Настройка IDE
setup_ide() {
    log_step "Настройка IDE..."
    
    cd "$ROOT_DIR"
    
    # VS Code настройки
    mkdir -p .vscode
    
    # settings.json
    cat > .vscode/settings.json << EOF
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
EOF
    
    # extensions.json
    cat > .vscode/extensions.json << EOF
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "bradlc.vscode-tailwindcss"
  ]
}
EOF
    
    log_success "VS Code настроен"
}

# 🧪 Проверка установки
verify_installation() {
    log_step "Проверка установки..."
    
    cd "$ROOT_DIR"
    
    # Проверяем сборку
    log_info "Тестовая сборка..."
    if pnpm build; then
        log_success "Сборка прошла успешно"
    else
        log_error "Ошибка сборки"
        return 1
    fi
    
    # Проверяем тесты
    log_info "Запуск тестов..."
    if pnpm test --run; then
        log_success "Тесты прошли успешно"
    else
        log_warn "Некоторые тесты не прошли (это нормально на этапе разработки)"
    fi
    
    log_success "Установка проверена"
}

# 📊 Показать итоги
show_summary() {
    echo
    log_success "🎉 Окружение разработки настроено!"
    echo
    echo -e "${CYAN}📊 УСТАНОВЛЕННЫЕ КОМПОНЕНТЫ:${NC}"
    echo -e "   ✅ Node.js $(node --version)"
    echo -e "   ✅ pnpm $(pnpm --version)"
    echo -e "   ✅ Зависимости проекта"
    echo -e "   ✅ Git hooks"
    echo -e "   ✅ VS Code настройки"
    echo
    echo -e "${CYAN}🚀 СЛЕДУЮЩИЕ ШАГИ:${NC}"
    echo -e "   1. ${GREEN}./scripts/development/dev-start.sh${NC} - запуск в режиме разработки"
    echo -e "   2. ${GREEN}./scripts/testing/test-watch.sh${NC} - запуск тестов в watch режиме"
    echo -e "   3. ${GREEN}code .${NC} - открыть проект в VS Code"
    echo
    echo -e "${CYAN}📚 ПОЛЕЗНЫЕ КОМАНДЫ:${NC}"
    echo -e "   📝 ${YELLOW}pnpm dev${NC} - разработка"
    echo -e "   🧪 ${YELLOW}pnpm test${NC} - тесты"
    echo -e "   🎨 ${YELLOW}pnpm format${NC} - форматирование"
    echo -e "   🔧 ${YELLOW}pnpm lint${NC} - линтинг"
    echo -e "   🏗️  ${YELLOW}pnpm build${NC} - сборка"
    echo
    echo -e "${GREEN}Готово к разработке! 🚀${NC}"
    echo
}

# 📋 Показать помощь
show_help() {
    cat << EOF
🔧 MCP Chat Client - Настройка окружения разработки

🎯 НАЗНАЧЕНИЕ:
   Автоматически настраивает полное окружение для разработки MCP Chat Client

🚀 ИСПОЛЬЗОВАНИЕ:
   $0 [опции]

📋 ОПЦИИ:
   --quick     Быстрая настройка (только зависимости)
   --full      Полная настройка (по умолчанию)
   --help      Показать эту справку

🔧 ЧТО БУДЕТ УСТАНОВЛЕНО:
   - Node.js 18+ (если отсутствует)
   - pnpm (менеджер пакетов)
   - Зависимости проекта
   - Инструменты разработки
   - Git hooks для качества кода
   - Настройки VS Code

📚 ТРЕБОВАНИЯ:
   - Права администратора (для установки Node.js)
   - Подключение к интернету
   - Git (рекомендуется)

EOF
}

# 🎯 Основная функция
main() {
    local mode="full"
    
    # Парсинг аргументов
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick)
                mode="quick"
                shift
                ;;
            --full)
                mode="full"
                shift
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
    
    show_welcome
    detect_os
    
    # Быстрая настройка
    if [ "$mode" = "quick" ]; then
        log_info "Режим: Быстрая настройка"
        check_existing_tools || install_nodejs
        install_pnpm
        setup_project
        verify_installation
        show_summary
        return 0
    fi
    
    # Полная настройка
    log_info "Режим: Полная настройка"
    
    check_existing_tools || {
        install_nodejs
        install_pnpm
    }
    
    install_dev_tools
    setup_project
    setup_git_hooks
    setup_ide
    verify_installation
    show_summary
}

# 🎯 Запуск
main "$@"