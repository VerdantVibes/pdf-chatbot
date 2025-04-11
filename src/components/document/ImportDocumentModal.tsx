import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  UploadIcon,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  InfoIcon,
  AlertCircle,
  ArrowUpFromLine,
  X,
} from "lucide-react";
import pdfIcon from "@/assets/pdficon.svg";
import { usePdfWebSocket, FileProgress } from "@/hooks/usePdfWebSocket";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface ImportDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelected?: (files: FileList) => void;
}

type FileStatus = "waiting" | "processing" | "uploading" | "uploaded" | "analyzing" | "complete" | "exists" | "error";

const FINAL_STATUSES = ["complete", "exists", "error"];

export function ImportDocumentModal({ open, onOpenChange, onFileSelected }: ImportDocumentModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [connectingWebsocket, setConnectingWebsocket] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});
  const [fileProgresses, setFileProgresses] = useState<{ [filename: string]: FileProgress }>({});

  const totalFilesRef = useRef(0);
  const completedFilesRef = useRef(0);
  const disconnectCalledRef = useRef(false);

  const {
    isConnected,
    isUploading,
    isAllUploaded,
    uploadFiles,
    fileProgresses: wsFileProgresses,
    connectWebSocket,
    disconnectWebSocket,
    resetWebSocket,
  } = usePdfWebSocket();

  const completedCount = Object.values(fileStatuses).filter((status) => status === "complete").length;
  const existsCount = Object.values(fileStatuses).filter((status) => status === "exists").length;
  const errorCount = Object.values(fileStatuses).filter((status) => status === "error").length;

  const resetState = () => {
    setSelectedFiles(null);
    setUploadCompleted(false);
    setUploadError(null);
    setConnectingWebsocket(false);
    setConnectionError(null);
    setFileStatuses({});
    setFileProgresses({});
    setIsDragging(false);

    totalFilesRef.current = 0;
    completedFilesRef.current = 0;
    disconnectCalledRef.current = false;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    resetWebSocket();

    console.log("Modal state reset");
  };

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, isConnected, disconnectWebSocket]);

  useEffect(() => {
    if (wsFileProgresses && Object.keys(wsFileProgresses).length > 0) {
      console.log("Received new fileProgresses from WebSocket:", wsFileProgresses);

      const newStatuses: Record<string, FileStatus> = {};
      let completedCount = 0;
      let existsCount = 0;
      let errorCount = 0;

      setFileProgresses(wsFileProgresses);

      Object.entries(wsFileProgresses).forEach(([filename, fileProgress]) => {
        const status = fileProgress.status as FileStatus;
        newStatuses[filename] = status;

        if (status === "exists") {
          existsCount++;
          completedCount++;
        } else if (status === "complete") {
          completedCount++;
        } else if (status === "error") {
          errorCount++;
          completedCount++;
        }
      });

      setFileStatuses(newStatuses);

      if (selectedFiles) {
        completedFilesRef.current = Math.max(completedFilesRef.current, completedCount);

        console.log(`Status counts - Completed: ${completedCount}, Exists: ${existsCount}, Errors: ${errorCount}`);
      }

      if (selectedFiles) {
        const allFiles = Array.from(selectedFiles);
        const allFilesCompleted = allFiles.every((file) => {
          const filename = file.name;
          const status = wsFileProgresses[filename]?.status as FileStatus;
          return status && FINAL_STATUSES.includes(status);
        });

        if (allFilesCompleted) {
          console.log("All files have completed processing");
          setUploadCompleted(true);
        } else {
          console.log("Some files still not in final state, waiting for completion");
        }
      }
    }
  }, [wsFileProgresses, selectedFiles]);

  useEffect(() => {
    if (!isUploading && selectedFiles && selectedFiles.length > 0) {
      const allFinalState = completedCount + existsCount + errorCount === selectedFiles.length;

      if (allFinalState) {
        const timer = setTimeout(() => {
          setUploadCompleted(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [isUploading, selectedFiles, completedCount, existsCount, errorCount]);

  useEffect(() => {
    if (!uploadCompleted && !isUploading && isAllUploaded && selectedFiles) {
      console.log("Upload completed based on WebSocket hook state");
      setUploadCompleted(true);
      resetWebSocket();
    }
  }, [isUploading, isAllUploaded, uploadCompleted, selectedFiles]);

  useEffect(() => {
    if (!uploadCompleted || !isConnected || disconnectCalledRef.current) return;

    if (selectedFiles) {
      const allFiles = Array.from(selectedFiles);
      const allFilesCompleted = allFiles.every((file) => {
        const status = fileStatuses[file.name] || (fileProgresses[file.name]?.status as FileStatus);
        return FINAL_STATUSES.includes(status as FileStatus);
      });

      if (!allFilesCompleted) {
        console.log("Not disconnecting WebSocket - some files still not in final state");
        return;
      }
    }

    console.log(`All files completed. Disconnecting WebSocket.`);
    disconnectCalledRef.current = true;
    disconnectWebSocket();
  }, [uploadCompleted, isConnected, disconnectWebSocket, selectedFiles, fileStatuses, fileProgresses]);

  useEffect(() => {
    if (!selectedFiles) return;

    if (totalFilesRef.current === 0) {
      totalFilesRef.current = Array.from(selectedFiles).length;
      console.log(`Tracking ${totalFilesRef.current} files for upload`);
    }

    const allFiles = Array.from(selectedFiles);
    const newStatuses = { ...fileStatuses };
    let hasNewFiles = false;

    allFiles.forEach((file) => {
      const filename = file.name;
      if (!newStatuses[filename]) {
        newStatuses[filename] = "waiting";
        hasNewFiles = true;
      }
    });

    if (hasNewFiles) {
      setFileStatuses(newStatuses);
    }
  }, [selectedFiles, fileStatuses]);

  useEffect(() => {
    if (selectedFiles && Object.keys(fileStatuses).length > 0) {
      const stateCounts = {
        waiting: 0,
        processing: 0,
        uploading: 0,
        uploaded: 0,
        analyzing: 0,
        complete: 0,
        exists: 0,
        error: 0,
      };

      Object.values(fileStatuses).forEach((status) => {
        if (status in stateCounts) {
          stateCounts[status as keyof typeof stateCounts]++;
        }
      });

      console.log("Current file status counts:", stateCounts);
      console.log("Upload completed:", uploadCompleted);
      console.log("Is uploading:", isUploading);
      console.log("Is all uploaded:", isAllUploaded);
    }
  }, [fileStatuses, uploadCompleted, isUploading, isAllUploaded, selectedFiles]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading && !connectingWebsocket) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading || connectingWebsocket) {
      return;
    }

    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    const maxSizePerFile = 50 * 1024 * 1024; // 50MB

    Array.from(fileList).forEach((file) => {
      const fileType = file.type.toLowerCase();
      const extension = file.name.split(".").pop()?.toLowerCase();

      const validTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const validExtensions = ["pdf", "txt", "doc", "docx"];

      if (
        (validTypes.includes(fileType) || (extension && validExtensions.includes(extension))) &&
        file.size <= maxSizePerFile
      ) {
        validFiles.push(file);
      } else {
        let reason = "";
        if (file.size > maxSizePerFile) {
          reason = `exceeds size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB > 50MB)`;
        } else {
          reason = "unsupported file type";
        }
        invalidFiles.push(`${file.name} (${reason})`);
      }
    });

    if (invalidFiles.length > 0) {
      const errorMessage = `Could not upload: ${invalidFiles.join(", ")}`;
      setUploadError(errorMessage);

      if (validFiles.length === 0) {
        return;
      }
    }

    const dataTransfer = new DataTransfer();
    validFiles.forEach((file) => dataTransfer.items.add(file));

    const filesForUpload = dataTransfer.files;
    setSelectedFiles(filesForUpload);
    setUploadCompleted(false);
    setFileStatuses({});
    setFileProgresses({});
    totalFilesRef.current = validFiles.length;
    completedFilesRef.current = 0;
    disconnectCalledRef.current = false;

    const initialStatuses: Record<string, FileStatus> = {};
    validFiles.forEach((file) => {
      initialStatuses[file.name] = "waiting";
    });
    setFileStatuses(initialStatuses);

    if (validFiles.length > 0) {
      console.log("Starting automatic upload process with WebSocket...");

      const startUpload = async () => {
        console.log("Auto-upload triggered for", validFiles.length, "files");

        if (onFileSelected) {
          onFileSelected(filesForUpload);
        }

        setUploadError(null);
        setConnectingWebsocket(true);

        try {
          console.log("Initiating uploadFiles WebSocket process");
          await uploadFiles(filesForUpload);
          console.log("WebSocket connection established successfully");
          setConnectingWebsocket(false);
        } catch (error) {
          console.error("WebSocket connection or upload failed:", error);
          setConnectingWebsocket(false);
          if (error instanceof Error) {
            setUploadError(error.message);
            setConnectionError(error);
          } else {
            setUploadError("An unknown error occurred during upload");
          }
        }
      };

      setTimeout(startUpload, 0);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleDone = () => {
    resetState();

    onOpenChange(false);
    queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    navigate(`/private-assets?t=${Date.now()}`, { replace: true });
  };

  const handleClose = () => {
    if (uploadCompleted) {
      handleDone();
    } else {
      onOpenChange(false);
    }
  };

  const retryConnection = async () => {
    setConnectionError(null);
    try {
      await connectWebSocket();
    } catch (error) {
      if (error instanceof Error) {
        setConnectionError(error);
      } else {
        setConnectionError(new Error("Failed to connect"));
      }
    }
  };

  const FileStatusIcon = ({ filename }: { filename: string }) => {
    const fileProgress = fileProgresses[filename];
    const fileStatus = fileStatuses[filename] || (fileProgress?.status as FileStatus) || "waiting";
    const progress = fileProgress?.progress || 0;

    switch (fileStatus) {
      case "exists":
        return <InfoIcon className="h-4 w-4 text-blue-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "uploaded":
        return <CheckCircle className="h-4 w-4 text-indigo-500" />;
      case "uploading":
        return <ArrowUpFromLine className="h-4 w-4 text-amber-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" />;
      case "analyzing":
        return <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />;
      case "waiting":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        if (progress === 100) {
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        } else if (progress > 0) {
          return <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />;
        }
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const PdfIcon = () => <img src={pdfIcon} alt="PDF" width="22" height="22" />;

  const truncateFilename = (filename: string, maxLength: number = 30) => {
    const extension = filename.split(".").pop();
    const name = filename.split(".").slice(0, -1).join(".");

    if (name.length <= maxLength) return filename;

    return `${name.substring(0, maxLength)}...${extension ? `.${extension}` : ""}`;
  };

  const getStatusLabel = ({ filename }: { filename: string }) => {
    const fileProgress = fileProgresses[filename];
    const fileStatus = fileStatuses[filename] || (fileProgress?.status as FileStatus) || "waiting";
    const progress = fileProgress?.progress || 0;

    switch (fileStatus) {
      case "exists":
        return (
          <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Already exists</span>
        );
      case "error":
        return <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Failed</span>;
      case "complete":
        return (
          <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Complete</span>
        );
      case "uploaded":
        return (
          <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Uploaded</span>
        );
      case "uploading":
        return (
          <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Uploading</span>
        );
      case "processing":
        return (
          <span className="text-xs font-medium text-cyan-500 bg-cyan-50 px-2 py-0.5 rounded-full">Processing</span>
        );
      case "analyzing":
        return (
          <span className="text-xs font-medium text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">Analyzing</span>
        );
      case "waiting":
        return <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">Waiting</span>;
      default:
        if (progress === 100) {
          return (
            <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Complete</span>
          );
        } else if (progress > 0) {
          return (
            <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
              Uploading ({progress}%)
            </span>
          );
        }
        return <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">Waiting</span>;
    }
  };

  const getProgressBarColor = (filename: string) => {
    const fileProgress = fileProgresses[filename];
    const status = fileStatuses[filename] || (fileProgress?.status as FileStatus) || "waiting";

    switch (status) {
      case "error":
        return "bg-red-500";
      case "exists":
        return "bg-blue-500";
      case "complete":
        return "bg-green-600";
      case "uploaded":
        return "bg-indigo-500";
      case "uploading":
        return "bg-amber-500";
      case "processing":
        return "bg-cyan-500";
      case "analyzing":
        return "bg-purple-500";
      default:
        return "bg-[#2DA395]";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open && !isUploading && !connectingWebsocket) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden"
        onInteractOutside={(e) => {
          if (isUploading || connectingWebsocket) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isUploading || connectingWebsocket) {
            e.preventDefault();
          } else {
            handleClose();
          }
        }}
      >
        {!(isUploading || connectingWebsocket) && (
          <DialogPrimitive.Close
            onClick={handleClose}
            disabled={isUploading || connectingWebsocket}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        <VisuallyHidden>
          <DialogTitle>Import Document</DialogTitle>
        </VisuallyHidden>
        <div className="p-6 max-w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-[#18181B]">Import Document</h2>
          </div>

          {
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isUploading || connectingWebsocket ? "opacity-75 pointer-events-none" : ""
              } ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <UploadIcon className="h-8 w-8 text-gray-400" />
                <p className="font-semibold text-[#18181B]">Drop File or Browse your local Computer</p>
                <p className="text-[#767A7F] text-sm">Formats: PDF, TXT, DOC, DOCX (Max 50MB per file)</p>
                <Button
                  variant="default"
                  className="bg-[#18181B] hover:bg-[#303035] text-white mt-2"
                  onClick={handleBrowseFiles}
                  disabled={isUploading || connectingWebsocket}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.doc"
                  className="hidden"
                  onChange={handleFileInputChange}
                  multiple
                  disabled={isUploading || connectingWebsocket}
                />
              </div>
            </div>
          }

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              <p className="font-medium mb-1">Error</p>
              <p>{uploadError}</p>
            </div>
          )}

          {connectionError && !isConnected && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium mb-1">Connection Issue</p>
                  <p>Unable to connect to the upload service.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 mt-0"
                  onClick={retryConnection}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {selectedFiles && (
            <div className="mt-6">
              <h3 className="font-semibold text-[#18181B] mb-3">
                {isUploading ? "Uploading" : uploadCompleted ? "Upload Complete" : "Selected Files"}
                {selectedFiles && (
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    ({Array.from(selectedFiles).length} files)
                  </span>
                )}
              </h3>

              <div style={{ maxHeight: "300px", overflow: "auto" }} className="pr-2">
                <div className="space-y-3">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="border border-[#E4E4E4] rounded-lg p-3 flex flex-col overflow-hidden">
                      <div className="flex items-center mb-2">
                        <PdfIcon />
                        <div className="ml-2 flex-1 overflow-hidden">
                          <p className="font-medium truncate">{truncateFilename(file.name)}</p>
                          <p className="text-sm text-gray-500 truncate">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <div className="flex items-center">
                          <FileStatusIcon filename={file.name} />
                        </div>
                      </div>
                      <div className="mt-auto">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Status</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-semibold leading-none text-[#2DA395]">
                                {fileProgresses[file.name]?.progress || 0}%
                              </span>
                              {getStatusLabel({ filename: file.name })}
                            </div>
                          </div>
                          <div className="h-[7px] rounded-[6px] bg-[#D4EBE9] w-full overflow-hidden">
                            <div
                              className={`h-[7px] rounded-[6px] transition-all duration-300 ease-out ${getProgressBarColor(
                                file.name
                              )}`}
                              style={{ width: `${fileProgresses[file.name]?.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {selectedFiles && (
            <div className="mt-4">
              <Button
                onClick={handleDone}
                disabled={isUploading || connectingWebsocket}
                className="w-full bg-[#18181B] hover:bg-[#303035] text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : uploadCompleted ? (
                  "Done"
                ) : null}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
