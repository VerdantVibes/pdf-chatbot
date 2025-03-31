import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/private-assets/components/data-table-view-options";
import { FilterMenu } from "./filter-menu";

// import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onFiltersChange?: (filters: {
    selectedAuthors: string[];
    selectedCategories: string[];
    selectedSectors: string[];
  }) => void;
}

export function DataTableToolbar<TData>({ table, onFiltersChange }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search files"
          value={(table.getColumn("filename")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("filename")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div>
          <FilterMenu onFiltersChange={onFiltersChange} />
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
