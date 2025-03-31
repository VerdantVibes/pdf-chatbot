import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { PDFWebSocketService, UploadProgressResponse } from '@/lib/websocket/pdfWebSocketService';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export interface FileProgress {
  filename: string;
  progress: number;
  status: string;
  fileId?: string;
}

export const usePdfWebSocket = () => {
  const { user } = useAuth();
  const token = Cookies.get('auth_token') || localStorage.getItem('auth_token');
  const [fileProgresses, setFileProgresses] = useState<{[filename: string]: FileProgress}>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAllUploaded, setIsAllUploaded] = useState(false);
  
  // Initialize WebSocket service
  const wsService = token 
    ? PDFWebSocketService.getInstance(token)
    : null;
  
  useEffect(() => {
    if (!wsService) return;
    
    const connect = async () => {
      try {
        await wsService.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };
    
    connect();
    
    // Handle progress updates
    wsService.onProgress((data: UploadProgressResponse) => {
      // Update the file progress using functional update to get latest state
      setFileProgresses(prev => {
        const updated = {
          ...prev,
          [data.filename]: {
            filename: data.filename,
            progress: data.progress_percent,
            status: data.status,
            fileId: data.file_id
          }
        };
        
        // Only set upload as complete when all tracked files are at 100%
        if (data.current_file === data.total_files && 
            (data.status === 'complete' || data.status === 'uploaded' || data.status === 'exists')) {
          
          const allFilesComplete = Object.values(updated).every(file => 
            file.progress === 100 || ['complete', 'uploaded', 'exists'].includes(file.status)
          );
          
          if (allFilesComplete) {
            // We'll use setTimeout to avoid state update conflicts
            setTimeout(() => {
              setIsAllUploaded(true);
              setIsUploading(false);
            }, 0);
          }
        }
        
        return updated;
      });
    });
    
    wsService.onError(() => {
      toast.error('Error during file upload');
    });
    
    return () => {
      wsService.disconnect();
    };
  }, [token, wsService]);
  
  const uploadFiles = useCallback(async (files: FileList) => {
    if (!wsService || !user) {
      toast.error('Not authenticated');
      return;
    }
    
    setIsUploading(true);
    setIsAllUploaded(false);
    
    // Create initial progress entries
    const initialProgress = Array.from(files).reduce((acc, file) => ({
      ...acc,
      [file.name]: {
        filename: file.name,
        progress: 0,
        status: 'pending'
      }
    }), {});
    
    setFileProgresses(initialProgress);
    
    try {
      // Add all files to WebSocket service
      for (const file of Array.from(files)) {
        await wsService.addFile(file);
      }
      
      // Start upload process
      wsService.startUpload(user.id);
    } catch (error) {
      console.error('Error preparing files for upload:', error);
      toast.error('Failed to prepare files for upload');
      setIsUploading(false);
    }
  }, [wsService, user]);
  
  const reset = useCallback(() => {
    setFileProgresses({});
    setIsUploading(false);
    setIsAllUploaded(false);
    
    if (wsService) {
      wsService.clearFiles();
    }
  }, [wsService]);
  
  return {
    isConnected,
    isUploading,
    isAllUploaded,
    fileProgresses,
    uploadFiles,
    reset
  };
};
