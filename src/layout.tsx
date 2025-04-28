import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";

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
          <header className="flex sticky top-0 z-10 bg-white border-b-[1.25px] shadow-sm border-neutral-200 min-h-16 px-3 py-4 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              {/* <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" /> */}
              <Breadcrumb>
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
          <div className="flex flex-1 flex-col gap-4 px-7 py-6 relative">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbContext.Provider>
  );
}
