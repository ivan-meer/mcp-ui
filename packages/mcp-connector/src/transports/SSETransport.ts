// packages/mcp-connector/src/transports/SSETransport.ts
import { McpMessage, McpTransport, McpTransportConfig, TransportStatus } from '../types';
import { EventEmitter } from 'events'; // Assuming 'events' package is available

export interface SSETransportConfig extends McpTransportConfig {
  url: string; // URL for the SSE endpoint
  sendUrl?: string; // Optional separate URL for sending messages (e.g., HTTP POST)
}

export class SSETransport extends EventEmitter implements McpTransport {
  private status: TransportStatus = 'idle';
  private eventSource: EventSource | null = null;
  private config: SSETransportConfig;

  constructor(config: SSETransportConfig) {
    super();
    this.config = config;
    console.log(`SSETransport: Initialized with URL '${config.url}'`);
  }

  async connect(): Promise<void> {
    if (this.status === 'connected' || this.status === 'connecting') {
      return;
    }
    this._setStatus('connecting');

    return new Promise((resolve, reject) => {
      try {
        console.log(`SSETransport: Connecting to ${this.config.url}`);
        this.eventSource = new EventSource(this.config.url);

        this.eventSource.onopen = () => {
          this._setStatus('connected');
          this.emit('connected');
          console.log('SSETransport: Connected.');
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const message: McpMessage = JSON.parse(event.data);
            this.emit('message', message);
          } catch (error) {
            console.error('SSETransport: Error parsing message data:', error);
            this.emit('error', new Error('Error parsing message data'));
          }
        };

        this.eventSource.onerror = (error) => {
          console.error('SSETransport: Connection error.', error);
          // If not already connected, reject promise. Otherwise, just emit error.
          if (this.status === 'connecting') {
             this._setStatus('error');
             reject(new Error('SSE connection error'));
          } else {
             this._setStatus('error'); // Or 'disconnected' depending on error type
             this.emit('error', new Error('SSE connection error'));
          }
          this.disconnect(); // Close the connection on error
        };
      } catch (error) {
        console.error('SSETransport: Failed to create EventSource.', error);
        this._setStatus('error');
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.eventSource) {
      console.log('SSETransport: Disconnecting.');
      this.eventSource.close();
      this.eventSource = null;
    }
    this._setStatus('disconnected');
    this.emit('disconnected');
  }

  async send(message: McpMessage): Promise<void> {
    if (this.status !== 'connected') {
      console.error('SSETransport: Not connected. Cannot send message.');
      throw new Error('Not connected');
    }

    if (!this.config.sendUrl) {
      console.warn('SSETransport: `sendUrl` is not configured. Cannot send message over SSE. Client-to-server messages usually require a separate HTTP POST.');
      // Optionally throw an error or resolve silently
      return Promise.resolve();
    }

    try {
      console.log(`SSETransport: Sending message to ${this.config.sendUrl}:`, JSON.stringify(message));
      const response = await fetch(this.config.sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`SSETransport: Failed to send message, server responded with ${response.status}`);
      }
      // SSE typically doesn't get direct responses to POSTs in the same way as WebSockets.
      // Any server response to this POST would be handled as a standard HTTP response.
      // Server might send a separate SSE event if it needs to acknowledge or respond.
      console.log('SSETransport: Message sent via POST.');
    } catch (error) {
      console.error('SSETransport: Error sending message via POST:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private _setStatus(status: TransportStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.emit('statusChange', status);
    }
  }

  getStatus(): TransportStatus {
    return this.status;
  }
}
