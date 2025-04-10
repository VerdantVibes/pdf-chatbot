import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { PDFWebSocketService } from "../lib/websocket/pdfWebSocketService";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";

export interface FileProgress {
  filename: string;
  progress: number;
  status: string;
  fileId?: string;
}

export function usePdfWebSocket() {
  const { user } = useAuth();
  const token = Cookies.get("auth_token") || localStorage.getItem("auth_token");
  const [fileProgresses, setFileProgresses] = useState<{ [filename: string]: FileProgress }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAllUploaded, setIsAllUploaded] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const queryClient = useQueryClient();

  const shouldMaintainConnection = useRef(false);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getWebSocketService = useCallback(() => {
    try {
      if (!token) {
        console.error("No auth token available for WebSocket connection");
        return null;
      }
      return PDFWebSocketService.getInstance(token);
    } catch (error) {
      console.error("Error getting WebSocket service:", error);
      return null;
    }
  }, [token]);

  const disconnectWebSocket = useCallback(() => {
    shouldMaintainConnection.current = false;

    try {
      const wsService = getWebSocketService();
      if (wsService) {
        console.log("Disconnecting WebSocket...");
        wsService.disconnect();
      }

      PDFWebSocketService.resetInstance();

      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting WebSocket:", error);
    }

    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
      progressTimeoutRef.current = null;
    }
  }, [getWebSocketService]);

  const connectWebSocket = useCallback(async (): Promise<boolean> => {
    if (isConnected) return true;

    setIsConnecting(true);

    try {
      if (!getWebSocketService()) {
        console.log("No WebSocket service available");
        setIsConnected(false);
        return false;
      }

      console.log("Connecting to WebSocket...");

      getWebSocketService()?.onOpen(() => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        setIsConnecting(false);
        setRetryCount(0);
        setConnectionError(null);
      });

      getWebSocketService()?.onError((error: unknown) => {
        console.error("WebSocket connection error:", error);
        setConnectionError(error instanceof Error ? error : new Error("Unknown connection error"));

        if (retryCount < maxRetries) {
          if (retryCount > 1) {
            toast.error("Connection error. Retrying...");
          }
        } else {
          toast.error("Failed to connect to server. Please try again later.");
          setIsConnecting(false);
        }
      });

      getWebSocketService()?.onClose(() => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
      });

      await getWebSocketService()?.connect();

      return true;
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setRetryCount((prev) => prev + 1);
      setConnectionError(error instanceof Error ? error : new Error("Unknown connection error"));

      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`Retrying connection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return connectWebSocket();
      } else {
        toast.error("Failed to connect to server. Please try again later.");
        setIsConnecting(false);
        return false;
      }
    }
  }, [getWebSocketService, retryCount, maxRetries, isConnected]);

  useEffect(() => {
    return () => {
      if (shouldMaintainConnection.current) {
        console.log("Component unmounting, cleaning up WebSocket");
        disconnectWebSocket();
      }
    };
  }, [disconnectWebSocket]);

  const uploadFiles = useCallback(
    async (files: FileList | File[], onComplete?: () => void) => {
      if (!files || files.length === 0 || !user || !user.id) {
        toast.error("No files to upload or user information missing");
        return;
      }

      try {
        console.log(`Starting upload process for ${files.length} files for user ${user.id}`);
        shouldMaintainConnection.current = true;
        setIsUploading(true);
        setIsAllUploaded(false);

        const connected = await connectWebSocket();
        if (!connected) {
          toast.error("Failed to establish connection for upload");
          shouldMaintainConnection.current = false;
          setIsUploading(false);
          return;
        }

        setFileProgresses(
          Array.from(files).reduce((acc, file) => {
            return {
              ...acc,
              [file.name]: {
                progress: 0,
                status: "waiting",
              },
            };
          }, {})
        );

        const progressHandler = (data: any) => {
          console.log("Progress update received:", data);
          const { filename, progress_percent, status, file_id, current_file, total_files } = data;

          if (filename) {
            setFileProgresses((prev) => {
              const updatedProgresses: { [filename: string]: FileProgress } = {
                ...prev,
                [filename]: {
                  filename,
                  progress: status === "exists" ? 100 : progress_percent || prev[filename]?.progress || 0,
                  status: status || prev[filename]?.status || "uploading",
                  fileId: file_id || prev[filename]?.fileId,
                },
              };

              const allFileNames = Array.from(files).map((file: File) => file.name);

              const orderedFiles = Array.from(files).map((file: File) => file.name);

              let completedFiles = 0;
              let lastFileCompleted = false;

              orderedFiles.forEach((filename, index) => {
                const progress = updatedProgresses[filename];
                if (
                  progress &&
                  (progress.status === "complete" || progress.status === "exists" || progress.status === "error")
                ) {
                  completedFiles++;

                  if (index === orderedFiles.length - 1) {
                    lastFileCompleted = true;
                  }
                }
              });

              console.log(
                `File status check: ${completedFiles}/${orderedFiles.length} files completed, last file completed: ${lastFileCompleted}`
              );

              if (completedFiles === orderedFiles.length || lastFileCompleted) {
                console.log("All files or last file completed - updating state");
                setIsAllUploaded(true);
                setIsUploading(false);

                queryClient.invalidateQueries({ queryKey: ["documents"] });

                setTimeout(() => {
                  console.log("Auto-disconnecting WebSocket after all files processed");
                  disconnectWebSocket();
                }, 1000);
              } else {
                console.log("Some files still processing, waiting for more updates...");
              }

              return updatedProgresses;
            });
          }
        };

        const errorHandler = (error: unknown) => {
          console.error("Error during upload:", error);
          toast.error(`Upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
        };

        getWebSocketService()?.onProgress(progressHandler);
        getWebSocketService()?.onError(errorHandler);

        getWebSocketService()?.addMessageHandler("message", (data: any) => {
          console.log("Generic message received:", data);
        });

        for (const file of Array.from(files)) {
          try {
            await getWebSocketService()?.addFile(file);
          } catch (error) {
            console.error(`Error adding file ${file.name}:`, error);
            setFileProgresses((prev) => ({
              ...prev,
              [file.name]: {
                ...prev[file.name],
                status: "error",
              },
            }));
          }
        }

        await getWebSocketService()?.startUpload(user.id);
        console.log("Upload started successfully");

        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current);
        }

        progressTimeoutRef.current = setTimeout(() => {
          console.log("Safety timeout checking upload completion status...");

          setFileProgresses((prev) => {
            const updated: { [filename: string]: FileProgress } = { ...prev };

            const orderedFiles = Array.from(files).map((file: File) => file.name);

            orderedFiles.forEach((filename) => {
              if (
                updated[filename] &&
                updated[filename].progress > 80 &&
                !(
                  updated[filename].status === "complete" ||
                  updated[filename].status === "exists" ||
                  updated[filename].status === "error"
                )
              ) {
                console.log(`Forcing completion for file ${filename} with ${updated[filename].progress}% progress`);
                updated[filename] = {
                  ...updated[filename],
                  progress: 100,
                  status: "complete",
                };
              }
            });

            let completedFiles = 0;
            let lastFileCompleted = false;

            orderedFiles.forEach((filename, index) => {
              const progress = updated[filename];
              if (
                progress &&
                (progress.status === "complete" || progress.status === "exists" || progress.status === "error")
              ) {
                completedFiles++;

                if (index === orderedFiles.length - 1) {
                  lastFileCompleted = true;
                }
              }
            });

            console.log(
              `Timeout check: ${completedFiles}/${orderedFiles.length} files completed, last file completed: ${lastFileCompleted}`
            );

            if (completedFiles === orderedFiles.length || lastFileCompleted) {
              console.log("All files or last file completed (some forced by timeout) - updating state");
              setIsAllUploaded(true);
              setIsUploading(false);

              queryClient.invalidateQueries({ queryKey: ["documents"] });

              setTimeout(() => {
                if (shouldMaintainConnection.current) {
                  disconnectWebSocket();
                }
              }, 1000);
            } else {
              console.log("Timeout check: Still waiting for files to complete...");
            }

            return updated;
          });
        }, 60000);
      } catch (error) {
        console.error("Error during upload:", error);
        toast.error("Upload failed, please try again");
        setIsUploading(false);
        shouldMaintainConnection.current = false;
        disconnectWebSocket();
      }
    },
    [user, connectWebSocket, disconnectWebSocket, isUploading, fileProgresses, getWebSocketService, queryClient]
  );

  return {
    isConnected,
    isConnecting,
    isUploading,
    isAllUploaded,
    uploadFiles,
    fileProgresses,
    connectWebSocket,
    disconnectWebSocket,
  };
}
