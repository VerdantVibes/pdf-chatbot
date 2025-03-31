import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { useQuery } from "@tanstack/react-query";
import { getGmailPdfs } from "@/lib/api/knowledge-base";
import { ErrorDisplay } from "../ui/error-display";
import { useState, useEffect } from "react";

export function PrivateAssetsPage() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortParams, setSortParams] = useState<{ sortBy: string; sortOrder: string }>({
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [filters, setFilters] = useState<{
    selectedAuthors: string[];
    selectedCategories: string[];
    selectedSectors: string[];
  }>({
    selectedAuthors: [],
    selectedCategories: [],
    selectedSectors: [],
  });

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "pdfs",
      {
        offset: 1,
        limit: 100,
        sortBy: sortParams.sortBy,
        sortOrder: sortParams.sortOrder,
        selectedAuthors: filters.selectedAuthors,
        selectedCategories: filters.selectedCategories,
        selectedSectors: filters.selectedSectors,
      },
    ],
    queryFn: getGmailPdfs,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("selectedRowsChanged", {
          detail: {
            selectedRows,
            items: response?.items || [],
          },
        })
      );
    }
  }, [selectedRows, response?.items]);

  const handleFiltersChange = (newFilters: {
    selectedAuthors: string[];
    selectedCategories: string[];
    selectedSectors: string[];
  }) => {
    setFilters(newFilters);
  };

  if (isError) {
    return (
      <ErrorDisplay
        error={error}
        title="Error loading files"
        description="Failed to load files. Please check your connection and authentication."
        onRetry={() => refetch()}
      />
    );
  }

  const items = response?.items || [];

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-5 py-2 md:flex">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Files</h2>
        </div>
        <DataTable
          data={items}
          columns={columns}
          onSelectionChange={setSelectedRows}
          onSortingChange={(field: string, direction: string) => {
            setSortParams({
              sortBy: field,
              sortOrder: direction,
            });
          }}
          onFiltersChange={handleFiltersChange}
          isFetching={isFetching}
          isLoading={isLoading}
          refetch={refetch}
        />
      </div>
    </>
  );
}
