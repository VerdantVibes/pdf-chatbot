import { getColumns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { data as signals } from "./data/data";

export function SignalsPage() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
  }>({
    selectedFilterA: [],
    selectedFilterB: [],
    selectedFilterC: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("selectedRowsChanged", {
          detail: {
            selectedRows,
            items: signals || [],
          },
        })
      );
    }
  }, [selectedRows, signals]);

  const handleFiltersChange = (newFilters: {
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
  }) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <div className="flex-1 flex-col space-y-2 md:space-y-5 py-2 flex">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start justify-center mb-1">
            <h2 className="text-2xl font-bold tracking-tight">Signals</h2>
            <p className="text-secondary-foreground/50">Description subtext will go here</p>
          </div>
          <div className="hidden md:flex gap-3">
            <Button variant="default">
              <span className="font-medium px-2">New Signal</span>
            </Button>
          </div>
        </div>

        <DataTable
          data={signals}
          columns={getColumns()}
          onSelectionChange={setSelectedRows}
          onFiltersChange={handleFiltersChange}
          refetch={undefined}
        />
      </div>
    </div>
  );
}
