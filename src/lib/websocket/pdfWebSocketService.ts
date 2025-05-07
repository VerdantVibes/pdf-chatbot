import { BaseWebSocketService } from "./baseWebSocketService";
import { toast } from "sonner";

export interface FileContent {
  filename: string;
  content: string;
  content_type: string;
}

export interface FileUploadMessage {
  action: "upload";
  user_id: string;
  files: FileContent[];
  total_files: number;
}

export interface UploadProgressResponse {
  status: string;
  file_id?: string;
  filename: string;
  current_file: number;
  total_files: number;
  preview_status?: string;
  progress_percent: number;
}

export class PDFWebSocketService {
  private static instance: PDFWebSocketService | null = null;
  private wsService: BaseWebSocketService;
  private filesData: Map<string, { data: string; type: string }> = new Map();
  private connectionRetries: number = 0;
  private maxConnectionRetries: number = 2;
  private isConnecting: boolean = false;
  private connectionFailed: boolean = false;

  private constructor(token: string) {
    this.wsService = new BaseWebSocketService("pdf/upload/ws", token);
  }

  public static getInstance(token: string): PDFWebSocketService {
    if (!PDFWebSocketService.instance) {
      PDFWebSocketService.instance = new PDFWebSocketService(token);
    }
    return PDFWebSocketService.instance;
  }

  public static resetInstance(): void {
    if (PDFWebSocketService.instance) {
      try {
        PDFWebSocketService.instance.disconnect();
      } catch (error) {
        console.error("Error disconnecting instance:", error);
      }
      PDFWebSocketService.instance = null;
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
        console.log("PDF WebSocket connection successful");
        this.connectionRetries = 0;
        this.isConnecting = false;
        this.connectionFailed = false;
        return Promise.resolve();
      })
      .catch(async (error) => {
        console.error("PDF WebSocket connection failed:", error);
        this.isConnecting = false;

        if (this.connectionRetries < this.maxConnectionRetries) {
          this.connectionRetries++;
          console.log(`Retrying PDF WebSocket connection (${this.connectionRetries}/${this.maxConnectionRetries})...`);

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

  public onProgress(handler: (data: UploadProgressResponse) => void): void {
    this.wsService.addMessageHandler("processing", handler);
    this.wsService.addMessageHandler("uploading", handler);
    this.wsService.addMessageHandler("analyzing", handler);
    this.wsService.addMessageHandler("complete", handler);
    this.wsService.addMessageHandler("uploaded", handler);
    this.wsService.addMessageHandler("exists", handler);
    this.wsService.addMessageHandler("error", handler);
    this.wsService.addMessageHandler("progress", handler);

    this.wsService.addMessageHandler("message", (data: any) => {
      if (data.filename && (data.progress_percent !== undefined || data.progress !== undefined)) {
        const progressData: UploadProgressResponse = {
          status: data.status || "uploading",
          filename: data.filename,
          current_file: data.current_file || 1,
          total_files: data.total_files || 1,
          progress_percent: data.progress_percent !== undefined ? data.progress_percent : data.progress || 0,
          file_id: data.file_id,
          preview_status: data.preview_status,
        };

        handler(progressData);
      }
    });
  }

  public onError(handler: (data: any) => void): void {
    this.wsService.addMessageHandler("error", handler);
  }

  public addMessageHandler(type: string, handler: (data: any) => void): void {
    this.wsService.addMessageHandler(type, handler);
  }

  public addFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!file || !(file instanceof File)) {
          reject(new Error("Invalid file provided"));
          return;
        }

        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          reject(new Error(`File size exceeds the limit (50MB): ${file.name}`));
          return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            if (e.target?.result) {
              let base64String = e.target.result as string;

              if (base64String.startsWith("data:application/pdf;base64,")) {
                base64String = base64String.replace("data:application/pdf;base64,", "");
              } else if (base64String.startsWith("data:text/plain;base64,")) {
                base64String = base64String.replace("data:text/plain;base64,", "");
              } else if (base64String.includes(";base64,")) {
                base64String = base64String.substring(base64String.indexOf(";base64,") + 8);
              }

              this.filesData.set(file.name, {
                data: base64String,
                type: file.type || "application/octet-stream",
              });

              console.log(`File prepared for upload: ${file.name} (${file.type || "unknown type"})`);
              resolve();
            } else {
              reject(new Error("Failed to read file content"));
            }
          } catch (error) {
            console.error("Error processing file:", error);
            reject(error);
          }
        };

        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          reject(error);
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error in addFile:", error);
        reject(error);
      }
    });
  }

  public async startUpload(userId: string): Promise<void> {
    if (this.filesData.size === 0) {
      console.error("No files to upload");
      return;
    }

    try {
      await this.connect();

      const files = Array.from(this.filesData.entries()).map(([filename, fileData]) => ({
        filename,
        content: fileData.data,
        content_type: fileData.type,
      }));

      const message: FileUploadMessage = {
        action: "upload",
        user_id: userId,
        files,
        total_files: files.length,
      };

      console.log(`Starting upload of ${files.length} files for user ${userId}`);
      this.wsService.send(message);
    } catch (error) {
      console.error("Failed to start upload:", error);
      throw error;
    }
  }

  public clearFiles(): void {
    this.filesData.clear();
  }

  public disconnect(): void {
    console.log("Disconnecting PDF WebSocket service");
    this.isConnecting = false;
    this.wsService.disconnect();
    this.filesData.clear();
  }
}
