// packages/mcp-connector/src/transports/LocalTransport.ts
import { McpMessage, McpTransport, McpTransportConfig, TransportStatus } from '../types';
import { EventEmitter } from 'events'; // Assuming 'events' package is available

export interface LocalTransportConfig extends McpTransportConfig {
  command: string; // Command to execute for the local process
  args?: string[];
}

export class LocalTransport extends EventEmitter implements McpTransport {
  private status: TransportStatus = 'idle';
  private config: LocalTransportConfig;

  constructor(config: LocalTransportConfig) {
    super();
    this.config = config;
    console.log(`LocalTransport: Initialized with command '${config.command}'`);
  }

  async connect(): Promise<void> {
    if (this.status === 'connected' || this.status === 'connecting') {
      return;
    }
    this._setStatus('connecting');
    console.log(`LocalTransport: Attempting to connect (simulated). Command: ${this.config.command}`);

    // Simulate connection success after a short delay
    return new Promise((resolve) => {
      setTimeout(() => {
        this._setStatus('connected');
        this.emit('connected');
        console.log('LocalTransport: Connected (simulated).');
        // In a real implementation, you would spawn a child process here
        // and set up listeners for its stdout/stderr and exit events.
        // e.g., this.childProcess = spawn(this.config.command, this.config.args);
        // this.childProcess.stdout.on('data', (data) => this._handleIncomingData(data));
        resolve();
      }, 500);
    });
  }

  async disconnect(): Promise<void> {
    if (this.status !== 'connected' && this.status !== 'connecting') {
      return;
    }
    console.log('LocalTransport: Disconnecting (simulated).');
    // In a real implementation, you would kill the child process.
    // this.childProcess?.kill();
    this._setStatus('disconnected');
    this.emit('disconnected');
  }

  async send(message: McpMessage): Promise<void> {
    if (this.status !== 'connected') {
      console.error('LocalTransport: Not connected. Cannot send message.');
      throw new Error('Not connected');
    }
    console.log('LocalTransport: Sending message (simulated):', JSON.stringify(message));
    // In a real implementation, write to the child process's stdin.
    // this.childProcess?.stdin.write(JSON.stringify(message) + '\n');

    // Simulate receiving a response for testing purposes if needed
    // setTimeout(() => {
    //   const response: McpMessage = { jsonrpc: "2.0", id: message.id, result: { confirmation: "message received by local process" } };
    //   this.emit('message', response);
    // }, 100);
    return Promise.resolve();
  }

  private _handleIncomingData(data: Buffer | string): void {
     // Process data from child process stdout, parse JSON messages
     const messageString = data.toString();
     try {
         const message: McpMessage = JSON.parse(messageString);
         this.emit('message', message);
     } catch (error) {
         console.error('LocalTransport: Error parsing incoming message:', error);
         this.emit('error', new Error('Error parsing incoming message'));
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
