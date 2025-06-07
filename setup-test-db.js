#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Создаем простую SQLite базу данных в виде SQL файла
const dbPath = '/tmp/mcp_test.sql';

const sqlContent = `
-- Test database for MCP UI development
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  github_username TEXT,
  role TEXT DEFAULT 'developer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, github_username, role) VALUES 
  ('John Doe', 'john@example.com', 'johndoe', 'admin'),
  ('Jane Smith', 'jane@example.com', 'janesmith', 'developer'),
  ('Bob Johnson', 'bob@example.com', 'bobjohnson', 'designer'),
  ('Alice Brown', 'alice@example.com', 'alicebrown', 'developer');

-- Projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  owner_id INTEGER,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

INSERT INTO projects (name, description, repository_url, owner_id, status) VALUES
  ('mcp-ui', 'UI components for Model Context Protocol', 'https://github.com/idosal/mcp-ui', 1, 'active'),
  ('awesome-mcp-server', 'Collection of MCP servers', 'https://github.com/example/awesome-mcp', 2, 'active'),
  ('mcp-database-connector', 'Database integration for MCP', 'https://github.com/example/mcp-db', 3, 'development'),
  ('mcp-file-manager', 'File management through MCP', 'https://github.com/example/mcp-files', 4, 'planning');

-- Issues table
CREATE TABLE issues (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assignee_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assignee_id) REFERENCES users(id)
);

INSERT INTO issues (project_id, title, description, status, priority, assignee_id) VALUES
  (1, 'Add dark theme support', 'Implement dark mode for all UI components', 'open', 'high', 2),
  (1, 'Create data visualization components', 'Build charts and graphs components', 'in_progress', 'medium', 1),
  (1, 'Improve TypeScript types', 'Add better type definitions', 'open', 'low', 3),
  (2, 'Document installation process', 'Create comprehensive setup guide', 'completed', 'medium', 4),
  (3, 'Add PostgreSQL support', 'Implement PostgreSQL database connector', 'open', 'high', 2);

-- UI Components metadata table
CREATE TABLE ui_components (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  props_schema TEXT, -- JSON schema for component props
  example_data TEXT, -- Example data for testing
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ui_components (name, category, description, props_schema, example_data) VALUES
  ('DataTable', 'data-display', 'Interactive table with sorting and filtering', 
   '{"type":"object","properties":{"data":{"type":"array"},"columns":{"type":"array"}}}',
   '{"data":[{"id":1,"name":"John","age":30}],"columns":["id","name","age"]}'),
  ('Chart', 'visualization', 'Configurable chart component',
   '{"type":"object","properties":{"type":{"enum":["line","bar","pie"]},"data":{"type":"array"}}}',
   '{"type":"line","data":[{"x":"Jan","y":100},{"x":"Feb","y":150}]}'),
  ('FileExplorer', 'navigation', 'File system browser component',
   '{"type":"object","properties":{"rootPath":{"type":"string"},"allowUpload":{"type":"boolean"}}}',
   '{"rootPath":"/home/user","allowUpload":true}'),
  ('JsonViewer', 'data-display', 'Interactive JSON data viewer',
   '{"type":"object","properties":{"data":{"type":"object"},"expandable":{"type":"boolean"}}}',
   '{"data":{"user":{"name":"John","details":{"age":30}}},"expandable":true}');
`;

fs.writeFileSync(dbPath, sqlContent);
console.log(`✅ Test database SQL created at: ${dbPath}`);
console.log('📝 To use with SQLite MCP server, you can import this into a .db file');
console.log('📖 Contents preview:');
console.log('   - 4 users (John, Jane, Bob, Alice)');
console.log('   - 4 projects (mcp-ui, awesome-mcp-server, etc.)');
console.log('   - 5 issues with different priorities');
console.log('   - 4 UI component definitions');