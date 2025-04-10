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
  private connectionPromise: Promise<void> | null = null;
  private openHandler: (() => void) | null = null;

  constructor(endpoint: string, token: string) {
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    let wsUrl = baseUrl.replace(/^http/, "ws");

    wsUrl = wsUrl.replace(/\/$/, "");

    endpoint = endpoint.replace(/^\//, "");

    this.url = `${wsUrl}/ws/${endpoint}?token=${token}`;

    console.log("WebSocket URL:", this.url);
  }

  public connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        if (this.socket) {
          this.socket.onopen = null;
          this.socket.onmessage = null;
          this.socket.onclose = null;
          this.socket.onerror = null;

          try {
            this.socket.close();
          } catch (e) {}
        }

        console.log("Creating new WebSocket connection");
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log("WebSocket connection established");
          this.reconnectAttempts = 0;
          this.isConnecting = false;

          if (this.openHandler) {
            this.openHandler();
          }

          resolve();
          this.connectionPromise = null;
        };

        this.socket.onmessage = (event) => {
          try {
            console.log("WebSocket message received:", event.data);
            const data = JSON.parse(event.data);
            console.log("Parsed WebSocket message:", data);

            const status = data.status || data.type || (data.action === "progress" ? "uploading" : null);

            if (status) {
              console.log(`Handling message with status: ${status}`);
              if (this.messageHandlers.has(status)) {
                this.messageHandlers.get(status)?.(data);
              } else {
                console.log(`No handler registered for status: ${status}`);
              }
            }

            if (this.messageHandlers.has("message")) {
              console.log("Calling generic message handler");
              this.messageHandlers.get("message")?.(data);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error, "Raw message:", event.data);
          }
        };

        this.socket.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          this.isConnecting = false;
          this.connectionPromise = null;

          if (event.code !== 1000) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
          this.connectionPromise = null;
        };
      } catch (error) {
        console.error("WebSocket connection error:", error);
        this.isConnecting = false;
        reject(error);
        this.connectionPromise = null;
      }
    });

    return this.connectionPromise;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Connection lost. Max reconnection attempts reached.");
      return;
    }

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    console.info(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    const timeout = this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch((err) => {
        console.error("Reconnection attempt failed:", err);
      });
    }, timeout);
  }

  public onOpen(handler: () => void): void {
    this.openHandler = handler;

    if (this.socket?.readyState === WebSocket.OPEN) {
      handler();
    }
  }

  public addMessageHandler(type: string, handler: WebSocketMessageHandler): void {
    this.messageHandlers.set(type, handler);
  }

  public removeMessageHandler(type: string): void {
    this.messageHandlers.delete(type);
  }

  public send(message: WebSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      console.log("Sending WebSocket message:", message);
      this.socket.send(messageStr);
    } else {
      console.log("Socket not open, connecting first...");
      this.connect()
        .then(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            const messageStr = JSON.stringify(message);
            console.log("Now sending WebSocket message:", message);
            this.socket.send(messageStr);
          } else {
            console.error("Socket not open after connect");
          }
        })
        .catch((err) => {
          console.error("Failed to establish connection for sending message:", err);
        });
    }
  }

  public disconnect(): void {
    console.log("Disconnecting WebSocket");
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.connectionPromise = null;

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;

      try {
        this.socket.close(1000, "Normal closure");
      } catch (e) {
        console.error("Error closing WebSocket:", e);
      }
      this.socket = null;
    }
  }
}
