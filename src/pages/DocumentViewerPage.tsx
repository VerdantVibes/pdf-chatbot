import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useBreadcrumbs } from "../layout";
import { useSidebar } from "@/components/ui/sidebar";
import { DocumentViewer as DocumentViewerComponent } from "@/components/document/DocumentViewer";

export default function DocumentViewer() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { state: sidebarState } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const document = location.state?.document;

  useEffect(() => {
    if (document) {
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
          label: (document.email_subject || document.filename || "Document") + " (Deep Read)",
          path: `/document/${id}`,
          isCurrentPage: true,
        },
      ]);
    }

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs, document, id]);

  if (!document) {
    useEffect(() => {
      navigate("/private-assets", { replace: true });
    }, [navigate]);

    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading document...</h2>
          <p className="text-gray-500">
            If not redirected,{" "}
            <button onClick={() => navigate("/private-assets")} className="text-primary hover:underline">
              click here
            </button>
          </p>
        </div>
      </div>
    );
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || "";
  const pdfUrl = id ? `${apiBaseUrl}/pdf/${id}/content` : "";
  const googleDriveProxyUrl = document?.drive_file_id
    ? `${apiBaseUrl}/proxy/googledrive/${document.drive_file_id}`
    : "";

  const documentUrl = pdfUrl || googleDriveProxyUrl;

  return (
    <div className="h-full">
      <DocumentViewerComponent pdfUrl={documentUrl} document={document} sidebarOpen={sidebarState === "expanded"} />
    </div>
  );
}
