import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { useQuery } from "@tanstack/react-query";
import { getGmailPdfs } from "@/lib/api/knowledge-base";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PrivateAssetsPage() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
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
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Alert variant="destructive" className="max-w-md mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading files</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load files. Please check your connection and authentication."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
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
