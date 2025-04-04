import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useBreadcrumbs } from "../layout";
import { useSidebar } from "@/components/ui/sidebar";
import { DocumentViewer as DocumentViewerComponent } from "@/components/document/DocumentViewer";
import { Button } from "@/components/ui/button";

export function DocumentViewer() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { state: sidebarState } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const documentData = location.state?.document;

  useEffect(() => {
    if (documentData) {
      setBreadcrumbs([
        {
          label: "Knowledge Base",
          path: "/knowledge-base",
          isCurrentPage: false,
        },
        {
          label: "Private Assets",
          path: "/private-assets",
          isCurrentPage: false,
        },
        {
          label: (documentData.email_subject || documentData.filename || "Document") + " (Deep Read)",
          path: `/document/${id}`,
          isCurrentPage: true,
        },
      ]);
    }

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs, documentData, id]);

  if (!documentData) {
    useEffect(() => {
      navigate("/private-assets", { replace: true });
    }, [navigate]);

    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading document...</h2>
          <p className="text-gray-500">
            If not redirected,{" "}
            <Button onClick={() => navigate("/private-assets")} variant="link" className="h-auto p-0">
              click here
            </Button>
          </p>
        </div>
      </div>
    );
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || "";
  const pdfUrl = id ? `${apiBaseUrl}/pdf/${id}/content` : "";
  const googleDriveProxyUrl = documentData?.drive_file_id
    ? `${apiBaseUrl}/proxy/googledrive/${documentData.drive_file_id}`
    : "";

  const documentUrl = pdfUrl || googleDriveProxyUrl;

  return (
    <div className="h-full">
      <DocumentViewerComponent pdfUrl={documentUrl} document={documentData} sidebarOpen={sidebarState === "expanded"} />
    </div>
  );
}
