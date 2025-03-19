// components/app-sidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu
} from "@/components/ui/sidebar";
import { IoAddCircleOutline } from "react-icons/io5";

export function AppSidebar() {
  return (
    <Sidebar className="ml-20 bg-[#f5f5f4]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className=" p-2 h-[calc(100vh-50px)]">
                <div className="w-full h-10 flex items-center justify-center gap-1 border rounded-lg  ">
                  <IoAddCircleOutline />
                  <p>New</p>
                </div>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
