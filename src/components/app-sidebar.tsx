import * as React from "react";
import { BookOpen, Bot, Home, LifeBuoy, Notebook, Settings2, Zap, FileBarChart2, Database } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavFavorites } from "@/components/nav-favorites";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { User } from "@/lib/context/AuthContext";

const data = {
  user: {
    name: "user",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  },
  teams: [
    {
      name: "Delphis",
      description: "v1.0.1 (Beta)",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
      isActive: true,
    },
    {
      title: "Knowledge Base",
      url: "/knowledge-base",
      icon: BookOpen,
      items: [
        {
          title: "Recent",
          url: "/knowledge-base/general",
        },
      ],
    },
    {
      title: "Chat",
      url: "/chat",
      icon: Bot,
      items: [
        {
          title: "Recent Chats",
          url: "/chat",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileBarChart2,
    },
  ],
  favorites: [
    {
      name: "Signals",
      url: "/signals",
      icon: Zap,
    },
    {
      name: "Notes",
      url: "/notes",
      icon: Notebook,
    },
  ],
  support: [
    {
      title: "Data Integrations",
      url: "/integrations",
      icon: Database,
      items: [
        {
          title: "Podcasts",
          url: "/integrations/podcasts",
        },
        {
          title: "Storage",
          url: "/integrations/storage",
        },
        {
          title: "News",
          url: "/integrations/news",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    }
  ],
};

export function AppSidebar({
  handleLogout,
  isLoading,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  handleLogout?: () => Promise<void>;
  isLoading?: boolean;
  user?: User;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Platform" />
        <NavFavorites favorites={data.favorites} />
      </SidebarContent>
      <NavMain items={data.support} label="Data Integrations" />
      <SidebarFooter>
        <NavUser
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  avatar: "/avatars/default.jpg",
                }
              : data.user
          }
          handleLogout={handleLogout}
          isLoading={isLoading}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
