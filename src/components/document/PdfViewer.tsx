import { useEffect, useState, useRef } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCreateNote } from "@/lib/api/pdf-notes";
import { toast } from "sonner";

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

// interface PositionData {
//   rects: number[][];
//   page_width: number;
//   page_height: number;
//   text_node_indices: number[];
//   text_context: string;
//   character_start_index: number;
//   character_end_index: number;
// }

// interface HighlightData {
//   pdf_id: string;
//   page_number: number;
//   highlighted_text: string;
//   note_content: string;
//   position_data: PositionData;
//   highlight_color: string;
// }

export function PdfViewer({ pdfUrl, initialPage = 1 }: PdfViewerProps) {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevelType>(SpecialZoomLevel.PageWidth);
  const defaultZoomRef = useRef<ZoomLevelType>(SpecialZoomLevel.PageWidth);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const zoomStepsRef = useRef<number>(0);
  const initialZoomRef = useRef<boolean>(true);
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [highlightColor, setHighlightColor] = useState<string>("#EECBFE");

  const colors = ["#E6E7EB", "#D1FAE5", "#FEF3C7", "#DAEAFE", "#EEE9FE", "#F5D0FE", "#FEE2E2"];

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;
  const { jumpToPage } = pageNavigationPluginInstance;

  const createNoteMutation = useCreateNote();

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

  useEffect(() => {
    const handleTextSelection = () => {
      if (!viewerRef.current) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedTextContent = range.toString().trim();
      if (selectedTextContent === "") return;

      let isSelectionInViewer = false;
      let node = range.commonAncestorContainer;

      while (node && node !== document.body) {
        if (node === viewerRef.current) {
          isSelectionInViewer = true;
          break;
        }
        node = node.parentNode as Node;
      }

      if (!isSelectionInViewer) return;

      setSelectedText(selectedTextContent);
      setSelectionRange(range.cloneRange());
    };

    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("selectionchange", handleTextSelection);

    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("selectionchange", handleTextSelection);
    };
  }, []);

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
      setZoomLevel(1.1);
      zoomTo(1.1);
    } else {
      const newZoom = zoomLevel + 0.1;
      setZoomLevel(newZoom);
      zoomTo(newZoom);
    }
  };

  const handleZoomOut = () => {
    zoomStepsRef.current -= 1;

    if (typeof zoomLevel === "string") {
      setZoomLevel(0.9);
      zoomTo(0.9);
    } else if (zoomLevel > 0.25) {
      const newZoom = zoomLevel - 0.1;
      setZoomLevel(newZoom);
      zoomTo(newZoom);
    }
  };

  const resetZoom = () => {
    setZoomLevel(defaultZoomRef.current);
    zoomTo(defaultZoomRef.current);
  };

  const handleHighlightSelection = async () => {
    if (!selectedText || !selectionRange || !viewerRef.current) {
      return;
    }

    try {
      const pageNumber = currentPage;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const textLayer = viewerRef.current.querySelector(".rpv-core__text-layer");
      if (!textLayer) return;
      
      const rects = [];
      const domRects = range.getClientRects();
      
      for (let i = 0; i < domRects.length; i++) {
        const rect = domRects[i];
        const viewerRect = viewerRef.current.getBoundingClientRect();
        
        const relativeRect = [
          rect.left - viewerRect.left,
          rect.top - viewerRect.top,
          rect.right - viewerRect.left,
          rect.bottom - viewerRect.top
        ];
        
        rects.push(relativeRect);
      }
      
      const positionData = {
        rects: rects,
        page_width: textLayer.clientWidth,
        page_height: textLayer.clientHeight,
        text_node_indices: [],
        text_context: "",
        character_start_index: 0,
        character_end_index: 0
      };
      
      const documentId = window.location.pathname.split('/').pop();
      
      await createNoteMutation.mutateAsync({
        pdf_id: documentId,
        page_number: pageNumber,
        highlighted_text: selectedText,
        note_content: "",
        position_data: positionData,
        highlight_color: highlightColor
      });
      
      const highlightedSpan = document.createElement('span');
      highlightedSpan.style.backgroundColor = highlightColor;
      highlightedSpan.style.position = 'absolute';
      
      for (let i = 0; i < domRects.length; i++) {
        const rect = domRects[i];
        const viewerRect = viewerRef.current.getBoundingClientRect();
        
        const highlightDiv = document.createElement('div');
        highlightDiv.style.position = 'absolute';
        highlightDiv.style.left = `${rect.left - viewerRect.left}px`;
        highlightDiv.style.top = `${rect.top - viewerRect.top}px`;
        highlightDiv.style.width = `${rect.width}px`;
        highlightDiv.style.height = `${rect.height}px`;
        highlightDiv.style.backgroundColor = highlightColor;
        highlightDiv.style.opacity = '0.4';
        highlightDiv.style.pointerEvents = 'none';
        
        textLayer.appendChild(highlightDiv);
      }
      
      window.getSelection()?.removeAllRanges();
      setSelectedText("");
      setSelectionRange(null);
      
      const event = new CustomEvent("highlightCreated");
      window.document.dispatchEvent(event);
      
      toast.success("Text highlighted successfully");
    } catch (error) {
      console.error("Failed to highlight text:", error);
      toast.error("Failed to highlight text");
    }
  };

  const scrollToHighlight = (pageNumber: number, rects: number[][]) => {
    if (!pageNumber || !rects || rects.length === 0) return;
    
    jumpToPage(pageNumber - 1);
    
    setTimeout(() => {
      const textLayer = viewerRef.current?.querySelector(".rpv-core__text-layer");
      if (!textLayer) return;
      
      const rect = rects[0];
      
      const scrollTop = rect[1] - 100;
      viewerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
      
      const highlightIndicator = document.createElement('div');
      highlightIndicator.style.position = 'absolute';
      highlightIndicator.style.left = `${rect[0]}px`;
      highlightIndicator.style.top = `${rect[1]}px`;
      highlightIndicator.style.width = `${rect[2] - rect[0]}px`;
      highlightIndicator.style.height = `${rect[3] - rect[1]}px`;
      highlightIndicator.style.border = '2px solid #000';
      highlightIndicator.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
      highlightIndicator.style.animation = 'fadeOut 2s forwards';
      highlightIndicator.style.zIndex = '1000';
      
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
      
      textLayer.appendChild(highlightIndicator);
      
      setTimeout(() => {
        textLayer.removeChild(highlightIndicator);
        document.head.removeChild(style);
      }, 2000);
    }, 300);
  };

  useEffect(() => {
    const handleScrollToHighlight = (event: CustomEvent) => {
      const { pageNumber, rects } = event.detail;
      scrollToHighlight(pageNumber, rects);
    };
    
    window.document.addEventListener("scrollToHighlight", handleScrollToHighlight as EventListener);
    
    return () => {
      window.document.removeEventListener("scrollToHighlight", handleScrollToHighlight as EventListener);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2.5 pb-4 bg-white w-full">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-gray-500"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            <span className="px-2 py-1">
              {currentPage} of {totalPages || "1"}
            </span>
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-gray-500"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 text-gray-500" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 text-gray-500" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-gray-700" 
            disabled={!selectedText}
            onClick={handleHighlightSelection}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-14 px-1 overflow-hidden">
                <div className="flex items-center justify-between w-full h-full px-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: highlightColor }} />
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-2 pdf-viewer-color-dropdown">
              <div className="flex flex-col space-y-2">
                {colors.map((color) => (
                  <DropdownMenuItem
                    key={color}
                    className=" p-0 m-0 focus:bg-transparent cursor-pointer h-6 hover:bg-gray-100 rounded-sm"
                    onSelect={() => setHighlightColor(color)}
                  >
                    <div className="flex items-center justify-center w-full">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: color }} />
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-hidden w-full" ref={viewerRef}>
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
