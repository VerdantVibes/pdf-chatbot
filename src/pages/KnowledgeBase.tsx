import { useEffect } from "react";
import { useBreadcrumbs } from "../layout";

export default function KnowledgeBase() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Knowledge Base", path: "/knowledge-base", isCurrentPage: true },
    ]);

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs]);

  return <div className="space-y-4">This is Knowledge Base</div>;
}
