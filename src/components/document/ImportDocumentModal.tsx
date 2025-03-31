import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadIcon, Loader2 } from "lucide-react";
import pdfIcon from "@/assets/pdficon.svg";
import { usePdfWebSocket } from "@/hooks/usePdfWebSocket";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface ImportDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelected?: (files: FileList) => void;
}

export function ImportDocumentModal({
  open,
  onOpenChange,
  onFileSelected
}: ImportDocumentModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  
  const {
    isUploading,
    fileProgresses,
    uploadFiles,
    reset,
  } = usePdfWebSocket();
  
  const [, setLocalIsAllUploaded] = useState(true);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedFiles(null);
      setUploadCompleted(false);
      reset();
    }
  }, [open, reset]);
  
  // Modify the useEffect that tracks file progress
  useEffect(() => {
    if (selectedFiles) {
      const allFiles = Array.from(selectedFiles).map(file => file.name);
      
      // Check if we have progress data for all files
      const hasProgressData = allFiles.some(filename => 
        fileProgresses[filename]?.progress !== undefined
      );
      
      // If we've started tracking progress, check completion
      if (hasProgressData) {
        const allCompleted = allFiles.every(
          filename => fileProgresses[filename]?.progress === 100
        );
        
        if (allCompleted && allFiles.length > 0) {
          setLocalIsAllUploaded(true);
          setUploadCompleted(true);
        } else if (isUploading) {
          // If uploading but not completed, ensure we show spinner
          setLocalIsAllUploaded(false);
        }
      }
    }
  }, [fileProgresses, selectedFiles, isUploading]);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (fileList: FileList) => {
    setSelectedFiles(fileList);
    setUploadCompleted(false);
  };
  
  const handleUpload = async () => {
    if (!selectedFiles) return;
    
    // Set loading state immediately
    setLocalIsAllUploaded(false);
    setUploadCompleted(false);
    
    // Pass files to onFileSelected callback if provided
    if (onFileSelected) {
      onFileSelected(selectedFiles);
    }
    
    // Start WebSocket upload
    await uploadFiles(selectedFiles);
  };
  
  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };
  
  const handleDone = () => {
    // Clear the selected files and progress
    setSelectedFiles(null);
    setUploadCompleted(false);
    reset();
    
    // Close the modal
    onOpenChange(false);
    
    // Invalidate the PDF query cache to force a refetch
    queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    
    // Redirect to private-assets page with timestamp to ensure refresh
    navigate(`/private-assets?t=${Date.now()}`, { replace: true });
  };

  // Replace the PdfIcon component with an image
  const PdfIcon = () => (
    <img src={pdfIcon} alt="PDF" width="22" height="22" />
  );

  // Add this helper function to truncate filename
  const truncateFilename = (filename: string, maxLength: number = 30) => {
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    
    if (name.length <= maxLength) return filename;
    
    return `${name.substring(0, maxLength)}...${extension ? `.${extension}` : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="p-6 max-w-full">
          {/* Header with title */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-[#18181B]">
              Import Document
            </h2>
          </div>
          
          {/* Drop area */}
          {(
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <UploadIcon className="h-8 w-8 text-gray-400" />
                <p className="font-semibold text-[#18181B]">
                  Drop File or Browse your local Computer
                </p>
                <p className="text-[#767A7F] text-sm">
                  Formats: PDF, TXT, DOC,
                </p>
                <Button 
                  variant="default"
                  className="bg-[#18181B] hover:bg-[#303035] text-white mt-2" 
                  onClick={handleBrowseFiles}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileInputChange}
                  multiple
                />
              </div>
            </div>
          )}
          
          {/* Uploading files area */}
          {selectedFiles && (
            <div className="mt-6">
              <h3 className="font-semibold text-[#18181B] mb-3">
                {isUploading || uploadCompleted ? "Uploading" : "Selected Files"}
              </h3>
              <div className="space-y-3">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="border border-[#E4E4E4] rounded-lg p-3 flex flex-col overflow-hidden">
                    <div className="flex items-center mb-2">
                      <PdfIcon />
                      <div className="ml-2 flex-1 overflow-hidden">
                        <p className="font-medium truncate">
                          {truncateFilename(file.name)}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {truncateFilename(file.name)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-[7px] rounded-[6px] bg-[#D4EBE9]">
                          <div 
                            className="h-[7px] rounded-[6px] bg-[#2DA395] transition-all duration-300" 
                            style={{ width: `${fileProgresses[file.name]?.progress || 0}%` }}
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-[12px] font-semibold leading-none text-[#2DA395]">
                            {fileProgresses[file.name]?.progress || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Single unified button for all states */}
          {selectedFiles && (
            <div className="mt-4">
              <Button 
                onClick={uploadCompleted ? handleDone : handleUpload}
                disabled={isUploading}
                className="w-full bg-[#18181B] hover:bg-[#303035] text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : uploadCompleted ? (
                  'Done'
                ) : (
                  'Upload Files'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 