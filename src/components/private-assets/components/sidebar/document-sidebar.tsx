import { X, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PdfViewer } from "@/components/chat/PdfViewer";
import pdfIcon from "@/assets/pdficon.svg";
import { useState, useEffect } from "react";

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
}

export function DocumentSidebar({ onClose, document }: DocumentSidebarProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return "N/A";

    const kilobytes = sizeInBytes / 1024;
    if (kilobytes < 1024) {
      return `${kilobytes.toFixed(2)} KB`;
    }

    const megabytes = kilobytes / 1024;
    return `${megabytes.toFixed(2)} MB`;
  };

  const {
    filename,
    email_subject,
    author = [],
    created_at,
    analysis = {},
    file_size,
    category_tags = [],
    id,
    source,
    upload_date,
    email_received_date,
    downloaded_at,
    drive_web_link,
    drive_file_id,
  } = document || {};

  const { ai_summary, signals = [], threads = [] } = analysis;

  const [currentPdfId, setCurrentPdfId] = useState<string>(id || "");
  const [currentPage, setCurrentPage] = useState(1);

  const selectedPdfs = [
    {
      id: id || "default-id",
      filename: filename || email_subject || "document.pdf",
    },
  ];

  const apiBaseUrl = import.meta.env.VITE_API_URL || "";
  const pdfUrl = id ? `${apiBaseUrl}/pdf/${id}/content` : "";

  const googleDriveProxyUrl = drive_file_id ? `${apiBaseUrl}/proxy/googledrive/${drive_file_id}` : "";

  const documentUrl = pdfUrl || googleDriveProxyUrl;
  const hasValidPdfUrl = documentUrl !== "";

  const handlePdfChange = (newPdfId: string) => {
    setCurrentPdfId(newPdfId);
  };

  const transitionConfig = {
    type: "tween",
    duration: 0.3,
    ease: "easeInOut",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitionConfig}
      className="h-full bg-white z-10 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        <Tabs defaultValue="summary" className="h-full flex flex-col">
          <header className="relative flex items-center">
            <div className="flex items-center w-full mx-4 mt-2">
              <TabsList className="flex w-full justify-start bg-white p-0 h-10 space-x-3">
                <TabsTrigger
                  value="summary"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="signals"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Signals
                </TabsTrigger>
                <TabsTrigger
                  value="threads"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Threads
                </TabsTrigger>
                <TabsTrigger
                  value="doc"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold px-2"
                >
                  Doc
                </TabsTrigger>
                <TabsTrigger
                  value="info"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold px-2"
                >
                  Info
                </TabsTrigger>
              </TabsList>
            </div>
            <button onClick={onClose} className="absolute right-2 p-1 rounded-sm hover:bg-gray-200 z-10 mb-4">
              <X className="w-4 h-4 text-gray-500 font-semibold" />
            </button>
          </header>

          <div className="h-[calc(100%-40px)] overflow-hidden">
            <ScrollArea className="h-full px-6 pt-6 pb-4">
              <TabsContent value="summary" className="mt-0">
                <div className="space-y-4">
                  <div className="pb-4">
                    <h3 className="text-sm font-semibold mb-2">Document</h3>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <div className="p-2 rounded">
                        <img src={pdfIcon} alt="PDF Icon" className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-black font-semibold">{email_subject || "Untitled Document"}</p>
                        <p className="text-xs text-gray-500">{filename || "document.pdf"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Authors</h3>
                    <div className="space-y-1">
                      {author && author.length > 0 ? (
                        author.map((name: string, index: number) => (
                          <p key={index} className="text-sm">
                            {name}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm">Unknown Author</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 mt-8">Added</h3>
                    <div className="bg-[#D4EBE9] text-black text-xs text-nowrap px-2 py-1 font-medium rounded-lg w-fit">
                      {formatDate(created_at)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Threads</h3>
                    <div className="bg-purple-100 px-2 py-1 rounded-lg w-fit">
                      <p className="text-xs text-black font-medium">{threads.length || 0} Threads</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 mt-8">Summary</h3>
                    <div className="space-y-2 text-sm text-gray-500 border border-gray-200 px-4 py-3 rounded-lg">
                      {ai_summary ? <p>{ai_summary}</p> : <p>N/A</p>}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signals" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Key Signals</h3>

                  {signals && signals.length > 0 ? (
                    <ul className="space-y-3 px-4 py-3 border border-gray-200 rounded-lg">
                      {signals.map((signal: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{signal}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-gray-200 rounded-lg bg-gray-50">
                      <AlertCircle className="w-10 h-10 text-gray-400 mb-2" />
                      <h4 className="text-sm font-medium text-gray-600 mb-1">No Signals Available</h4>
                      <p className="text-xs text-gray-500">This document doesn't have any signals identified yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="threads" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Discussion Threads</h3>

                  {threads && threads.length > 0 ? (
                    <ul className="space-y-3">
                      {threads.map((thread: any, index: number) => (
                        <li key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {typeof thread === "string" ? thread : thread.title}
                            </span>
                            <div className="bg-purple-100 px-2 py-1 rounded text-xs text-purple-600 font-medium">
                              {index + 1}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-gray-200 rounded-lg bg-gray-50">
                      <AlertCircle className="w-10 h-10 text-gray-400 mb-2" />
                      <h4 className="text-sm font-medium text-gray-600 mb-1">No Threads Available</h4>
                      <p className="text-xs text-gray-500">This document doesn't have any discussion threads yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="doc" className="mt-0 h-full p-0">
                {hasValidPdfUrl ? (
                  <div className="h-full">
                    <PdfViewer
                      pdfUrl={documentUrl}
                      selectedPdfs={selectedPdfs}
                      onPdfChange={handlePdfChange}
                      initialPage={currentPage}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full px-6">
                    <div className="text-center p-8">
                      <div className="bg-orange-100 p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                        <img src={pdfIcon} alt="PDF Icon" className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">PDF Not Available</h3>
                      <p className="text-sm text-gray-500 max-w-md mb-4">
                        {drive_web_link
                          ? "This document is currently unavailable in the viewer. You can access it externally."
                          : "The document cannot be displayed. It may not be available or you might not have permission to view it."}
                      </p>
                      {drive_web_link && (
                        <a
                          href={drive_web_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                        >
                          Open Document
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="info" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Paper Name</h3>
                    <p className="text-sm text-gray-700">{email_subject || "Untitled Document"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Upload Date</h3>
                    <p className="text-sm text-gray-700">
                      {formatDateTime(upload_date || downloaded_at || email_received_date || created_at)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Size</h3>
                    <p className="text-sm text-gray-700">{formatFileSize(file_size)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Paper Type</h3>
                    <p className="text-sm text-gray-700">
                      {category_tags && category_tags.length > 0 ? category_tags[0] : "Journal Article"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Source</h3>
                    <p className="text-sm text-gray-700 capitalize">{source || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">File Type</h3>
                    <p className="text-sm text-gray-700">
                      {filename ? filename.split(".").pop()?.toUpperCase() : "PDF"}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
}
