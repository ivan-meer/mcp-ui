# 🤝 Contributing to MCP UI SDK

Спасибо за интерес к развитию MCP UI SDK! Ваш вклад поможет создать лучший инструмент для разработки интерактивных веб-компонентов в экосистеме Model Context Protocol.

---

## 🚀 Быстрый старт для участников

### 📋 Подготовка окружения

```bash
# 1. Форк и клонирование репозитория
git clone https://github.com/YOUR_USERNAME/mcp-ui.git
cd mcp-ui

# 2. Установка зависимостей
pnpm install

# 3. Запуск тестов
pnpm test

# 4. Запуск демо
./start-demo.sh

# 5. Сборка проекта
pnpm build
```

### 🛠️ Требования к системе
- **Node.js**: 18.0.0 или выше
- **pnpm**: 8.0.0 или выше (обязательно, enforced preinstall script)
- **Git**: для version control
- **Браузер**: Chrome/Firefox/Safari (последние версии)

---

## 📝 Как участвовать

### 🐛 Сообщение об ошибках

1. **Проверьте существующие issues** - возможно, проблема уже известна
2. **Используйте Bug Report template** - заполните все поля формы
3. **Приложите минимальный пример** - код для воспроизведения
4. **Укажите environment** - OS, Node.js, браузер версии

### ✨ Предложение новых функций

1. **Изучите roadmap** - проверьте планируемые функции
2. **Создайте Feature Request** - детально опишите предложение
3. **Обсудите в Discussions** - получите feedback от сообщества
4. **Дождитесь approval** - перед началом разработки

### 🔧 Создание Pull Request

#### 📐 Соглашения по коду

**Naming Conventions:**
```typescript
// Components - PascalCase
export function HtmlResource() {}

// Functions - camelCase  
export function createHtmlResource() {}

// Constants - SCREAMING_SNAKE_CASE
export const DEFAULT_TIMEOUT = 5000;

// Files - kebab-case
html-resource.tsx
create-html-resource.ts
```

**Code Style:**
- **ESLint + Prettier** - автоматическое форматирование
- **TypeScript strict mode** - обязательная типизация
- **JSDoc комментарии** - для всех публичных API
- **Error handling** - proper try/catch и error types

#### 🧪 Тестирование

**Обязательные тесты:**
```typescript
// Unit tests для всех функций
describe('createHtmlResource', () => {
  it('should create valid HTML resource', () => {
    // test implementation
  });
});

// Integration tests для компонентов
describe('HtmlResource component', () => {
  it('should render HTML content correctly', () => {
    // test implementation
  });
});
```

**Test Coverage требования:**
- **Новый код**: 100% coverage
- **Существующий код**: не снижать coverage
- **Critical paths**: обязательное покрытие

#### 📦 Commit Messages

Используйте **Conventional Commits** format:

```
type(scope): description

feat(client): add new HtmlResource component
fix(server): resolve URI parsing issue
docs(readme): update installation guide
test(client): add unit tests for HtmlResource
chore(deps): update TypeScript to 5.3
```

**Types:**
- `feat` - новая функция
- `fix` - исправление бага
- `docs` - изменения документации
- `test` - добавление/изменение тестов
- `refactor` - рефакторинг без изменения API
- `perf` - улучшение производительности
- `chore` - maintenance задачи

**Scopes:**
- `client` - @mcp-ui/client пакет
- `server` - @mcp-ui/server пакет
- `shared` - @mcp-ui/shared пакет
- `examples` - примеры и демо
- `docs` - документация
- `ci` - CI/CD конфигурация

---

## 🏗️ Архитектура проекта

### 📁 Структура директорий

```
mcp-ui/
├── packages/                    # Монорепо пакеты
│   ├── client/                 # React компоненты
│   │   ├── src/
│   │   │   ├── components/     # UI компоненты
│   │   │   ├── hooks/          # React hooks
│   │   │   ├── utils/          # Утилиты
│   │   │   └── types/          # TypeScript типы
│   │   └── package.json
│   ├── server/                 # Серверные утилиты
│   │   ├── src/
│   │   │   ├── core/           # Основная функциональность
│   │   │   ├── utils/          # Помощники
│   │   │   └── types/          # TypeScript типы
│   │   └── package.json
│   └── shared/                 # Общие типы и утилиты
│       ├── src/
│       │   ├── types/          # Shared типы
│       │   └── utils/          # Shared утилиты
│       └── package.json
├── examples/                   # Примеры использования
│   └── server/                 # MCP server пример
├── docs/                       # Документация
│   ├── src/                    # VitePress docs
│   └── DEMO_GUIDE.md
├── .github/                    # GitHub конфигурация
│   ├── workflows/              # CI/CD автоматизация
│   └── ISSUE_TEMPLATE/         # Templates для issues
└── demo.html                   # Интерактивное демо
```

### 🔄 Development Workflow

```bash
# 1. Создать feature ветку
git checkout -b feat/new-component

# 2. Разработка
# - Написать код
# - Добавить тесты
# - Обновить документацию

# 3. Локальная проверка
pnpm lint          # ESLint проверка
pnpm format        # Prettier форматирование
pnpm test          # Запуск тестов
pnpm build         # Сборка пакетов
./start-demo.sh    # Проверка демо

# 4. Commit и Push
git add .
git commit -m "feat(client): add new component"
git push origin feat/new-component

# 5. Создать Pull Request
# - Заполнить PR template
# - Дождаться CI checks
# - Ответить на review комментарии
```

---

## 📚 Разработка компонентов

### ⚛️ React Component Guidelines

```typescript
// ✅ Хороший пример компонента
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Disabled state */
  disabled?: boolean;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant}`}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
```

**Component Checklist:**
- [ ] TypeScript интерфейс с JSDoc
- [ ] Default props значения
- [ ] Proper accessibility attributes
- [ ] CSS classes следуют BEM methodology
- [ ] Unit tests с React Testing Library
- [ ] Storybook story (если применимо)

### 🔧 Server Utilities Guidelines

```typescript
// ✅ Хороший пример утилиты
interface CreateResourceOptions {
  /** Unique URI identifier */
  uri: string;
  /** HTML content */
  content: string;
  /** Optional CSS styles */
  css?: string;
  /** Optional JavaScript code */
  js?: string;
}

/**
 * Creates an HTML resource for MCP protocol
 * @param options - Resource creation options
 * @returns HtmlResource object
 * @throws {Error} When URI is invalid
 */
export function createHtmlResource(
  options: CreateResourceOptions
): HtmlResource {
  // Implementation with proper error handling
}
```

**Utility Checklist:**
- [ ] Clear function signature
- [ ] Comprehensive JSDoc documentation
- [ ] Input validation
- [ ] Error handling with typed errors
- [ ] Unit tests с edge cases
- [ ] Performance considerations

---

## 🧪 Testing Guidelines

### 🎯 Testing Strategy

**Unit Tests** (packages/*/src/**/*.test.ts):
```typescript
import { createHtmlResource } from './create-html-resource';

describe('createHtmlResource', () => {
  it('should create resource with valid URI', () => {
    const resource = createHtmlResource({
      uri: 'ui://test/component',
      content: '<div>Test</div>'
    });
    
    expect(resource.type).toBe('resource');
    expect(resource.resource.uri).toBe('ui://test/component');
  });

  it('should throw error for invalid URI', () => {
    expect(() => createHtmlResource({
      uri: 'invalid-uri',
      content: '<div>Test</div>'
    })).toThrow('Invalid URI format');
  });
});
```

**Component Tests** (packages/client/src/**/*.test.tsx):
```typescript
import { render, screen } from '@testing-library/react';
import { HtmlResource } from './HtmlResource';

describe('HtmlResource', () => {
  it('should render HTML content', () => {
    render(
      <HtmlResource 
        resource={{
          type: 'resource',
          resource: {
            uri: 'ui://test',
            mimeType: 'text/html',
            text: '<div>Hello World</div>'
          }
        }} 
      />
    );
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

**Integration Tests** (examples/server tests):
```typescript
describe('Demo server', () => {
  it('should serve UI gallery', async () => {
    const response = await mcpServer.callTool('show_ui_gallery');
    expect(response.type).toBe('resource');
    expect(response.resource.uri).toMatch(/^ui:\/\//);
  });
});
```

### 📊 Coverage Requirements

- **Statements**: 95%+
- **Branches**: 90%+
- **Functions**: 95%+
- **Lines**: 95%+

Проверка coverage:
```bash
pnpm coverage
open coverage/lcov-report/index.html
```

---

## 📖 Documentation Guidelines

### 📝 Code Documentation

**TypeScript Interfaces:**
```typescript
/**
 * Configuration options for HTML resource creation
 * @public
 */
interface HtmlResourceOptions {
  /** 
   * Unique identifier for the resource
   * @example "ui://dashboard/analytics"
   */
  uri: string;
  
  /** 
   * HTML content to render
   * @example "<div>Hello World</div>"
   */
  content: string;
  
  /** 
   * Optional CSS styles
   * @defaultValue undefined
   */
  css?: string;
}
```

**Function Documentation:**
```typescript
/**
 * Creates an HTML resource for MCP protocol
 * 
 * @param options - Resource configuration
 * @returns Promise resolving to HtmlResource
 * @throws {ValidationError} When options are invalid
 * @throws {NetworkError} When resource cannot be created
 * 
 * @example
 * ```typescript
 * const resource = await createHtmlResource({
 *   uri: 'ui://my-component',
 *   content: '<div>Hello</div>',
 *   css: 'div { color: blue; }'
 * });
 * ```
 * 
 * @see {@link HtmlResource} for return type details
 * @since 2.0.0
 */
export async function createHtmlResource(
  options: HtmlResourceOptions
): Promise<HtmlResource> {
  // implementation
}
```

### 📚 README Updates

При добавлении новых компонентов обновите:
1. **README.md** - краткое описание + пример
2. **packages/*/README.md** - детальная документация пакета
3. **docs/** - полная VitePress документация
4. **examples/** - рабочий пример использования

---

## 🔍 Code Review Process

### 👀 Review Checklist

**Functionality:**
- [ ] Код работает как ожидается
- [ ] Все тесты проходят
- [ ] Нет regression issues
- [ ] Performance не ухудшился

**Code Quality:**
- [ ] Следует проектным conventions
- [ ] Читаемый и понятный код
- [ ] Нет code smells
- [ ] Proper error handling

**Documentation:**
- [ ] JSDoc для публичных API
- [ ] README обновлен
- [ ] Examples актуальны
- [ ] Breaking changes документированы

**Testing:**
- [ ] Адекватное test coverage
- [ ] Edge cases покрыты
- [ ] Integration tests при необходимости

### 🗣️ Review Feedback Guidelines

**Для авторов PR:**
- Отвечайте на все комментарии
- Объясняйте архитектурные решения
- Обновляйте код согласно feedback
- Тестируйте предложенные изменения

**Для reviewers:**
- Будьте конструктивными
- Предлагайте конкретные улучшения
- Объясняйте reasoning для запросов
- Признавайте хорошие решения

---

## 🏆 Recognition

### 🌟 Contributor Types

**🔧 Code Contributors:**
- Pull requests авторы
- Bug fixers
- Performance optimizers
- Security researchers

**📚 Documentation Contributors:**
- Technical writers
- Tutorial creators
- API documentation improvers
- Translation contributors

**🎨 Design Contributors:**
- UI/UX designers
- Component designers
- Icon creators
- Brand developers

**🤝 Community Contributors:**
- Issue triagers
- Discussion moderators
- Release testers
- Event organizers

### 🏅 Recognition Program

- **Monthly Contributor Spotlight** - в README и social media
- **Annual Contributors Report** - comprehensive statistics
- **Conference Speaking Opportunities** - представление проекта
- **Exclusive Contributor Discord Channels** - direct access to maintainers

---

## 🆘 Получение помощи

### 💬 Каналы поддержки

1. **GitHub Discussions** - общие вопросы и идеи
2. **GitHub Issues** - bugs и feature requests
3. **Discord Community** - real-time chat поддержка
4. **Email Support** - [ivan@how2ai.info](mailto:ivan@how2ai.info)

### 📞 Maintainer Contact

**Primary Maintainer:**
- **Name**: Ivan Meer
- **GitHub**: [@ivan-meer](https://github.com/ivan-meer)
- **Email**: ivan@how2ai.info
- **Timezone**: UTC+3 (Moscow)
- **Response Time**: 24-48 hours

### 🕐 Office Hours

**Community Office Hours** - каждую среду 18:00 MSK:
- Обсуждение roadmap
- Code review sessions
- Architecture discussions
- Newcomer onboarding

---

## 📄 Legal

### ⚖️ License Agreement

Участвуя в проекте, вы соглашаетесь что ваш код будет лицензирован под [Apache 2.0 License](LICENSE).

### 🏢 Corporate Contributors

Для corporate contributions требуется подписание Contributor License Agreement (CLA).

### 🔒 Security

Для сообщения о security vulnerabilities используйте private email: security@how2ai.info

---

<div align="center">

**🙏 Спасибо за ваш вклад в MCP UI SDK!**

[![Contributors](https://img.shields.io/github/contributors/ivan-meer/mcp-ui)](https://github.com/ivan-meer/mcp-ui/graphs/contributors)
[![Pull Requests](https://img.shields.io/github/issues-pr/ivan-meer/mcp-ui)](https://github.com/ivan-meer/mcp-ui/pulls)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

---

*Последнее обновление: Июнь 2025*

</div>