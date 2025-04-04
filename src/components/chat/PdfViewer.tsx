import { Viewer, Worker } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "tippy.js/dist/tippy.css";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PdfViewerProps {
  pdfUrl: string;
  selectedPdfs: Array<{
    id: string;
    filename: string;
  }>;
  onPdfChange: (pdfId: string) => void;
  initialPage?: number;
  simplified?: boolean;
}

export function PdfViewer({ pdfUrl, selectedPdfs, onPdfChange, initialPage = 1, simplified = false }: PdfViewerProps) {
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton, zoomTo } = zoomPluginInstance;
  const { CurrentPageLabel, GoToNextPageButton, GoToPreviousPageButton, NumberOfPages, jumpToPage } =
    pageNavigationPluginInstance;

  // Set initial page when component mounts or when initialPage changes
  useEffect(() => {
    if (initialPage > 1) {
      jumpToPage(initialPage - 1);
    }
  }, [initialPage, jumpToPage]);

  // Get the first PDF's ID as default value
  const defaultPdfId = selectedPdfs[0]?.id;

  // Extract the file ID from the URL (second to last segment)
  const getFileIdFromUrl = (url: string) => {
    const segments = url.split("/").filter(Boolean);
    return segments.length >= 2 ? segments[segments.length - 2] : "";
  };

  return (
    <div className="relative h-[calc(100vh-129px)] w-full overflow-auto p-4 bg-[#fcfcfb] custom-scroll flex flex-col">
      {/* Only show dropdown if not simplified */}
      {!simplified && (
        <div className="sticky top-0 z-10 mb-4 flex justify-end">
          <Select onValueChange={onPdfChange} defaultValue={defaultPdfId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a PDF">
                {selectedPdfs.find((pdf) => pdf.id === getFileIdFromUrl(pdfUrl))?.filename}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {selectedPdfs.map((pdf) => (
                <SelectItem key={pdf.id} value={pdf.id}>
                  {pdf.filename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* PDF Content */}
      <div className="flex-1">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl={pdfUrl} defaultScale={1} plugins={[pageNavigationPluginInstance, zoomPluginInstance]} />
        </Worker>
      </div>

      {/* Only show controls if not simplified */}
      {!simplified && (
        <div className="sticky bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center gap-3 px-4 pt-2 pb-1 max-w-[300px]">
          <GoToPreviousPageButton />
          <span className="text-sm font-medium text-[#707070]">
            <CurrentPageLabel /> of <NumberOfPages />
          </span>
          <GoToNextPageButton />

          <div className="flex items-center gap-1">
            <div>
              <ZoomOutButton />
            </div>
            <div>
              <Button
                onClick={() => zoomTo(1.3)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-sm text-[#707070]"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <ZoomInButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
