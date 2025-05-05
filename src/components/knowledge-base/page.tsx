import { getColumns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { useQuery } from "@tanstack/react-query";
import { getGmailPdfs } from "@/lib/api/knowledge-base";
import { ErrorDisplay } from "../ui/error-display";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ImportDocumentModal } from "../document/ImportDocumentModal";

export function PrivateAssetsPage() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortParams, setSortParams] = useState<{ sortBy: string; sortOrder: string }>({
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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

  const handleImportDocument = () => {
    setIsImportModalOpen(true);
  };

  const handleFileSelected = (files: FileList) => {
    console.log("Selected files:", files);
    // Here you would implement the upload logic when ready
    // This currently just logs the files to the console
  };

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
    <div>
      <ImportDocumentModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onFileSelected={handleFileSelected}
      />
      <div className="flex-1 flex-col space-y-2 md:space-y-5 py-2 flex">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start justify-center mb-1">
            <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
            <p className="text-secondary-foreground/50">Description subtext will go here</p>
          </div>
          <div className="hidden md:flex gap-3">
            <Button onClick={handleImportDocument} variant="outline">
              <span className="font-medium">Import Document</span>
            </Button>
            <Button variant="default">
              <span className="font-medium px-2">Main Button</span>
            </Button>
          </div>
        </div>

        <DataTable
          data={items}
          columns={getColumns()}
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
    </div>
  );
}
