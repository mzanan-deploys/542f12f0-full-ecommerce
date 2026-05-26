'use client'

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import Image from 'next/image';
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { AdminProductTableItem } from "@/types/admin"; 
import { ActionButtons } from "@/components/shared/ActionButtons/ActionButtons";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { deleteProduct } from "@/lib/actions/productActions";

export const columns = (refreshData: () => Promise<void>): ColumnDef<AdminProductTableItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border border-muted-foreground/50"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border border-muted-foreground/50"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "image",
    header: () => <span className="font-bold">Image</span>,
    accessorFn: row => row.product_images?.[0]?.image_url,
    cell: ({ row }) => {
      const images = row.original.product_images;
      const firstImageUrl = images?.[0]?.image_url;
      return (
          <div className="w-12 h-12 flex items-center justify-center p-1">
              {firstImageUrl ? (
                  <Image
                      src={firstImageUrl}
                      alt={row.original.name ?? "Product image"}
                      width={48}
                      height={48}
                      className="rounded object-cover aspect-square border"
                  />
              ) : (
                  <div className="w-full h-full rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  </div>
              )}
          </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
     cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "slug",
    header: () => <span className="font-bold">Slug</span>,
    cell: ({ row }) => <div>{row.getValue("slug")}</div>,
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right font-bold">Price</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("price"))}
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: () => <span className="font-bold">Status</span>,
    cell: ({ row }) => (
       <Badge variant={row.getValue("is_active") ? 'default' : 'outline'}>
          {row.getValue("is_active") ? 'Active' : 'Inactive'}
       </Badge>
    ),
  },
   {
    accessorKey: "created_at",
    header: () => <span className="font-bold">Created At</span>,
    cell: ({ row }) => <div>{formatDate(row.getValue("created_at"))}</div>,
  },
  {
    id: "actions",
    header: () => <span className="font-bold">Actions</span>,
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
     
      const handleDelete = async (productId: string) => {
          const result = await deleteProduct(productId);
          if (result.success) {
              refreshData();
              return result;
          } else {
              return result;
          }
      };

      return (
        <ActionButtons
          itemId={product.id}
          itemName={product.name ?? 'Product'}
          entityName="Product"
          editHref={`/admin/products/${product.id}/edit`}
          deleteAction={handleDelete}
          refreshData={refreshData}
        />
      );
    },
  },
]; 