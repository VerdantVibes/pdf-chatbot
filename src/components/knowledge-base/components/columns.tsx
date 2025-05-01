import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Pdf } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
// import { FileText, Youtube, Podcast, Radio, File, Archive, Bookmark } from "lucide-react";
import {
  File,
  Archive,
  Bookmark,
  Folder,
  Loader2,
  Tag,
  ChevronDown,
  Star,
  BookOpen,
  Compass,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getFolders, movePdfsToFolder } from "@/lib/api/folder";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

interface FolderType {
  name: string;
  // Add other properties if needed
}

type ExtendedColumnDef<T> = ColumnDef<T> & {
  identifier?: string | boolean;
};

export const getColumns = (): ExtendedColumnDef<Pdf>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email_subject",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Document" />,
    cell: ({ row }) => (
      <div className="w-fit space-y-2 group relative text-sm max-w-60">
        <div className="truncate">{row.original?.email_subject}</div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: () => {
      // const icons = ["file", "podcast", "youtube", "filetext", "radio"];
      // const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      const randomIcon = "file";
      return (
        <div className="ml-0.5 text-secondary-foreground/40">
          {randomIcon === "file" && <File className="h-4 w-4" />}
          {/* {randomIcon === "podcast" && <Podcast className="h-4 w-4" />}
          {randomIcon === "youtube" && <Youtube className="h-4 w-4" />}
          {randomIcon === "filetext" && <FileText className="h-4 w-4" />}
          {randomIcon === "radio" && <Radio className="h-4 w-4" />} */}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "Tags",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tags" />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap max-w-40 items-center gap-1.5">
          {row.original?.sector?.map((sector) => (
            <Badge key={sector} variant={"outline"}>
              <div className="flex items-center space-x-1 text-nowrap">
                <span className="font-medium">{sector}</span>
              </div>
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    identifier: "Added",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));

      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return (
        <div className="w-fit text-nowrap font-medium flex flex-col">
          <span className={row.getIsExpanded() ? "font-bold" : ""}>{formattedDate}</span>
          <span className="text-gray-500">
            {hours}:{minutes}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "author",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-1 text-nowrap">
          <div className="w-fit">{row.original?.author[0]}</div>
        </div>
      );
    },
    enableSorting: false,
  },
  // {
  //   accessorKey: "action",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
  //   cell: ({ row }) => {
  //     const handleClick = () => {
  //       if (onRowExpand) {
  //         onRowExpand(row.id);
  //       } else {
  //         row.toggleExpanded();
  //       }
  //     };

  //     return (
  //       <button onClick={handleClick} className="cursor-pointer p-1 rounded-sm hover:bg-gray-100">
  //         {row.getIsExpanded() ? (
  //           <div className="flex items-center justify-center">
  //             <Minimize2 className="h-3.5 w-3.5 text-gray-900" />
  //           </div>
  //         ) : (
  //           <div className="flex items-center justify-center">
  //             <Expand className="h-3.5 w-3.5 text-gray-900" />
  //           </div>
  //         )}
  //       </button>
  //     );
  //   },
  //   enableSorting: false,
  //   identifier: false,
  // },
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => {
      const [dropdownOpen, setDropdownOpen] = React.useState(false);
      const { data: folders = [] } = useQuery<FolderType[]>({
        queryKey: ["folders"],
        queryFn: getFolders,
        enabled: false, // Prevent additional fetching, just subscribe to the cache
      });
      const queryClient = useQueryClient();

      const moveToCategoryMutation = useMutation({
        mutationFn: ({ pdfIds, category }: { pdfIds: string[]; category: string }) => {
          return movePdfsToFolder(pdfIds, category);
        },
        onSuccess: (data) => {
          toast.success(
            data.message || `Successfully moved ${data.moved_pdf_ids.length} document(s) to '${data.folder_name}'`
          );

          // Refresh the table data
          queryClient.invalidateQueries({ queryKey: ["pdfs"] });

          // If there were failures, show a warning
          if (data.failed_pdf_ids && data.failed_pdf_ids.length > 0) {
            toast.warning(`Failed to move ${data.failed_pdf_ids.length} document(s)`);
          }
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.detail || "Failed to move documents to folder");
        },
      });

      const handleArchive = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const documentId = (row.original as any).id;
        const folderName = "Archived";

        moveToCategoryMutation.mutate({ pdfIds: [documentId], category: folderName });
      };

      const handleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const documentId = (row.original as any).id;
        const folderName = "Tag as";

        moveToCategoryMutation.mutate({ pdfIds: [documentId], category: folderName });
      };

      const handleMoveToCategory = (category: string) => {
        const documentId = (row.original as any).id;
        moveToCategoryMutation.mutate({ pdfIds: [documentId], category });
        setDropdownOpen(false);
      };

      return (
        <div
          className={`flex transition-opacity ${dropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <Button
            disabled={moveToCategoryMutation.isPending}
            variant={"ghost"}
            size={"icon"}
            className="w-7 h-7 text-neutral-700"
            onClick={handleArchive}
          >
            <Archive className="h-4 w-4" />
          </Button>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size={"icon"}
                className="w-7 h-7 text-neutral-700"
                disabled={moveToCategoryMutation.isPending}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="mr-12">
              {/* Hardcoded options matching files-tabs.tsx */}
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveToCategory("Favorites");
                }}
                disabled={moveToCategoryMutation.isPending}
              >
                <Star className="h-4 w-4" />
                <span>Favorites</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveToCategory("Read Later");
                }}
                disabled={moveToCategoryMutation.isPending}
              >
                <BookOpen className="h-4 w-4" />
                <span>Read Later</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveToCategory("Discover");
                }}
                disabled={moveToCategoryMutation.isPending}
              >
                <Compass className="h-4 w-4" />
                <span>Discover</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveToCategory("Shared");
                }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveToCategory(folder.name);
                  }}
                  disabled={moveToCategoryMutation.isPending}
                >
                  <Folder className="h-4 w-4" />
                  <span>{folder.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    identifier: false,
  },
];
