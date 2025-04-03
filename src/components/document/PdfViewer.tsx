import { useEffect, useState, useRef } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "tippy.js/dist/tippy.css";

import "./pdf-viewer.css";

interface PdfViewerProps {
  pdfUrl: string;
  initialPage?: number;
}

type ZoomLevelType = number | SpecialZoomLevel;

export function PdfViewer({ pdfUrl, initialPage = 1 }: PdfViewerProps) {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevelType>(SpecialZoomLevel.PageWidth);
  const defaultZoomRef = useRef<ZoomLevelType>(SpecialZoomLevel.PageWidth);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const zoomStepsRef = useRef<number>(0);
  const initialZoomRef = useRef<boolean>(true);

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;
  const { jumpToPage } = pageNavigationPluginInstance;

  useEffect(() => {
    if (initialPage > 1 && isDocumentLoaded) {
      jumpToPage(initialPage - 1);
    }
  }, [initialPage, jumpToPage, isDocumentLoaded]);

  useEffect(() => {
    if (!isDocumentLoaded) return;

    const pageLayer = document.querySelector(".rpv-core__page-layer");
    if (pageLayer) {
      (pageLayer as HTMLElement).style.display = "flex";
      (pageLayer as HTMLElement).style.justifyContent = "center";
    }
  }, [zoomLevel, isDocumentLoaded]);

  useEffect(() => {
    if (zoomStepsRef.current === 0 && !initialZoomRef.current) {
      resetZoom();
    }

    if (initialZoomRef.current && isDocumentLoaded) {
      initialZoomRef.current = false;
    }
  }, [zoomStepsRef.current, isDocumentLoaded]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      jumpToPage(currentPage - 2);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      jumpToPage(currentPage);
    }
  };

  const handleZoomIn = () => {
    zoomStepsRef.current += 1;

    if (typeof zoomLevel === "string") {
      setZoomLevel(1.25);
      zoomTo(1.25);
    } else {
      const newZoom = zoomLevel + 0.25;
      setZoomLevel(newZoom);
      zoomTo(newZoom);
    }
  };

  const handleZoomOut = () => {
    zoomStepsRef.current -= 1;

    if (typeof zoomLevel === "string") {
      setZoomLevel(0.75);
      zoomTo(0.75);
    } else if (zoomLevel > 0.25) {
      const newZoom = zoomLevel - 0.25;
      setZoomLevel(newZoom);
      zoomTo(newZoom);
    }
  };

  const resetZoom = () => {
    setZoomLevel(defaultZoomRef.current);
    zoomTo(defaultZoomRef.current);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2.5 pb-4 bg-white w-full">
        <div className="flex items-center">
          <button
            className="p-1.5 rounded-sm hover:bg-gray-100 border border-gray-200"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          </button>
          <span className="text-sm text-gray-500">
            <span className="px-2 py-1">
              {currentPage} of {totalPages || "1"}
            </span>
          </span>
          <button
            className="p-1.5 rounded-sm hover:bg-gray-100 border border-gray-200"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1 rounded-sm hover:bg-gray-100 border border-gray-200" onClick={handleZoomIn}>
            <ZoomIn className="h-5 w-5 text-gray-900" />
          </button>
          <button className="p-1 rounded-sm hover:bg-gray-100 border border-gray-200" onClick={handleZoomOut}>
            <ZoomOut className="h-5 w-5 text-gray-900" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden w-full">
        <div className="pdf-container h-full w-full">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfUrl}
              defaultScale={SpecialZoomLevel.PageWidth}
              plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
              onDocumentLoad={(e) => {
                setTotalPages(e.doc.numPages);
                setIsDocumentLoaded(true);
              }}
              onPageChange={(e) => {
                setCurrentPage(e.currentPage + 1);
              }}
              onZoom={(e) => {
                setZoomLevel(e.scale);
              }}
              renderPage={(props) => (
                <div className="flex justify-center w-full">
                  {props.canvasLayer.children}
                  {props.textLayer.children}
                  {props.annotationLayer.children}
                </div>
              )}
            />
          </Worker>
        </div>
      </div>
    </div>
  );
}
