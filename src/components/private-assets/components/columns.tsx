import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Pdf } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { AtSign, Eye, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PreviewModal } from "@/components/ui/preview-modal/PreviewModal";
import { DocumentContentView } from "./document-content-view";

type ExtendedColumnDef<T> = ColumnDef<T> & {
  identifier?: string;
};

function FileNameCell({ row, table }: { row: any; table: any }) {
  const currentIndex = table.getCoreRowModel().flatRows.findIndex((r: any) => r.original.id === row.original.id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(currentIndex);

  const handlePreview = () => {
    setCurrentPreviewIndex(currentIndex);
    setPreviewOpen(true);
  };

  return (
    <>
      <PreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        content={
          <DocumentContentView
            document={table.getCoreRowModel().flatRows?.[currentPreviewIndex]?.original}
            selectedPdfs={[
              {
                id: table.getCoreRowModel().flatRows?.[currentPreviewIndex]?.original.id,
                filename: table.getCoreRowModel().flatRows?.[currentPreviewIndex]?.original.filename,
              },
            ]}
            currentPdfId={table.getCoreRowModel().flatRows?.[currentPreviewIndex]?.original.id}
          />
        }
        currentIndex={currentPreviewIndex}
        totalItems={table.getCoreRowModel().flatRows.length}
        onNavigate={setCurrentPreviewIndex}
      />

      <div className="w-fit space-y-2 group relative">
        <div className="font-semibold">{row.original?.email_subject}</div>
        <div className="flex items-center space-x-2 text-gray-500">
          <File className="h-3 w-3" />
          <span className="text-xs">{row.getValue("filename")}</span>
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
}

export const columns: ExtendedColumnDef<Pdf>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "filename",
    header: ({ column }) => <DataTableColumnHeader column={column} title="File name" />,
    cell: ({ row, table }) => <FileNameCell row={row} table={table} />,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "source",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-1">
          <Badge variant={"outline"} className="w-fit">
            <div className="flex items-center space-x-1">
              <AtSign className="h-3 w-3" />
              <span>{row.getValue("source")}</span>
            </div>
          </Badge>
          <div className="font-medium w-fit">{row.original?.author[0]}</div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "Topics",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Topics" />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap max-w-32 items-center gap-1.5">
          {row.original?.sector?.map((sector) => (
            <Badge key={sector} variant={"outline"}>
              <div className="flex items-center space-x-1 text-nowrap">
                <span className="font-medium">{sector}</span>
              </div>
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    accessorKey: "Summary",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Summary" />,
    cell: ({ row }) => {
      return (
        <div
          className="max-w-sm overflow-hidden text-ellipsis"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {row.original?.analysis?.ai_summary}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    identifier: "Added",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-center w-fit bg-[#D4EBE9] text-black text-xs text-nowrap px-2 py-1 font-medium rounded">
          {date.getDate()} {date.toLocaleString("default", { month: "short" })} {date.getFullYear()}
        </div>
      );
    },
    enableSorting: true,
  },
];
