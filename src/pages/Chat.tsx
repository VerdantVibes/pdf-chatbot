import { useState } from "react";
import PdfViewer from "@/components/chat/PdfViewer";
import pdfUrl from "../assets/sample.pdf";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import ChatView from "@/components/chat/ChatView";

export default function Chat() {
  const [isFileViewOpen, setIsFileViewOpen] = useState(true);

  return (
    <div className="min-h-full flex relative border-t border-stone-200">
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
      {isFileViewOpen && (
        <div className="basis-1/2">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 h-12">
            <h4 className="text-sm font-semibold flex items-center gap-1 text-stone-900">
              <FileText width={16} /> PDF View{" "}
              <span className="text-stone-500 font-normal">(1 Selected)</span>
            </h4>
            <button
              className="flex items-center gap-1 text-sm text-stone-700 font-medium"
              onClick={() => setIsFileViewOpen(false)}
            >
              <ChevronLeft width={14} /> Hide view
            </button>
          </div>
          <PdfViewer pdfUrl={pdfUrl} />
        </div>
      )}

      {/* Chat Section */}
      <div className="flex-1 lg:max-w-[65%] mx-auto">
        <ChatView />
      </div>
    </div>
  );
}
