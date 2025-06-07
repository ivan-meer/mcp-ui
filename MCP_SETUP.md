# MCP Servers Setup Guide

Руководство по настройке MCP серверов для разработки и тестирования mcp-ui проекта.

## 1. GitHub MCP Server

### Требования
- Docker установлен и запущен
- GitHub Personal Access Token с необходимыми правами

### Создание GitHub Token
1. Перейти в GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Создать новый token с правами:
   - `repo` (полный доступ к репозиториям)
   - `read:org` (чтение организации)
   - `user` (доступ к профилю пользователя)

### Установка через Claude Code

```bash
# Добавить в ~/.claude/claude_desktop_config.json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN_HERE",
        "-e", "GITHUB_TOOLSETS=repos,issues,pull_requests,search,files",
        "ghcr.io/github/github-mcp-server"
      ]
    }
  }
}
```

### Тестирование GitHub сервера
```bash
# Проверить что Docker работает
docker --version

# Запустить GitHub MCP server вручную для тестирования
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN_HERE \
  -e GITHUB_TOOLSETS=repos,issues,pull_requests \
  ghcr.io/github/github-mcp-server
```

### Доступные инструменты GitHub MCP
- `list_repositories` - список репозиториев
- `get_repository` - детали репозитория
- `list_issues` - список issues
- `create_issue` - создание issue
- `list_pull_requests` - список PR
- `create_pull_request` - создание PR
- `search_repositories` - поиск репозиториев
- `get_file_contents` - содержимое файлов

---

## 2. File System MCP Server

### Установка
```bash
# Глобальная установка
npm install -g @modelcontextprotocol/server-filesystem

# Или локальная
npx @modelcontextprotocol/server-filesystem
```

### Конфигурация Claude Code
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/directory"
      ]
    }
  }
}
```

### Безопасная конфигурация для разработки
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-filesystem",
        "/home/how2ai/mcp-ui",
        "--allowed-extensions", ".ts,.tsx,.js,.jsx,.json,.md"
      ]
    }
  }
}
```

### Доступные инструменты File System MCP
- `read_file` - чтение файлов
- `write_file` - запись файлов
- `create_directory` - создание директорий
- `list_directory` - список файлов в директории
- `move_file` - перемещение файлов
- `search_files` - поиск файлов

---

## 3. Database MCP Servers

### PostgreSQL MCP Server

#### Установка
```bash
npm install -g @modelcontextprotocol/server-postgres
```

#### Конфигурация
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://username:password@localhost:5432/database_name"
      ]
    }
  }
}
```

#### Для тестирования с Docker PostgreSQL
```bash
# Запустить PostgreSQL в Docker
docker run --name test-postgres \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=testdb \
  -p 5432:5432 \
  -d postgres:15

# Подключение строка
postgresql://postgres:testpass@localhost:5432/testdb
```

### SQLite MCP Server

#### Установка
```bash
npm install -g @modelcontextprotocol/server-sqlite
```

#### Конфигурация
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "/path/to/database.db"
      ]
    }
  }
}
```

#### Создание тестовой SQLite БД
```bash
# Создать тестовую базу данных
sqlite3 /tmp/test.db << EOF
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Bob Johnson', 'bob@example.com');

CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

INSERT INTO projects (name, description, owner_id) VALUES
  ('mcp-ui', 'UI components for MCP', 1),
  ('awesome-project', 'Some awesome project', 2);
EOF
```

### Доступные инструменты Database MCP
- `query` - выполнение SQL запросов
- `describe_table` - описание структуры таблицы
- `list_tables` - список таблиц
- `read_query` - только чтение данных
- `schema` - получение схемы базы данных

---

## Полная конфигурация Claude Code

Создать файл `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN",
        "-e", "GITHUB_TOOLSETS=repos,issues,pull_requests,search,files",
        "ghcr.io/github/github-mcp-server"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-filesystem",
        "/home/how2ai/mcp-ui"
      ]
    },
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "/tmp/test.db"
      ]
    }
  }
}
```

## Тестирование установки

После настройки конфигурации:

1. Перезапустить Claude Code
2. Выполнить `claude mcp` для проверки серверов
3. Тестировать каждый сервер с простыми командами:

```bash
# Тест GitHub
"List my repositories"

# Тест File System  
"Show me files in the current directory"

# Тест Database
"Show me all tables in the database"
```

## Устранение неполадок

### GitHub MCP Server
- Проверить что Docker запущен: `docker ps`
- Проверить валидность токена в GitHub Settings
- Убедиться что токен имеет необходимые права

### File System MCP Server
- Проверить права доступа к директории
- Убедиться что путь существует
- Проверить установку Node.js: `node --version`

### Database MCP Server
- Проверить что база данных доступна
- Тестировать подключение вручную
- Проверить строку подключения

### Общие проблемы
- Проверить JSON синтаксис в конфигурации
- Убедиться что все зависимости установлены
- Перезапустить Claude Code после изменения конфигурации