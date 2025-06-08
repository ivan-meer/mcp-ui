import React from 'react';

export const StatusBar: React.FC = () => {
  return (
    <footer className="bg-card border-t border-base px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Status indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-secondary font-medium">Система активна</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-muted">MCP v2024.11</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-muted">Безопасное соединение</span>
          </div>
        </div>

        {/* Right side - Performance metrics */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-muted">CPU 75%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span className="text-muted">32ms</span>
          </div>
          
          <div className="text-muted">
            © 2024 MCP UI
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;