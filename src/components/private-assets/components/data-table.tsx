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
import { AnimatePresence } from "framer-motion";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteDocuments } from "@/lib/api/knowledge-base";
import { buildChatIndex } from "@/lib/api/chat";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { TableSelectionActions } from "./table-selection-actions";

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
  columns,
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
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isBuildingIndex, setIsBuildingIndex] = React.useState(false);

  React.useEffect(() => {
    if (sorting.length > 0 && onSortingChange) {
      const column = sorting[0].id;
      const direction = sorting[0].desc ? "desc" : "asc";
      onSortingChange(column, direction);
    }
  }, [sorting, onSortingChange]);

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
  });

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

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const showSkeleton = isLoading || isFetching;
  const skeletonRowCount = 8;

  return (
    <div className="space-y-4 relative">
      <DataTableToolbar table={table} onFiltersChange={onFiltersChange} />
      <div className={`rounded-md border ${showSkeleton ? "min-h-[400px]" : ""}`}>
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {showSkeleton ? (
              Array.from({ length: skeletonRowCount }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: columns.length }).map((_, cellIndex) => (
                    <TableCell key={`skeleton-cell-${cellIndex}`}>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      <AnimatePresence>
        {selectedRowCount > 0 && (
          <TableSelectionActions
            selectedCount={selectedRowCount}
            onStartChat={handleStartChat}
            onDelete={handleDelete}
            onSelectAll={handleSelectAll}
            isDeleting={isDeleting}
            isBuildingIndex={isBuildingIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
