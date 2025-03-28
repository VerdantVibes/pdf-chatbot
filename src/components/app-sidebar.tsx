import * as React from "react";
import {
  BookOpen,
  Bot,
  Files,
  Home,
  LifeBuoy,
  MessageSquare,
  Notebook,
  Send,
  Settings2,
  Zap,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavFavorites } from "@/components/nav-favorites";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@/lib/context/AuthContext";

const data = {
  // This is default user data
  user: {
    name: "user",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  },
  teams: [
    {
      name: "Delphis",
      description: "by Delhis",
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
      title: "Chat",
      url: "/chat",
      icon: Bot,
      items: [
        {
          title: "Chat",
          url: "/chat",
        },
      ],
    },
    {
      title: "Knowledge Base",
      url: "/knowledge-base",
      icon: BookOpen,
      items: [
        {
          title: "Private Assets",
          url: "/private-assets",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Settings",
          url: "/settings",
        },
      ],
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
    {
      name: "Files",
      url: "/files",
      icon: Files,
    },
    {
      name: "Chats",
      url: "/chats",
      icon: MessageSquare,
      items: [
        {
          title: "Chats",
          url: "/chats",
        },
      ],
    },
  ],
  support: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
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
      <NavMain items={data.support} label={false} />
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
