#!/bin/bash

# 🎨 MCP UI SDK - Auto Demo Launcher
# Автоматический запуск демонстрации прототипа

set -e  # Выход при ошибке

# Настройка кодировки для корректного отображения русского текста
# Проверяем доступные локали и выбираем подходящую
if locale -a 2>/dev/null | grep -q "ru_RU.utf8\|ru_RU.UTF-8"; then
    export LANG=ru_RU.UTF-8
    export LC_CTYPE=ru_RU.UTF-8
elif locale -a 2>/dev/null | grep -q "C.UTF-8"; then
    export LANG=C.UTF-8
    export LC_CTYPE=C.UTF-8
elif locale -a 2>/dev/null | grep -q "en_US.utf8\|en_US.UTF-8"; then
    export LANG=en_US.UTF-8
    export LC_CTYPE=en_US.UTF-8
else
    # Fallback к стандартной локали
    export LANG=C
    export LC_CTYPE=C
fi

# Убираем LC_ALL чтобы избежать конфликтов
unset LC_ALL

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Эмодзи
ROCKET="🚀"
GEAR="⚙️"
CHECK="✅"
CROSS="❌"
INFO="ℹ️"
DEMO="🎨"

# Функция для красивого вывода
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}   $DEMO MCP UI SDK Demo Launcher${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}$GEAR $1${NC}"
}

print_success() {
    echo -e "${GREEN}$CHECK $1${NC}"
}

print_error() {
    echo -e "${RED}$CROSS $1${NC}"
}

print_info() {
    echo -e "${CYAN}$INFO $1${NC}"
}

# Функция для проверки наличия команды
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Функция для определения браузера
detect_browser() {
    if command_exists google-chrome; then
        echo "google-chrome"
    elif command_exists chromium-browser; then
        echo "chromium-browser"
    elif command_exists firefox; then
        echo "firefox"
    elif command_exists safari; then
        echo "safari"
    elif command_exists microsoft-edge; then
        echo "microsoft-edge"
    else
        echo ""
    fi
}

# Функция для открытия URL в браузере
open_browser() {
    local url="$1"
    local browser=$(detect_browser)
    
    if [[ -n "$browser" ]]; then
        print_step "Открываем демо в браузере ($browser)..."
        
        if [[ "$browser" == "safari" ]]; then
            open "$url" 2>/dev/null || true
        else
            "$browser" "$url" >/dev/null 2>&1 &
        fi
        
        print_success "Демо открыто в браузере!"
        return 0
    else
        print_error "Браузер не найден. Откройте URL вручную: $url"
        return 1
    fi
}

# Функция для проверки доступности порта
check_port() {
    local port="$1"
    if lsof -i ":$port" >/dev/null 2>&1; then
        return 0  # Порт занят
    else
        return 1  # Порт свободен
    fi
}

# Функция для поиска свободного порта
find_free_port() {
    local start_port=8080
    local max_attempts=20
    
    for ((i=0; i<max_attempts; i++)); do
        local port=$((start_port + i))
        if ! check_port "$port"; then
            echo "$port"
            return 0
        fi
    done
    
    echo "8080"  # Возвращаем стандартный порт если ничего не найдено
}

# Функция для запуска веб-сервера
start_web_server() {
    local port="$1"
    local demo_dir="$2"
    
    print_step "Запускаем веб-сервер на порту $port..."
    
    # Проверяем доступность Python
    if command_exists python3; then
        python3 -m http.server "$port" --directory "$demo_dir" >/dev/null 2>&1 &
        local server_pid=$!
        print_success "Веб-сервер запущен (PID: $server_pid)"
        echo "$server_pid"
        return 0
    elif command_exists python; then
        python -m SimpleHTTPServer "$port" >/dev/null 2>&1 &
        local server_pid=$!
        print_success "Веб-сервер запущен (PID: $server_pid)"
        echo "$server_pid"
        return 0
    else
        print_error "Python не найден. Используйте статический режим."
        return 1
    fi
}

# Функция для остановки всех серверов
cleanup() {
    print_step "Останавливаем все серверы..."
    
    # Остановка основного веб-сервера
    if [[ -n "$SERVER_PID" ]]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    
    # Остановка всех Python HTTP серверов
    pkill -f "python.*http\.server.*$(basename "$(pwd)")" 2>/dev/null || true
    
    # Остановка всех pnpm dev серверов
    pkill -f "pnpm.*dev" 2>/dev/null || true
    pkill -f "react-router.*dev" 2>/dev/null || true
    
    # Проверка освобождения портов
    local ports_to_check=("8080" "8081" "8082" "5173")
    for port in "${ports_to_check[@]}"; do
        if check_port "$port"; then
            local pid=$(lsof -ti ":$port" 2>/dev/null || true)
            if [[ -n "$pid" ]]; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        fi
    done
    
    print_success "Все серверы остановлены"
}

# Функция для показа помощи
show_help() {
    echo -e "${YELLOW}Использование:${NC}"
    echo "  ./start-demo.sh [опции]"
    echo ""
    echo -e "${YELLOW}Опции:${NC}"
    echo "  -s, --static     Открыть статичную версию (без сервера)"
    echo "  -p, --port PORT  Указать порт для веб-сервера (по умолчанию: 8080)"
    echo "  -h, --help       Показать эту справку"
    echo "  --no-browser     Не открывать браузер автоматически"
    echo "  --stop           Остановить все запущенные серверы"
    echo "  --status         Показать статус запущенных серверов"
    echo "  --mcp            Запустить также MCP сервер (examples/server)"
    echo ""
    echo -e "${YELLOW}Примеры:${NC}"
    echo "  ./start-demo.sh                  # Стандартный запуск"
    echo "  ./start-demo.sh --static         # Статичная версия"
    echo "  ./start-demo.sh --port 3000      # Запуск на порту 3000"
    echo "  ./start-demo.sh --no-browser     # Без автооткрытия браузера"
    echo "  ./start-demo.sh --mcp            # Запуск с MCP сервером"
    echo "  ./start-demo.sh --stop           # Остановить все серверы"
    echo "  ./start-demo.sh --status         # Статус серверов"
    echo ""
}

# Функция для отображения статистики системы
show_system_info() {
    print_info "Информация о системе:"
    echo "  OS: $(uname -s) $(uname -r)"
    echo "  Архитектура: $(uname -m)"
    
    if command_exists python3; then
        echo "  Python3: $(python3 --version 2>&1)"
    elif command_exists python; then
        echo "  Python: $(python --version 2>&1)"
    else
        echo "  Python: не найден"
    fi
    
    local browser=$(detect_browser)
    if [[ -n "$browser" ]]; then
        echo "  Браузер: $browser"
    else
        echo "  Браузер: не найден"
    fi
    
    echo ""
}

# Функция для показа статуса серверов
show_server_status() {
    print_header
    print_info "Статус запущенных серверов:"
    echo ""
    
    # Проверка HTTP серверов
    local http_servers=$(ps aux | grep -E "python.*http\.server.*$(basename "$(pwd)")" | grep -v grep | wc -l)
    if [[ $http_servers -gt 0 ]]; then
        print_success "HTTP серверы: $http_servers активных"
        ps aux | grep -E "python.*http\.server.*$(basename "$(pwd)")" | grep -v grep | while read -r line; do
            local port=$(echo "$line" | grep -o "http\.server [0-9]*" | cut -d' ' -f2)
            echo "  • Порт $port (PID: $(echo "$line" | awk '{print $2}'))"
        done
    else
        print_error "HTTP серверы: не запущены"
    fi
    
    # Проверка MCP серверов
    local mcp_servers=$(ps aux | grep -E "(react-router|pnpm.*dev)" | grep -v grep | wc -l)
    if [[ $mcp_servers -gt 0 ]]; then
        print_success "MCP серверы: $mcp_servers активных"
        ps aux | grep -E "(react-router|pnpm.*dev)" | grep -v grep | while read -r line; do
            echo "  • $(echo "$line" | awk '{print $11}') (PID: $(echo "$line" | awk '{print $2}'))"
        done
    else
        print_error "MCP серверы: не запущены"
    fi
    
    # Проверка занятых портов
    echo ""
    print_info "Занятые порты:"
    local common_ports=("8080" "8081" "8082" "5173" "3000")
    local ports_found=false
    
    for port in "${common_ports[@]}"; do
        if check_port "$port"; then
            local pid=$(lsof -ti ":$port" 2>/dev/null || echo "неизвестен")
            echo "  • Порт $port занят (PID: $pid)"
            ports_found=true
        fi
    done
    
    if [[ "$ports_found" == false ]]; then
        echo "  Основные порты свободны"
    fi
    
    echo ""
}

# Функция для остановки всех серверов
stop_all_servers() {
    print_header
    cleanup
    
    # Дополнительная проверка
    local remaining=$(ps aux | grep -E "(python.*http\.server|react-router|pnpm.*dev)" | grep -v grep | wc -l)
    if [[ $remaining -gt 0 ]]; then
        print_error "Обнаружены оставшиеся процессы, принудительная остановка..."
        pkill -9 -f "python.*http\.server" 2>/dev/null || true
        pkill -9 -f "react-router" 2>/dev/null || true
        pkill -9 -f "pnpm.*dev" 2>/dev/null || true
        sleep 1
    fi
    
    print_success "Все серверы успешно остановлены"
}

# Функция для запуска MCP сервера
start_mcp_server() {
    local mcp_dir="examples/server"
    
    if [[ ! -d "$mcp_dir" ]]; then
        print_error "Директория MCP сервера не найдена: $mcp_dir"
        return 1
    fi
    
    print_step "Запускаем MCP сервер..."
    
    # Проверка установки зависимостей
    if [[ ! -d "$mcp_dir/node_modules" ]]; then
        print_step "Устанавливаем зависимости MCP сервера..."
        (cd "$mcp_dir" && pnpm install --silent) || {
            print_error "Ошибка установки зависимостей MCP сервера"
            return 1
        }
    fi
    
    # Запуск сервера в фоне
    (cd "$mcp_dir" && pnpm dev >/dev/null 2>&1 &) || {
        print_error "Ошибка запуска MCP сервера"
        return 1
    }
    
    # Ожидание запуска
    print_step "Ожидание запуска MCP сервера..."
    local attempts=0
    local max_attempts=30
    
    while [[ $attempts -lt $max_attempts ]]; do
        if curl -s --connect-timeout 1 "http://localhost:5173" >/dev/null 2>&1; then
            print_success "MCP сервер запущен: http://localhost:5173"
            return 0
        fi
        sleep 1
        ((attempts++))
    done
    
    print_error "MCP сервер не отвечает после $max_attempts секунд"
    return 1
}

# Основная функция
main() {
    # Значения по умолчанию
    local static_mode=false
    local port=""
    local no_browser=false
    local start_mcp=false
    local demo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local demo_file="$demo_dir/demo.html"
    
    # Обработка аргументов командной строки
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--static)
                static_mode=true
                shift
                ;;
            -p|--port)
                port="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            --no-browser)
                no_browser=true
                shift
                ;;
            --stop)
                stop_all_servers
                exit 0
                ;;
            --status)
                show_server_status
                exit 0
                ;;
            --mcp)
                start_mcp=true
                shift
                ;;
            --system-info)
                show_system_info
                exit 0
                ;;
            *)
                print_error "Неизвестная опция: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Заголовок
    print_header
    
    # Проверка наличия demo.html
    if [[ ! -f "$demo_file" ]]; then
        print_error "Файл demo.html не найден в $demo_dir"
        print_info "Убедитесь, что вы запускаете скрипт из корневой директории проекта"
        exit 1
    fi
    
    print_success "Найден demo.html: $demo_file"
    
    # Статический режим
    if [[ "$static_mode" == true ]]; then
        print_step "Запуск в статическом режиме..."
        
        local file_url="file://$demo_file"
        print_info "URL: $file_url"
        
        if [[ "$no_browser" == false ]]; then
            open_browser "$file_url"
        else
            print_info "Откройте URL в браузере: $file_url"
        fi
        
        print_success "Статическое демо готово!"
        exit 0
    fi
    
    # Режим с веб-сервером
    
    # Определение порта
    if [[ -z "$port" ]]; then
        port=$(find_free_port)
        print_info "Используем порт: $port"
    else
        if check_port "$port"; then
            print_error "Порт $port уже занят"
            local free_port=$(find_free_port)
            print_info "Используем свободный порт: $free_port"
            port="$free_port"
        fi
    fi
    
    # Установка обработчика сигналов для корректного завершения
    trap cleanup EXIT INT TERM
    
    # Запуск веб-сервера
    SERVER_PID=$(start_web_server "$port" "$demo_dir")
    
    if [[ -z "$SERVER_PID" ]]; then
        print_error "Не удалось запустить веб-сервер"
        print_info "Попробуйте статический режим: ./start-demo.sh --static"
        exit 1
    fi
    
    # Ожидание запуска сервера
    print_step "Ожидание запуска сервера..."
    sleep 2
    
    # Проверка доступности сервера
    local server_url="http://localhost:$port/demo.html"
    local max_attempts=10
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s --connect-timeout 2 "$server_url" >/dev/null 2>&1; then
            break
        fi
        
        print_step "Попытка $attempt/$max_attempts: проверка доступности сервера..."
        sleep 1
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        print_error "Сервер не отвечает. Проверьте настройки."
        exit 1
    fi
    
    print_success "Сервер доступен: $server_url"
    
    # Открытие браузера
    if [[ "$no_browser" == false ]]; then
        open_browser "$server_url"
    else
        print_info "Откройте URL в браузере: $server_url"
    fi
    
    # Информация о запущенном сервере
    echo ""
    print_info "Демо сервер запущен!"
    print_info "URL: $server_url"
    print_info "Для остановки нажмите Ctrl+C"
    echo ""
    
    # Дополнительные URL для тестирования
    print_info "Дополнительные URL:"
    echo "  • Галерея: http://localhost:$port/demo.html#gallery"
    echo "  • Панель: http://localhost:$port/demo.html#dashboard"
    echo "  • Формы: http://localhost:$port/demo.html#forms"
    echo ""
    
    # Запуск MCP сервера если требуется
    if [[ "$start_mcp" == true ]]; then
        start_mcp_server && {
            print_info "MCP эндпоинты:"
            echo "  • HTTP: http://localhost:5173/mcp"
            echo "  • SSE: http://localhost:5173/sse"
            echo ""
        }
    fi
    
    # Ожидание завершения
    print_info "Сервер работает... (нажмите Ctrl+C для остановки)"
    
    # Бесконечный цикл с возможностью остановки
    while true; do
        sleep 10
        
        # Проверка, что сервер все еще работает
        if ! kill -0 "$SERVER_PID" 2>/dev/null; then
            print_error "Веб-сервер неожиданно остановился"
            break
        fi
    done
}

# Проверка прав на выполнение
if [[ ! -x "$0" ]]; then
    print_error "Скрипт не имеет прав на выполнение"
    print_info "Выполните: chmod +x start-demo.sh"
    exit 1
fi

# Запуск основной функции
main "$@"