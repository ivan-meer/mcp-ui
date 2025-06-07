# 🚀 Быстрая настройка MCP серверов для mcp-ui

## Шаг 1: Базовая конфигурация Claude Code

Создать/отредактировать файл `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-filesystem",
        "/home/how2ai/mcp-ui"
      ]
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
```

## Шаг 2: Добавление GitHub сервера (если есть Docker)

Для добавления GitHub MCP сервера нужен:
1. Docker установлен и запущен
2. GitHub Personal Access Token

Добавить в конфигурацию:
```json
{
  "mcpServers": {
    "filesystem": { ... },
    "memory": { ... },
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

### Создание GitHub Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Создать новый token с правами:
   - `repo` (полный доступ к репозиториям)
   - `read:org` (чтение организации)
   - `user` (доступ к профилю)

## Шаг 3: Проверка установки

После настройки конфигурации:

1. Перезапустить Claude Code
2. Выполнить команду `claude mcp` для проверки серверов
3. Тестировать каждый сервер:

### Filesystem сервер:
```
"Покажи мне файлы в директории packages/"
"Прочитай файл packages/client/package.json"
```

### Memory сервер:
```
"Запомни что я работаю над проектом mcp-ui"
"Что ты помнишь о моем проекте?"
```

### GitHub сервер (если настроен):
```
"Покажи мои репозитории"
"Найди репозитории по теме mcp"
```

## Шаг 4: Тестовые данные для разработки

Мы создали тестовые данные в файле `/tmp/mcp_test.sql` с:
- 4 пользователя (John, Jane, Bob, Alice)
- 4 проекта (включая mcp-ui)
- 5 issues с разными приоритетами
- 4 определения UI компонентов

## Шаг 5: Готовые серверы для тестирования

Доступные MCP серверы для установки:
- `@modelcontextprotocol/server-filesystem` - файловая система
- `@modelcontextprotocol/server-memory` - память/заметки
- `@modelcontextprotocol/server-postgres` - PostgreSQL
- `@modelcontextprotocol/server-github` - GitHub интеграция
- `@modelcontextprotocol/server-puppeteer` - веб автоматизация

## Устранение неполадок

### Если серверы не работают:
1. Проверить JSON синтаксис в конфигурации
2. Убедиться что пути существуют
3. Перезапустить Claude Code
4. Проверить логи в консоли разработчика

### Если GitHub сервер не работает:
1. Проверить что Docker запущен: `docker ps`
2. Проверить валидность токена
3. Убедиться что токен имеет правильные права

### Если filesystem сервер не работает:
1. Проверить права доступа к директории
2. Убедиться что Node.js установлен
3. Проверить что путь `/home/how2ai/mcp-ui` существует

## Следующие шаги

После успешной настройки MCP серверов можно:
1. Тестировать существующие UI компоненты mcp-ui
2. Разрабатывать новые компоненты с реальными данными
3. Создавать интеграции с GitHub для автоматизации
4. Использовать файловую систему для генерации кода

Готово к разработке! 🎉