export interface WebSocketMessage {
  [key: string]: any;
}

export type WebSocketMessageHandler = (data: any) => void;

export class BaseWebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private messageHandlers: Map<string, WebSocketMessageHandler> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 2000;
  private reconnectTimer: number | null = null;
  private isConnecting: boolean = false;

  constructor(endpoint: string, token: string) {
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    this.url = `${baseUrl.replace(/^http/, 'ws')}/ws/${endpoint}?token=${token}`;
  }

  public connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        const checkConnected = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnected);
            resolve();
          }
        }, 100);
      });
    }

    this.isConnecting = true;
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const status = data.status;

            if (status && this.messageHandlers.has(status)) {
              this.messageHandlers.get(status)?.(data);
            }
            
            // Always call the 'message' handler if it exists
            this.messageHandlers.get('message')?.(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          this.isConnecting = false;
          if (event.code !== 1000) { // Not a normal closure
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          this.isConnecting = false;
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        console.error('WebSocket connection error:', error);
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Connection lost. Please refresh the page.");
      return;
    }

    this.reconnectAttempts++;
    this.reconnectTimer = window.setTimeout(() => {
      console.info(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(() => {
        // Reconnect failure is handled in the connect method
      });
    }, this.reconnectTimeout * this.reconnectAttempts);
  }

  public addMessageHandler(type: string, handler: WebSocketMessageHandler): void {
    this.messageHandlers.set(type, handler);
  }

  public removeMessageHandler(type: string): void {
    this.messageHandlers.delete(type);
  }

  public send(message: WebSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.connect()
        .then(() => {
          this.socket?.send(JSON.stringify(message));
        })
        .catch(() => {
          console.error("Connection not available. Please try again.");
        });
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, "Normal closure");
      this.socket = null;
    }
  }
} 