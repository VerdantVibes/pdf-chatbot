import { BaseWebSocketService } from "./baseWebSocketService";
import { toast } from "sonner";

export interface ChatMessage {
  content: string;
  faiss_index_path: string;
  conversation_id: string;
  pdf_ids: string[];
}

export interface ChatResponse {
  status: "in_progress" | "completed" | "error";
  step: string;
  conversation_id: string | null;
  content: string[];
  message_id: string | null;
  pdf_ids: string[];
  error: string | null;
}

export const CHAT_STEPS = {
  INITIALIZING: "Initializing chat",
  LOADING_FAISS: "Loading FAISS index",
  GENERATING_QUERIES: "Generating search queries",
  SEARCHING_CHUNKS: "Searching relevant chunks",
  PREPARING_CONTEXT: "Preparing context",
  GENERATING_RESPONSE: "Generating response",
  COMPLETED: "Completed",
  ERROR: "Error occurred",
};

export class ChatWebSocketService {
  private static instance: ChatWebSocketService | null = null;
  private wsService: BaseWebSocketService;
  private connectionRetries: number = 0;
  private maxConnectionRetries: number = 2;
  private isConnecting: boolean = false;
  private connectionFailed: boolean = false;
  private processedMessageIds: Set<string> = new Set();

  private constructor(token: string) {
    this.wsService = new BaseWebSocketService("chat/message/ws", token);
  }

  public static getInstance(token: string): ChatWebSocketService {
    if (!ChatWebSocketService.instance) {
      ChatWebSocketService.instance = new ChatWebSocketService(token);
    }
    return ChatWebSocketService.instance;
  }

  public static resetInstance(): void {
    if (ChatWebSocketService.instance) {
      try {
        ChatWebSocketService.instance.disconnect();
      } catch (error) {
        console.error("Error disconnecting chat instance:", error);
      }
      ChatWebSocketService.instance = null;
    }
  }

  public connect(): Promise<void> {
    if (this.isConnecting) {
      return Promise.resolve();
    }

    if (this.connectionFailed) {
      return Promise.reject(new Error("Connection already failed"));
    }

    this.isConnecting = true;
    return this.wsService
      .connect()
      .then(() => {
        console.log("Chat WebSocket connection successful");
        this.connectionRetries = 0;
        this.isConnecting = false;
        this.connectionFailed = false;
        return Promise.resolve();
      })
      .catch(async (error) => {
        console.error("Chat WebSocket connection failed:", error);
        this.isConnecting = false;

        if (this.connectionRetries < this.maxConnectionRetries) {
          this.connectionRetries++;
          console.log(`Retrying Chat WebSocket connection (${this.connectionRetries}/${this.maxConnectionRetries})...`);

          await new Promise((resolve) => setTimeout(resolve, 1000 * this.connectionRetries));
          return this.connect();
        } else {
          this.connectionFailed = true;
          toast.error("Failed to establish a secure connection. Please try again later.");
          return Promise.reject(new Error("Failed to connect after maximum retries"));
        }
      });
  }

  public onOpen(handler: () => void): void {
    this.wsService.onOpen(handler);
  }

  public onClose(handler: () => void): void {
    this.wsService.addMessageHandler("close", () => {
      handler();
    });
  }

  public onProgress(handler: (data: ChatResponse) => void): void {
    this.wsService.addMessageHandler("in_progress", (data: ChatResponse) => {
      this.processMessage(data, handler);
    });

    this.wsService.addMessageHandler("completed", (data: ChatResponse) => {
      this.processMessage(data, handler);
    });

    this.wsService.addMessageHandler("error", (data: ChatResponse) => {
      this.processMessage(data, handler);
    });

    this.wsService.addMessageHandler("message", (data: any) => {
      if (data.status === "in_progress" || data.status === "completed" || data.status === "error") {
        if (data.step === "Completed" && data.status === "in_progress") {
          console.log("Detected completion step with in_progress status, treating as completed");
        }

        this.processMessage(data as ChatResponse, handler);
      }
    });
  }

  private processMessage(data: ChatResponse, handler: (data: ChatResponse) => void): void {
    if ((data.status === "completed" || data.step === "Completed") && data.message_id) {
      if (this.processedMessageIds.has(data.message_id)) {
        console.log("Skipping already processed message:", data.message_id);
        return;
      }

      if (data.message_id) {
        this.processedMessageIds.add(data.message_id);
        console.log("Marking message as processed:", data.message_id);
      }
    }

    handler(data);
  }

  public onError(handler: (data: any) => void): void {
    this.wsService.addMessageHandler("error", handler);
  }

  public sendMessage(message: ChatMessage): void {
    if (!message.content.trim()) {
      console.error("Attempted to send empty message");
      return;
    }

    this.connect()
      .then(() => {
        console.log("Sending chat message:", message);
        this.wsService.send(message);
      })
      .catch((error) => {
        console.error("Failed to connect for sending message:", error);
        toast.error("Connection error. Please try again.");
      });
  }

  public disconnect(): void {
    console.log("Disconnecting Chat WebSocket service");
    this.isConnecting = false;
    this.wsService.disconnect();
  }
}
