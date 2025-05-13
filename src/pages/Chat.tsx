import { useState } from "react";
import { ChevronLeft, FileText, Search, MessageSquare } from "lucide-react";
import { PdfViewer } from "@/components/chat/PdfViewer";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatItem {
  title: string;
  message: string;
  date: string;
  messages: number;
}

export function Chat() {
  const [isFileViewOpen, setIsFileViewOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);

  const selectedRows = location.state?.selectedRows || [];
  const selectedFiles = location.state?.selectedFiles || [];
  const currentPdfId = selectedRows[0];
  const pdfUrl = currentPdfId ? `${import.meta.env.VITE_API_URL}/pdf/${currentPdfId}/content` : null;

  const selectedPdfs = selectedFiles.map((file: { id: string; filename: string }) => ({
    id: file.id,
    filename: file.filename,
  }));

  const [currentPdfUrl, setCurrentPdfUrl] = useState(pdfUrl!);

  const handlePdfChange = (newPdfId: string, page?: number) => {
    const newPdfUrl = `${import.meta.env.VITE_API_URL}/pdf/${newPdfId}/content`;
    setCurrentPdfUrl(newPdfUrl);
    if (page) {
      setCurrentPage(page);
    }
  };

  const renderChatList = (chats: ChatItem[], title: string) => (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      <div className="space-y-1">
        {chats.map((chat, index) => (
          <div
            key={index}
            className="p-3 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-neutral-900 mb-1">
                  Chat: {chat.title}
                </h3>
                <p className="text-sm text-neutral-600 line-clamp-2">{chat.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-neutral-500">{chat.date}</span>
                  <span className="text-xs text-neutral-500">{chat.messages} Messages</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Sample data for chat lists
  const recentChats: ChatItem[] = [
    {
      title: "Chinese Economic Recession",
      message: "Type a message for me to help you out with reviewing this document, provide info",
      date: "21 August, 12:42PM",
      messages: 23,
    },
    // Add more recent chats as needed
  ];

  const pinnedChats: ChatItem[] = [
    {
      title: "Chinese Economic Recession",
      message: "Type a message for me to help you out with reviewing this document, provide info",
      date: "21 August, 12:42PM",
      messages: 23,
    },
    // Add more pinned chats as needed
  ];

  return (
    <div className="hidden h-[calc(100vh-48px)] flex-1 flex-col md:flex">
      <div className="flex w-full h-full overflow-hidden">
        {/* Left Sidebar - Chat List */}
        <div className="w-[300px] border-r border-stone-200 flex flex-col">
          <div className="p-4 space-y-4">
            <h1 className="text-[#18181B] text-base font-semibold leading-6 overflow-hidden text-ellipsis whitespace-nowrap font-sans">
              Recent Chats
            </h1>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <Input
                  placeholder="Search chats"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3"
                />
              </div>
              <Button variant="outline" size="default" className="shrink-0">
                Search
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
            {renderChatList(pinnedChats, "Pinned Chats")}
            {renderChatList(recentChats, "Recent Chats")}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-[#18181B] text-base font-semibold leading-6 overflow-hidden text-ellipsis whitespace-nowrap font-sans">
              AI Assistant
            </h2>
            <Button variant="default" size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800">
              New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pt-16">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-[#3A3B3F] text-[28px] font-semibold leading-[32px] tracking-[-0.4px] text-center font-sans mb-2">
                Discover Insights and Chat with AI on Steroids
              </h1>
              <p className="text-[#767A7F] text-base font-normal leading-6 text-center font-sans mb-8">
                Ready to assist you with your advanced search queries, deep document research
                as well as finding answering any of your question.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 border border-stone-200 rounded-lg">
                    <MessageSquare className="h-5 w-5 mb-2 text-neutral-600" />
                    <p className="text-sm text-neutral-600">
                      Please put together for me the Predictions for the Chinese Economy and its upcoming Recession.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="max-w-3xl mx-auto">
              <Input
                placeholder="Ask your question in this field to start chatting with AI..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* PDF Viewer Section */}
        {isFileViewOpen && pdfUrl && (
          <div className="w-1/2 border-l border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 h-12">
              <h4 className="text-sm font-semibold flex items-center gap-1 text-stone-900">
                <FileText className="h-4 w-4" /> PDF View{" "}
                <span className="text-stone-500 font-normal">({selectedPdfs.length} Selected)</span>
              </h4>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-sm text-stone-700 font-medium h-8 px-2"
                onClick={() => setIsFileViewOpen(false)}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Hide view
              </Button>
            </div>
            <PdfViewer
              pdfUrl={currentPdfUrl}
              selectedPdfs={selectedPdfs}
              onPdfChange={(pdfId) => handlePdfChange(pdfId)}
              initialPage={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
