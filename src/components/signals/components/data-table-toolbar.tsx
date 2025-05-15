import { Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/signals/components/data-table-view-options";
import { FilterMenu } from "./filter-menu";
import { ViewMode } from "./view-mode";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onFiltersChange?: (filters: {
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
  }) => void;
  initialFilters?: {
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
  };
  onViewChange?: (view: "list" | "grid") => void;
}

export function DataTableToolbar<TData>({
  table,
  onFiltersChange,
  initialFilters,
  onViewChange,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="hidden md:flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-[150px] lg:w-[250px]">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search signals"
            value={(table.getColumn("signal")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("signal")?.setFilterValue(event.target.value)}
            className="h-8 pl-8 w-full"
          />
        </div>
        <div>
          <FilterMenu onFiltersChange={onFiltersChange} initialFilters={initialFilters} />
        </div>
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <DataTableViewOptions table={table} />
        <ViewMode onViewChange={onViewChange} />
      </div>
    </div>
  );
}
