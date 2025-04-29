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
import { useQuery } from "@tanstack/react-query";

// Define the Folder type to match what's returned by the API
interface FolderType {
  name: string;
  // Add other properties if needed
}

interface TableSelectionActionsProps {
  selectedCount: number;
  onStartChat: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  isDeleting: boolean;
  isBuildingIndex: boolean;
}

export function TableSelectionActions({
  selectedCount,
  onStartChat,
  onDelete,
  onSelectAll,
  isDeleting,
  isBuildingIndex,
}: TableSelectionActionsProps) {
  // Use useQuery with enabled: false to subscribe to cache updates without triggering new fetches
  const { data: folders = [] } = useQuery<FolderType[]>({
    queryKey: ["folders"],
    enabled: false, // Prevent additional fetching, just subscribe to the cache
  });

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
            <Button variant="outline" className="h-9 flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>Tag as</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {/* Hardcoded options matching files-tabs.tsx */}
            <DropdownMenuItem className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Read Later</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span>Discover</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>Shared</span>
            </DropdownMenuItem>

            {/* Show separator if there are folders */}
            {folders.length > 0 && <DropdownMenuSeparator />}

            {/* Dynamic folders */}
            {folders.map((folder: FolderType) => (
              <DropdownMenuItem key={folder.name} className="flex items-center gap-2">
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
