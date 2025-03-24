import { Viewer, Worker } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { RotateCw } from "lucide-react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "tippy.js/dist/tippy.css";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PdfViewerProps {
  pdfUrl: string;
  selectedPdfs: Array<{
    id: string;
    filename: string;
  }>;
  onPdfChange: (pdfId: string) => void;
}

export const PdfViewer = ({ pdfUrl, selectedPdfs, onPdfChange }: PdfViewerProps) => {
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  const {
    GoToNextPageButton,
    GoToPreviousPageButton,
    CurrentPageLabel,
    NumberOfPages,
  } = pageNavigationPluginInstance;
  const { ZoomInButton, ZoomOutButton, zoomTo } = zoomPluginInstance;

  // Get the first PDF's ID as default value
  const defaultPdfId = selectedPdfs[0]?.id;

  return (
    <div className="relative h-[calc(100vh-129px)] w-full overflow-auto p-4 bg-[#fcfcfb] custom-scroll flex flex-col">
      <div className="sticky top-0 z-10 mb-4 flex justify-end">
        <Select onValueChange={onPdfChange} defaultValue={defaultPdfId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue>
              {selectedPdfs[0]?.filename || "Select a PDF"}
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

      <div className="bg-white w-full pdf_preview flex-1 overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            defaultScale={1.3}
            plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
          />
        </Worker>
      </div>

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
              <button
                onClick={() => zoomTo(1.3)}
                className="rounded-sm hover:bg-[#0000001a] p-2 mb-[6px]"
              >
                <RotateCw width={16} height={16} color="#707070" />
              </button>
            </div>
            <div>
              <ZoomInButton />
            </div>
        </div>
      </div>
    </div>
  );
}; 