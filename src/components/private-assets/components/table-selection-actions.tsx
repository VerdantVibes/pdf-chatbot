import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Loader2, Trash2, Tag, ChevronDown, Star, BookOpen, Compass, Share2, Folder } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFolders, movePdfsToFolder } from "@/lib/api/folder";
import { toast } from "sonner";

// Define the Folder type to match what's returned by the API
interface FolderType {
  name: string;
  // Add other properties if needed
}

interface TableSelectionActionsProps {
  selectedCount: number;
  selectedRowIds: string[];
  onStartChat: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  isDeleting: boolean;
  isBuildingIndex: boolean;
  refetch?: () => void;
}

export function TableSelectionActions({
  selectedCount,
  selectedRowIds,
  onStartChat,
  onDelete,
  onSelectAll,
  isDeleting,
  isBuildingIndex,
  refetch,
}: TableSelectionActionsProps) {
  // Use useQuery with enabled: false to subscribe to cache updates without triggering new fetches
  const { data: folders = [] } = useQuery<FolderType[]>({
    queryKey: ["folders"],
    queryFn: getFolders,
    enabled: false, // Prevent additional fetching, just subscribe to the cache
  });

  const queryClient = useQueryClient();

  // Mutation for moving documents to a folder
  const moveToCategoryMutation = useMutation({
    mutationFn: ({ pdfIds, category }: { pdfIds: string[]; category: string }) => {
      return movePdfsToFolder(pdfIds, category);
    },
    onSuccess: (data) => {
      toast.success(
        data.message || `Successfully moved ${data.moved_pdf_ids.length} document(s) to '${data.folder_name}'`
      );

      // Refresh the table data
      if (refetch) {
        refetch();
      } else {
        queryClient.invalidateQueries({ queryKey: ["pdfs"] });
      }

      // Reset row selection after refetching data
      onSelectAll();

      // If there were failures, show a warning
      if (data.failed_pdf_ids && data.failed_pdf_ids.length > 0) {
        toast.warning(`Failed to move ${data.failed_pdf_ids.length} document(s)`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to move documents to folder");
    },
  });

  // Handle moving documents to a category
  const handleMoveToCategory = (category: string) => {
    if (selectedRowIds.length === 0) {
      toast.error("No documents selected");
      return;
    }

    moveToCategoryMutation.mutate({ pdfIds: selectedRowIds, category });
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 400 }}
      className="sticky left-0 right-0 bottom-8 mx-auto w-fit z-50 flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={true}
          onCheckedChange={() => {
            onSelectAll();
          }}
          disabled={isBuildingIndex || isDeleting}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <span className="text-sm font-medium">{selectedCount} Selected Documents</span>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 flex items-center gap-1"
              disabled={moveToCategoryMutation.isPending || isBuildingIndex || isDeleting}
            >
              {moveToCategoryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Moving...
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4" />
                  <span>Tag as</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {/* Hardcoded options matching files-tabs.tsx */}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleMoveToCategory("Favorites")}
              disabled={moveToCategoryMutation.isPending}
            >
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleMoveToCategory("Read Later")}
              disabled={moveToCategoryMutation.isPending}
            >
              <BookOpen className="h-4 w-4" />
              <span>Read Later</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleMoveToCategory("Discover")}
              disabled={moveToCategoryMutation.isPending}
            >
              <Compass className="h-4 w-4" />
              <span>Discover</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleMoveToCategory("Shared")}
              disabled={moveToCategoryMutation.isPending}
            >
              <Share2 className="h-4 w-4" />
              <span>Shared</span>
            </DropdownMenuItem>

            {/* Show separator if there are folders */}
            {folders.length > 0 && <DropdownMenuSeparator />}

            {/* Dynamic folders */}
            {folders.map((folder: FolderType) => (
              <DropdownMenuItem
                key={folder.name}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleMoveToCategory(folder.name)}
                disabled={moveToCategoryMutation.isPending}
              >
                <Folder className="h-4 w-4" />
                <span>{folder.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="default" className="h-9" onClick={onStartChat} disabled={isBuildingIndex || isDeleting}>
          {isBuildingIndex ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Preparing documents...
            </>
          ) : (
            "Start Chat"
          )}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-9 w-9"
          onClick={onDelete}
          disabled={isDeleting || isBuildingIndex}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
}
