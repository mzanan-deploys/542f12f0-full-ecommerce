'use client'

import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/admin/data-table/DataTable/DataTableColumnHeader"
import { DataTableActions } from "@/components/admin/data-table/DataTable/DataTableActions"
import { deleteSizeGuideTemplate } from "@/lib/actions/sizeGuideActions"
import type { SizeGuideTemplate } from "@/lib/schemas/sizeGuideTemplateSchema"

export function getColumns(): ColumnDef<SizeGuideTemplate>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <span>{date.toLocaleDateString()}</span>;
      },
       enableSorting: true,
    },
    {
      id: "actions",
      header: () => <span className="font-bold">Actions</span>,
      cell: ({ row }) => {
        const template = row.original;
        return (
          <DataTableActions
            itemId={template.id}
            entityName="Size Guide Template"
            editItemLinkPattern="/admin/size-guides/[id]/edit"
            deleteItemAction={deleteSizeGuideTemplate}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 