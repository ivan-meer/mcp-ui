# 🎨 MCP UI SDK - Полное руководство по демо-прототипу

## 📋 Содержание

- [Обзор](#обзор)
- [Быстрый старт](#быстрый-старт)
- [Подробное описание компонентов](#подробное-описание-компонентов)
- [Архитектура и технические детали](#архитектура-и-технические-детали)
- [Интеграция с MCP сервером](#интеграция-с-mcp-сервером)
- [Расширение функциональности](#расширение-функциональности)

## 🌟 Обзор

Демо-прототип MCP UI SDK представляет собой комплексную демонстрацию возможностей создания интерактивных пользовательских интерфейсов для Model Context Protocol серверов. Прототип включает в себя галерею компонентов, интерактивную аналитическую панель, генератор форм и документацию по интеграции.

### 🎯 Цели демо

1. **Визуализация возможностей** - показать весь спектр UI компонентов, поддерживаемых SDK
2. **Практические примеры** - предоставить работающие примеры кода для разработчиков
3. **Тестирование интерактивности** - продемонстрировать событийную модель и обработку действий пользователя
4. **Архитектурная демонстрация** - показать, как интегрировать UI компоненты в существующие MCP серверы

## 🚀 Быстрый старт

### Опция 1: Статическая демонстрация (рекомендуется)

```bash
# Переходим в директорию проекта
cd /home/how2ai/mcp-ui

# Открываем демо в браузере (любой из вариантов):
firefox demo.html
google-chrome demo.html
open demo.html  # на macOS

# Или двойной клик по файлу demo.html в файловом менеджере
```

### Опция 2: Локальный веб-сервер

```bash
# Используем готовый скрипт автозапуска
./start-demo.sh

# Или вручную:
python3 -m http.server 8080
# Затем открываем http://localhost:8080/demo.html
```

### Опция 3: Полный MCP сервер (требует установки зависимостей)

```bash
cd examples/server
pnpm install
pnpm dev
# Сервер будет доступен на http://localhost:3000
```

## 📊 Подробное описание компонентов

### 1. 🎨 Галерея компонентов (`show_ui_gallery`)

**Назначение**: Главная страница демо с обзором всех доступных типов UI компонентов.

**Функциональность**:
- Интерактивные карточки с предварительным просмотром каждого компонента
- Анимированные hover-эффекты и переходы
- Демонстрационные элементы внутри каждой карточки
- Навигация между различными разделами демо

**Технические особенности**:
```html
<!-- Структура карточки компонента -->
<div class="card" data-tool="show_dashboard" data-params='{"type":"analytics"}'>
    <h3>📊 Аналитическая панель</h3>
    <p>Интерактивные графики и метрики для отображения данных</p>
    <div class="demo-element">
        <!-- Предварительный просмотр -->
    </div>
    <button class="btn">Открыть панель</button>
</div>
```

**Стили и анимации**:
- CSS Grid макет для адаптивного расположения карточек
- Анимированная прогресс-полоса с CSS keyframes
- Трансформации при наведении (translateY, box-shadow)
- Градиентные фоны и современные цветовые схемы

### 2. 📊 Аналитическая панель (`show_dashboard`)

**Назначение**: Демонстрация интерактивных графиков, метрик и индикаторов состояния системы.

**Компоненты панели**:

#### Виджет метрик
```html
<div class="widget">
    <h3>📊 Ключевые метрики</h3>
    <div class="metric">
        <span>Активные пользователи</span>
        <span class="metric-value">1,234</span>
    </div>
    <!-- Дополнительные метрики -->
</div>
```

#### Интерактивные графики (Chart.js)
```javascript
// График продаж - линейный график
new Chart(salesCtx, {
    type: 'line',
    data: {
        labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'],
        datasets: [{
            label: 'Продажи',
            data: [120, 190, 300, 500, 200, 300, 450],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
    }
});

// География пользователей - круговая диаграмма
new Chart(geoCtx, {
    type: 'doughnut',
    data: {
        labels: ['Россия', 'США', 'Германия', 'Франция', 'Другие'],
        datasets: [{
            data: [45, 25, 15, 10, 5],
            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
        }]
    }
});
```

#### Индикаторы состояния системы
```html
<div class="metric">
    <span>
        <span class="status-indicator status-green"></span>
        API сервер
    </span>
    <span class="metric-value">Работает</span>
</div>
```

**Интерактивные элементы**:
- Кнопки для проверки системы и перезапуска сервисов
- Обработка событий через `data-tool` атрибуты
- Отправка сообщений родительскому окну через `postMessage`

### 3. 📝 Генератор форм (`show_form_generator`)

**Назначение**: Демонстрация создания динамических форм с валидацией и обработкой данных.

**Типы полей формы**:

#### Текстовые поля
```html
<div class="form-group">
    <label class="form-label">Имя <span class="required">*</span></label>
    <input type="text" class="form-input" name="name" required>
    <div class="help-text">Введите ваше полное имя</div>
</div>
```

#### Email с валидацией
```html
<input type="email" class="form-input" name="email" required>
```

#### Числовые поля с ограничениями
```html
<input type="number" class="form-input" name="age" min="18" max="120">
```

#### Выпадающие списки
```html
<select class="form-select" name="role">
    <option value="">Выберите роль</option>
    <option value="admin">Администратор</option>
    <option value="user">Пользователь</option>
    <option value="guest">Гость</option>
</select>
```

#### Текстовые области
```html
<textarea class="form-textarea" name="bio" placeholder="Расскажите немного о себе..."></textarea>
```

#### Чекбоксы
```html
<label class="checkbox-label">
    <input type="checkbox" class="form-checkbox" name="newsletter">
    Подписаться на рассылку
</label>
```

**Обработка формы**:
```javascript
document.getElementById('dynamicForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Обработка различных типов полей
    for (let [key, value] of formData.entries()) {
        if (e.target.elements[key].type === 'checkbox') {
            data[key] = e.target.elements[key].checked;
        } else {
            data[key] = value;
        }
    }
    
    // Отправка данных через MCP
    if (window.parent !== window) {
        window.parent.postMessage({
            tool: 'save_form_data',
            params: { schema: '${schema}', data: data }
        }, '*');
    }
});
```

### 4. 📋 Таблицы данных

**Функциональность**:
- Отображение табличных данных с заголовками
- Сортировка по столбцам
- Фильтрация и поиск
- Пагинация для больших наборов данных
- Выделение строк при наведении

### 5. 📅 Календарь событий

**Возможности**:
- Месячный и недельный виды
- Добавление и редактирование событий
- Навигация между месяцами
- Цветовая категоризация событий

### 6. 💬 Чат интерфейс

**Компоненты**:
- Область сообщений с прокруткой
- Поле ввода с кнопкой отправки
- Различение сообщений пользователя и агента
- Временные метки сообщений

### 7. 📁 Файловый менеджер

**Функции**:
- Навигация по директориям
- Отображение файлов с иконками по типам
- Операции с файлами (просмотр, скачивание)
- Контекстные меню

## 🏗️ Архитектура и технические детали

### Структура файлов демо

```
demo.html
├── Секция <head>
│   ├── Meta теги и viewport
│   ├── Подключение внешних библиотек
│   │   ├── React 18 (development)
│   │   ├── ReactDOM 18
│   │   ├── Babel Standalone
│   │   └── Chart.js
│   └── CSS стили (встроенные)
├── Секция <body>
│   ├── Заголовок демо
│   ├── Навигационные табы
│   ├── Контентные секции
│   │   ├── Обзор
│   │   ├── Галерея (iframe)
│   │   ├── Панель (iframe)
│   │   ├── Формы (iframe)
│   │   └── Интеграция
│   └── JavaScript секция
│       ├── HTML контент для iframe'ов
│       └── Навигационная логика
```

### CSS Архитектура

#### Цветовая палитра
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #48bb78;
    --warning-color: #ed8936;
    --error-color: #f56565;
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --background-light: #f8f9fa;
    --border-color: #e2e8f0;
}
```

#### Компонентная система стилей
```css
/* Базовые компоненты */
.btn { /* Универсальные кнопки */ }
.card { /* Карточки компонентов */ }
.widget { /* Виджеты панели */ }
.form-group { /* Группы полей форм */ }

/* Модификаторы */
.btn-primary { /* Основные кнопки */ }
.btn-secondary { /* Вторичные кнопки */ }
.card:hover { /* Интерактивные состояния */ }

/* Утилиты */
.text-center { text-align: center; }
.margin-bottom { margin-bottom: 20px; }
```

#### Адаптивный дизайн
```css
/* Мобильные устройства */
@media (max-width: 768px) {
    .gallery {
        grid-template-columns: 1fr;
    }
    .demo-header h1 {
        font-size: 2em;
    }
}

/* Планшеты */
@media (min-width: 769px) and (max-width: 1024px) {
    .gallery {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Десктопы */
@media (min-width: 1025px) {
    .gallery {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### JavaScript Архитектура

#### Модульная структура
```javascript
// 1. HTML контент для компонентов
const galleryHTML = `...`;
const dashboardHTML = `...`;
const formsHTML = `...`;

// 2. Утилитарные функции
function loadIframeContent(frameId, content) { ... }
function handleTabNavigation(tabName) { ... }

// 3. Обработчики событий
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', handleTabClick);
});

// 4. Инициализация
window.addEventListener('DOMContentLoaded', initDemo);
```

#### Система событий
```javascript
// Обработка кликов по табам
function handleTabClick(event) {
    const tabName = event.target.getAttribute('data-tab');
    
    // Обновление активного таба
    updateActiveTab(tabName);
    
    // Показ соответствующего контента
    showTabContent(tabName);
    
    // Загрузка содержимого в iframe
    loadTabContent(tabName);
}

// Коммуникация между iframe и родительским окном
window.addEventListener('message', (event) => {
    if (event.data.tool) {
        console.log('Received tool call:', event.data.tool, event.data.params);
        // Здесь можно обработать вызовы MCP инструментов
    }
});
```

## 🔌 Интеграция с MCP сервером

### Новые MCP инструменты

#### 1. show_ui_gallery
```typescript
this.server.tool(
    'show_ui_gallery',
    'Displays a gallery of different UI component examples',
    async () => {
        const galleryHtml = `/* HTML контент галереи */`;
        
        const uniqueUiUri = `ui://gallery/${Date.now()}`;
        const resourceBlock = createHtmlResource({
            uri: uniqueUiUri,
            content: { type: 'rawHtml', htmlString: galleryHtml },
            delivery: 'text',
        });

        return {
            content: [resourceBlock],
        };
    },
);
```

#### 2. show_dashboard
```typescript
this.server.tool(
    'show_dashboard',
    'Displays an analytics dashboard with interactive charts',
    { type: z.string().optional() },
    async ({ type = 'default' }) => {
        const dashboardHtml = generateDashboardHTML(type);
        
        const uniqueUiUri = `ui://dashboard/${Date.now()}`;
        const resourceBlock = createHtmlResource({
            uri: uniqueUiUri,
            content: { type: 'rawHtml', htmlString: dashboardHtml },
            delivery: 'text',
        });

        return {
            content: [resourceBlock],
        };
    },
);
```

#### 3. show_form_generator
```typescript
this.server.tool(
    'show_form_generator',
    'Generate a dynamic form based on JSON schema',
    { 
        schema: z.string(), 
        data: z.record(z.any()).optional() 
    },
    async ({ schema, data = {} }) => {
        const formHtml = generateFormHTML(schema, data);
        
        const uniqueUiUri = `ui://form-generator/${Date.now()}`;
        const resourceBlock = createHtmlResource({
            uri: uniqueUiUri,
            content: { type: 'rawHtml', htmlString: formHtml },
            delivery: 'text',
        });

        return {
            content: [resourceBlock],
        };
    },
);
```

### Обработка событий

#### Серверная сторона
```typescript
// Обработка сохранения данных формы
this.server.tool(
    'save_form_data',
    'Save form data to the server',
    { 
        schema: z.string(),
        data: z.record(z.any())
    },
    async ({ schema, data }) => {
        // Валидация данных по схеме
        const isValid = validateFormData(schema, data);
        
        if (isValid) {
            // Сохранение в базу данных
            await saveToDatabase(data);
            
            return {
                content: [{
                    type: 'text',
                    text: 'Данные успешно сохранены!'
                }]
            };
        } else {
            throw new Error('Некорректные данные формы');
        }
    }
);
```

#### Клиентская сторона
```javascript
// В HTML ресурсе
function submitForm(formData) {
    if (window.parent !== window) {
        // Отправка через postMessage в MCP клиент
        window.parent.postMessage({
            tool: 'save_form_data',
            params: {
                schema: 'user_profile',
                data: formData
            }
        }, '*');
    }
}

// Обработка ответа от сервера
window.addEventListener('message', (event) => {
    if (event.data.type === 'mcp_response') {
        if (event.data.success) {
            showSuccessMessage(event.data.message);
        } else {
            showErrorMessage(event.data.error);
        }
    }
});
```

## 🔧 Расширение функциональности

### Добавление новых компонентов

#### 1. Создание HTML шаблона
```html
<!-- Новый компонент: Graph Visualizer -->
<div class="graph-container">
    <div class="graph-header">
        <h3>🕸️ Визуализатор графов</h3>
        <div class="graph-controls">
            <button data-action="zoom-in">Увеличить</button>
            <button data-action="zoom-out">Уменьшить</button>
            <button data-action="reset">Сбросить</button>
        </div>
    </div>
    <div class="graph-canvas" id="graphCanvas"></div>
</div>
```

#### 2. Добавление JavaScript логики
```javascript
// Инициализация графа
function initGraphVisualizer() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    
    // Данные графа
    const nodes = [
        { id: 1, x: 100, y: 100, label: 'Node 1' },
        { id: 2, x: 200, y: 150, label: 'Node 2' },
        // ...
    ];
    
    const edges = [
        { from: 1, to: 2 },
        // ...
    ];
    
    // Рендеринг графа
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Рисование рёбер
        edges.forEach(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
        });
        
        // Рисование узлов
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = '#667eea';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.stroke();
            
            // Подписи узлов
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y - 25);
        });
    }
    
    render();
    
    // Обработка интерактивности
    canvas.addEventListener('click', handleNodeClick);
    canvas.addEventListener('mousemove', handleMouseMove);
}
```

#### 3. Создание MCP инструмента
```typescript
this.server.tool(
    'show_graph_visualizer',
    'Display an interactive graph visualization',
    { 
        nodes: z.array(z.object({
            id: z.number(),
            label: z.string(),
            x: z.number().optional(),
            y: z.number().optional()
        })),
        edges: z.array(z.object({
            from: z.number(),
            to: z.number(),
            weight: z.number().optional()
        })).optional()
    },
    async ({ nodes, edges = [] }) => {
        const graphHtml = generateGraphHTML(nodes, edges);
        
        const uniqueUiUri = `ui://graph-visualizer/${Date.now()}`;
        const resourceBlock = createHtmlResource({
            uri: uniqueUiUri,
            content: { type: 'rawHtml', htmlString: graphHtml },
            delivery: 'text',
        });

        return {
            content: [resourceBlock],
        };
    },
);
```

### Улучшение существующих компонентов

#### Добавление темной темы
```css
/* Темная тема */
.dark-theme {
    --primary-color: #9f7aea;
    --background-color: #1a1a1a;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    --card-background: #2d2d2d;
    --border-color: #404040;
}

.dark-theme .card {
    background: var(--card-background);
    color: var(--text-primary);
    border-color: var(--border-color);
}

/* Переключатель темы */
.theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    z-index: 1000;
}
```

```javascript
// Логика переключения темы
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Инициализация темы при загрузке
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});
```

#### Интернационализация
```javascript
// Система переводов
const translations = {
    en: {
        'analytics_dashboard': 'Analytics Dashboard',
        'form_generator': 'Form Generator',
        'data_table': 'Data Table',
        // ...
    },
    ru: {
        'analytics_dashboard': 'Аналитическая панель',
        'form_generator': 'Генератор форм',
        'data_table': 'Таблица данных',
        // ...
    },
    // Дополнительные языки...
};

function translate(key, lang = 'en') {
    return translations[lang][key] || key;
}

function setLanguage(lang) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translate(key, lang);
    });
    
    localStorage.setItem('language', lang);
}
```

## 📈 Метрики и аналитика

### Отслеживание использования компонентов
```javascript
// Система аналитики
class DemoAnalytics {
    constructor() {
        this.events = [];
        this.startTime = Date.now();
    }
    
    track(eventName, data = {}) {
        this.events.push({
            name: eventName,
            data: data,
            timestamp: Date.now() - this.startTime
        });
        
        // Отправка на сервер (опционально)
        this.sendToServer(eventName, data);
    }
    
    trackComponentView(componentName) {
        this.track('component_view', { component: componentName });
    }
    
    trackInteraction(componentName, action) {
        this.track('user_interaction', { 
            component: componentName, 
            action: action 
        });
    }
    
    getUsageReport() {
        const componentViews = {};
        const interactions = {};
        
        this.events.forEach(event => {
            if (event.name === 'component_view') {
                const component = event.data.component;
                componentViews[component] = (componentViews[component] || 0) + 1;
            } else if (event.name === 'user_interaction') {
                const key = `${event.data.component}:${event.data.action}`;
                interactions[key] = (interactions[key] || 0) + 1;
            }
        });
        
        return {
            totalEvents: this.events.length,
            sessionDuration: Date.now() - this.startTime,
            componentViews: componentViews,
            interactions: interactions
        };
    }
}

// Инициализация аналитики
const analytics = new DemoAnalytics();

// Использование
analytics.trackComponentView('dashboard');
analytics.trackInteraction('form_generator', 'submit');
```

## 🔍 Отладка и тестирование

### Консольные утилиты
```javascript
// Утилиты для отладки
window.DEMO_DEBUG = {
    // Показать все зарегистрированные события
    showEvents: () => analytics.events,
    
    // Получить отчет об использовании
    getReport: () => analytics.getUsageReport(),
    
    // Переключить режим отладки
    toggleDebug: () => {
        document.body.classList.toggle('debug-mode');
    },
    
    // Протестировать все компоненты
    testAllComponents: () => {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach((tab, index) => {
            setTimeout(() => {
                tab.click();
                console.log(`Tested tab: ${tab.textContent}`);
            }, index * 1000);
        });
    },
    
    // Симуляция MCP событий
    simulateMCPEvent: (tool, params) => {
        console.log(`Simulating MCP tool call: ${tool}`, params);
        // Эмуляция ответа сервера
        window.postMessage({
            type: 'mcp_response',
            tool: tool,
            success: true,
            data: { message: 'Simulated response' }
        }, '*');
    }
};

// CSS для режима отладки
.debug-mode .card {
    border: 2px dashed red !important;
}

.debug-mode .widget {
    border: 2px dashed blue !important;
}

.debug-mode::before {
    content: 'DEBUG MODE ACTIVE';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: red;
    color: white;
    text-align: center;
    padding: 5px;
    z-index: 9999;
}
```

### Автоматизированное тестирование
```javascript
// Простая система тестирования
class DemoTester {
    constructor() {
        this.tests = [];
        this.results = [];
    }
    
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async runAllTests() {
        console.log('🧪 Running demo tests...');
        
        for (const test of this.tests) {
            try {
                const result = await test.testFunction();
                this.results.push({ 
                    name: test.name, 
                    status: 'passed', 
                    result 
                });
                console.log(`✅ ${test.name}: PASSED`);
            } catch (error) {
                this.results.push({ 
                    name: test.name, 
                    status: 'failed', 
                    error: error.message 
                });
                console.log(`❌ ${test.name}: FAILED - ${error.message}`);
            }
        }
        
        return this.results;
    }
}

// Примеры тестов
const tester = new DemoTester();

tester.addTest('Navigation tabs work', () => {
    const tabs = document.querySelectorAll('.nav-tab');
    if (tabs.length === 0) throw new Error('No navigation tabs found');
    
    tabs[0].click();
    const activeTab = document.querySelector('.nav-tab.active');
    if (!activeTab) throw new Error('Tab activation failed');
    
    return { tabsCount: tabs.length };
});

tester.addTest('Iframe content loads', async () => {
    const galleryTab = document.querySelector('[data-tab="gallery"]');
    galleryTab.click();
    
    // Ожидание загрузки iframe
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const iframe = document.getElementById('galleryFrame');
    if (!iframe || !iframe.srcdoc) {
        throw new Error('Gallery iframe not loaded');
    }
    
    return { iframeLoaded: true };
});

// Запуск тестов
// tester.runAllTests();
```

## 🎯 Заключение

Демо-прототип MCP UI SDK представляет собой комплексное решение для создания интерактивных пользовательских интерфейсов в экосистеме Model Context Protocol. Он демонстрирует:

1. **Широкий спектр UI компонентов** - от простых форм до сложных аналитических панелей
2. **Современный дизайн и UX** - адаптивная верстка, анимации, интуитивная навигация
3. **Гибкую архитектуру** - модульная структура, легко расширяемая и настраиваемая
4. **Полную интеграцию с MCP** - двустороннюю коммуникацию между клиентом и сервером
5. **Готовые примеры кода** - для быстрого старта и обучения

Этот прототип служит как демонстрацией возможностей SDK, так и отправной точкой для создания собственных UI решений в MCP проектах.