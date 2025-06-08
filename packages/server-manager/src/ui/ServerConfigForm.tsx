// packages/server-manager/src/ui/ServerConfigForm.tsx
import React, { useState, useEffect } from 'react';
import { ServerConfig, ServerTransportType } from '../types';

interface ServerConfigFormProps {
  initialData?: ServerConfig;
  onSubmit: (config: ServerConfig) => void;
  onCancel: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const ServerConfigForm: React.FC<ServerConfigFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [transport, setTransport] = useState<ServerTransportType>('websocket');
  const [id, setId] = useState<string>(initialData?.id || generateId());

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUrl(initialData.url);
      setTransport(initialData.transport);
      setId(initialData.id);
    } else {
      // Reset for new form
      setName('');
      setUrl('');
      setTransport('websocket');
      setId(generateId());
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id,
      name,
      url,
      transport,
      type: 'mcp', // Default type
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-lg">
      <h3 className="text-lg font-medium">{initialData ? 'Edit Server' : 'Add New Server'}</h3>
      <div>
        <label htmlFor="server-name" className="block text-sm font-medium text-gray-700">Server Name</label>
        <input
          type="text"
          id="server-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="server-url" className="block text-sm font-medium text-gray-700">URL / Path</label>
        <input
          type="text"
          id="server-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="server-transport" className="block text-sm font-medium text-gray-700">Transport</label>
        <select
          id="server-transport"
          value={transport}
          onChange={(e) => setTransport(e.target.value as ServerTransportType)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="websocket">WebSocket</option>
          <option value="localprocess">Local Process</option>
          <option value="sse">SSE</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">
          {initialData ? 'Save Changes' : 'Add Server'}
        </button>
      </div>
    </form>
  );
};

export default ServerConfigForm;
