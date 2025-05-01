import { PdfViewer } from "../../chat/PdfViewer";

interface SimplePdfViewerProps {
  pdfUrl: string;
  selectedPdfs: Array<{
    id: string;
    filename: string;
  }>;
  onPdfChange: (pdfId: string) => void;
  initialPage?: number;
}

export function SimplePdfViewer({ pdfUrl, selectedPdfs, onPdfChange, initialPage = 1 }: SimplePdfViewerProps) {
  return (
    <div className="h-full relative">
      <PdfViewer
        pdfUrl={pdfUrl}
        selectedPdfs={selectedPdfs}
        onPdfChange={onPdfChange}
        initialPage={initialPage}
        simplified={true}
      />
    </div>
  );
}
