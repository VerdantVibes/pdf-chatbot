import { X, Filter, ThumbsDown, ThumbsUp, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimplePdfViewer } from "@/components/private-assets/components/pdf-viewer";
import pdfIcon from "@/assets/pdficon.svg";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  appliedFilters?: {
    selectedAuthors: string[];
    selectedCategories: string[];
    selectedSectors: string[];
  };
  onToggleAuthorFilter?: (author: string) => void;
}

interface IconProps {
  className?: string;
}

const SummaryIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path
      d="M11.8333 4.06641H2.5"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14.5 8.06641H2.5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.5667 12H2.5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DiveDeeperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_2294_15114)">
      <path
        d="M6.6243 10.3342C6.56478 10.1034 6.44453 9.89289 6.27605 9.72441C6.10757 9.55593 5.89702 9.43567 5.6663 9.37615L1.5763 8.32148C1.50652 8.30168 1.44511 8.25965 1.40138 8.20178C1.35765 8.14391 1.33398 8.07335 1.33398 8.00082C1.33398 7.92828 1.35765 7.85773 1.40138 7.79985C1.44511 7.74198 1.50652 7.69996 1.5763 7.68015L5.6663 6.62482C5.89693 6.56536 6.10743 6.4452 6.2759 6.27684C6.44438 6.10849 6.56468 5.89808 6.6243 5.66748L7.67897 1.57748C7.69857 1.50743 7.74056 1.44571 7.79851 1.40175C7.85647 1.35778 7.92722 1.33398 7.99997 1.33398C8.07271 1.33398 8.14346 1.35778 8.20142 1.40175C8.25938 1.44571 8.30136 1.50743 8.32097 1.57748L9.37497 5.66748C9.43449 5.8982 9.55474 6.10875 9.72322 6.27723C9.8917 6.44571 10.1023 6.56597 10.333 6.62548L14.423 7.67948C14.4933 7.69888 14.5553 7.74082 14.5995 7.79887C14.6437 7.85691 14.6677 7.92786 14.6677 8.00082C14.6677 8.07378 14.6437 8.14472 14.5995 8.20277C14.5553 8.26081 14.4933 8.30275 14.423 8.32215L10.333 9.37615C10.1023 9.43567 9.8917 9.55593 9.72322 9.72441C9.55474 9.89289 9.43449 10.1034 9.37497 10.3342L8.3203 14.4242C8.3007 14.4942 8.25871 14.5559 8.20075 14.5999C8.1428 14.6439 8.07205 14.6677 7.9993 14.6677C7.92656 14.6677 7.85581 14.6439 7.79785 14.5999C7.73989 14.5559 7.69791 14.4942 7.6783 14.4242L6.6243 10.3342Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.334 2V4.66667" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6667 3.33398H12" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.66602 11.334V12.6673" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33333 12H2" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_2294_15114">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const SignalsIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path
      d="M3.76641 12.7333C1.16641 10.1333 1.16641 5.8666 3.76641 3.2666"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.70078 10.8005C4.16745 9.26712 4.16745 6.73379 5.70078 5.13379"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.49935 9.33366C9.23573 9.33366 9.83268 8.73671 9.83268 8.00033C9.83268 7.26395 9.23573 6.66699 8.49935 6.66699C7.76297 6.66699 7.16602 7.26395 7.16602 8.00033C7.16602 8.73671 7.76297 9.33366 8.49935 9.33366Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.3008 5.2002C12.8341 6.73353 12.8341 9.26686 11.3008 10.8669"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.2324 3.2666C15.8324 5.8666 15.8324 10.0666 13.2324 12.6666"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThreadsIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M14 10C14 10.3536 13.8595 10.6928 13.6095 10.9428C13.3594 11.1929 13.0203 11.3333 12.6667 11.3333H4.66667L2 14V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V10Z"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.66602 5.33301H4.66602"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.3327 8H4.66602"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16" fill="none">
    <path
      d="M8.49935 1.33301H2.49935C2.14573 1.33301 1.80659 1.47348 1.55654 1.72353C1.30649 1.97358 1.16602 2.31272 1.16602 2.66634V13.333C1.16602 13.6866 1.30649 14.0258 1.55654 14.2758C1.80659 14.5259 2.14573 14.6663 2.49935 14.6663H10.4993C10.853 14.6663 11.1921 14.5259 11.4422 14.2758C11.6922 14.0258 11.8327 13.6866 11.8327 13.333V4.66634L8.49935 1.33301Z"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path
      d="M8.50065 14.6663C12.1825 14.6663 15.1673 11.6816 15.1673 7.99967C15.1673 4.31778 12.1825 1.33301 8.50065 1.33301C4.81875 1.33301 1.83398 4.31778 1.83398 7.99967C1.83398 11.6816 4.81875 14.6663 8.50065 14.6663Z"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8.5 10.6667V8" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M8.5 5.33301H8.50667"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocumentThumbnail = ({ thumbnail, filename }: { thumbnail: string | null; filename: string }) => {
  if (!thumbnail) {
    return (
      <img
        src={pdfIcon}
        alt="PDF Icon"
        className="w-[48px] h-[64px] object-cover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
      />
    );
  }

  return (
    <img
      src={`data:image/jpeg;base64,${thumbnail}`}
      alt={`${filename} thumbnail`}
      className="w-[48px] h-[64px] object-cover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
    />
  );
};

export function DocumentSidebar({
  onClose,
  document,
  appliedFilters = { selectedAuthors: [], selectedCategories: [], selectedSectors: [] },
  onToggleAuthorFilter,
}: DocumentSidebarProps) {
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
    drive_web_link,
    drive_file_id,
    thumbnail,
  } = document || {};

  const { ai_summary, threads = [] } = analysis;

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

  const date = new Date(created_at);

  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const handlePdfChange = (newPdfId: string) => {
    setCurrentPdfId(newPdfId);
  };

  const handleAuthorClick = (authorName: string) => {
    if (onToggleAuthorFilter) {
      onToggleAuthorFilter(authorName);
    }
  };

  const isAuthorFiltered = (authorName: string) => {
    return appliedFilters.selectedAuthors.includes(authorName);
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
      className="min-h-[630px] max-h-screen bg-white z-10 overflow-y-auto"
    >
      <div className="flex relative flex-col h-full">
        <header className="flex sticky top-0 right-0 z-20 items-center justify-end px-4 py-1 w-full box-border">
          <button onClick={onClose} className="p-1 rounded-sm hover:bg-neutral-200">
            <X className="w-4 h-4 text-neutral-500 font-semibold" />
          </button>
        </header>

        <Tabs
          defaultValue="summary"
          className="h-full flex flex-col -mt-2"
          onValueChange={(value) => setActiveTab(value)}
        >
          <div className="flex items-center w-full mt-2 px-4 -mb-3">
            <TabsList
              className="flex w-full justify-start px-1 py-0 space-x-6"
              style={{
                borderRadius: "var(--border-radius-lg, 6px)",
                background: "var(--base-border-primary, #F4F4F5)",
                height: "var(--height-h-9, 36px)",
                flexShrink: 0,
              }}
            >
              <TabsTrigger
                value="summary"
                className={`px-3 ${
                  activeTab === "summary"
                    ? "bg-white shadow-md flex justify-center items-center gap-1"
                    : "data-[state=active]:bg-neutral-100 data-[state=active]:font-semibold"
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
                className={`px-3 ${
                  activeTab === "signals"
                    ? "bg-white shadow-md flex justify-center items-center gap-1"
                    : "data-[state=active]:bg-neutral-100 data-[state=active]:font-semibold"
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
                className={`px-3 ${
                  activeTab === "threads"
                    ? "bg-white shadow-md flex justify-center items-center gap-1"
                    : "data-[state=active]:bg-neutral-100 data-[state=active]:font-semibold"
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
                className={`px-3 ${
                  activeTab === "doc"
                    ? "bg-white shadow-md flex justify-center items-center gap-1"
                    : "data-[state=active]:bg-neutral-100 data-[state=active]:font-semibold"
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
                value="ai"
                className={`px-3 ${
                  activeTab === "ai"
                    ? "bg-white shadow-md flex justify-center items-center gap-1"
                    : "data-[state=active]:bg-neutral-100 data-[state=active]:font-semibold"
                }`}
                style={{
                  borderRadius: "var(--border-radius-md, 6px)",
                  boxShadow:
                    activeTab === "ai"
                      ? "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                      : "none",
                  flexShrink: 0,
                }}
              >
                {activeTab === "ai" && <Bot className="h-4 w-4 mr-0.5 mb-0.5" />}
                AI
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className={`px-3 ${
                  activeTab === "info"
                    ? "bg-white shadow-md flex justify-center items-center gap-1"
                    : "data-[state=active]:bg-neutral-100 data-[state=active]:font-semibold"
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

          <div className="h-[calc(100%-40px)] overflow-hidden">
            <ScrollArea className="h-full pt-6 pb-4">
              <TabsContent value="summary" className="mt-3.5 px-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Document</h3>
                  <div className="border border-[#E4E4E4] rounded-lg bg-[#FCFBFC]">
                    <div className="flex items-center gap-2 p-4">
                      <div className="flex-shrink-0">
                        <DocumentThumbnail thumbnail={thumbnail} filename={filename || "document.pdf"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1 max-w-[360px]">
                            <p className="text-sm text-black font-semibold truncate">
                              {email_subject || "Untitled Document"}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">{filename || "document.pdf"}</p>
                          </div>
                          <Link
                            to={`/document/${id}`}
                            state={{ document }}
                            className="flex-shrink-0 flex items-center justify-center px-4 h-9 bg-[#18181B] text-[#FAFAFA] rounded-md shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_0px_rgba(0,0,0,0.06)] hover:bg-[#27272A] transition-colors whitespace-nowrap"
                          >
                            Deep Read
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-neutral-500 mx-4 py-3 border-t border-[#E4E4E4]">
                      {ai_summary ? <p>{ai_summary}</p> : <p>N/A</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 mt-5">Research House</h3>
                    <div className="flex flex-wrap gap-3">
                      {author.map((author: string, index: number) => {
                        const isFiltered = isAuthorFiltered(author);
                        return (
                          <button
                            key={`author-${author}-${index}`}
                            onClick={() => handleAuthorClick(author)}
                            className="cursor-pointer"
                          >
                            <Badge
                              variant={"outline"}
                              className={`${
                                isFiltered ? "bg-white" : "bg-neutral-100"
                              } text-black text-sm py-1.5 flex items-center gap-2`}
                            >
                              <span>{author}</span>
                              {isFiltered && <Filter className="w-4 h-4" />}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 mt-8">Added</h3>
                    <div className="w-fit text-nowrap font-medium flex flex-row gap-2 text-sm">
                      <span className="font-semibold">{formattedDate}</span>
                      <span className="text-neutral-500">
                        {hours}:{minutes}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 mt-8">Threads</h3>
                    <div className="bg-[#CDBEDA] px-2 py-1 rounded-lg w-fit">
                      <p className="text-sm text-black font-medium">{threads.length || 0} Threads</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signals" className="px-4">
                <div>
                  <div className="space-y-3.5">
                    <div className="border border-neutral-200 rounded-md p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center">
                          <Badge className="shadow-none flex items-center gap-1 bg-green-50 text-green-800 border-green-50 hover:bg-green-100 hover:text-green-800 h-5 px-2 rounded text-xs font-medium">
                            <div className="h-1.5 w-1.5 bg-green-600 rounded-full"></div>
                            <span>Long</span>
                          </Badge>
                        </div>
                        <span className="text-xs text-neutral-500">5 min ago</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center space-x-1">
                          <h4 className="text-sm font-semibold">Trade:</h4>
                          <span className="text-sm">Long RXM5</span>
                        </div>
                        <div className="flex items-center space-x-1 text-neutral-500 font-thin">
                          <span className="text-sm">Horizon: 1-2 months</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-5">
                          <h4 className="text-sm font-semibold">Structure:</h4>
                          <span className="text-sm text-neutral-700">20/22k 1×0.5 CS</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <h4 className="text-sm font-semibold">From:</h4>
                          <span className="text-sm text-neutral-700">Goldman Sachs</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-normal">
                          <DiveDeeperIcon />
                          Dive Deeper
                        </Button>
                        <div className="flex items-center space-x-2">
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="border border-neutral-200 rounded-md p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center">
                          <Badge className="shadow-none flex items-center gap-1 bg-red-50 text-red-800 border-red-50 hover:bg-red-100 hover:text-red-800 h-5 px-2 rounded text-xs font-medium">
                            <div className="h-1.5 w-1.5 bg-red-600 rounded-full"></div>
                            <span>Short</span>
                          </Badge>
                        </div>
                        <span className="text-xs text-neutral-500">5 min ago</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center space-x-1">
                          <h4 className="text-sm font-semibold">Trade:</h4>
                          <span className="text-sm">Long RXM5</span>
                        </div>
                        <div className="flex items-center space-x-1 text-neutral-500 font-thin">
                          <span className="text-sm">Horizon: 1-2 months</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-5">
                          <h4 className="text-sm font-semibold">Structure:</h4>
                          <span className="text-sm text-neutral-700">20/22k 1×0.5 CS</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <h4 className="text-sm font-semibold">From:</h4>
                          <span className="text-sm text-neutral-700">Goldman Sachs</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-normal">
                          <DiveDeeperIcon />
                          Dive Deeper
                        </Button>
                        <div className="flex items-center space-x-2">
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="threads" className="mt-0">
                <div className="space-y-4 px-4"></div>
              </TabsContent>

              <TabsContent value="doc" className="-mt-1 h-full p-0">
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
                      <p className="text-sm text-neutral-500 max-w-md mb-4">
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

              <TabsContent value="ai" className="mt-0">
                <div className="space-y-4 px-4"></div>
              </TabsContent>

              <TabsContent value="info" className="mt-1">
                <div className="space-y-6 px-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Paper Name</h3>
                    <p className="text-sm text-neutral-500">{email_subject || "Untitled Document"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Paper ID</h3>
                    <p className="text-sm text-neutral-500">{document?.id}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Size</h3>
                    <p className="text-sm text-neutral-500">{formatFileSize(file_size)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Paper Type</h3>
                    <p className="text-sm text-neutral-500">
                      {category_tags && category_tags.length > 0 ? category_tags[0] : "Journal Article"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">File Type</h3>
                    <p className="text-sm text-neutral-500">
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
