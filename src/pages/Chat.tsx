import { useState } from "react";
import { ChevronLeft, FileText, Search, MessageSquare, Send } from "lucide-react";
import { PdfViewer } from "@/components/chat/PdfViewer";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeInputTab, setActiveInputTab] = useState("chat");

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
        <div className="w-[360px] border-r border-stone-200 flex flex-col">
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
            <div className="w-full relative">
              <Input
                placeholder="Ask your question in this field to start chatting with AI..."
                className="w-full pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Tabs defaultValue="chat" value={activeInputTab} onValueChange={setActiveInputTab} className="w-auto">
                  <TabsList className="h-auto p-0 bg-transparent border-0 gap-2">
                    <TabsTrigger 
                      value="chat" 
                      className="data-[state=active]:bg-[#F1F1F1] data-[state=inactive]:bg-transparent data-[state=active]:shadow-none border-0 px-2 py-1.5 h-auto rounded-lg hover:bg-[#F1F1F1]/80"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className={activeInputTab === "chat" ? "opacity-100" : "opacity-50"}>
                        <path d="M14.4688 10.3848C14.4688 10.7384 14.3283 11.0775 14.0782 11.3276C13.8282 11.5776 13.489 11.7181 13.1354 11.7181H5.13542L2.46875 14.3848V3.7181C2.46875 3.36448 2.60923 3.02534 2.85927 2.77529C3.10932 2.52524 3.44846 2.38477 3.80208 2.38477H13.1354C13.489 2.38477 13.8282 2.52524 14.0782 2.77529C14.3283 3.02534 14.4688 3.36448 14.4688 3.7181V10.3848Z" stroke="#4E5255" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.13281 5.71777H5.13281" stroke="#4E5255" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.7995 8.38477H5.13281" stroke="#4E5255" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="command" 
                      className="data-[state=active]:bg-[#F1F1F1] data-[state=inactive]:bg-transparent data-[state=active]:shadow-none border-0 px-2 py-1.5 h-auto rounded-lg hover:bg-[#F1F1F1]/80"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className={activeInputTab === "command" ? "opacity-100" : "opacity-50"}>
                        <g clipPath="url(#clip0_2658_28809)">
                          <path d="M8.47135 4.38444V1.71777H5.80469" stroke="#BCC0C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5.79948 12.3848L3.13281 15.0514V5.7181C3.13281 5.36448 3.27329 5.02534 3.52334 4.77529C3.77339 4.52524 4.11252 4.38477 4.46615 4.38477H12.4661C12.8198 4.38477 13.1589 4.52524 13.409 4.77529C13.659 5.02534 13.7995 5.36448 13.7995 5.7181V11.0514C13.7995 11.4051 13.659 11.7442 13.409 11.9942C13.1589 12.2443 12.8198 12.3848 12.4661 12.3848H5.79948Z" stroke="#BCC0C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M1.80469 8.38477H3.13802" stroke="#BCC0C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.46875 7.71777V9.05111" stroke="#BCC0C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10.4688 7.71777V9.05111" stroke="#BCC0C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13.8047 8.38477H15.138" stroke="#BCC0C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_2658_28809">
                            <rect width="16" height="16" fill="white" transform="translate(0.46875 0.384766)"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-md bg-neutral-900 hover:bg-neutral-800"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
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
