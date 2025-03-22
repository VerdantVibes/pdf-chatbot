import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { useQuery } from "@tanstack/react-query";
import { getGmailPdfs } from "@/lib/api/knowledge-base";
import { LoaderCircle } from "lucide-react";
import { ErrorDisplay } from "../ui/error-display";

export default function PrivateAssetsPage() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pdfs", { offset: 1, limit: 100 }],
    queryFn: getGmailPdfs,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  if (isLoading || isFetching) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoaderCircle className="animate-spin size-12" />
      </div>
    );
  }

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
        <div className="flex items-center justify-between space-y">
          <h2 className="text-2xl font-bold tracking-tight">Files</h2>
        </div>
        <DataTable data={items} columns={columns} />
      </div>
    </>
  );
}
