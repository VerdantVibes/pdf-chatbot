import { useEffect, useState, useRef, useCallback } from "react";
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
import { NoteResponse } from "@/lib/api/pdf-notes";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "tippy.js/dist/tippy.css";

import "./pdf-viewer.css";

interface PdfViewerProps {
  pdfUrl: string;
  initialPage?: number;
  notes?: NoteResponse[];
}

type ZoomLevelType = number | SpecialZoomLevel;

interface PositionData {
  rects: number[][];
  page_width: number;
  page_height: number;
  text_node_indices: number[];
  text_context: string;
  character_start_index: number;
  character_end_index: number;
  zoom_level: number;
}

export function PdfViewer({ pdfUrl, initialPage = 1, notes = [] }: PdfViewerProps) {
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

  const pageViewboxRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const permanentHighlightsRef = useRef<{ [pageNumber: number]: HTMLDivElement[] }>({});

  const adjustColorBrightness = (hex: string, percent: number): string => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.min(255, Math.max(0, Math.round(r + (percent / 100) * 255)));
    g = Math.min(255, Math.max(0, Math.round(g + (percent / 100) * 255)));
    b = Math.min(255, Math.max(0, Math.round(b + (percent / 100) * 255)));

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const saturateColor = (hex: string, percent: number): string => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255;
      g /= 255;
      b /= 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0,
        s = 0,
        l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }

        h /= 6;
      }

      return [h, s, l];
    };

    const hslToRgb = (h: number, s: number, l: number) => {
      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    const [h, s, l] = rgbToHsl(r, g, b);
    const newS = Math.min(1, s + percent / 100); // Increase saturation
    const [newR, newG, newB] = hslToRgb(h, newS, l);

    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB
      .toString(16)
      .padStart(2, "0")}`;
  };

  const applyPermanentHighlights = useCallback(
    (specificPage?: number) => {
      if (!viewerRef.current) return;

      const validNotes = notes.filter(
        (note) =>
          note &&
          note.page_number &&
          note.position_data &&
          note.position_data.rects &&
          note.position_data.rects.length > 0 &&
          (!specificPage || note.page_number === specificPage)
      );

      if (validNotes.length === 0) return;

      console.log("[DEBUG] Applying permanent highlights for", specificPage ? `page ${specificPage}` : "all pages");

      validNotes.forEach((note) => {
        const pageNumber = note.page_number;

        if (specificPage && pageNumber !== specificPage) return;

        if (pageNumber === currentPage) {
          const textLayer = viewerRef.current?.querySelector(".rpv-core__text-layer");
          if (!textLayer) return;

          const effectiveZoom = typeof zoomLevel === "number" ? zoomLevel : 1;

          const highlightElements: HTMLDivElement[] = [];

          note.position_data.rects.forEach((rect) => {
            const left = rect[0] * textLayer.clientWidth;
            const top = rect[1] * textLayer.clientHeight;
            const width = (rect[2] - rect[0]) * textLayer.clientWidth;
            const height = (rect[3] - rect[1]) * textLayer.clientHeight;

            const highlightDiv = document.createElement("div");
            highlightDiv.style.position = "absolute";
            highlightDiv.style.left = `${left}px`;
            highlightDiv.style.top = `${top}px`;
            highlightDiv.style.width = `${width}px`;
            highlightDiv.style.height = `${height}px`;

            const highlightColorToUse = note.highlight_color || "#EECBFE";
            const adjustedColor = saturateColor(highlightColorToUse, 30);

            highlightDiv.style.backgroundColor = adjustedColor;
            highlightDiv.style.opacity = "1";
            highlightDiv.style.mixBlendMode = "multiply";
            highlightDiv.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            highlightDiv.style.pointerEvents = "none";
            highlightDiv.dataset.noteId = note.id;

            textLayer.appendChild(highlightDiv);
            highlightElements.push(highlightDiv);
          });

          permanentHighlightsRef.current[pageNumber] = permanentHighlightsRef.current[pageNumber]
            ? [...permanentHighlightsRef.current[pageNumber], ...highlightElements]
            : highlightElements;
        }
      });
    },
    [notes, currentPage, zoomLevel]
  );

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

      const updatePageDimensions = () => {
        const textLayer = viewerRef.current?.querySelector(".rpv-core__text-layer");
        if (textLayer) {
          pageViewboxRef.current = {
            width: textLayer.clientWidth,
            height: textLayer.clientHeight,
          };
        }
      };

      updatePageDimensions();

      const resizeObserver = new ResizeObserver(updatePageDimensions);
      if (pageLayer) {
        resizeObserver.observe(pageLayer as Element);
      }

      return () => {
        resizeObserver.disconnect();
      };
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

      const effectiveZoom = typeof zoomLevel === "number" ? zoomLevel : 1;

      const pageWidth = textLayer.clientWidth;
      const pageHeight = textLayer.clientHeight;

      const viewerRect = viewerRef.current.getBoundingClientRect();
      const textLayerRect = textLayer.getBoundingClientRect();

      const rects = [];
      const domRects = range.getClientRects();

      console.log("[DEBUG] Creating highlight with zoom:", effectiveZoom);
      console.log("[DEBUG] Page dimensions:", pageWidth, pageHeight);

      for (let i = 0; i < domRects.length; i++) {
        const rect = domRects[i];

        const relativeRect = [
          (rect.left - textLayerRect.left) / textLayerRect.width,
          (rect.top - textLayerRect.top) / textLayerRect.height,
          (rect.right - textLayerRect.left) / textLayerRect.width,
          (rect.bottom - textLayerRect.top) / textLayerRect.height,
        ];

        console.log("[DEBUG] Highlight rect %:", relativeRect);
        rects.push(relativeRect);
      }

      const positionData: PositionData = {
        rects: rects,
        page_width: pageWidth,
        page_height: pageHeight,
        text_node_indices: [],
        text_context: "",
        character_start_index: 0,
        character_end_index: 0,
        zoom_level: effectiveZoom,
      };

      const documentId = window.location.pathname.split("/").pop();

      if (!documentId) {
        console.error("Failed to extract document ID from URL");
        return;
      }

      await createNoteMutation.mutateAsync({
        pdf_id: documentId,
        page_number: pageNumber,
        highlighted_text: selectedText,
        note_content: "",
        position_data: positionData,
        highlight_color: highlightColor,
      });

      for (let i = 0; i < domRects.length; i++) {
        const rect = domRects[i];

        const highlightDiv = document.createElement("div");
        highlightDiv.style.position = "absolute";
        highlightDiv.style.left = `${rect.left - textLayerRect.left}px`;
        highlightDiv.style.top = `${rect.top - textLayerRect.top}px`;
        highlightDiv.style.width = `${rect.width}px`;
        highlightDiv.style.height = `${rect.height}px`;

        const adjustedColor = saturateColor(highlightColor, 30);

        highlightDiv.style.backgroundColor = adjustedColor;
        highlightDiv.style.opacity = "1";
        highlightDiv.style.mixBlendMode = "multiply";
        highlightDiv.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
        highlightDiv.style.pointerEvents = "none";

        textLayer.appendChild(highlightDiv);
      }

      window.getSelection()?.removeAllRanges();
      setSelectedText("");
      setSelectionRange(null);

      const event = new CustomEvent("highlightCreated");
      window.document.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to highlight text:", error);
    }
  };

  const scrollToHighlight = (pageNumber: number, rects: number[][]) => {
    if (!pageNumber || !rects || rects.length === 0) return;

    jumpToPage(pageNumber - 1);

    setTimeout(() => {
      const textLayer = viewerRef.current?.querySelector(".rpv-core__text-layer");
      if (!textLayer) {
        console.error("Text layer not found when trying to scroll to highlight");
        return;
      }

      const rect = rects[0];

      console.log("[DEBUG] Navigating to highlight");
      console.log("[DEBUG] Highlight rect %:", rect);

      const left = rect[0] * textLayer.clientWidth;
      const top = rect[1] * textLayer.clientHeight;
      const width = (rect[2] - rect[0]) * textLayer.clientWidth;
      const height = (rect[3] - rect[1]) * textLayer.clientHeight;

      console.log("[DEBUG] Calculated position px:", { left, top, width, height });

      const scrollTop = top - 100;
      if (viewerRef.current) {
        viewerRef.current.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      }

      const highlightIndicator = document.createElement("div");
      highlightIndicator.style.position = "absolute";
      highlightIndicator.style.left = `${left}px`;
      highlightIndicator.style.top = `${top}px`;
      highlightIndicator.style.width = `${width}px`;
      highlightIndicator.style.height = `${height}px`;
      highlightIndicator.style.backgroundColor = "rgba(255, 215, 0, 0.6)";
      highlightIndicator.style.boxShadow = "0 0 10px rgba(255, 215, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.5)";
      highlightIndicator.style.zIndex = "1000";

      const style = document.createElement("style");
      style.innerHTML = `
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `;
      highlightIndicator.style.animation = "fadeOut 2s, pulse 0.5s infinite";

      document.head.appendChild(style);
      textLayer.appendChild(highlightIndicator);

      setTimeout(() => {
        if (textLayer.contains(highlightIndicator)) {
          textLayer.removeChild(highlightIndicator);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 2000);
    }, 500);
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

  useEffect(() => {
    if (!isDocumentLoaded || notes.length === 0) return;

    Object.values(permanentHighlightsRef.current).forEach((highlights) => {
      highlights.forEach((highlight) => {
        if (highlight.parentNode) {
          highlight.parentNode.removeChild(highlight);
        }
      });
    });
    permanentHighlightsRef.current = {};

    const renderTimer = setTimeout(() => {
      applyPermanentHighlights();
    }, 1000);

    return () => clearTimeout(renderTimer);
  }, [notes, isDocumentLoaded, applyPermanentHighlights]);

  useEffect(() => {
    if (!isDocumentLoaded || notes.length === 0) return;

    const pageChangeTimer = setTimeout(() => {
      applyPermanentHighlights(currentPage);
    }, 300);

    return () => clearTimeout(pageChangeTimer);
  }, [currentPage, isDocumentLoaded, notes, applyPermanentHighlights]);

  useEffect(() => {
    if (!isDocumentLoaded || notes.length === 0) return;

    if (permanentHighlightsRef.current[currentPage]) {
      permanentHighlightsRef.current[currentPage].forEach((highlight) => {
        if (highlight.parentNode) {
          highlight.parentNode.removeChild(highlight);
        }
      });
      permanentHighlightsRef.current[currentPage] = [];
    }

    const zoomChangeTimer = setTimeout(() => {
      applyPermanentHighlights(currentPage);
    }, 300);

    return () => clearTimeout(zoomChangeTimer);
  }, [zoomLevel, isDocumentLoaded, notes, currentPage, applyPermanentHighlights]);

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
