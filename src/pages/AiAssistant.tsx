import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AiAssistant/app-sidebar";
function AiAssistant() {
  return (
    <div className="ml-20">
      <SidebarProvider>
        <div className="flex  w-full">
          <AppSidebar />
          <main className="flex-1  h-full p-2">
            <SidebarTrigger className="mb-4" />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default AiAssistant;
