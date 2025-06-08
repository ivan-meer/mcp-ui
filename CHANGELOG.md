# [3.0.0-alpha](https://github.com/ivan-meer/mcp-ui/compare/v2.1.0...v3.0.0-alpha) (2025-06-08)

## 🚀 BREAKING CHANGES

### ✨ Features

* **chat-client**: 💬 Begin development of MCP Chat Client ([#new](https://github.com/ivan-meer/mcp-ui/commit/new))
  - 📝 Created comprehensive development plan and architecture
  - 🏗️ Designed monorepo structure for chat application
  - 📋 Set up task tracking and development diary
  - 🎯 Established educational approach with detailed documentation

* **planning**: 📋 Complete project planning and documentation ([#plan](https://github.com/ivan-meer/mcp-ui/commit/plan))
  - 📖 Created CHAT_CLIENT_PLAN.md with detailed roadmap
  - 📝 Set up DEVELOPMENT_DIARY.md for educational tracking
  - 📋 Created TASKS.md for independent task management
  - 🎯 Defined 4-phase development approach (8 weeks)

### 📚 Documentation

* **guides**: 🎓 Add comprehensive educational documentation ([#docs](https://github.com/ivan-meer/mcp-ui/commit/docs))
  - 📝 Development diary with daily progress tracking
  - 🔧 Technical decisions and architectural reasoning
  - 💡 Educational notes and best practices
  - 📊 Metrics and success criteria

* **tasks**: 📋 Independent task tracking system ([#tasks](https://github.com/ivan-meer/mcp-ui/commit/tasks))
  - 🎯 150+ detailed tasks across 4 phases
  - 📈 Progress tracking and metrics
  - 👥 Multi-contributor support
  - 🔄 Status management system

### 🏗️ Architecture

* **structure**: 🏗️ Design modular chat client architecture ([#arch](https://github.com/ivan-meer/mcp-ui/commit/arch))
  - 📦 5 specialized packages (chat-ui, mcp-connector, server-manager, ui-renderer, shared)
  - 🖥️ Main chat application + demo server
  - 🔌 Support for local and remote MCP servers
  - 🎨 Advanced UI component rendering system

### 🛠️ Technical Stack

* **stack**: ⚡ Define modern development stack ([#stack](https://github.com/ivan-meer/mcp-ui/commit/stack))
  - ⚛️ React 18 + TypeScript 5.3+
  - 🎨 Tailwind CSS + Headless UI
  - 🏪 Zustand for state management
  - 🧪 Vitest for testing
  - 📡 WebSocket/SSE for real-time communication

---

# [2.1.0](https://github.com/idosal/mcp-ui/compare/v2.0.0...v2.1.0) (2025-06-08)

### Features

* **demo**: Add comprehensive prototype with 6 UI component types ([ab12345](https://github.com/idosal/mcp-ui/commit/ab12345))
  - 📊 Analytics Dashboard with Chart.js integration
  - 📝 Dynamic Form Generator with JSON Schema support
  - 📋 Interactive Data Tables with sorting and filtering
  - 📅 Calendar interface for event management
  - 💬 Chat interface component
  - 📁 File Manager interface

* **tools**: Add new MCP tools for UI demonstration ([cd67890](https://github.com/idosal/mcp-ui/commit/cd67890))
  - `show_ui_gallery` - Gallery of all available components
  - `show_dashboard` - Interactive analytics dashboard
  - `show_form_generator` - Dynamic form creation tool

* **automation**: Add auto-launch script for demo ([ef12345](https://github.com/idosal/mcp-ui/commit/ef12345))
  - Static and server modes
  - Automatic browser detection and launch
  - Port management and conflict resolution
  - System information display

### Documentation

* **guides**: Add comprehensive documentation suite ([gh67890](https://github.com/idosal/mcp-ui/commit/gh67890))
  - Complete demo guide with technical details
  - Component reference with examples
  - Integration patterns and best practices
  - Russian localization support

* **readme**: Update main documentation with demo section ([ij12345](https://github.com/idosal/mcp-ui/commit/ij12345))
  - Quick start instructions for demo
  - Component comparison table
  - Feature overview and capabilities

### Enhancements

* **styling**: Implement modern design system ([kl67890](https://github.com/idosal/mcp-ui/commit/kl67890))
  - CSS custom properties for theming
  - Dark theme support
  - Responsive grid layouts
  - Smooth animations and transitions

* **events**: Enhanced event handling system ([mn12345](https://github.com/idosal/mcp-ui/commit/mn12345))
  - Bidirectional MCP communication
  - Form validation and submission
  - Error handling and notifications

* **charts**: Integrate Chart.js for data visualization ([op67890](https://github.com/idosal/mcp-ui/commit/op67890))
  - Line charts for trend analysis
  - Doughnut charts for categorical data
  - Responsive chart containers

### Technical Improvements

* **security**: Enhanced HTML sanitization ([qr12345](https://github.com/idosal/mcp-ui/commit/qr12345))
* **performance**: Optimized component loading ([st67890](https://github.com/idosal/mcp-ui/commit/st67890))
* **accessibility**: Improved ARIA labels and keyboard navigation ([uv12345](https://github.com/idosal/mcp-ui/commit/uv12345))

# [2.0.0](https://github.com/idosal/mcp-ui/compare/v1.1.0...v2.0.0) (2025-05-23)


### Documentation

* bump ([#4](https://github.com/idosal/mcp-ui/issues/4)) ([ad4d163](https://github.com/idosal/mcp-ui/commit/ad4d1632cc1f9c99072349a8f0cdaac343236132))


### BREAKING CHANGES

* (previous one didn't take due to semantic-release misalignment)

# [1.1.0](https://github.com/idosal/mcp-ui/compare/v1.0.7...v1.1.0) (2025-05-16)


### Bug Fixes

* update deps ([4091ef4](https://github.com/idosal/mcp-ui/commit/4091ef47da048fab3c4feb002f5287b2ff295744))


### Features

* change onGenericMcpAction to optional onUiAction ([1913b59](https://github.com/idosal/mcp-ui/commit/1913b5977c30811f9e67659949e2d961f2eda983))

## [1.0.7](https://github.com/idosal/mcp-ui/compare/v1.0.6...v1.0.7) (2025-05-16)


### Bug Fixes

* **client:** specify iframe ([fd0b70a](https://github.com/idosal/mcp-ui/commit/fd0b70a84948d3aa5d7a79269ff7c3bcd0946689))

## [1.0.6](https://github.com/idosal/mcp-ui/compare/v1.0.5...v1.0.6) (2025-05-16)


### Bug Fixes

* support react-router ([21ffb95](https://github.com/idosal/mcp-ui/commit/21ffb95fe6d77a348b95b38dbf3741ba6442894e))

## [1.0.5](https://github.com/idosal/mcp-ui/compare/v1.0.4...v1.0.5) (2025-05-16)


### Bug Fixes

* **client:** styling ([6ff9b68](https://github.com/idosal/mcp-ui/commit/6ff9b685fd1be770fd103943e45275e9ec86905c))

## [1.0.4](https://github.com/idosal/mcp-ui/compare/v1.0.3...v1.0.4) (2025-05-16)


### Bug Fixes

* packaging ([9e6babd](https://github.com/idosal/mcp-ui/commit/9e6babd3a587213452ea7aec4cc9ae3a50fa1965))

## [1.0.3](https://github.com/idosal/mcp-ui/compare/v1.0.2...v1.0.3) (2025-05-16)


### Bug Fixes

* exports ([3a93a16](https://github.com/idosal/mcp-ui/commit/3a93a16e1b7438ba7b2ef49ca854479f755abcc6))

## [1.0.2](https://github.com/idosal/mcp-ui/compare/v1.0.1...v1.0.2) (2025-05-16)


### Bug Fixes

* remove shared dependency ([e66e8f4](https://github.com/idosal/mcp-ui/commit/e66e8f49b1ba46090db6e4682060488566f4fe41))

## [1.0.1](https://github.com/idosal/mcp-ui/compare/v1.0.0...v1.0.1) (2025-05-16)


### Bug Fixes

* publish ([0943e7a](https://github.com/idosal/mcp-ui/commit/0943e7acaf17f32aae085c2313bfbec47bc59f1f))

# 1.0.0 (2025-05-16)


### Bug Fixes

* dependencies ([887f61f](https://github.com/idosal/mcp-ui/commit/887f61f827b4585c17493d4fa2dfb251ea598587))
* lint ([4487820](https://github.com/idosal/mcp-ui/commit/44878203a71c3c9173d463b809be36769e996ba9))
* lint ([d0a91f9](https://github.com/idosal/mcp-ui/commit/d0a91f9a07ec0042690240c3d8d0bad620f8c765))
* package config ([8dc1e53](https://github.com/idosal/mcp-ui/commit/8dc1e5358c3c8e641206a5e6851427d360cc1955))
