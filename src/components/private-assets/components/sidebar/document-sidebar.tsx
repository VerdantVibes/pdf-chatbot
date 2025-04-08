import { X, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimplePdfViewer } from "@/components/private-assets/components/pdf-viewer";
import pdfIcon from "@/assets/pdficon.svg";
import { useState } from "react";
import { Link } from "react-router-dom";

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
}

interface IconProps {
  className?: string;
}

const SummaryIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path d="M11.8333 4.06641H2.5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5 8.06641H2.5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5667 12H2.5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SignalsIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path d="M3.76641 12.7333C1.16641 10.1333 1.16641 5.8666 3.76641 3.2666" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.70078 10.8005C4.16745 9.26712 4.16745 6.73379 5.70078 5.13379" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.49935 9.33366C9.23573 9.33366 9.83268 8.73671 9.83268 8.00033C9.83268 7.26395 9.23573 6.66699 8.49935 6.66699C7.76297 6.66699 7.16602 7.26395 7.16602 8.00033C7.16602 8.73671 7.76297 9.33366 8.49935 9.33366Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.3008 5.2002C12.8341 6.73353 12.8341 9.26686 11.3008 10.8669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.2324 3.2666C15.8324 5.8666 15.8324 10.0666 13.2324 12.6666" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThreadsIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 10C14 10.3536 13.8595 10.6928 13.6095 10.9428C13.3594 11.1929 13.0203 11.3333 12.6667 11.3333H4.66667L2 14V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V10Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66602 5.33301H4.66602" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.3327 8H4.66602" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16" fill="none">
    <path d="M8.49935 1.33301H2.49935C2.14573 1.33301 1.80659 1.47348 1.55654 1.72353C1.30649 1.97358 1.16602 2.31272 1.16602 2.66634V13.333C1.16602 13.6866 1.30649 14.0258 1.55654 14.2758C1.80659 14.5259 2.14573 14.6663 2.49935 14.6663H10.4993C10.853 14.6663 11.1921 14.5259 11.4422 14.2758C11.6922 14.0258 11.8327 13.6866 11.8327 13.333V4.66634L8.49935 1.33301Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InfoIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path d="M8.50065 14.6663C12.1825 14.6663 15.1673 11.6816 15.1673 7.99967C15.1673 4.31778 12.1825 1.33301 8.50065 1.33301C4.81875 1.33301 1.83398 4.31778 1.83398 7.99967C1.83398 11.6816 4.81875 14.6663 8.50065 14.6663Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 10.6667V8" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 5.33301H8.50667" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

  const [, setCurrentPdfId] = useState<string>(id || "");
  const [currentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("summary");

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
        <Tabs
          defaultValue="summary"
          className="h-full flex flex-col"
          onValueChange={(value) => setActiveTab(value)}
        >
          <header className="relative flex items-center">
            <div className="flex items-center w-full mx-4 mt-2">
              <TabsList
                className="flex w-full justify-start p-0 space-x-3"
                style={{
                  borderRadius: "var(--border-radius-lg, 8px)",
                  background: "var(--base-border-primary, #F4F4F5)",
                  height: "var(--height-h-9, 36px)",
                  flexShrink: 0,
                }}
              >
                <TabsTrigger
                  value="summary"
                  className={`px-2 ${
                    activeTab === "summary"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "summary"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "summary" && <SummaryIcon />}
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="signals"
                  className={`px-2 ${
                    activeTab === "signals"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "signals"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "signals" && <SignalsIcon />}
                  Signals
                </TabsTrigger>
                <TabsTrigger
                  value="threads"
                  className={`px-2 ${
                    activeTab === "threads"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "threads"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "threads" && <ThreadsIcon />}
                  Threads
                </TabsTrigger>
                <TabsTrigger
                  value="doc"
                  className={`px-2 ${
                    activeTab === "doc"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "doc"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "doc" && <DocIcon />}
                  Doc
                </TabsTrigger>
                <TabsTrigger
                  value="info"
                  className={`px-2 ${
                    activeTab === "info"
                      ? "bg-white shadow-md flex justify-center items-center gap-1"
                      : "data-[state=active]:bg-gray-100 data-[state=active]:font-semibold"
                  }`}
                  style={{
                    borderRadius: "var(--border-radius-md, 6px)",
                    boxShadow:
                      activeTab === "info"
                        ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "info" && <InfoIcon />}
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
                  <h3 className="text-sm font-semibold mb-2">Document</h3>
                  <div className="border border-[#E4E4E4] rounded-lg bg-[#FCFBFC]">
                    <Link to={`/document/${id}`} state={{ document }} className="block group">
                      <div
                        className="flex items-center gap-2 border-b border-[#E4E4E4] p-2
                        transition-all duration-300 ease-in-out 
                        transform group-hover:translate-y-[-2px] group-hover:border-blue-300 group-hover:shadow-md
                        group-hover:bg-white group-active:translate-y-[0px] group-active:shadow-sm"
                      >
                        <div className="p-2 rounded transition-all duration-300">
                          <img
                            src={pdfIcon}
                            alt="PDF Icon"
                            className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div>
                          <p className="text-sm text-black font-semibold transition-colors duration-300 group-hover:text-blue-600">
                            {email_subject || "Untitled Document"}
                          </p>
                          <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
                            {filename || "document.pdf"}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="space-y-2 text-sm text-gray-500 px-4 py-3">
                      {ai_summary ? <p>{ai_summary}</p> : <p>N/A</p>}
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
                    <SimplePdfViewer
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
