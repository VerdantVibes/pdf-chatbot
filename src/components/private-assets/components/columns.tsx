import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import { Pdf } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { AtSign, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Pdf>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
    accessorKey: "filename",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-fit space-y-2">
          <div className="font-semibold">{row.original?.email_subject}</div>
          <div className="flex items-center space-x-2 text-gray-500">
            <File className="h-3 w-3" />
            <span className="text-xs">{row.getValue("filename")}</span>
          </div>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-fit flex flex-col space-y-1">
          <Badge variant={"outline"}>
            <div className="flex items-center space-x-1">
              <AtSign className="h-3 w-3" />
              <span>{row.getValue("source")}</span>
            </div>
          </Badge>
          <div className="font-medium">{row.original?.author[0]}</div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "Topics",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Topics" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap max-w-32 items-center gap-1.5">
          {row.original?.sector?.map((sector) => (
            <Badge key={sector} variant={"outline"}>
              <div className="flex items-center space-x-1">
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
    accessorKey: "Summary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Summary" />
    ),
    cell: ({ row }) => {
      return (
        <div
          className="flex items-center max-w-sm overflow-hidden text-ellipsis"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {row.original?.analysis?.ai_summary}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
];
