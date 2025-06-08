# 🧩 MCP UI SDK - Справочник компонентов

## 📋 Содержание

- [Обзор архитектуры](#обзор-архитектуры)
- [Базовые компоненты](#базовые-компоненты)
- [Продвинутые компоненты](#продвинутые-компоненты)
- [Система событий](#система-событий)
- [Стилизация и темы](#стилизация-и-темы)
- [Примеры интеграции](#примеры-интеграции)

## 🏗️ Обзор архитектуры

MCP UI SDK предоставляет модульную систему компонентов, построенную на следующих принципах:

### Основные принципы

1. **Безопасность** - все HTML контент санитизируется через DOMPurify
2. **Изоляция** - компоненты работают в изолированных iframe или безопасном режиме
3. **Событийность** - двусторонняя коммуникация через систему событий
4. **Переиспользуемость** - компоненты легко интегрируются в любые MCP серверы
5. **Расширяемость** - простое добавление новых типов компонентов

### Типы компонентов

| Тип | Назначение | Сложность | Статус |
|-----|------------|-----------|--------|
| **Базовые** | Простые UI элементы | ⭐ | ✅ Готово |
| **Формы** | Ввод и валидация данных | ⭐⭐ | ✅ Готово |
| **Визуализация** | Графики и диаграммы | ⭐⭐⭐ | ✅ Готово |
| **Интерактивные** | Сложные интерфейсы | ⭐⭐⭐⭐ | 🚧 В разработке |
| **Кастомные** | Пользовательские компоненты | ⭐⭐⭐⭐⭐ | 📋 Планируется |

## 🔧 Базовые компоненты

### 1. Галерея компонентов (Gallery)

**Описание**: Главный компонент для демонстрации и навигации между различными типами UI элементов.

#### Использование

```typescript
// MCP Tool
server.tool('show_ui_gallery', async () => {
    const resourceBlock = createHtmlResource({
        uri: `ui://gallery/${Date.now()}`,
        content: { type: 'rawHtml', htmlString: galleryHTML },
        delivery: 'text',
    });
    
    return { content: [resourceBlock] };
});
```

#### Структура HTML

```html
<div class="container">
    <div class="header">
        <h1>🎨 MCP UI Gallery</h1>
        <p>Интерактивные компоненты для Model Context Protocol</p>
    </div>
    
    <div class="gallery">
        <!-- Карточки компонентов -->
        <div class="card" data-tool="show_dashboard" data-params='{"type":"analytics"}'>
            <h3>📊 Аналитическая панель</h3>
            <p>Описание компонента</p>
            <div class="demo-element">
                <!-- Предварительный просмотр -->
            </div>
            <button class="btn">Открыть панель</button>
        </div>
    </div>
</div>
```

#### CSS стили

```css
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 30px;
}

.card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
    cursor: pointer;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    border-color: #667eea;
}
```

#### JavaScript логика

```javascript
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        const tool = card.getAttribute('data-tool');
        const params = JSON.parse(card.getAttribute('data-params') || '{}');
        
        // Отправка MCP события
        if (window.parent !== window) {
            window.parent.postMessage({
                tool: tool,
                params: params
            }, '*');
        }
    });
});
```

### 2. Кнопки и элементы управления

#### Базовые кнопки

```html
<!-- Основная кнопка -->
<button class="btn btn-primary" data-tool="save_data">
    Сохранить
</button>

<!-- Вторичная кнопка -->
<button class="btn btn-secondary" data-tool="cancel">
    Отмена
</button>

<!-- Кнопка с иконкой -->
<button class="btn btn-icon" data-tool="refresh">
    🔄 Обновить
</button>
```

#### Стили кнопок

```css
.btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    transition: all 0.3s ease;
    font-weight: 500;
}

.btn:hover {
    background: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
    background: #e2e8f0;
    color: #4a5568;
}

.btn-icon {
    display: flex;
    align-items: center;
    gap: 8px;
}
```

### 3. Индикаторы и метрики

#### Метрики

```html
<div class="metrics-container">
    <div class="metric">
        <span class="metric-label">Активные пользователи</span>
        <span class="metric-value">1,234</span>
    </div>
    <div class="metric">
        <span class="metric-label">Конверсия</span>
        <span class="metric-value">12.5%</span>
    </div>
</div>
```

#### Прогресс-бары

```html
<div class="progress-container">
    <div class="progress-label">Загрузка: 65%</div>
    <div class="progress-bar">
        <div class="progress-fill" style="width: 65%"></div>
    </div>
</div>
```

#### Индикаторы состояния

```html
<div class="status-indicator-container">
    <span class="status-indicator status-green"></span>
    <span class="status-text">Система работает</span>
</div>
```

```css
.status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
}

.status-green { background: #48bb78; }
.status-yellow { background: #ed8936; }
.status-red { background: #f56565; }
```

## 📊 Продвинутые компоненты

### 1. Аналитическая панель (Dashboard)

**Описание**: Комплексный компонент для отображения метрик, графиков и индикаторов состояния.

#### Основные возможности

- Интерактивные графики с Chart.js
- Виджеты с ключевыми метриками
- Индикаторы состояния системы
- Кнопки управления

#### MCP Tool

```typescript
server.tool(
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

        return { content: [resourceBlock] };
    },
);
```

#### Структура виджетов

```html
<div class="dashboard">
    <!-- Виджет метрик -->
    <div class="widget">
        <h3>📊 Ключевые метрики</h3>
        <div class="metric">
            <span>Активные пользователи</span>
            <span class="metric-value">1,234</span>
        </div>
        <!-- Дополнительные метрики -->
    </div>

    <!-- Виджет с графиком -->
    <div class="widget">
        <h3>📈 График продаж</h3>
        <div class="chart-container">
            <canvas id="salesChart"></canvas>
        </div>
    </div>

    <!-- Виджет состояния -->
    <div class="widget">
        <h3>⚡ Статус системы</h3>
        <div class="metric">
            <span>
                <span class="status-indicator status-green"></span>
                API сервер
            </span>
            <span class="metric-value">Работает</span>
        </div>
        <button class="btn" data-tool="check_system_health">
            Проверить систему
        </button>
    </div>
</div>
```

#### Интеграция с Chart.js

```javascript
// Линейный график
const salesCtx = document.getElementById('salesChart').getContext('2d');
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
        scales: {
            y: { beginAtZero: true }
        }
    }
});

// Круговая диаграмма
const geoCtx = document.getElementById('geoChart').getContext('2d');
new Chart(geoCtx, {
    type: 'doughnut',
    data: {
        labels: ['Россия', 'США', 'Германия', 'Франция', 'Другие'],
        datasets: [{
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
                '#667eea', '#764ba2', '#f093fb', 
                '#f5576c', '#4facfe'
            ]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});
```

### 2. Генератор форм (Form Generator)

**Описание**: Динамическое создание форм на основе JSON Schema с валидацией и обработкой данных.

#### Поддерживаемые типы полей

| Тип поля | HTML тип | Валидация | Пример |
|----------|----------|-----------|--------|
| `string` | `<input type="text">` | required, minLength, maxLength | Имя пользователя |
| `email` | `<input type="email">` | email format | user@example.com |
| `number` | `<input type="number">` | min, max, step | Возраст: 18-120 |
| `textarea` | `<textarea>` | maxLength | Описание |
| `select` | `<select>` | enum values | Выбор роли |
| `checkbox` | `<input type="checkbox">` | boolean | Согласие с условиями |
| `radio` | `<input type="radio">` | enum values | Выбор одного варианта |
| `date` | `<input type="date">` | date format | Дата рождения |

#### MCP Tool

```typescript
server.tool(
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

        return { content: [resourceBlock] };
    },
);
```

#### Генерация формы по схеме

```javascript
function generateFormFromSchema(schema, data = {}) {
    const formHTML = [];
    
    Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
        const fieldHTML = generateFieldHTML(fieldName, fieldSchema, data[fieldName]);
        formHTML.push(fieldHTML);
    });
    
    return formHTML.join('');
}

function generateFieldHTML(name, schema, value = '') {
    const isRequired = schema.required || false;
    const placeholder = schema.placeholder || '';
    const helpText = schema.description || '';
    
    let fieldHTML = `
        <div class="form-group">
            <label class="form-label">
                ${schema.title || name}
                ${isRequired ? '<span class="required">*</span>' : ''}
            </label>
    `;
    
    switch (schema.type) {
        case 'string':
            if (schema.format === 'email') {
                fieldHTML += `<input type="email" class="form-input" name="${name}" 
                              value="${value}" placeholder="${placeholder}" 
                              ${isRequired ? 'required' : ''}>`;
            } else if (schema.enum) {
                fieldHTML += `<select class="form-select" name="${name}" 
                              ${isRequired ? 'required' : ''}>`;
                fieldHTML += `<option value="">Выберите значение</option>`;
                schema.enum.forEach(option => {
                    const selected = value === option ? 'selected' : '';
                    fieldHTML += `<option value="${option}" ${selected}>${option}</option>`;
                });
                fieldHTML += `</select>`;
            } else if (schema.format === 'textarea') {
                fieldHTML += `<textarea class="form-textarea" name="${name}" 
                              placeholder="${placeholder}" 
                              ${isRequired ? 'required' : ''}>${value}</textarea>`;
            } else {
                fieldHTML += `<input type="text" class="form-input" name="${name}" 
                              value="${value}" placeholder="${placeholder}" 
                              ${isRequired ? 'required' : ''}>`;
            }
            break;
            
        case 'number':
            fieldHTML += `<input type="number" class="form-input" name="${name}" 
                          value="${value}" ${schema.minimum ? `min="${schema.minimum}"` : ''} 
                          ${schema.maximum ? `max="${schema.maximum}"` : ''} 
                          ${isRequired ? 'required' : ''}>`;
            break;
            
        case 'boolean':
            const checked = value ? 'checked' : '';
            fieldHTML += `
                <label class="checkbox-label">
                    <input type="checkbox" class="form-checkbox" name="${name}" ${checked}>
                    ${schema.title || name}
                </label>
            `;
            break;
    }
    
    if (helpText) {
        fieldHTML += `<div class="help-text">${helpText}</div>`;
    }
    
    fieldHTML += `</div>`;
    
    return fieldHTML;
}
```

#### Обработка отправки формы

```javascript
document.getElementById('dynamicForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Обработка разных типов полей
    for (let [key, value] of formData.entries()) {
        const element = e.target.elements[key];
        
        if (element.type === 'checkbox') {
            data[key] = element.checked;
        } else if (element.type === 'number') {
            data[key] = value ? Number(value) : null;
        } else {
            data[key] = value;
        }
    }
    
    // Валидация формы
    const validation = validateFormData(data, schema);
    if (!validation.valid) {
        showValidationErrors(validation.errors);
        return;
    }
    
    // Отправка данных через MCP
    if (window.parent !== window) {
        window.parent.postMessage({
            tool: 'save_form_data',
            params: { schema: schema.name, data: data }
        }, '*');
    }
});

function validateFormData(data, schema) {
    const errors = [];
    
    Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
        const value = data[fieldName];
        
        // Проверка обязательных полей
        if (fieldSchema.required && (!value || value === '')) {
            errors.push(`Поле "${fieldSchema.title || fieldName}" обязательно для заполнения`);
        }
        
        // Проверка типов и форматов
        if (value) {
            if (fieldSchema.type === 'email' && !isValidEmail(value)) {
                errors.push(`Поле "${fieldSchema.title || fieldName}" должно содержать корректный email`);
            }
            
            if (fieldSchema.type === 'number') {
                const numValue = Number(value);
                if (fieldSchema.minimum && numValue < fieldSchema.minimum) {
                    errors.push(`Значение "${fieldSchema.title || fieldName}" должно быть не менее ${fieldSchema.minimum}`);
                }
                if (fieldSchema.maximum && numValue > fieldSchema.maximum) {
                    errors.push(`Значение "${fieldSchema.title || fieldName}" должно быть не более ${fieldSchema.maximum}`);
                }
            }
        }
    });
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}
```

### 3. Таблицы данных (Data Tables)

**Описание**: Интерактивные таблицы с сортировкой, фильтрацией и пагинацией.

#### Основные возможности

- Сортировка по столбцам
- Поиск и фильтрация
- Пагинация
- Выделение строк
- Контекстные меню

#### Структура HTML

```html
<div class="table-container">
    <div class="table-header">
        <h3>📋 Таблица данных</h3>
        <div class="table-controls">
            <input type="text" class="search-input" placeholder="Поиск...">
            <select class="filter-select">
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
            </select>
        </div>
    </div>
    
    <div class="table-wrapper">
        <table class="data-table">
            <thead>
                <tr>
                    <th data-sort="id" class="sortable">
                        ID <span class="sort-indicator"></span>
                    </th>
                    <th data-sort="name" class="sortable">
                        Имя <span class="sort-indicator"></span>
                    </th>
                    <th data-sort="status" class="sortable">
                        Статус <span class="sort-indicator"></span>
                    </th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody id="tableBody">
                <!-- Строки данных будут добавлены через JavaScript -->
            </tbody>
        </table>
    </div>
    
    <div class="table-footer">
        <div class="pagination">
            <button class="btn btn-sm" id="prevPage">← Предыдущая</button>
            <span class="page-info">Страница 1 из 5</span>
            <button class="btn btn-sm" id="nextPage">Следующая →</button>
        </div>
        <div class="table-stats">
            Показано 10 из 50 записей
        </div>
    </div>
</div>
```

#### JavaScript для таблиц

```javascript
class DataTable {
    constructor(containerId, data, options = {}) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.filteredData = [...data];
        this.sortField = null;
        this.sortDirection = 'asc';
        this.currentPage = 1;
        this.pageSize = options.pageSize || 10;
        this.searchTerm = '';
        this.filterValue = '';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.render();
    }
    
    bindEvents() {
        // Поиск
        const searchInput = this.container.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.applyFilters();
        });
        
        // Фильтрация
        const filterSelect = this.container.querySelector('.filter-select');
        filterSelect.addEventListener('change', (e) => {
            this.filterValue = e.target.value;
            this.applyFilters();
        });
        
        // Сортировка
        const sortableHeaders = this.container.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.getAttribute('data-sort');
                this.sort(field);
            });
        });
        
        // Пагинация
        const prevButton = this.container.querySelector('#prevPage');
        const nextButton = this.container.querySelector('#nextPage');
        
        prevButton.addEventListener('click', () => this.prevPage());
        nextButton.addEventListener('click', () => this.nextPage());
    }
    
    applyFilters() {
        this.filteredData = this.data.filter(row => {
            // Поиск по всем полям
            const matchesSearch = this.searchTerm === '' || 
                Object.values(row).some(value => 
                    String(value).toLowerCase().includes(this.searchTerm)
                );
            
            // Фильтрация по статусу
            const matchesFilter = this.filterValue === '' || 
                row.status === this.filterValue;
            
            return matchesSearch && matchesFilter;
        });
        
        this.currentPage = 1; // Сброс на первую страницу
        this.render();
    }
    
    sort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        
        this.filteredData.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            } else {
                const comparison = String(aVal).localeCompare(String(bVal));
                return this.sortDirection === 'asc' ? comparison : -comparison;
            }
        });
        
        this.render();
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.render();
        }
    }
    
    render() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        // Рендеринг строк таблицы
        const tbody = this.container.querySelector('#tableBody');
        tbody.innerHTML = pageData.map(row => `
            <tr data-id="${row.id}">
                <td>${row.id}</td>
                <td>${row.name}</td>
                <td>
                    <span class="status-badge status-${row.status}">
                        ${row.status === 'active' ? '🟢 Активен' : '🔴 Неактивен'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm" data-action="edit" data-id="${row.id}">
                        ✏️ Редактировать
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${row.id}">
                        🗑️ Удалить
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Обновление пагинации
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        const pageInfo = this.container.querySelector('.page-info');
        pageInfo.textContent = `Страница ${this.currentPage} из ${totalPages}`;
        
        // Обновление статистики
        const tableStats = this.container.querySelector('.table-stats');
        tableStats.textContent = `Показано ${pageData.length} из ${this.filteredData.length} записей`;
        
        // Обновление индикаторов сортировки
        this.updateSortIndicators();
        
        // Привязка событий к кнопкам действий
        this.bindActionEvents();
    }
    
    updateSortIndicators() {
        const headers = this.container.querySelectorAll('.sortable');
        headers.forEach(header => {
            const indicator = header.querySelector('.sort-indicator');
            const field = header.getAttribute('data-sort');
            
            if (field === this.sortField) {
                indicator.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
                header.classList.add('sorted');
            } else {
                indicator.textContent = '';
                header.classList.remove('sorted');
            }
        });
    }
    
    bindActionEvents() {
        const actionButtons = this.container.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                const id = button.getAttribute('data-id');
                
                this.handleAction(action, id);
            });
        });
    }
    
    handleAction(action, id) {
        if (window.parent !== window) {
            window.parent.postMessage({
                tool: `table_${action}`,
                params: { id: id, table: 'users' }
            }, '*');
        } else {
            console.log(`Action: ${action}, ID: ${id}`);
        }
    }
}

// Использование
const sampleData = [
    { id: 1, name: 'Alice Johnson', status: 'active' },
    { id: 2, name: 'Bob Smith', status: 'inactive' },
    { id: 3, name: 'Carol Williams', status: 'active' },
    // Дополнительные данные...
];

const table = new DataTable('tableContainer', sampleData, {
    pageSize: 10
});
```

## 🎯 Система событий

### Архитектура событий

MCP UI SDK использует событийную архитектуру для коммуникации между UI компонентами и MCP сервером.

#### Типы событий

1. **UI Actions** - действия пользователя в интерфейсе
2. **Data Events** - события связанные с данными
3. **System Events** - системные события и уведомления
4. **Navigation Events** - события навигации

#### Отправка событий из компонента

```javascript
// Универсальная функция отправки MCP события
function sendMCPEvent(tool, params = {}, target = '*') {
    if (window.parent !== window) {
        window.parent.postMessage({
            type: 'mcp_action',
            tool: tool,
            params: params,
            timestamp: Date.now(),
            source: 'ui_component'
        }, target);
    } else {
        // Fallback для разработки
        console.log('MCP Event:', { tool, params });
    }
}

// Примеры использования
sendMCPEvent('save_user_data', {
    userId: 123,
    data: { name: 'John', email: 'john@example.com' }
});

sendMCPEvent('delete_item', { itemId: 456 });

sendMCPEvent('navigate_to', { page: 'dashboard', section: 'analytics' });
```

#### Обработка событий в MCP сервере

```typescript
// Обработчик сохранения данных пользователя
server.tool(
    'save_user_data',
    'Save user data to the database',
    {
        userId: z.number(),
        data: z.object({
            name: z.string(),
            email: z.string().email()
        })
    },
    async ({ userId, data }) => {
        try {
            // Валидация данных
            const user = await validateUser(userId);
            if (!user) {
                throw new Error('Пользователь не найден');
            }
            
            // Сохранение в базу данных
            await updateUser(userId, data);
            
            // Логирование действия
            await logAction('user_updated', { userId, changes: data });
            
            return {
                content: [{
                    type: 'text',
                    text: 'Данные пользователя успешно сохранены'
                }]
            };
        } catch (error) {
            throw new Error(`Ошибка сохранения: ${error.message}`);
        }
    }
);

// Обработчик удаления элемента
server.tool(
    'delete_item',
    'Delete an item from the database',
    { itemId: z.number() },
    async ({ itemId }) => {
        try {
            const item = await getItem(itemId);
            if (!item) {
                throw new Error('Элемент не найден');
            }
            
            // Проверка прав доступа
            if (!hasDeletePermission(item)) {
                throw new Error('Недостаточно прав для удаления');
            }
            
            await deleteItem(itemId);
            
            return {
                content: [{
                    type: 'text',
                    text: `Элемент ${itemId} успешно удален`
                }]
            };
        } catch (error) {
            throw new Error(`Ошибка удаления: ${error.message}`);
        }
    }
);
```

#### Обработка ответов в компоненте

```javascript
// Обработчик ответов от MCP сервера
window.addEventListener('message', (event) => {
    if (event.data.type === 'mcp_response') {
        const { tool, success, data, error } = event.data;
        
        switch (tool) {
            case 'save_user_data':
                if (success) {
                    showSuccessNotification('Данные сохранены успешно');
                    refreshUserInterface();
                } else {
                    showErrorNotification(`Ошибка сохранения: ${error}`);
                }
                break;
                
            case 'delete_item':
                if (success) {
                    showSuccessNotification('Элемент удален');
                    removeItemFromUI(data.itemId);
                } else {
                    showErrorNotification(`Ошибка удаления: ${error}`);
                }
                break;
                
            default:
                console.log('Неизвестный ответ от MCP:', event.data);
        }
    }
});

// Функции уведомлений
function showSuccessNotification(message) {
    const notification = createNotification(message, 'success');
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showErrorNotification(message) {
    const notification = createNotification(message, 'error');
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '✅' : '❌'}
            </span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;
    
    // Обработчик закрытия
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    return notification;
}
```

## 🎨 Стилизация и темы

### Система дизайна

#### Цветовая палитра

```css
:root {
    /* Основные цвета */
    --primary-color: #667eea;
    --primary-hover: #5a67d8;
    --secondary-color: #764ba2;
    
    /* Цвета состояний */
    --success-color: #48bb78;
    --warning-color: #ed8936;
    --error-color: #f56565;
    --info-color: #3182ce;
    
    /* Нейтральные цвета */
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    
    /* Текст */
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --text-tertiary: #718096;
    
    /* Фоны */
    --background-primary: #ffffff;
    --background-secondary: #f8f9fa;
    --background-tertiary: #e9ecef;
    
    /* Границы */
    --border-color: #e2e8f0;
    --border-color-hover: #cbd5e0;
    
    /* Тени */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    
    /* Радиусы */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    
    /* Отступы */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
    
    /* Переходы */
    --transition-fast: 0.15s ease;
    --transition-base: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

#### Темная тема

```css
.dark-theme {
    /* Основные цвета (остаются яркими) */
    --primary-color: #9f7aea;
    --primary-hover: #805ad5;
    
    /* Фоны */
    --background-primary: #1a1a1a;
    --background-secondary: #2d2d2d;
    --background-tertiary: #404040;
    
    /* Текст */
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    --text-tertiary: #808080;
    
    /* Границы */
    --border-color: #404040;
    --border-color-hover: #525252;
    
    /* Карточки и компоненты */
    --card-background: var(--background-secondary);
    --widget-background: var(--background-secondary);
}

/* Автоматическое переключение по системным настройкам */
@media (prefers-color-scheme: dark) {
    :root {
        /* Применение темной темы по умолчанию */
    }
}
```

#### Утилитарные классы

```css
/* Отступы */
.m-0 { margin: 0; }
.m-1 { margin: var(--spacing-xs); }
.m-2 { margin: var(--spacing-sm); }
.m-3 { margin: var(--spacing-md); }
.m-4 { margin: var(--spacing-lg); }

.p-0 { padding: 0; }
.p-1 { padding: var(--spacing-xs); }
.p-2 { padding: var(--spacing-sm); }
.p-3 { padding: var(--spacing-md); }
.p-4 { padding: var(--spacing-lg); }

/* Текст */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-success { color: var(--success-color); }
.text-warning { color: var(--warning-color); }
.text-error { color: var(--error-color); }

/* Фоны */
.bg-primary { background-color: var(--primary-color); }
.bg-secondary { background-color: var(--secondary-color); }
.bg-success { background-color: var(--success-color); }
.bg-warning { background-color: var(--warning-color); }
.bg-error { background-color: var(--error-color); }

/* Flexbox */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

/* Grid */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.gap-1 { gap: var(--spacing-xs); }
.gap-2 { gap: var(--spacing-sm); }
.gap-3 { gap: var(--spacing-md); }

/* Границы */
.border { border: 1px solid var(--border-color); }
.border-t { border-top: 1px solid var(--border-color); }
.border-b { border-bottom: 1px solid var(--border-color); }
.rounded { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }

/* Тени */
.shadow { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }
.shadow-xl { box-shadow: var(--shadow-xl); }

/* Переходы */
.transition { transition: all var(--transition-base); }
.transition-fast { transition: all var(--transition-fast); }
```

## 📋 Примеры интеграции

### Полный пример MCP сервера с UI компонентами

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createHtmlResource } from '@mcp-ui/server';
import { z } from 'zod';

export class UIExampleServer {
    server = new McpServer({
        name: 'UI Example Server',
        version: '1.0.0',
    });

    async init() {
        // Регистрация всех UI инструментов
        this.registerGalleryTool();
        this.registerDashboardTool();
        this.registerFormTool();
        this.registerTableTool();
        
        // Регистрация обработчиков данных
        this.registerDataHandlers();
    }

    private registerGalleryTool() {
        this.server.tool(
            'show_ui_gallery',
            'Display gallery of available UI components',
            async () => {
                const galleryHtml = this.generateGalleryHTML();
                
                const resourceBlock = createHtmlResource({
                    uri: `ui://gallery/${Date.now()}`,
                    content: { type: 'rawHtml', htmlString: galleryHtml },
                    delivery: 'text',
                });

                return { content: [resourceBlock] };
            },
        );
    }

    private registerDashboardTool() {
        this.server.tool(
            'show_dashboard',
            'Display analytics dashboard',
            { 
                type: z.string().optional(),
                dateRange: z.string().optional()
            },
            async ({ type = 'default', dateRange = '30d' }) => {
                const dashboardData = await this.getDashboardData(dateRange);
                const dashboardHtml = this.generateDashboardHTML(type, dashboardData);
                
                const resourceBlock = createHtmlResource({
                    uri: `ui://dashboard/${Date.now()}`,
                    content: { type: 'rawHtml', htmlString: dashboardHtml },
                    delivery: 'text',
                });

                return { content: [resourceBlock] };
            },
        );
    }

    private registerFormTool() {
        this.server.tool(
            'create_user_form',
            'Create a user registration form',
            { 
                userId: z.number().optional(),
                template: z.string().optional()
            },
            async ({ userId, template = 'standard' }) => {
                const userData = userId ? await this.getUserData(userId) : {};
                const schema = this.getUserFormSchema(template);
                const formHtml = this.generateFormHTML(schema, userData);
                
                const resourceBlock = createHtmlResource({
                    uri: `ui://form/user/${userId || 'new'}`,
                    content: { type: 'rawHtml', htmlString: formHtml },
                    delivery: 'text',
                });

                return { content: [resourceBlock] };
            },
        );
    }

    private registerTableTool() {
        this.server.tool(
            'show_data_table',
            'Display data in a sortable table',
            { 
                entity: z.string(),
                filters: z.record(z.any()).optional(),
                page: z.number().optional(),
                limit: z.number().optional()
            },
            async ({ entity, filters = {}, page = 1, limit = 10 }) => {
                const tableData = await this.getTableData(entity, filters, page, limit);
                const tableHtml = this.generateTableHTML(entity, tableData);
                
                const resourceBlock = createHtmlResource({
                    uri: `ui://table/${entity}/${Date.now()}`,
                    content: { type: 'rawHtml', htmlString: tableHtml },
                    delivery: 'text',
                });

                return { content: [resourceBlock] };
            },
        );
    }

    private registerDataHandlers() {
        // Сохранение данных формы
        this.server.tool(
            'save_form_data',
            'Save form data to database',
            {
                entity: z.string(),
                data: z.record(z.any()),
                validate: z.boolean().optional()
            },
            async ({ entity, data, validate = true }) => {
                try {
                    if (validate) {
                        const validation = await this.validateEntityData(entity, data);
                        if (!validation.valid) {
                            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
                        }
                    }

                    const result = await this.saveEntityData(entity, data);
                    
                    return {
                        content: [{
                            type: 'text',
                            text: `Data saved successfully. ID: ${result.id}`
                        }]
                    };
                } catch (error) {
                    throw new Error(`Save failed: ${error.message}`);
                }
            }
        );

        // Удаление записи
        this.server.tool(
            'delete_record',
            'Delete a record from database',
            {
                entity: z.string(),
                id: z.number()
            },
            async ({ entity, id }) => {
                try {
                    await this.deleteEntityRecord(entity, id);
                    
                    return {
                        content: [{
                            type: 'text',
                            text: `Record ${id} deleted successfully`
                        }]
                    };
                } catch (error) {
                    throw new Error(`Delete failed: ${error.message}`);
                }
            }
        );
    }

    // Вспомогательные методы для генерации HTML
    private generateGalleryHTML(): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>UI Gallery</title>
                <style>${this.getCommonStyles()}</style>
            </head>
            <body>
                ${this.getGalleryContent()}
                <script>${this.getGalleryScript()}</script>
            </body>
            </html>
        `;
    }

    private generateDashboardHTML(type: string, data: any): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Dashboard</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <style>${this.getCommonStyles()}</style>
            </head>
            <body>
                ${this.getDashboardContent(type, data)}
                <script>${this.getDashboardScript(data)}</script>
            </body>
            </html>
        `;
    }

    private generateFormHTML(schema: any, data: any): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Form</title>
                <style>${this.getCommonStyles()}</style>
            </head>
            <body>
                ${this.getFormContent(schema, data)}
                <script>${this.getFormScript(schema)}</script>
            </body>
            </html>
        `;
    }

    // Методы для работы с данными
    private async getDashboardData(dateRange: string) {
        // Здесь будет логика получения данных для дашборда
        return {
            metrics: {
                users: 1234,
                revenue: 2150000,
                conversion: 12.5
            },
            chartData: {
                sales: [120, 190, 300, 500, 200, 300, 450],
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл']
            }
        };
    }

    private async getUserData(userId: number) {
        // Получение данных пользователя из базы
        return {
            id: userId,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user'
        };
    }

    private getUserFormSchema(template: string) {
        const schemas = {
            standard: {
                name: 'user_form',
                properties: {
                    name: { type: 'string', title: 'Имя', required: true },
                    email: { type: 'string', format: 'email', title: 'Email', required: true },
                    age: { type: 'number', title: 'Возраст', minimum: 18, maximum: 120 },
                    role: { type: 'string', enum: ['admin', 'user', 'guest'], title: 'Роль' }
                }
            },
            extended: {
                name: 'user_form_extended',
                properties: {
                    // Расширенная схема с дополнительными полями
                }
            }
        };

        return schemas[template] || schemas.standard;
    }

    private getCommonStyles(): string {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            /* Дополнительные стили... */
        `;
    }

    // Дополнительные методы...
}
```

### Использование в React приложении

```tsx
import React, { useState } from 'react';
import { HtmlResource } from '@mcp-ui/client';

interface MCPUIIntegrationProps {
    mcpClient: any; // Ваш MCP клиент
}

export const MCPUIIntegration: React.FC<MCPUIIntegrationProps> = ({ mcpClient }) => {
    const [currentResource, setCurrentResource] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUIAction = async (tool: string, params: Record<string, unknown>) => {
        try {
            setLoading(true);
            
            // Вызов MCP инструмента
            const response = await mcpClient.callTool(tool, params);
            
            if (response.content && response.content[0]?.type === 'resource') {
                setCurrentResource(response.content[0]);
            }
            
            return { status: 'success', data: response };
        } catch (error) {
            console.error('MCP tool call failed:', error);
            return { status: 'error', error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const loadGallery = async () => {
        await handleUIAction('show_ui_gallery', {});
    };

    const loadDashboard = async () => {
        await handleUIAction('show_dashboard', { type: 'analytics' });
    };

    const createUserForm = async () => {
        await handleUIAction('create_user_form', { template: 'standard' });
    };

    return (
        <div className="mcp-ui-integration">
            <div className="toolbar">
                <button onClick={loadGallery} disabled={loading}>
                    🎨 Галерея
                </button>
                <button onClick={loadDashboard} disabled={loading}>
                    📊 Дашборд
                </button>
                <button onClick={createUserForm} disabled={loading}>
                    📝 Форма
                </button>
            </div>

            {loading && (
                <div className="loading">
                    <div className="spinner">⏳</div>
                    <p>Загрузка компонента...</p>
                </div>
            )}

            {currentResource && (
                <div className="ui-component-container">
                    <HtmlResource
                        resource={currentResource.resource}
                        onUiAction={handleUIAction}
                        renderMode="secure" // Используем безопасный режим
                        style={{ 
                            width: '100%', 
                            minHeight: '600px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

// Стили для интеграции
const styles = `
.mcp-ui-integration {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.toolbar button {
    background: #667eea;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.toolbar button:hover:not(:disabled) {
    background: #5a67d8;
}

.toolbar button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.loading {
    text-align: center;
    padding: 40px;
}

.spinner {
    font-size: 2em;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.ui-component-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
}
`;
```

## 🔧 Заключение

Справочник компонентов MCP UI SDK предоставляет полное описание архитектуры, компонентов и паттернов использования. Основные преимущества системы:

1. **Модульность** - каждый компонент независим и переиспользуем
2. **Безопасность** - все HTML контент санитизируется
3. **Гибкость** - легкая настройка и расширение компонентов
4. **Интерактивность** - полная поддержка событий и двустороннего взаимодействия
5. **Современный дизайн** - адаптивная верстка и современные UI паттерны

Используйте этот справочник как отправную точку для создания собственных UI компонентов в экосистеме Model Context Protocol.