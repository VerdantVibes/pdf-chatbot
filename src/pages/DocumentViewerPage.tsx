import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBreadcrumbs } from "../layout";
import { useSidebar } from "@/components/ui/sidebar";
import { DocumentViewer as DocumentViewerComponent } from "@/components/document/DocumentViewer";
import { Button } from "@/components/ui/button";
import { getGmailPdfs } from "@/lib/api/knowledge-base";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function DocumentViewer() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { state: sidebarState } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const documentData = location.state?.document;
  const [currentDocument, setCurrentDocument] = useState(documentData);

  const {
    data: response,
    isLoading: isLoadingPdfs,
    isFetching: isFetchingPdfs,
  } = useQuery({
    queryKey: [
      "pdfs",
      {
        offset: 1,
        limit: Number.MAX_SAFE_INTEGER,
      },
    ],
    queryFn: getGmailPdfs,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  useEffect(() => {
    if (!documentData && response?.items && id) {
      const foundDocument = response.items.find((doc: any) => doc.id === id);
      if (foundDocument) {
        setCurrentDocument(foundDocument);
      }
    } else if (documentData) {
      setCurrentDocument(documentData);
    }
  }, [documentData, response, id]);

  useEffect(() => {
    if (currentDocument) {
      setBreadcrumbs([
        {
          label: "Knowledge Base",
          path: "/knowledge-base",
          isCurrentPage: false,
        },
        {
          label: "General",
          path: "/knowledge-base/general",
          isCurrentPage: false,
        },
        {
          label: (currentDocument.email_subject || currentDocument.filename || "Document") + " (Deep Read)",
          path: `/document/${id}`,
          isCurrentPage: true,
        },
      ]);
    }

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs, currentDocument, id]);

  // Move the redirect effect outside of the conditional rendering
  useEffect(() => {
    if (!currentDocument && !isLoadingPdfs && !isFetchingPdfs && response) {
      navigate("/knowledge-base/general", { replace: true });
    }
  }, [currentDocument, isLoadingPdfs, isFetchingPdfs, navigate, response]);

  if (!currentDocument) {
    // Show loading if we're fetching data
    if (isLoadingPdfs || isFetchingPdfs) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
            <h2 className="text-lg font-semibold mb-2">Loading document...</h2>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading document...</h2>
          <p className="text-gray-500">
            If not redirected,{" "}
            <Button onClick={() => navigate("/knowledge-base/general")} variant="link" className="h-auto p-0">
              click here
            </Button>
          </p>
        </div>
      </div>
    );
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || "";
  const pdfUrl = id ? `${apiBaseUrl}/pdf/${id}/content` : "";
  const googleDriveProxyUrl = currentDocument?.drive_file_id
    ? `${apiBaseUrl}/proxy/googledrive/${currentDocument.drive_file_id}`
    : "";

  const documentUrl = pdfUrl || googleDriveProxyUrl;

  return (
    <div className="h-full">
      <DocumentViewerComponent
        isPdfsLoading={isLoadingPdfs || isFetchingPdfs}
        pdfs={response}
        pdfUrl={documentUrl}
        document={currentDocument}
        sidebarOpen={sidebarState === "expanded"}
      />
    </div>
  );
}
