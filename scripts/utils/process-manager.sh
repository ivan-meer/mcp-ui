#!/bin/bash

# 🔧 Process Management Utilities
# Утилиты для управления процессами и предотвращения дублирования

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция логирования
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} ${timestamp} - $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} ${timestamp} - $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - $message"
            ;;
        *)
            echo -e "${timestamp} - $message"
            ;;
    esac
}

# Проверка запущенных процессов по порту
check_port() {
    local port=$1
    local process=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$process" ]; then
        return 0  # Порт занят
    else
        return 1  # Порт свободен
    fi
}

# Получение информации о процессе на порту
get_port_info() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        local cmd=$(ps -p $pid -o comm= 2>/dev/null)
        local args=$(ps -p $pid -o args= 2>/dev/null)
        echo "PID: $pid, Command: $cmd, Args: $args"
    else
        echo "Порт свободен"
    fi
}

# Остановка процесса на порту
kill_port() {
    local port=$1
    local force=${2:-false}
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        log "INFO" "Найден процесс на порту $port: PID $pid"
        
        if [ "$force" = "true" ]; then
            log "WARNING" "Принудительная остановка процесса $pid"
            kill -9 $pid
        else
            log "INFO" "Мягкая остановка процесса $pid"
            kill $pid
            
            # Ждем 5 секунд, если процесс не остановился - принудительно
            sleep 5
            if kill -0 $pid 2>/dev/null; then
                log "WARNING" "Процесс не остановился, принудительная остановка"
                kill -9 $pid
            fi
        fi
        
        sleep 1
        
        if ! kill -0 $pid 2>/dev/null; then
            log "SUCCESS" "Процесс на порту $port остановлен"
            return 0
        else
            log "ERROR" "Не удалось остановить процесс на порту $port"
            return 1
        fi
    else
        log "INFO" "Порт $port свободен"
        return 0
    fi
}

# Проверка запущенных Node.js процессов с определенным именем
check_node_process() {
    local process_name=$1
    local pids=$(pgrep -f "$process_name" 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        log "INFO" "Найдены процессы '$process_name': $pids"
        return 0
    else
        return 1
    fi
}

# Остановка Node.js процессов по имени
kill_node_process() {
    local process_name=$1
    local force=${2:-false}
    
    local pids=$(pgrep -f "$process_name" 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        log "INFO" "Останавливаем процессы '$process_name': $pids"
        
        for pid in $pids; do
            if [ "$force" = "true" ]; then
                kill -9 $pid
            else
                kill $pid
            fi
        done
        
        sleep 2
        
        # Проверяем что процессы остановлены
        local remaining=$(pgrep -f "$process_name" 2>/dev/null)
        if [ ! -z "$remaining" ]; then
            log "WARNING" "Некоторые процессы не остановились, принудительная остановка"
            kill -9 $remaining
        fi
        
        log "SUCCESS" "Процессы '$process_name' остановлены"
        return 0
    else
        log "INFO" "Процессы '$process_name' не найдены"
        return 0
    fi
}

# Ожидание освобождения порта
wait_for_port_free() {
    local port=$1
    local timeout=${2:-30}
    local elapsed=0
    
    log "INFO" "Ожидание освобождения порта $port (таймаут: ${timeout}с)"
    
    while check_port $port; do
        if [ $elapsed -ge $timeout ]; then
            log "ERROR" "Таймаут ожидания освобождения порта $port"
            return 1
        fi
        
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    log "SUCCESS" "Порт $port освобожден"
    return 0
}

# Ожидание запуска сервиса на порту
wait_for_port_ready() {
    local port=$1
    local timeout=${2:-60}
    local elapsed=0
    
    log "INFO" "Ожидание запуска сервиса на порту $port (таймаут: ${timeout}с)"
    
    while ! check_port $port; do
        if [ $elapsed -ge $timeout ]; then
            log "ERROR" "Таймаут ожидания запуска сервиса на порту $port"
            return 1
        fi
        
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    log "SUCCESS" "Сервис на порту $port запущен"
    return 0
}

# Проверка зависимостей
check_dependency() {
    local cmd=$1
    local install_hint=$2
    
    if ! command -v $cmd &> /dev/null; then
        log "ERROR" "$cmd не найден"
        if [ ! -z "$install_hint" ]; then
            log "INFO" "Для установки выполните: $install_hint"
        fi
        return 1
    else
        log "SUCCESS" "$cmd найден: $(which $cmd)"
        return 0
    fi
}

# Создание PID файла
create_pidfile() {
    local service_name=$1
    local pid=${2:-$$}
    local pidfile="/tmp/mcp-ui-${service_name}.pid"
    
    echo $pid > $pidfile
    log "INFO" "PID файл создан: $pidfile (PID: $pid)"
}

# Удаление PID файла
remove_pidfile() {
    local service_name=$1
    local pidfile="/tmp/mcp-ui-${service_name}.pid"
    
    if [ -f $pidfile ]; then
        rm $pidfile
        log "INFO" "PID файл удален: $pidfile"
    fi
}

# Проверка PID файла
check_pidfile() {
    local service_name=$1
    local pidfile="/tmp/mcp-ui-${service_name}.pid"
    
    if [ -f $pidfile ]; then
        local pid=$(cat $pidfile)
        if kill -0 $pid 2>/dev/null; then
            log "INFO" "Сервис $service_name уже запущен (PID: $pid)"
            return 0
        else
            log "WARNING" "Найден устаревший PID файл, удаляем"
            rm $pidfile
            return 1
        fi
    else
        return 1
    fi
}

# Экспорт функций
export -f log check_port get_port_info kill_port check_node_process kill_node_process
export -f wait_for_port_free wait_for_port_ready check_dependency
export -f create_pidfile remove_pidfile check_pidfile