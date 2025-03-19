// components/app-sidebar.tsx
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, Inbox, Calendar, Search, Settings } from "lucide-react";
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
