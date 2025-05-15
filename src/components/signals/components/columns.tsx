import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Expand } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ExtendedColumnDef<T> = ColumnDef<T> & {
  identifier?: string | boolean;
};

export const getColumns = (): ExtendedColumnDef<any>[] => [
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
    accessorKey: "signal",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Signal" />,
    cell: ({ row }) => (
      <div className="flex gap-1">
        <div className="font-semibold">{row?.original?.signal}:</div>
        <div>{row?.original?.action}</div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ticker",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ticker" />,
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <Badge className="shadow-none flex items-center gap-1 bg-red-50 text-red-800 border-red-50 hover:bg-red-100 hover:text-red-800 h-5 px-2 rounded text-sm font-medium">
            <div className="h-1.5 w-1.5 bg-red-600 rounded-full"></div>
            <span>{row?.original?.direction}</span>
          </Badge>
          <Badge className="shadow-none flex items-center gap-1 bg-neutral-100 text-neutral-500 border-red-50 hover:bg-neutral-200 hover:text-neutral-800 h-5 px-2 rounded text-sm font-medium">
            <span>{row?.original?.market}</span>
          </Badge>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "excerpt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Excerpt" />,
    cell: ({ row }) => {
      return <div className="text-sm text-neutral-500 max-w-md">{row?.original?.excerpt}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    identifier: "Added",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));

      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return (
        <div className="w-fit text-nowrap font-medium flex flex-col">
          <span className="font-bold">{formattedDate}</span>
          <span className="text-gray-500">
            {hours}:{minutes}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: () => {
      return (
        <button className="cursor-pointer p-1 rounded-sm hover:bg-gray-100">
          <div className="flex items-center justify-center">
            <Expand className="h-3.5 w-3.5 text-gray-900" />
          </div>
        </button>
      );
    },
    enableSorting: false,
    identifier: false,
  },
];
