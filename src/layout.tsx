import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buildChatIndex } from "@/lib/api/chat";
import { LoaderCircle } from "lucide-react";

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
  const navigate = useNavigate();
  const [isBuildingIndex, setIsBuildingIndex] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [items, setItems] = useState([]);

  const generateDefaultBreadcrumbs = () => {
    const pathSegments = location.pathname
      .split("/")
      .filter((segment) => segment);

    if (pathSegments.length === 0) {
      return [{ label: "Home", path: "/", isCurrentPage: true }];
    }

    const breadcrumbItems: BreadcrumbItem[] = [];

    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLastSegment = index === pathSegments.length - 1;

      const formattedLabel = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      breadcrumbItems.push({
        label: formattedLabel,
        path: currentPath,
        isCurrentPage: isLastSegment,
      });
    });

    return breadcrumbItems;
  };

  const displayBreadcrumbs =
    breadcrumbs.length > 0 ? breadcrumbs : generateDefaultBreadcrumbs();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast("Logout failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatWith = async () => {
    setIsBuildingIndex(true);
    try {
      const response = await buildChatIndex(selectedRows);
      
      // Get the selected files data from the items array
      const selectedFiles = items
        .filter((item: any) => selectedRows.includes(item.id))
        .map((item: any) => ({
          id: item.id,
          filename: item.filename
        }));
      
      if (response.status === "success") {
        toast.success("Your files are ready for chat!");
        navigate("/chat", { 
          state: { 
            selectedRows,
            selectedFiles,
            faissIndexPath: response.index_path,
            mode: "chat" 
          },
          replace: true 
        });
      } else {
        throw new Error("Failed to build chat index");
      }
    } catch (error) {
      console.error("Error building chat index:", error);
      toast.error("Failed to build chat index", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsBuildingIndex(false);
    }
  };

  useEffect(() => {
    const handleSelectedRowsChange = (event: CustomEvent) => {
      setSelectedRows(event.detail.selectedRows);
      setItems(event.detail.items);
    };

    window.addEventListener('selectedRowsChanged', handleSelectedRowsChange as EventListener);

    return () => {
      window.removeEventListener('selectedRowsChanged', handleSelectedRowsChange as EventListener);
    };
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      <SidebarProvider>
        <AppSidebar
          handleLogout={handleLogout}
          isLoading={isLoading}
          user={user || undefined}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
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
                      {index < displayBreadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2 px-4">
              {location.pathname === "/private-assets" && (
                <Button 
                  onClick={handleChatWith}
                  disabled={isBuildingIndex || selectedRows.length === 0}
                  className="inline-flex h-9 items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[#18181B] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_0px_rgba(0,0,0,0.06)]"
                >
                  {isBuildingIndex ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    null
                  )}
                  <span className="text-[#FAFAFA] font-sans text-sm font-medium leading-5">
                    {isBuildingIndex ? "Preparing documents..." : "Chat with..."}
                  </span>
                </Button>
              )}
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 relative">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbContext.Provider>
  );
}
