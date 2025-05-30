import { useEffect } from "react";
import { useBreadcrumbs } from "../layout";

export default function Home() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Home", path: "/home", isCurrentPage: true }]);

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs]);

  return <div className="space-y-4"></div>;
}
