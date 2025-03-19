import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export default function Sidebar() {
  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-4">
          <SidebarTrigger />
          <h1>Welcome to the Sidebar Page</h1>
          <p>This page contains a sidebar.</p>
        </main>
      </div>
    </SidebarProvider>
  );
}
