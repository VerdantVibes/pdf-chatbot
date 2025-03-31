import { BaseWebSocketService } from './baseWebSocketService';

export interface FileContent {
  filename: string;
  content: string;
  content_type: string;
}

export interface FileUploadMessage {
  action: 'upload';
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
  private static instance: PDFWebSocketService;
  private wsService: BaseWebSocketService;
  private filesData: Map<string, { data: string, type: string }> = new Map();
  
  private constructor(token: string) {
    this.wsService = new BaseWebSocketService('pdf/upload/ws', token);
  }

  public static getInstance(token: string): PDFWebSocketService {
    if (!PDFWebSocketService.instance) {
      PDFWebSocketService.instance = new PDFWebSocketService(token);
    }
    return PDFWebSocketService.instance;
  }

  public connect(): Promise<void> {
    return this.wsService.connect();
  }

  public onProgress(handler: (data: UploadProgressResponse) => void): void {
    // Register handlers for different statuses
    this.wsService.addMessageHandler('processing', handler);
    this.wsService.addMessageHandler('uploading', handler);
    this.wsService.addMessageHandler('analyzing', handler);
    this.wsService.addMessageHandler('complete', handler);
    this.wsService.addMessageHandler('uploaded', handler);
    this.wsService.addMessageHandler('exists', handler);
    this.wsService.addMessageHandler('error', handler);
  }

  public onError(handler: (data: any) => void): void {
    this.wsService.addMessageHandler('error', handler);
  }

  public addFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64String = (e.target.result as string)
            .replace('data:application/pdf;base64,', '')
            .replace('data:text/plain;base64,', '');
          
          this.filesData.set(file.name, {
            data: base64String,
            type: file.type
          });
          resolve();
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public startUpload(userId: string): void {
    const files = Array.from(this.filesData.entries()).map(([filename, fileData]) => ({
      filename,
      content: fileData.data,
      content_type: fileData.type
    }));
    
    const message: FileUploadMessage = {
      action: 'upload',
      user_id: userId,
      files,
      total_files: files.length
    };
    
    this.wsService.send(message);
  }

  public clearFiles(): void {
    this.filesData.clear();
  }

  public disconnect(): void {
    this.wsService.disconnect();
    this.filesData.clear();
  }
}
