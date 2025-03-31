import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

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
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 400 }}
      className="sticky left-0 right-0 bottom-8 mx-auto w-fit z-49 flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
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
