import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { ChatView } from "@/components/chat/ChatView";
import { PdfViewer } from "@/components/chat/PdfViewer";
import { useLocation, useNavigate } from "react-router-dom";

export default function Chat() {
  const [isFileViewOpen, setIsFileViewOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.selectedRows?.length) {
      navigate("/private-assets", { replace: true });
    }
  }, []);

  const selectedRows = location.state?.selectedRows || [];
  const selectedFiles = location.state?.selectedFiles || [];
  const currentPdfId = selectedRows[0];
  const pdfUrl = currentPdfId ? `${import.meta.env.VITE_API_URL}/pdf/${currentPdfId}/content` : null;

  const selectedPdfs = selectedFiles.map((file: { id: string; filename: string }) => ({
    id: file.id,
    filename: file.filename
  }));

  const [currentPdfUrl, setCurrentPdfUrl] = useState(pdfUrl!);

  const handlePdfChange = (newPdfId: string) => {
    const newPdfUrl = `${import.meta.env.VITE_API_URL}/pdf/${newPdfId}/content`;
    setCurrentPdfUrl(newPdfUrl);
  };

  return (
    <div className="hidden h-full flex-1 flex-col md:flex">
      <div className="flex w-full h-full overflow-hidden border-t border-stone-200">
        {/* File View Opener */}
        {!isFileViewOpen && (
          <button
            className="absolute top-0 left-0 flex items-center gap-1 text-sm text-stone-700 font-semibold pl-2 pt-2 z-[99]"
            onClick={() => setIsFileViewOpen(true)}
          >
            File viewer <ChevronRight width={14} />
          </button>
        )}

        {/* PDF Viewer Section */}
        {isFileViewOpen && pdfUrl && (
          <div className="basis-1/2">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 h-12">
              <h4 className="text-sm font-semibold flex items-center gap-1 text-stone-900">
                <FileText width={16} /> PDF View{" "}
                <span className="text-stone-500 font-normal">
                  ({selectedPdfs.length} Selected)
                </span>
              </h4>
              <button
                className="flex items-center gap-1 text-sm text-stone-700 font-medium"
                onClick={() => setIsFileViewOpen(false)}
              >
                <ChevronLeft width={14} /> Hide view
              </button>
            </div>
            <PdfViewer 
              pdfUrl={currentPdfUrl}
              selectedPdfs={selectedPdfs}
              onPdfChange={handlePdfChange}
            />
          </div>
        )}

        {/* Chat Section */}
        <div className={`flex-1 ${isFileViewOpen ? '' : 'lg:max-w-[65%] mx-auto'}`}>
          <ChatView />
        </div>
      </div>
    </div>
  );
}
