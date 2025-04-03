import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PdfViewer } from "./PdfViewer";

interface DocumentViewerProps {
  pdfUrl: string;
  document: any;
  sidebarOpen?: boolean;
}

export function DocumentViewer({ pdfUrl, document, sidebarOpen = false }: DocumentViewerProps) {
  const { analysis = {} } = document || {};
  const { ai_summary } = analysis;

  return (
    <div className={`flex h-[calc(100vh-80px)] space-x-6 ${!sidebarOpen ? "mt-4" : ""}`}>
      <div className="w-1/2 h-[calc(100vh-65px)] relative">
        <PdfViewer pdfUrl={pdfUrl} />
      </div>

      <div className="w-1/2 border border-gray-200 h-full bg-white overflow-hidden flex flex-col">
        <header className="relative flex items-center">
          <div className="flex items-center w-full mx-2 mt-2">
            <Tabs defaultValue="overview" className="h-full flex flex-col w-full">
              <TabsList className="flex w-full justify-start bg-white p-0 h-10 space-x-3">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Overview Summary
                </TabsTrigger>
                <TabsTrigger
                  value="detailed"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Detailed Summary
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:ml-2 px-2"
                >
                  Notes
                </TabsTrigger>
                <TabsTrigger
                  value="ai-chat"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:font-semibold px-2"
                >
                  AI Chat
                </TabsTrigger>
              </TabsList>

              <div className="h-[calc(100%-40px)] overflow-hidden">
                <ScrollArea className="h-full px-2 pt-6 pb-4">
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Summary</h3>
                        <div className="space-y-2 text-sm text-gray-500 border border-gray-200 px-4 py-3 rounded-lg">
                          <p>{ai_summary}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="detailed" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Detailed summary will be available here.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Notes will be available here.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai-chat" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">AI Chat will be available here.</p>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </header>
      </div>
    </div>
  );
}
