import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createRequestHandler } from 'react-router';
import { createHtmlResource } from '@mcp-ui/server';

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
  server = new McpServer({
    name: 'MCP UI Example',
    version: '1.0.0',
  });

  async init() {
    const requestUrl = this.props.requestUrl as string;
    const url = new URL(requestUrl);
    const requestHost = url.host;

    this.server.tool(
      'get_tasks_status',
      'Get a textual representation of the status of all tasks',
      async () => {
        const todayData = {
          alice: { remaining: 12, toDo: 5, inProgress: 4, blocked: 3 },
          bob: { remaining: 18, toDo: 11, inProgress: 4, blocked: 3 },
          charlie: { remaining: 14, toDo: 6, inProgress: 5, blocked: 3 },
        };

        // Full sprint data for weekly summary
        const sprintDataFull = [
          {
            date: '5/10',
            alice: { remaining: 8, toDo: 3, inProgress: 3, blocked: 2 },
            bob: { remaining: 7, toDo: 2, inProgress: 3, blocked: 2 },
            charlie: { remaining: 9, toDo: 4, inProgress: 3, blocked: 2 },
          },
          {
            date: '5/11',
            alice: { remaining: 7, toDo: 2, inProgress: 3, blocked: 2 },
            bob: { remaining: 6, toDo: 2, inProgress: 2, blocked: 2 },
            charlie: { remaining: 8, toDo: 3, inProgress: 3, blocked: 2 },
          },
          {
            date: '5/12',
            alice: { remaining: 9, toDo: 3, inProgress: 4, blocked: 2 },
            bob: { remaining: 8, toDo: 3, inProgress: 3, blocked: 2 },
            charlie: { remaining: 10, toDo: 4, inProgress: 4, blocked: 2 },
          },
          {
            date: '5/13',
            alice: { remaining: 6, toDo: 1, inProgress: 2, blocked: 3 },
            bob: { remaining: 9, toDo: 3, inProgress: 3, blocked: 3 },
            charlie: { remaining: 11, toDo: 5, inProgress: 3, blocked: 3 },
          },
          {
            date: '5/14',
            alice: { remaining: 10, toDo: 4, inProgress: 3, blocked: 3 },
            bob: { remaining: 9, toDo: 3, inProgress: 3, blocked: 3 },
            charlie: { remaining: 12, toDo: 5, inProgress: 4, blocked: 3 },
          },
          {
            date: '5/15',
            alice: { remaining: 11, toDo: 4, inProgress: 4, blocked: 3 },
            bob: { remaining: 10, toDo: 3, inProgress: 4, blocked: 3 },
            charlie: { remaining: 13, toDo: 6, inProgress: 4, blocked: 3 },
          },
          {
            date: '5/16',
            alice: { remaining: 12, toDo: 5, inProgress: 4, blocked: 3 },
            bob: { remaining: 11, toDo: 4, inProgress: 4, blocked: 3 },
            charlie: { remaining: 14, toDo: 6, inProgress: 5, blocked: 3 },
          },
        ];
        const teamMembers = ['alice', 'bob', 'charlie'];

        let statusText = "Today's Task Status:\n\n";

        statusText += 'Alice:\n';
        statusText += `  To Do: ${todayData.alice.toDo}\n`;
        statusText += `  In Progress: ${todayData.alice.inProgress}\n`;
        statusText += `  Blocked: ${todayData.alice.blocked}\n`;
        statusText += `  Remaining: ${todayData.alice.remaining}\n\n`;

        statusText += 'Bob:\n';
        statusText += `  To Do: ${todayData.bob.toDo}\n`;
        statusText += `  In Progress: ${todayData.bob.inProgress}\n`;
        statusText += `  Blocked: ${todayData.bob.blocked}\n`;
        statusText += `  Remaining: ${todayData.bob.remaining}\n\n`;

        statusText += 'Charlie:\n';
        statusText += `  To Do: ${todayData.charlie.toDo}\n`;
        statusText += `  In Progress: ${todayData.charlie.inProgress}\n`;
        statusText += `  Blocked: ${todayData.charlie.blocked}\n`;
        statusText += `  Remaining: ${todayData.charlie.remaining}\n`;

        // Calculate weekly totals
        let weeklyTotalToDo = 0;
        let weeklyTotalInProgress = 0;
        let weeklyTotalBlocked = 0;

        sprintDataFull.forEach((day) => {
          teamMembers.forEach((member) => {
            // @ts-expect-error - member is a string, but it's used as an index type for day
            weeklyTotalToDo += day[member]?.toDo || 0;
            // @ts-expect-error - member is a string, but it's used as an index type for day
            weeklyTotalInProgress += day[member]?.inProgress || 0;
            // @ts-expect-error - member is a string, but it's used as an index type for day
            weeklyTotalBlocked += day[member]?.blocked || 0;
          });
        });

        statusText += '\n\nSummary for the past week:\n';
        statusText += `Total tasks To Do: ${weeklyTotalToDo}\n`;
        statusText += `Total tasks In Progress: ${weeklyTotalInProgress}\n`;
        statusText += `Total tasks Blocked: ${weeklyTotalBlocked}\n`;

        return {
          content: [{ type: 'text', text: statusText }],
        };
      },
    );

    this.server.tool(
      'nudge_team_member',
      { name: z.string() },
      async ({ name }) => ({
        content: [{ type: 'text', text: 'Nudged ' + name + '!' }],
      }),
    );

    this.server.tool(
      'show_task_status',
      'Displays a UI for the user to see the status of tasks',
      async () => {
        const scheme =
          requestHost.includes('localhost') || requestHost.includes('127.0.0.1')
            ? 'http'
            : 'https';

        const pickerPageUrl = `${scheme}://${requestHost}/task`;

        // Generate a unique URI for this specific invocation of the file picker UI.
        // This URI identifies the resource block itself, not the content of the iframe.
        const uniqueUiAppUri = `ui-app://task-manager/${Date.now()}`;
        const resourceBlock = createHtmlResource({
          uri: uniqueUiAppUri,
          content: { type: 'externalUrl', iframeUrl: pickerPageUrl },
          delivery: 'text', // The URL itself is delivered as text
        });

        return {
          content: [resourceBlock],
        };
      },
    );
    this.server.tool(
      'show_user_status',
      'Displays a UI for the user to see the status of a user and their tasks',
      { id: z.string(), name: z.string(), avatarUrl: z.string() },
      async ({ id, name, avatarUrl }) => {
        const scheme =
          requestHost.includes('localhost') || requestHost.includes('127.0.0.1')
            ? 'http'
            : 'https';

        const pickerPageUrl = `${scheme}://${requestHost}/user?id=${id}&name=${name}&avatarUrl=${avatarUrl}`;

        // Generate a unique URI for this specific invocation of the file picker UI.
        // This URI identifies the resource block itself, not the content of the iframe.
        const uniqueUiAppUri = `ui-app://user-profile/${Date.now()}`;
        const resourceBlock = createHtmlResource({
          uri: uniqueUiAppUri,
          content: { type: 'externalUrl', iframeUrl: pickerPageUrl },
          delivery: 'text', // The URL itself is delivered as text
        });

        return {
          content: [resourceBlock],
        };
      },
    );

    // Демонстрационные инструменты для различных типов UI
    this.server.tool(
      'show_ui_gallery',
      'Displays a gallery of different UI component examples',
      async () => {
        const galleryHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP UI Gallery</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #4a5568;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
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
        .card h3 {
            color: #2d3748;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .card p {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background 0.3s ease;
        }
        .btn:hover { background: #5a67d8; }
        .demo-element {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #667eea;
            width: 65%;
            animation: progress 2s ease-in-out infinite alternate;
        }
        @keyframes progress {
            0% { width: 30%; }
            100% { width: 85%; }
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .metric:last-child { border-bottom: none; }
        .metric-value {
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 MCP UI Gallery</h1>
            <p>Интерактивные компоненты для Model Context Protocol</p>
        </div>
        
        <div class="gallery">
            <div class="card" data-tool="show_dashboard" data-params='{"type":"analytics"}'>
                <h3>📊 Аналитическая панель</h3>
                <p>Интерактивные графики и метрики для отображения данных</p>
                <div class="demo-element">
                    <div class="metric">
                        <span>Активные пользователи</span>
                        <span class="metric-value">1,234</span>
                    </div>
                    <div class="metric">
                        <span>Конверсия</span>
                        <span class="metric-value">12.5%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
                <button class="btn">Открыть панель</button>
            </div>

            <div class="card" data-tool="show_form_generator" data-params='{"schema":"user_profile"}'>
                <h3>📝 Генератор форм</h3>
                <p>Динамическое создание форм на основе JSON Schema</p>
                <div class="demo-element">
                    <input type="text" placeholder="Имя пользователя" style="width:100%;padding:8px;margin:5px 0;border:1px solid #ddd;border-radius:4px;">
                    <select style="width:100%;padding:8px;margin:5px 0;border:1px solid #ddd;border-radius:4px;">
                        <option>Выберите роль</option>
                        <option>Администратор</option>
                        <option>Пользователь</option>
                    </select>
                </div>
                <button class="btn">Создать форму</button>
            </div>

            <div class="card" data-tool="show_data_table" data-params='{"dataset":"users"}'>
                <h3>📋 Таблица данных</h3>
                <p>Интерактивная таблица с сортировкой и фильтрацией</p>
                <div class="demo-element">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr style="background:#f8f9fa;">
                            <th style="text-align:left;padding:8px;border:1px solid #ddd;">ID</th>
                            <th style="text-align:left;padding:8px;border:1px solid #ddd;">Имя</th>
                            <th style="text-align:left;padding:8px;border:1px solid #ddd;">Статус</th>
                        </tr>
                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;">001</td>
                            <td style="padding:8px;border:1px solid #ddd;">Alice</td>
                            <td style="padding:8px;border:1px solid #ddd;">🟢 Активен</td>
                        </tr>
                    </table>
                </div>
                <button class="btn">Открыть таблицу</button>
            </div>

            <div class="card" data-tool="show_calendar" data-params='{"view":"month"}'>
                <h3>📅 Календарь событий</h3>
                <p>Календарный интерфейс для планирования и отображения событий</p>
                <div class="demo-element">
                    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;font-size:0.8em;">
                        <div style="text-align:center;font-weight:bold;padding:4px;">Пн</div>
                        <div style="text-align:center;font-weight:bold;padding:4px;">Вт</div>
                        <div style="text-align:center;font-weight:bold;padding:4px;">Ср</div>
                        <div style="text-align:center;font-weight:bold;padding:4px;">Чт</div>
                        <div style="text-align:center;font-weight:bold;padding:4px;">Пт</div>
                        <div style="text-align:center;font-weight:bold;padding:4px;">Сб</div>
                        <div style="text-align:center;font-weight:bold;padding:4px;">Вс</div>
                        <div style="text-align:center;padding:4px;background:#667eea;color:white;border-radius:2px;">15</div>
                        <div style="text-align:center;padding:4px;">16</div>
                        <div style="text-align:center;padding:4px;">17</div>
                        <div style="text-align:center;padding:4px;">18</div>
                        <div style="text-align:center;padding:4px;">19</div>
                        <div style="text-align:center;padding:4px;">20</div>
                        <div style="text-align:center;padding:4px;">21</div>
                    </div>
                </div>
                <button class="btn">Открыть календарь</button>
            </div>

            <div class="card" data-tool="show_chat_interface" data-params='{"theme":"modern"}'>
                <h3>💬 Чат интерфейс</h3>
                <p>Встроенный чат для взаимодействия с агентами</p>
                <div class="demo-element">
                    <div style="background:#f8f9fa;padding:10px;border-radius:8px;margin:5px 0;">
                        <div style="font-size:0.8em;color:#666;">Агент</div>
                        <div>Привет! Как дела?</div>
                    </div>
                    <div style="background:#667eea;color:white;padding:10px;border-radius:8px;margin:5px 0;text-align:right;">
                        <div style="font-size:0.8em;opacity:0.8;">Вы</div>
                        <div>Отлично, спасибо!</div>
                    </div>
                </div>
                <button class="btn">Открыть чат</button>
            </div>

            <div class="card" data-tool="show_file_manager" data-params='{"path":"/"}'>
                <h3>📁 Файловый менеджер</h3>
                <p>Интерфейс для работы с файлами и папками</p>
                <div class="demo-element">
                    <div style="display:flex;align-items:center;padding:5px 0;border-bottom:1px solid #eee;">
                        <span style="margin-right:10px;">📂</span>
                        <span>Documents</span>
                    </div>
                    <div style="display:flex;align-items:center;padding:5px 0;border-bottom:1px solid #eee;">
                        <span style="margin-right:10px;">📄</span>
                        <span>report.pdf</span>
                    </div>
                    <div style="display:flex;align-items:center;padding:5px 0;">
                        <span style="margin-right:10px;">🖼️</span>
                        <span>image.png</span>
                    </div>
                </div>
                <button class="btn">Открыть менеджер</button>
            </div>
        </div>
    </div>

    <script>
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const tool = card.getAttribute('data-tool');
                const params = JSON.parse(card.getAttribute('data-params') || '{}');
                
                // Отправляем сообщение родительскому окну (MCP клиенту)
                if (window.parent !== window) {
                    window.parent.postMessage({
                        tool: tool,
                        params: params
                    }, '*');
                } else {
                    alert(\`Инструмент: \${tool}\\nПараметры: \${JSON.stringify(params, null, 2)}\`);
                }
            });
        });
    </script>
</body>
</html>`;

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

    this.server.tool(
      'show_dashboard',
      'Displays an analytics dashboard with interactive charts',
      { type: z.string().optional() },
      async ({ type = 'default' }) => {
        const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            padding: 20px;
        }
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .widget {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .widget h3 {
            color: #2d3748;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .metric:last-child { border-bottom: none; }
        .metric-value {
            font-weight: bold;
            font-size: 1.1em;
            color: #667eea;
        }
        .chart-container {
            position: relative;
            height: 300px;
            margin-top: 15px;
        }
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
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            margin: 5px;
            transition: background 0.3s ease;
        }
        .btn:hover { background: #5a67d8; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="widget">
            <h3>📊 Ключевые метрики</h3>
            <div class="metric">
                <span>Активные пользователи</span>
                <span class="metric-value">1,234</span>
            </div>
            <div class="metric">
                <span>Конверсия</span>
                <span class="metric-value">12.5%</span>
            </div>
            <div class="metric">
                <span>Доход (₽)</span>
                <span class="metric-value">2,150,000</span>
            </div>
            <div class="metric">
                <span>Средний чек (₽)</span>
                <span class="metric-value">1,750</span>
            </div>
        </div>

        <div class="widget">
            <h3>📈 График продаж</h3>
            <div class="chart-container">
                <canvas id="salesChart"></canvas>
            </div>
        </div>

        <div class="widget">
            <h3>🌍 География пользователей</h3>
            <div class="chart-container">
                <canvas id="geoChart"></canvas>
            </div>
        </div>

        <div class="widget">
            <h3>⚡ Статус системы</h3>
            <div class="metric">
                <span><span class="status-indicator status-green"></span>API сервер</span>
                <span class="metric-value">Работает</span>
            </div>
            <div class="metric">
                <span><span class="status-indicator status-green"></span>База данных</span>
                <span class="metric-value">Работает</span>
            </div>
            <div class="metric">
                <span><span class="status-indicator status-yellow"></span>Кэш</span>
                <span class="metric-value">Предупреждение</span>
            </div>
            <div class="metric">
                <span><span class="status-indicator status-red"></span>Очередь</span>
                <span class="metric-value">Ошибка</span>
            </div>
            <button class="btn" data-tool="check_system_health">Проверить систему</button>
            <button class="btn" data-tool="restart_services">Перезапустить</button>
        </div>
    </div>

    <script>
        // Инициализация графиков
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

        const geoCtx = document.getElementById('geoChart').getContext('2d');
        new Chart(geoCtx, {
            type: 'doughnut',
            data: {
                labels: ['Россия', 'США', 'Германия', 'Франция', 'Другие'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Обработка кликов по кнопкам
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.getAttribute('data-tool');
                if (window.parent !== window) {
                    window.parent.postMessage({ tool, params: {} }, '*');
                } else {
                    alert(\`Инструмент: \${tool}\`);
                }
            });
        });
    </script>
</body>
</html>`;

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

    this.server.tool(
      'show_form_generator',
      'Generate a dynamic form based on JSON schema',
      { schema: z.string(), data: z.record(z.any()).optional() },
      async ({ schema, data = {} }) => {
        const formHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Form Generator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .form-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .form-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .form-header h1 {
            color: #2d3748;
            font-size: 2em;
            margin-bottom: 10px;
        }
        .form-header p {
            color: #4a5568;
            font-size: 1.1em;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-label {
            display: block;
            margin-bottom: 8px;
            color: #2d3748;
            font-weight: 500;
        }
        .form-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        .form-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .form-select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            background: white;
            cursor: pointer;
        }
        .form-textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            min-height: 100px;
            resize: vertical;
        }
        .form-checkbox {
            margin-right: 8px;
            transform: scale(1.2);
        }
        .checkbox-label {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        .form-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-primary:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: #e2e8f0;
            color: #4a5568;
        }
        .btn-secondary:hover {
            background: #cbd5e0;
        }
        .required {
            color: #f56565;
        }
        .help-text {
            font-size: 14px;
            color: #718096;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="form-header">
            <h1>📝 Генератор форм</h1>
            <p>Схема: ${schema}</p>
        </div>

        <form id="dynamicForm">
            <div class="form-group">
                <label class="form-label">Имя <span class="required">*</span></label>
                <input type="text" class="form-input" name="name" required value="${data.name || ''}">
                <div class="help-text">Введите ваше полное имя</div>
            </div>

            <div class="form-group">
                <label class="form-label">Email <span class="required">*</span></label>
                <input type="email" class="form-input" name="email" required value="${data.email || ''}">
                <div class="help-text">Используется для уведомлений</div>
            </div>

            <div class="form-group">
                <label class="form-label">Возраст</label>
                <input type="number" class="form-input" name="age" min="18" max="120" value="${data.age || ''}">
            </div>

            <div class="form-group">
                <label class="form-label">Роль</label>
                <select class="form-select" name="role">
                    <option value="">Выберите роль</option>
                    <option value="admin" ${data.role === 'admin' ? 'selected' : ''}>Администратор</option>
                    <option value="user" ${data.role === 'user' ? 'selected' : ''}>Пользователь</option>
                    <option value="guest" ${data.role === 'guest' ? 'selected' : ''}>Гость</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">О себе</label>
                <textarea class="form-textarea" name="bio" placeholder="Расскажите немного о себе...">${data.bio || ''}</textarea>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" class="form-checkbox" name="newsletter" ${data.newsletter ? 'checked' : ''}>
                    Подписаться на рассылку
                </label>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" class="form-checkbox" name="terms" required>
                    Я согласен с условиями использования <span class="required">*</span>
                </label>
            </div>

            <div class="form-buttons">
                <button type="button" class="btn btn-secondary" data-tool="cancel_form">Отмена</button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
        </form>
    </div>

    <script>
        document.getElementById('dynamicForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (e.target.elements[key].type === 'checkbox') {
                    data[key] = e.target.elements[key].checked;
                } else {
                    data[key] = value;
                }
            }
            
            if (window.parent !== window) {
                window.parent.postMessage({
                    tool: 'save_form_data',
                    params: { schema: '${schema}', data: data }
                }, '*');
            } else {
                alert('Данные формы:\\n' + JSON.stringify(data, null, 2));
            }
        });

        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.getAttribute('data-tool');
                if (window.parent !== window) {
                    window.parent.postMessage({ tool, params: {} }, '*');
                } else {
                    alert(\`Инструмент: \${tool}\`);
                }
            });
        });
    </script>
</body>
</html>`;

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
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    const url = new URL(request.url);
    ctx.props.requestUrl = request.url;

    if (url.pathname === '/sse' || url.pathname === '/sse/message') {
      return MyMCP.serveSSE('/sse').fetch(request, env, ctx);
    }

    if (url.pathname === '/mcp') {
      return MyMCP.serve('/mcp').fetch(request, env, ctx);
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
    // return new Response("Not found", { status: 404 });
  },
};
