import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { useQuery } from "@tanstack/react-query";
import { getGmailPdfs } from "@/lib/api/knowledge-base";
import { LoaderCircle } from "lucide-react";

export default function PrivateAssetsPage() {
  const { data: pdfs, isLoading } = useQuery({
    queryKey: ["pdfs", { offset: 1, limit: 100 }],
    queryFn: getGmailPdfs,
  });

  if (isLoading)
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoaderCircle className="animate-spin size-12" />
      </div>
    );

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-5 py-2 md:flex">
        <div className="flex items-center justify-between space-y">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Files</h2>
          </div>
        </div>
        <DataTable data={pdfs?.pdfs} columns={columns} />
      </div>
    </>
  );
}
