'use client'

import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/admin/data-table/DataTable/DataTableColumnHeader';
import { DataTableActions } from '@/components/admin/data-table/DataTable/DataTableActions';
import type { AdminSetListItem } from '@/types/sets';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { ActionResponse } from "@/types/actions";

export const createSetColumns = (deleteSetActionFn: (id: string) => Promise<ActionResponse>): ColumnDef<AdminSetListItem>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'image_url',
    header: () => <span className="font-bold">Image</span>,
    cell: ({ row }) => {
      const imageUrl = row.original.image_url;
      return imageUrl ? (
        <div className="relative w-8 h-12 rounded-md overflow-hidden">
            <Image src={imageUrl} alt={row.original.name ?? 'Set image'} fill className="object-cover" sizes="32px" />
        </div>
      ) : (
        <div className="w-8 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">No img</div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
        const type = row.original.type;
        const variant = type === 'DAY' ? 'secondary' : type === 'NIGHT' ? 'destructive' : 'outline';
        return type ? <Badge variant={variant}>{type}</Badge> : null;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'product_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Products" />,
    cell: ({ row }) => row.original.product_count ?? 0,
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'outline'}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      return createdAt ? new Date(createdAt).toLocaleDateString() : '-';
    },
  },
  {
    id: 'actions',
    header: () => <span className="font-bold">Actions</span>,
    cell: ({ row }) => (
      <DataTableActions
        itemId={row.original.id}
        entityName="Set"
        editItemLinkPattern="/admin/sets/[id]/edit"
        deleteItemAction={deleteSetActionFn} 
      />
    ),
  },
]; 