import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { ThumbsDown, ThumbsUp, Bookmark } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteDocuments } from "@/lib/api/knowledge-base";
import { buildChatIndex } from "@/lib/api/chat";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { TableSelectionActions } from "./table-selection-actions";
import { DocumentSidebar } from "./sidebar/document-sidebar";
import { getColumns } from "./columns";
import { FilesTabs } from "./files-tabs";
import { ViewMode } from "./view-mode";

const ShareIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="19" 
    height="20" 
    viewBox="0 0 19 20" 
    fill="none"
    className="w-4 h-4 text-neutral-600"
    >
    <path d="M15.3016 6.4C16.7927 6.4 18.0016 5.19117 18.0016 3.7C18.0016 2.20883 16.7927 1 15.3016 1C13.8104 1 12.6016 2.20883 12.6016 3.7C12.6016 5.19117 13.8104 6.4 15.3016 6.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.50469 12.6998C5.99586 12.6998 7.20469 11.491 7.20469 9.9998C7.20469 8.50864 5.99586 7.2998 4.50469 7.2998C3.01352 7.2998 1.80469 8.50864 1.80469 9.9998C1.80469 11.491 3.01352 12.6998 4.50469 12.6998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.3016 18.9996C16.7927 18.9996 18.0016 17.7908 18.0016 16.2996C18.0016 14.8084 16.7927 13.5996 15.3016 13.5996C13.8104 13.5996 12.6016 14.8084 12.6016 16.2996C12.6016 17.7908 13.8104 18.9996 15.3016 18.9996Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.83594 11.3594L12.9829 14.9414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.9739 5.05957L6.83594 8.64157" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onSelectionChange: (selectedRows: string[]) => void;
  onSortingChange?: (field: string, direction: string) => void;
  onFiltersChange?: (filters: {
    selectedAuthors: string[];
    selectedCategories: string[];
    selectedSectors: string[];
  }) => void;
  isFetching?: boolean;
  isLoading?: boolean;
  refetch?: () => void;
}

export function DataTable<TData>({
  data,
  onSelectionChange,
  onSortingChange,
  onFiltersChange,
  isFetching = false,
  isLoading = false,
  refetch,
}: DataTableProps<TData>) {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Track just the expanded row ID
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isBuildingIndex, setIsBuildingIndex] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState<TData | null>(null);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  React.useEffect(() => {
    if (sorting.length > 0 && onSortingChange) {
      const column = sorting[0].id;
      const direction = sorting[0].desc ? "desc" : "asc";
      onSortingChange(column, direction);
    }
  }, [sorting, onSortingChange]);

  // Custom handler for expanding rows - ensures only one row is expanded at a time
  const handleToggleExpand = React.useCallback((rowId: string) => {
    setExpandedRowId((prevId) => (prevId === rowId ? null : rowId));
  }, []);

  // Get columns with our custom expand handler
  const columns = React.useMemo(() => {
    return getColumns() as unknown as ColumnDef<TData>[];
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Add a cell context updater to expose the expanded state
    getRowCanExpand: () => true,
    getIsRowExpanded: (row) => row.id === expandedRowId,
  });

  // Update the selectedDocument whenever expandedRowId changes
  React.useEffect(() => {
    if (expandedRowId) {
      const foundRow = table.getRowModel().rows.find((row) => row.id === expandedRowId);
      if (foundRow) {
        setSelectedDocument(foundRow.original as TData);
        setSidebarOpen(true);
      }
    } else {
      setSidebarOpen(false);
    }
  }, [expandedRowId, table]);

  // Update the column visibility when sidebar opens/closes
  React.useEffect(() => {
    if (sidebarOpen) {
      setColumnVisibility((prev) => ({ ...prev, Tags: false }));
    } else {
      setColumnVisibility((prev) => ({ ...prev, Tags: true }));
    }
  }, [sidebarOpen]);

  React.useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => (row.original as any).id);
    onSelectionChange(selectedRows);
  }, [rowSelection, table, onSelectionChange]);

  const handleStartChat = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => (row.original as any).id);

    if (selectedRows.length === 0) return;

    setIsBuildingIndex(true);
    try {
      const response = await buildChatIndex(selectedRows);

      // Get the selected files data from the items array
      const selectedFiles = table.getFilteredSelectedRowModel().rows.map((row) => ({
        id: (row.original as any).id,
        filename: (row.original as any).filename,
      }));

      if (response.status === "success") {
        toast.success("Your files are ready for chat!");
        navigate("/chat", {
          state: {
            selectedRows,
            selectedFiles,
            faissIndexPath: response.index_path,
            mode: "chat",
          },
          replace: true,
        });
      } else {
        throw new Error("Failed to build chat index");
      }
    } catch (error) {
      console.error("Error building chat index:", error);
      toast.error("Failed to build chat index", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsBuildingIndex(false);
    }
  };

  const handleDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => (row.original as any).id);

    if (selectedRows.length === 0) return;

    try {
      setIsDeleting(true);
      await deleteDocuments(selectedRows);

      table.resetRowSelection();

      if (refetch) {
        await refetch();
      }

      toast.success(`Successfully deleted ${selectedRows.length} document${selectedRows.length > 1 ? "s" : ""}`);
    } catch (error) {
      toast.error("Failed to delete documents. Please try again.");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = () => {
    table.resetRowSelection();
  };

  const handleCloseSidebar = () => {
    setExpandedRowId(null);
    setSidebarOpen(false);
  };

  // Handler for row click to expand
  const handleRowClick = (e: React.MouseEvent, rowId: string) => {
    // Exclude clicks on checkbox, button, badge, or when user is selecting text
    const target = e.target as HTMLElement;

    // Check if clicking on or inside these interactive elements
    const isInteractiveElement =
      target.closest('input[type="checkbox"]') ||
      target.closest("button") ||
      target.closest(".badge") ||
      window.getSelection()?.toString();

    if (!isInteractiveElement) {
      handleToggleExpand(rowId);
    }
  };

  const handleTabChange = () => {
    // You could add additional logic here to filter data based on selected tab
  };

  const handleViewChange = (view: "list" | "grid") => {
    setViewMode(view);
    // Logic for changing the view display mode
  };

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const showSkeleton = isLoading || isFetching;
  const skeletonRowCount = 8;

  // Use the same transition values as the sidebar for consistency
  const transitionConfig = {
    type: "tween",
    duration: 0.3,
    ease: "easeInOut",
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} onFiltersChange={onFiltersChange} />

      <div className="flex justify-between items-center py-2 gap-4">
        <FilesTabs onTabChange={handleTabChange} />
        <ViewMode onViewChange={handleViewChange} />
      </div>

      <div className="flex space-x-0">
        <motion.div
          className="relative"
          animate={{
            width: sidebarOpen ? "60%" : "100%",
          }}
          transition={transitionConfig}
        >
          <div className="space-y-4">
            {viewMode === "list" ? (
              <div className={`rounded-md border ${showSkeleton ? "min-h-[250px]" : "min-h-[0]"}`}>
                <Table>
                  <TableHeader className="bg-neutral-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} colSpan={header.colSpan}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {showSkeleton
                      ? Array.from({ length: skeletonRowCount }).map((_, i) => (
                          <TableRow className="animate-pulse" key={i}>
                            {Array.from({ length: 6 }).map((_, j) => (
                              <TableCell key={j}>
                                <div className="h-6 bg-neutral-200 rounded"></div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : table.getRowModel().rows?.length
                      ? table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className={`${
                              row.getIsExpanded() ? "bg-neutral-100 font-semibold" : ""
                            } cursor-pointer transition-colors hover:bg-neutral-50`}
                            onClick={(e) => handleRowClick(e, row.id)}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : !showSkeleton && (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {showSkeleton
                  ? Array.from({ length: skeletonRowCount }).map((_, i) => (
                      <div className="animate-pulse border rounded-md p-4 flex flex-col space-y-3" key={i}>
                        <div className="h-48 bg-neutral-200 rounded w-full"></div>
                        <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    ))
                  : table.getRowModel().rows?.length
                  ? table.getRowModel().rows.map((row) => {
                      const data = row.original as any;
                      return (
                        <div
                          key={row.id}
                          className={`border rounded-lg overflow-hidden cursor-pointer ${
                            row.getIsSelected() ? "border-primary ring-1 ring-primary" : "border-neutral-200"
                          } ${row.getIsExpanded() ? "bg-neutral-50 border-neutral-300 ring-1 ring-neutral-300" : ""} hover:shadow-md transition-all`}
                          onClick={(e) => handleRowClick(e, row.id)}
                        >
                          <div className="aspect-[4/3] relative bg-[#FCFBFC]">
                            {data.grid_view ? (
                              <img
                                src={`data:image/jpeg;base64,${data.grid_view}`}
                                alt={data.filename}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-12 h-12 text-neutral-300"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 384 512"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"
                                  />
                                </svg>
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <input
                                type="checkbox"
                                checked={row.getIsSelected()}
                                onChange={(e) => {
                                  row.toggleSelected(e.target.checked);
                                  e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4 rounded border-neutral-300"
                              />
                            </div>
                            {row.getIsExpanded() && (
                              <div 
                                className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-center bg-white/80 backdrop-blur-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Add thumbs down logic
                                    }}
                                    className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
                                  >
                                    <ThumbsDown className="w-4 h-4 text-neutral-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Add thumbs up logic
                                    }}
                                    className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
                                  >
                                    <ThumbsUp className="w-4 h-4 text-neutral-600" />
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Add bookmark logic
                                    }}
                                    className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
                                  >
                                    <Bookmark className="w-4 h-4 text-neutral-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Add share logic
                                    }}
                                    className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
                                  >
                                    <ShareIcon />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-sm truncate mb-1" title={data.filename}>
                              {data.filename || "Untitled"}
                            </h3>
                            <p className="text-xs text-neutral-500 truncate" title={data.email_subject}>
                              {data.email_subject || "No subject"}
                            </p>
                            <p className="text-xs text-neutral-400 mt-2">
                              {new Date(data.created_at).toLocaleDateString() || "Unknown date"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  : !showSkeleton && <div className="col-span-full text-center py-8">No results.</div>}
              </div>
            )}
            <DataTablePagination table={table} />
          </div>
        </motion.div>

        <AnimatePresence>
          {sidebarOpen && selectedDocument && (
            <motion.div
              className="w-[40%] border border-neutral-200 z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={transitionConfig}
            >
              <DocumentSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} document={selectedDocument} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selection toolbar */}
      {selectedRowCount > 0 && (
        <TableSelectionActions
          selectedCount={selectedRowCount}
          onDelete={handleDelete}
          onStartChat={handleStartChat}
          onSelectAll={handleSelectAll}
          isBuildingIndex={isBuildingIndex}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
