import { useEffect } from "react";
import { useBreadcrumbs } from "../layout";
import { PrivateAssetsPage } from "@/components/private-assets/page";

export default function PrivateAssets() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Knowledge Base",
        path: "/knowledge-base",
        isCurrentPage: false,
      },
      {
        label: "Private Assets",
        path: "/private-assets",
        isCurrentPage: true,
      },
    ]);

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs]);

  return (
    <div className="space-y-4">
      <PrivateAssetsPage />
    </div>
  );
}
