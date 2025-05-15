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
import { motion } from "framer-motion";
import { ThumbsDown, ThumbsUp} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { TableSelectionActions } from "./table-selection-actions";
import { getColumns } from "./columns";
import { FilesTabs } from "./files-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DiveDeeperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_2294_15114)">
      <path
        d="M6.6243 10.3342C6.56478 10.1034 6.44453 9.89289 6.27605 9.72441C6.10757 9.55593 5.89702 9.43567 5.6663 9.37615L1.5763 8.32148C1.50652 8.30168 1.44511 8.25965 1.40138 8.20178C1.35765 8.14391 1.33398 8.07335 1.33398 8.00082C1.33398 7.92828 1.35765 7.85773 1.40138 7.79985C1.44511 7.74198 1.50652 7.69996 1.5763 7.68015L5.6663 6.62482C5.89693 6.56536 6.10743 6.4452 6.2759 6.27684C6.44438 6.10849 6.56468 5.89808 6.6243 5.66748L7.67897 1.57748C7.69857 1.50743 7.74056 1.44571 7.79851 1.40175C7.85647 1.35778 7.92722 1.33398 7.99997 1.33398C8.07271 1.33398 8.14346 1.35778 8.20142 1.40175C8.25938 1.44571 8.30136 1.50743 8.32097 1.57748L9.37497 5.66748C9.43449 5.8982 9.55474 6.10875 9.72322 6.27723C9.8917 6.44571 10.1023 6.56597 10.333 6.62548L14.423 7.67948C14.4933 7.69888 14.5553 7.74082 14.5995 7.79887C14.6437 7.85691 14.6677 7.92786 14.6677 8.00082C14.6677 8.07378 14.6437 8.14472 14.5995 8.20277C14.5553 8.26081 14.4933 8.30275 14.423 8.32215L10.333 9.37615C10.1023 9.43567 9.8917 9.55593 9.72322 9.72441C9.55474 9.89289 9.43449 10.1034 9.37497 10.3342L8.3203 14.4242C8.3007 14.4942 8.25871 14.5559 8.20075 14.5999C8.1428 14.6439 8.07205 14.6677 7.9993 14.6677C7.92656 14.6677 7.85581 14.6439 7.79785 14.5999C7.73989 14.5559 7.69791 14.4942 7.6783 14.4242L6.6243 10.3342Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.334 2V4.66667" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6667 3.33398H12" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.66602 11.334V12.6673" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33333 12H2" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_2294_15114">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onSelectionChange: (selectedRows: string[]) => void;
  onSortingChange?: (field: string, direction: string) => void;
  onFiltersChange?: (filters: {
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
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
  const { atLeastLg } = useTailwindBreakpoint();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  const [activeTab, setActiveTab] = React.useState<string>("all-files");
  const [filteredData, setFilteredData] = React.useState<TData[]>(data);

  const [appliedFilters, setAppliedFilters] = React.useState<{
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
  }>({
    selectedFilterA: [],
    selectedFilterB: [],
    selectedFilterC: [],
  });

  React.useEffect(() => {
    if (activeTab === "all-files") {
      setFilteredData(data);
    } else if (activeTab === "favorites") {
      setFilteredData(data.filter((item: any) => item.folder === "Favorites"));
    } else if (activeTab === "read-later") {
      setFilteredData(data.filter((item: any) => item.folder === "Read Later"));
    } else if (activeTab === "discover") {
      setFilteredData(data.filter((item: any) => item.folder === "Discover"));
    } else if (activeTab === "shared") {
      setFilteredData(data.filter((item: any) => item.folder === "Shared"));
    } else if (activeTab.startsWith("folder-")) {
      const folderName = activeTab.replace("folder-", "");
      setFilteredData(data.filter((item: any) => item.folder === folderName));
    }
  }, [data, activeTab]);

  React.useEffect(() => {
    if (sorting.length > 0 && onSortingChange) {
      const column = sorting[0].id;
      const direction = sorting[0].desc ? "desc" : "asc";
      onSortingChange(column, direction);
    }
  }, [sorting, onSortingChange]);

  const columns = React.useMemo(() => {
    return getColumns() as unknown as ColumnDef<TData>[];
  }, []);

  const table = useReactTable({
    data: filteredData,
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
    getRowCanExpand: () => true,
    getIsRowExpanded: (row) => row.id === expandedRowId,
  });

  React.useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => (row.original as any).id);
    onSelectionChange(selectedRows);
  }, [rowSelection, table, onSelectionChange]);

  React.useEffect(() => {
    if (!atLeastLg) {
      setViewMode("list");
    }
  }, [atLeastLg]);

  const handleFiltersChange = (filters: {
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
  }) => {
    setAppliedFilters(filters);
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  const handleDelete = async () => {
  };

  const handleSelectAll = () => {
    table.resetRowSelection();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleViewChange = (view: "list" | "grid") => {
    setViewMode(view);
  };

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const showSkeleton = isLoading || isFetching;
  const skeletonRowCount = 8;

  const transitionConfig = {
    type: "tween",
    duration: 0.3,
    ease: "easeInOut",
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar
        onViewChange={handleViewChange}
        table={table}
        onFiltersChange={handleFiltersChange}
        initialFilters={appliedFilters}
      />

      <div className="hidden lg:flex justify-between items-center py-2 gap-4">
        <FilesTabs onTabChange={handleTabChange} />
      </div>
      <div className="flex space-x-0">
        <motion.div
          className="relative"
          animate={{
            width: "100%",
          }}
          transition={transitionConfig}
        >
          <div className="space-y-4">
            {viewMode === "list" && atLeastLg ? (
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
                            } cursor-pointer transition-colors hover:bg-neutral-50 group`}
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
                  ? table.getRowModel().rows.map(() => {
                      return (
                        <>
                          <div className="border border-neutral-200 rounded-md p-4 shadow-sm cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center">
                                <Badge className="shadow-none flex items-center gap-1 bg-green-50 text-green-800 border-green-50 hover:bg-green-100 hover:text-green-800 h-5 px-2 rounded text-xs font-medium">
                                  <div className="h-1.5 w-1.5 bg-green-600 rounded-full"></div>
                                  <span>Long</span>
                                </Badge>
                              </div>
                              <span className="text-xs text-neutral-500">5 min ago</span>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center space-x-1">
                                <h4 className="text-sm font-semibold">Trade:</h4>
                                <span className="text-sm">Long RXM5</span>
                              </div>
                              <div className="flex items-center space-x-1 text-neutral-500 font-thin">
                                <span className="text-sm">Horizon: 1-2 months</span>
                              </div>
                              <div className="flex items-center space-x-1 mt-5">
                                <h4 className="text-sm font-semibold">Structure:</h4>
                                <span className="text-sm text-neutral-700">20/22k 1×0.5 CS</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <h4 className="text-sm font-semibold">From:</h4>
                                <span className="text-sm text-neutral-700">Goldman Sachs</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-normal">
                                <DiveDeeperIcon />
                                Dive Deeper
                              </Button>
                              <div className="flex items-center space-x-2">
                                <button className="text-neutral-400 hover:text-neutral-600">
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                                <button className="text-neutral-400 hover:text-neutral-600">
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="border border-neutral-200 rounded-md p-4 shadow-sm cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center">
                                <Badge className="shadow-none flex items-center gap-1 bg-green-50 text-green-800 border-green-50 hover:bg-green-100 hover:text-green-800 h-5 px-2 rounded text-xs font-medium">
                                  <div className="h-1.5 w-1.5 bg-green-600 rounded-full"></div>
                                  <span>Long</span>
                                </Badge>
                              </div>
                              <span className="text-xs text-neutral-500">5 min ago</span>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center space-x-1">
                                <h4 className="text-sm font-semibold">Trade:</h4>
                                <span className="text-sm">Long RXM5</span>
                              </div>
                              <div className="flex items-center space-x-1 text-neutral-500 font-thin">
                                <span className="text-sm">Horizon: 1-2 months</span>
                              </div>
                              <div className="flex items-center space-x-1 mt-5">
                                <h4 className="text-sm font-semibold">Structure:</h4>
                                <span className="text-sm text-neutral-700">20/22k 1×0.5 CS</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <h4 className="text-sm font-semibold">From:</h4>
                                <span className="text-sm text-neutral-700">Goldman Sachs</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-normal">
                                <DiveDeeperIcon />
                                Dive Deeper
                              </Button>
                              <div className="flex items-center space-x-2">
                                <button className="text-neutral-400 hover:text-neutral-600">
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                                <button className="text-neutral-400 hover:text-neutral-600">
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="border border-neutral-200 rounded-md p-4 shadow-sm cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center">
                                <Badge className="shadow-none flex items-center gap-1 bg-green-50 text-green-800 border-green-50 hover:bg-green-100 hover:text-green-800 h-5 px-2 rounded text-xs font-medium">
                                  <div className="h-1.5 w-1.5 bg-green-600 rounded-full"></div>
                                  <span>Long</span>
                                </Badge>
                              </div>
                              <span className="text-xs text-neutral-500">5 min ago</span>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center space-x-1">
                                <h4 className="text-sm font-semibold">Trade:</h4>
                                <span className="text-sm">Long RXM5</span>
                              </div>
                              <div className="flex items-center space-x-1 text-neutral-500 font-thin">
                                <span className="text-sm">Horizon: 1-2 months</span>
                              </div>
                              <div className="flex items-center space-x-1 mt-5">
                                <h4 className="text-sm font-semibold">Structure:</h4>
                                <span className="text-sm text-neutral-700">20/22k 1×0.5 CS</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <h4 className="text-sm font-semibold">From:</h4>
                                <span className="text-sm text-neutral-700">Goldman Sachs</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-normal">
                                <DiveDeeperIcon />
                                Dive Deeper
                              </Button>
                              <div className="flex items-center space-x-2">
                                <button className="text-neutral-400 hover:text-neutral-600">
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                                <button className="text-neutral-400 hover:text-neutral-600">
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="border border-neutral-200 rounded-md p-4 shadow-sm cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center">
                                <Badge className="shadow-none flex items-center gap-1 bg-red-50 text-red-800 border-red-50 hover:bg-red-100 hover:text-red-800 h-5 px-2 rounded text-xs font-medium">
                                  <div className="h-1.5 w-1.5 bg-red-600 rounded-full"></div>
                                  <span>Short</span>
                                </Badge>
                              </div>
                              <span className="text-xs text-neutral-500">5 min ago</span>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center space-x-1">
                                <h4 className="text-sm font-semibold">Trade:</h4>
                                <span className="text-sm">Long RXM5</span>
                              </div>
                              <div className="flex items-center space-x-1 text-neutral-500 font-thin">
                                <span className="text-sm">Horizon: 1-2 months</span>
                              </div>
                              <div className="flex items-center space-x-1 mt-5">
                                <h4 className="text-sm font-semibold">Structure:</h4>
                                <span className="text-sm text-neutral-700">20/22k 1×0.5 CS</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <h4 className="text-sm font-semibold">From:</h4>
                                <span className="text-sm text-neutral-700">Goldman Sachs</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-normal">
                                <DiveDeeperIcon />
                                Dive Deeper
                              </Button>
                              <div className="flex items-center space-x-2">
                                <button className="text-neutral-400 hover:text-neutral-600">
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                                <button className="text-neutral-400 hover:text-neutral-600">
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })
                  : !showSkeleton && <div className="col-span-full text-center py-8">No results.</div>}
              </div>
            )}
            <DataTablePagination table={table} />
          </div>
        </motion.div>
      </div>

      {selectedRowCount > 0 && (
        <TableSelectionActions
          selectedCount={selectedRowCount}
          selectedRowIds={table.getFilteredSelectedRowModel().rows.map((row) => (row.original as any).id)}
          onDelete={handleDelete}
          onSelectAll={handleSelectAll}
          isDeleting={isDeleting}
          refetch={refetch}
        />
      )}
    </div>
  );
}
