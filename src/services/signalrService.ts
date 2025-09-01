import * as signalR from '@microsoft/signalr';
import { BASE_URL } from '../consts/apiUrl/baseUrl';
import { SIGNALR_CONFIG } from '../config/signalr';
import { MessageDto } from './conversationService';

export interface SignalRService {
  startConnection(token: string): Promise<void>;
  stopConnection(): Promise<void>;
  joinConversation(conversationId: string): Promise<void>;
  leaveConversation(conversationId: string): Promise<void>;
  sendMessage(message: MessageDto): Promise<void>;
  onMessageReceived(callback: (message: MessageDto) => void): void;
  offMessageReceived(): void;
  onUserJoined(callback: (userId: string, conversationId: string) => void): void;
  onUserLeft(callback: (userId: string, conversationId: string) => void): void;
  getConnectionState(): signalR.HubConnectionState;
  isConnected(): boolean;
}

class SignalRServiceImpl implements SignalRService {
  private connection: signalR.HubConnection | null = null;
  private readonly hubUrl: string;

  constructor() {
    const baseUrl = BASE_URL.replace('/api', '');
    this.hubUrl = `${baseUrl}/hubs/chat`;
  }

  async startConnection(token: string): Promise<void> {
    if (!SIGNALR_CONFIG.ENABLED) {
      console.log('SignalR is disabled in configuration');
      return;
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(SIGNALR_CONFIG.DEBUG_MODE ? signalR.LogLevel.Debug : signalR.LogLevel.Warning)
        .build();

      await this.connection.start();
      console.log('SignalR Connected successfully');
    } catch (error) {
      console.error('SignalR Connection failed:', error);
      throw error;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('SignalR Connection stopped');
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('SignalR connection is not established');
    }

    try {
      console.log(`[SignalR] Joining conversation: ${conversationId}`);
      await this.connection!.invoke('JoinConversation', conversationId);
      console.log(`[SignalR] Successfully joined conversation: ${conversationId}`);
    } catch (error) {
      console.error('[SignalR] Failed to join conversation:', error);
      throw error;
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (!this.isConnected()) {
      return;
    }

    try {
      await this.connection!.invoke('LeaveConversation', conversationId);
      console.log(`Left conversation: ${conversationId}`);
    } catch (error) {
      console.error('Failed to leave conversation:', error);
    }
  }

  async sendMessage(message: MessageDto): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await this.connection!.invoke('SendMessage', message);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  onMessageReceived(callback: (message: MessageDto) => void): void {
    if (this.connection) {
      console.log('[SignalR] Setting up message handlers...');
      
      // Backend có thể gửi nhiều event names khác nhau
      // Thêm handler cho cả hai để đảm bảo
      this.connection.on('ReceiveMessage', (message: MessageDto) => {
        console.log('[SignalR] ReceiveMessage received:', message);
        callback(message);
      });
      
      this.connection.on('messagecreated', (message: MessageDto) => {
        console.log('[SignalR] messagecreated received:', message);
        callback(message);
      });
      
      // Thêm handler cho các event name khác có thể
      this.connection.on('MessageCreated', (message: MessageDto) => {
        console.log('[SignalR] MessageCreated received:', message);
        callback(message);
      });
    }
  }

  offMessageReceived(): void {
    if (this.connection) {
      console.log('[SignalR] Clearing message handlers...');
      this.connection.off('ReceiveMessage');
      this.connection.off('messagecreated');
      this.connection.off('MessageCreated');
    }
  }

  onUserJoined(callback: (userId: string, conversationId: string) => void): void {
    if (this.connection) {
      this.connection.on('UserJoined', callback);
    }
  }

  onUserLeft(callback: (userId: string, conversationId: string) => void): void {
    if (this.connection) {
      this.connection.on('UserLeft', callback);
    }
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const signalrService = new SignalRServiceImpl();
export default signalrService;
