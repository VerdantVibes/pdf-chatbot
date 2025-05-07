import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { ChatView } from "@/components/chat/ChatView";
import { PdfViewer } from "@/components/chat/PdfViewer";
import { useLocation, useNavigate } from "react-router-dom";
import { FileUpload } from "@/components/chat/FileUpload";
import { buildChatIndex } from "@/lib/api/chat";
import { Button } from "@/components/ui/button";

export function Chat() {
  const [isFileViewOpen, setIsFileViewOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const selectedRows = location.state?.selectedRows || [];
  const selectedFiles = location.state?.selectedFiles || [];
  const currentPdfId = selectedRows[0];
  const pdfUrl = currentPdfId ? `${import.meta.env.VITE_API_URL}/pdf/${currentPdfId}/content` : null;

  const selectedPdfs = selectedFiles.map((file: { id: string; filename: string }) => ({
    id: file.id,
    filename: file.filename,
  }));

  const [currentPdfUrl, setCurrentPdfUrl] = useState(pdfUrl!);

  const handlePdfChange = (newPdfId: string, page?: number) => {
    const newPdfUrl = `${import.meta.env.VITE_API_URL}/pdf/${newPdfId}/content`;
    setCurrentPdfUrl(newPdfUrl);
    if (page) {
      setCurrentPage(page);
    }
  };

  const handleUploadComplete = async (fileInfo: any) => {
    try {
      const response = await buildChatIndex([fileInfo.id]);
      if (response.status === "success") {
        navigate("/chat", {
          state: {
            selectedRows: [fileInfo.id],
            selectedFiles: [
              {
                id: fileInfo.id,
                filename: fileInfo.filename,
              },
            ],
            faissIndexPath: response.index_path,
            mode: "chat",
          },
          replace: true,
        });
      }
    } catch (error) {
      console.error("Error building chat index:", error);
    }
  };

  // Show upload interface if no files selected
  if (!selectedRows.length) {
    return <FileUpload onUploadComplete={handleUploadComplete} />;
  }

  return (
    <div className="hidden h-full flex-1 flex-col md:flex">
      <div className="flex w-full h-full overflow-hidden border-t border-stone-200">
        {/* File View Opener */}
        {!isFileViewOpen && (
          <Button
            variant="ghost"
            className="absolute top-0 left-0 flex items-center gap-1 text-sm text-stone-700 font-semibold pl-2 pt-2 z-[99]"
            onClick={() => setIsFileViewOpen(true)}
          >
            File viewer <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* PDF Viewer Section */}
        {isFileViewOpen && pdfUrl && (
          <div className="basis-1/2">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 h-12">
              <h4 className="text-sm font-semibold flex items-center gap-1 text-stone-900">
                <FileText className="h-4 w-4" /> PDF View{" "}
                <span className="text-stone-500 font-normal">({selectedPdfs.length} Selected)</span>
              </h4>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-sm text-stone-700 font-medium h-8 px-2"
                onClick={() => setIsFileViewOpen(false)}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Hide view
              </Button>
            </div>
            <PdfViewer
              pdfUrl={currentPdfUrl}
              selectedPdfs={selectedPdfs}
              onPdfChange={(pdfId) => handlePdfChange(pdfId)}
              initialPage={currentPage}
            />
          </div>
        )}

        {/* Chat Section */}
        <div className={`flex-1 ${isFileViewOpen ? "" : "lg:max-w-[65%] mx-auto"}`}>
          <ChatView onPdfChange={handlePdfChange} />
        </div>
      </div>
    </div>
  );
}
