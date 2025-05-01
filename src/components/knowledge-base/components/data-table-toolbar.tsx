import { Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/knowledge-base/components/data-table-view-options";
import { FilterMenu } from "./filter-menu";

// import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onFiltersChange?: (filters: {
    selectedAuthors: string[];
    selectedCategories: string[];
    selectedSectors: string[];
  }) => void;
  initialFilters?: {
    selectedAuthors: string[];
    selectedCategories: string[];
    selectedSectors: string[];
  };
}

export function DataTableToolbar<TData>({ table, onFiltersChange, initialFilters }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-[150px] lg:w-[250px]">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files"
            value={(table.getColumn("email_subject")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("email_subject")?.setFilterValue(event.target.value)}
            className="h-8 pl-8 w-full"
          />
        </div>
        <div>
          <FilterMenu onFiltersChange={onFiltersChange} initialFilters={initialFilters} />
        </div>
        {/* {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )} */}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
