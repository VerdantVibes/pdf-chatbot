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
// import { useCreateNote } from "@/lib/api/pdf-notes";
// import { toast } from "sonner";

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

  // const createNoteMutation = useCreateNote();

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

  // const handlePlusButtonClick = () => {
  //   if (!selectedText) return;

  //   const urlParts = pdfUrl.split("/");
  //   const pdfId = urlParts.length >= 2 ? urlParts[urlParts.length - 2] : "3fa85f64-5717-4562-b3fc-2c963f66afa6";

  //   const textLayer = document.querySelector(".rpv-core__text-layer");
  //   const pageContainer = document.querySelector(".rpv-core__viewer-current");
  //   const pageCanvas = pageContainer?.querySelector(".rpv-core__page-layer-canvas");

  //   let pageWidth = 0;
  //   let pageHeight = 0;

  //   if (pageCanvas instanceof HTMLElement) {
  //     pageWidth = pageCanvas.offsetWidth;
  //     pageHeight = pageCanvas.offsetHeight;
  //   }

  //   let rects: number[][] = [[0]];

  //   if (selectionRange && textLayer) {
  //     try {
  //       const clientRects = selectionRange.getClientRects();

  //       if (clientRects.length > 0) {
  //         const textLayerRect = textLayer.getBoundingClientRect();

  //         rects = Array.from(clientRects).map((rect) => [
  //           Math.round(rect.left - textLayerRect.left),
  //           Math.round(rect.top - textLayerRect.top),
  //           Math.round(rect.right - textLayerRect.left),
  //           Math.round(rect.bottom - textLayerRect.top),
  //         ]);
  //       }
  //     } catch (e) {
  //       console.error("Error getting selection rectangles:", e);
  //     }
  //   }

  //   let textContext = selectedText;
  //   let characterStartIndex = 0;
  //   let characterEndIndex = selectedText.length;

  //   if (textLayer && textLayer.textContent) {
  //     const fullText = textLayer.textContent;
  //     const selectionIndex = fullText.indexOf(selectedText);

  //     if (selectionIndex !== -1) {
  //       const contextLength = 50;
  //       const startContext = Math.max(0, selectionIndex - contextLength);
  //       const endContext = Math.min(fullText.length, selectionIndex + selectedText.length + contextLength);

  //       textContext = fullText.substring(startContext, endContext);
  //       characterStartIndex = selectionIndex - startContext;
  //       characterEndIndex = characterStartIndex + selectedText.length;
  //     }
  //   }

  //   const textNodeIndices = Array.from({ length: selectedText.length }, (_, i) => characterStartIndex + i);

  //   const highlightData = {
  //     pdf_id: pdfId,
  //     page_number: currentPage - 1,
  //     highlighted_text: selectedText,
  //     note_content: "",
  //     position_data: {
  //       rects: rects,
  //       page_width: pageWidth,
  //       page_height: pageHeight,
  //       text_node_indices: textNodeIndices,
  //       text_context: textContext,
  //       character_start_index: characterStartIndex,
  //       character_end_index: characterEndIndex,
  //     },
  //     highlight_color: highlightColor,
  //   };

  //   saveHighlight(highlightData);

  //   window.getSelection()?.removeAllRanges();
  //   setSelectedText("");
  //   setSelectionRange(null);
  // };

  // const saveHighlight = async (highlightData: HighlightData) => {
  //   try {
  //     toast.info("Highlighting text...", {
  //       id: "highlight-toast",
  //       duration: 2000,
  //     });

  //     await createNoteMutation.mutateAsync({
  //       pdf_id: highlightData.pdf_id,
  //       page_number: highlightData.page_number,
  //       highlighted_text: highlightData.highlighted_text,
  //       note_content:
  //         highlightData.note_content ||
  //         `Highlight: ${highlightData.highlighted_text.substring(0, 30)}${
  //           highlightData.highlighted_text.length > 30 ? "..." : ""
  //         }`,
  //       position_data: highlightData.position_data,
  //       highlight_color: highlightData.highlight_color,
  //     });

  //     toast.success("Text highlighted successfully", {
  //       id: "highlight-toast",
  //       duration: 2000,
  //     });

  //     const customEvent = new CustomEvent("highlightCreated", { detail: highlightData });
  //     window.document.dispatchEvent(customEvent);
  //   } catch (error) {
  //     console.error("Error saving highlight:", error);
  //     toast.error("Failed to highlight text. Please try again.", {
  //       id: "highlight-toast",
  //     });
  //   }
  // };

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
          <Button variant="outline" size="icon" className="h-8 w-8 text-gray-700" disabled={!selectedText}>
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
