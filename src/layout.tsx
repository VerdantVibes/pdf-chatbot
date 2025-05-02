import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "@radix-ui/react-separator";
import { Input } from "./components/ui/input";
import { Search } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  path: string;
  isCurrentPage?: boolean;
};

type BreadcrumbContextType = {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
};

export const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumbs: [],
  setBreadcrumbs: () => {},
});

export const useBreadcrumbs = () => useContext(BreadcrumbContext);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const location = useLocation();

  const generateDefaultBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter((segment) => segment);

    if (pathSegments.length === 0) {
      return [{ label: "Home", path: "/", isCurrentPage: true }];
    }

    const breadcrumbItems: BreadcrumbItem[] = [];

    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLastSegment = index === pathSegments.length - 1;

      const formattedLabel = segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

      breadcrumbItems.push({
        label: formattedLabel,
        path: currentPath,
        isCurrentPage: isLastSegment,
      });
    });

    return breadcrumbItems;
  };

  const displayBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : generateDefaultBreadcrumbs();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast("Logout failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      <SidebarProvider>
        <AppSidebar handleLogout={handleLogout} isLoading={isLoading} user={user || undefined} />
        <SidebarInset>
          <header className="flex sticky top-0 z-10 bg-white border-b-[1.25px] shadow-sm border-neutral-200 min-h-16 px-0 py-0 md:px-3 md:py-4 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <div className="md:hidden w-full flex items-center justify-center gap-3">
                <SidebarTrigger className="p-[1.05rem]" />
                <div className="w-full relative">
                  <Input placeholder="Search..." className="pl-8 text-xs placeholder:text-secondary-foreground/50" />
                  <Search className="h-3.5 w-3.5 absolute left-3 top-[48%] -translate-y-1/2 text-secondary-foreground/50" />
                </div>
              </div>

              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb className="hidden md:flex md:-ml-2">
                <BreadcrumbList>
                  {displayBreadcrumbs.map((item, index) => (
                    <BreadcrumbItem key={item.path} className="hidden md:flex">
                      {item.isCurrentPage ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink>
                          <Link to={item.path}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                      {index < displayBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 px-4 py-2 md:px-7 md:py-6 relative">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbContext.Provider>
  );
}
