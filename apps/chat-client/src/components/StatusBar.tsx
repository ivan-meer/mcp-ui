import React from 'react';

interface StatusBarProps {
  connectionStatus?: string;
  currentServer?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ connectionStatus, currentServer }) => {
  return (
    <footer className="bg-gray-200 text-sm text-gray-700 p-2 fixed bottom-0 w-full border-t border-gray-300">
      <div className="container mx-auto flex justify-between">
        <span>Status: {connectionStatus || 'Disconnected'}</span>
        <span>Server: {currentServer || 'None'}</span>
      </div>
    </footer>
  );
};

export default StatusBar;
