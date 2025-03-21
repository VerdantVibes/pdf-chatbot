import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { useQuery } from "@tanstack/react-query";
import { getGmailPdfs } from "@/lib/api/knowledge-base";
import { LoaderCircle, X } from "lucide-react";

export default function PrivateAssetsPage() {
  const {
    data: response,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["pdfs", { offset: 1, limit: 100 }],
    queryFn: getGmailPdfs,
  });

  if (isLoading)
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoaderCircle className="animate-spin size-12" />
      </div>
    );

  if (!isSuccess)
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
        <div className="flex flex-col items-center gap-3 p-5 rounded-lg">
          <X className="size-12 text-destructive" />
          <p className="text-md text-muted-foreground">Something went wrong</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-5 py-2 md:flex">
        <div className="flex items-center justify-between space-y">
          <h2 className="text-2xl font-bold tracking-tight">Files</h2>
        </div>
        <DataTable data={response.items} columns={columns} />
      </div>
    </>
  );
}
