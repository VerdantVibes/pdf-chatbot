import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFolder, getFolders } from "@/lib/api/folder";

interface FilesTabsProps {
  onTabChange?: (tab: string) => void;
}

export function FilesTabs({ onTabChange }: FilesTabsProps) {
  const [activeTab, setActiveTab] = useState("all-files");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const queryClient = useQueryClient();

  // Fetch folders with React Query
  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["folders"],
    queryFn: getFolders,
    refetchOnWindowFocus: false,
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (name: string) => createFolder(name),
    onSuccess: () => {
      toast.success("Folder created successfully");
      setNewFolderName("");
      setDialogOpen(false);
      // Invalidate and refetch folders
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
    onError: (error) => {
      console.error("Failed to create folder:", error);
      toast.error((error as any)?.response?.data?.detail || "Failed to create folder");
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate(newFolderName);
  };

  return (
    <>
      <Tabs defaultValue="all-files" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b border-border w-fit overflow-x-auto">
          <TabsList className="h-10 md:h-9 bg-transparent p-0 w-full flex md:flex-wrap max-w-[calc(100vw-2rem)] md:max-w-full justify-start">
            <TabsTrigger
              value="all-files"
              className="px-[1.15rem] h-9 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-medium"
            >
              All Files
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="px-[1.15rem] h-9 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-medium"
            >
              Favorites
            </TabsTrigger>
            <TabsTrigger
              value="read-later"
              className="px-[1.15rem] h-9 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-medium"
            >
              Read Later
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="px-[1.15rem] h-9 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-medium"
            >
              Discover
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="px-[1.15rem] h-9 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-medium"
            >
              Shared
            </TabsTrigger>

            {isLoading
              ? // Skeleton loaders for folders
                Array.from({ length: 1 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="px-[1.15rem] h-9 flex items-center">
                    <div className="h-4 bg-neutral-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))
              : // Render folder tabs
                folders.map((folder) => (
                  <TabsTrigger
                    key={folder.name}
                    value={`folder-${folder.name}`}
                    className="px-[1.15rem] h-9 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-medium"
                  >
                    {folder.name}
                  </TabsTrigger>
                ))}

            <button
              className="flex items-center text-nowrap text-sm font-medium px-[1.15rem] h-9 text-foreground hover:text-foreground/80"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-2.5 w-2.5 mr-0.5" />
              New Folder
            </button>
          </TabsList>
        </div>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                placeholder="Enter folder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCreateFolder}
              disabled={createFolderMutation.isPending || !newFolderName.trim()}
            >
              {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
