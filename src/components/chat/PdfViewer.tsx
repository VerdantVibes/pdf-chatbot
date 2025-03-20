import { Viewer, Worker } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/core/lib/styles/index.css"; // Import necessary styles
import "@react-pdf-viewer/zoom/lib/styles/index.css"; // Import zoom styles

export default function PdfViewer({ pdfUrl }) {
  // Initialize the zoom plugin
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  return (
    <div className="relative h-[calc(100vh-129px)] w-full overflow-auto p-4 bg-[#fcfcfb] custom-scroll border-r border-stone-200">
      <div className="bg-white w-full pdf_preview">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[zoomPluginInstance]}
            defaultScale={1.3}
          />
        </Worker>
      </div>
      {/* Zoom Controls */}
      <div className="sticky bottom-0 left-1/2 pt-1 px-2 transform -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center gap-4 max-w-[100px]">
        <ZoomInButton></ZoomInButton>
        <ZoomOutButton></ZoomOutButton>
      </div>
    </div>
  );
}
