/**
 * 🛠️ SERVER MANAGER PACKAGE
 * 
 * 📚 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА:
 * Система управления MCP серверами - локальными и удаленными.
 * Обеспечивает discovery, подключение, мониторинг и конфигурацию серверов.
 * 
 * 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ:
 * 1. Server Registry - центральный реестр всех доступных серверов
 * 2. Connection Pooling - эффективное управление подключениями
 * 3. Health Monitoring - мониторинг состояния серверов
 * 4. Auto-Discovery - автоматическое обнаружение локальных серверов
 * 5. Configuration Management - сохранение и загрузка настроек
 */

// 📦 CORE EXPORTS
export { ServerManager } from './manager/ServerManager';
export { ServerRegistry } from './registry/ServerRegistry';
export { default as ServerConfigForm } from './ui/ServerConfigForm'; // Added export

// 🎯 TYPE EXPORTS
// Replaced specific type exports with a wildcard export to include all types from './types'
// This ensures ServerConfig, ServerStatus, and ServerTransportType are exported.
export * from './types';

// 🛠️ UTILITY EXPORTS

// 🎨 CONSTANT EXPORTS

/**
 * 🎓 ОБРАЗОВАТЕЛЬНАЯ ЗАМЕТКА - SERVER MANAGEMENT:
 * 
 * 🖥️ **Server Types**:
 * - **Local Servers** - запущенные на том же устройстве
 * - **Remote Servers** - доступные через сеть
 * - **Cloud Servers** - размещенные в облаке
 * - **Development Servers** - для разработки и тестирования
 * 
 * 🔄 **Lifecycle Management**:
 * 1. **Discovery** - поиск доступных серверов
 * 2. **Registration** - добавление в реестр
 * 3. **Connection** - установка подключения
 * 4. **Monitoring** - отслеживание состояния
 * 5. **Cleanup** - очистка при отключении
 * 
 * 🎯 **Design Patterns**:
 * - **Registry Pattern** - центральный реестр серверов
 * - **Observer Pattern** - уведомления о изменениях
 * - **Factory Pattern** - создание подключений
 * - **Pool Pattern** - управление ресурсами
 */

export default {
  ServerManager,
  ServerRegistry,
  ServerConfigForm,
};
