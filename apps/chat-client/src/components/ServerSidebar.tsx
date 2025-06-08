// apps/chat-client/src/components/ServerSidebar.tsx
import React, { useState, useEffect } from 'react';
// Assuming ServerConfig and ServerManager types/instance are passed as props or from context/store
// For this subtask, we'll assume they are passed as props for simplicity.
import { ServerConfig, ServerManager } from '@mcp/server-manager'; // Adjust import path if needed
import ServerConfigForm from '@mcp/server-manager/ui/ServerConfigForm'; // Adjust import path

interface ServerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  serverManager: ServerManager; // Instance of ServerManager
  activeServerId: string | null;
  onSelectServer: (serverId: string) => void;
  onConnectServer: (serverId: string) => void; // Placeholder for actual connect
  onDisconnectServer: (serverId: string) => void; // Placeholder for actual disconnect
}

const ServerStatusIndicator: React.FC<{ status?: string }> = ({ status }) => {
  let bgColor = 'bg-gray-400'; // Default for unknown or disconnected
  if (status === 'connected') bgColor = 'bg-green-500';
  else if (status === 'connecting') bgColor = 'bg-yellow-500';
  else if (status === 'error') bgColor = 'bg-red-500';

  return <span className={`inline-block w-3 h-3 ${bgColor} rounded-full mr-2`}></span>;
};

const ServerSidebar: React.FC<ServerSidebarProps> = ({
  isOpen,
  onClose,
  serverManager,
  activeServerId,
  onSelectServer, // This might be what setActiveServer in ServerManager does
  onConnectServer,
  onDisconnectServer
}) => {
  const [servers, setServers] = useState<ServerConfig[]>(serverManager.listServers());
  const [showForm, setShowForm] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerConfig | undefined>(undefined);

  useEffect(() => {
    const handleServersChanged = (updatedServers: ServerConfig[]) => {
      setServers(updatedServers);
    };
    const handleStatusChanged = ({ serverId, status }: { serverId: string, status: string }) => {
      // Force re-render to update status indicator by updating the servers list
      // This is a bit of a hack; a proper solution might involve mapping statuses separately
      setServers(prevServers => prevServers.map(s => s.id === serverId ? { ...s } : s));
    };


    serverManager.on('serversChanged', handleServersChanged);
    serverManager.on('statusChanged', handleStatusChanged); // Assuming ServerManager emits this

    // Initial load
    setServers(serverManager.listServers());


    return () => {
      serverManager.off('serversChanged', handleServersChanged);
      serverManager.off('statusChanged', handleStatusChanged);
    };
  }, [serverManager]);

  const handleAddServer = (config: ServerConfig) => {
    if (editingServer) {
      serverManager.updateServer(config.id, config);
    } else {
      serverManager.addServer(config);
    }
    setShowForm(false);
    setEditingServer(undefined);
  };

  const handleEditServer = (server: ServerConfig) => {
    setEditingServer(server);
    setShowForm(true);
  };

  const handleDeleteServer = (serverId: string) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      serverManager.removeServer(serverId);
    }
  };

  const handleSelectAndConnect = (server: ServerConfig) => {
     onSelectServer(server.id); // This should call serverManager.setActiveServer(id) via App.tsx
     // For now, directly call connect if it's not the active one or simply select
     if (server.id !== activeServerId || serverManager.getServerStatus(server.id) !== 'connected') {
         onConnectServer(server.id);
     }
  }


  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 left-0 w-72 bg-gray-800 text-white p-4 shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Servers</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
      </div>

      {showForm ? (
        <ServerConfigForm
          initialData={editingServer}
          onSubmit={handleAddServer}
          onCancel={() => { setShowForm(false); setEditingServer(undefined); }}
        />
      ) : (
        <>
          <button
            onClick={() => { setEditingServer(undefined); setShowForm(true); }}
            className="w-full mb-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white"
          >
            Add New Server
          </button>
          <div className="flex-grow overflow-y-auto">
            {servers.length === 0 && <p className="text-gray-400">No servers configured.</p>}
            <ul className="space-y-2">
              {servers.map((server) => (
                <li key={server.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-700 ${activeServerId === server.id ? 'bg-gray-900 ring-2 ring-indigo-400' : 'bg-gray-750'}`}
                    onClick={() => handleSelectAndConnect(server)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ServerStatusIndicator status={serverManager.getServerStatus(server.id)} />
                      <span className="font-medium">{server.name}</span>
                    </div>
                    <div>
                      <button onClick={(e) => { e.stopPropagation(); handleEditServer(server);}} className="text-xs text-gray-400 hover:text-white mr-2">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteServer(server.id);}} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{server.url} ({server.transport})</p>
                  {/* Connect/Disconnect buttons could be added here too */}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ServerSidebar;
