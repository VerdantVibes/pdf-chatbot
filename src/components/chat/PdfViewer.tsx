import { Viewer, Worker } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import { RotateCw } from "lucide-react";

export default function PdfViewer({ pdfUrl }) {
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const {
    GoToNextPageButton,
    GoToPreviousPageButton,
    CurrentPageLabel,
    NumberOfPages,
  } = pageNavigationPluginInstance;

  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton, zoomTo } = zoomPluginInstance;

  return (
    <div className="relative h-[calc(100vh-129px)] w-full overflow-auto p-4 bg-[#fcfcfb] custom-scroll border-r border-stone-200 flex flex-col">
      <div className="bg-white w-full pdf_preview flex-1 overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            defaultScale={1.3}
            plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
          />
        </Worker>
      </div>

      {/* Controls */}
      <div className="sticky bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center gap-3 px-4 pt-2 pb-1 max-w-[300px]">
        <Tippy content="Previous Page">
          <div className="-rotate-90">
            <GoToPreviousPageButton />
          </div>
        </Tippy>
        <span className="text-sm font-medium text-[#707070]">
          <CurrentPageLabel /> of <NumberOfPages />
        </span>
        <Tippy content="Next Page">
          <div className="-rotate-90">
            <GoToNextPageButton />
          </div>
        </Tippy>

        {/* Zoom controls with tooltips */}
        <div className="flex items-center gap-1">
          <Tippy content="Zoom In">
            <div>
              <ZoomInButton />
            </div>
          </Tippy>
          <Tippy content="Reset Zoom">
            <button
              onClick={() => zoomTo(1.3)}
              className="rounded-sm hover:bg-[#0000001a] p-2 mb-[6px]"
            >
              <RotateCw width={16} height={16} color="#707070" />
            </button>
          </Tippy>
          <Tippy content="Zoom Out">
            <div>
              <ZoomOutButton />
            </div>
          </Tippy>
        </div>
      </div>
    </div>
  );
}
