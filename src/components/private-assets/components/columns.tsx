import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Pdf } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { FileText, Youtube, Podcast, Radio, File, Archive, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    cell: () => {
      return (
        <div className="flex">
          <Button variant={"ghost"} size={"icon"} className="w-7 h-7 text-neutral-700">
            <Archive />
          </Button>
          <Button variant={"ghost"} size={"icon"} className="w-7 h-7 text-neutral-700">
            <Bookmark />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    identifier: false,
  },
];
