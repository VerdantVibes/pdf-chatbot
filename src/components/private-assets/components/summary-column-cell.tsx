import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewModal } from "@/components/ui/preview-modal/PreviewModal";
import { DocumentContentView } from "./document-content-view";

interface SummaryColumnCellProps {
  table: any;
}

export const SummaryColumnCell: React.FC<SummaryColumnCellProps> = ({
  table,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(
    table?.table
      ?.getCoreRowModel()
      ?.flatRows?.findIndex(
        (row: any) => row?.original?.id === table?.row?.original?.id
      )
  );
  const handlePreview = () => {
    setPreviewOpen(true);
  };

  useEffect(() => {
    if (!previewOpen) {
      setCurrentIndex(
        table?.table
          ?.getCoreRowModel()
          ?.flatRows?.findIndex(
            (row: any) => row?.original?.id === table?.row?.original?.id
          )
      );
    }
  }, [previewOpen]);

  return (
    <>
      <PreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        content={
          <DocumentContentView
            document={
              table?.table
                ?.getCoreRowModel()
                ?.flatRows?.find(
                  (row: any) =>
                    row?.original?.id ===
                    table?.table?.getCoreRowModel()?.flatRows?.[currentIndex]
                      ?.original?.id
                )?.original
            }
          />
        }
        currentIndex={currentIndex}
        totalItems={table?.table?.getCoreRowModel()?.flatRows?.length}
        onNavigate={setCurrentIndex}
      />
      <div className="group relative">
        <div
          className="max-w-sm overflow-hidden text-ellipsis transition-opacity group-hover:opacity-80"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {table.row.original?.analysis?.ai_summary}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="backdrop-blur-[2px] bg-white/40 dark:bg-gray-900/40 rounded-lg p-1.5 shadow-lg border border-gray-200/50 dark:border-gray-700/50 transform -translate-y-1 group-hover:translate-y-0 transition-transform">
            <Button
              onClick={handlePreview}
              size="sm"
              variant="default"
              className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:shadow px-3 py-1.5 h-auto font-medium text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Open Preview
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
