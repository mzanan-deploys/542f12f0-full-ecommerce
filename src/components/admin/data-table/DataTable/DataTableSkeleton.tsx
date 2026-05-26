import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-muted animate-pulse rounded w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTableSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <div className="h-10 bg-muted animate-pulse rounded-md w-full max-w-sm" />
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 bg-muted animate-pulse rounded w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="h-8 bg-muted animate-pulse rounded w-20" />
        <div className="flex items-center space-x-2">
          <div className="h-8 bg-muted animate-pulse rounded w-20" />
          <div className="h-8 bg-muted animate-pulse rounded w-16" />
          <div className="h-8 bg-muted animate-pulse rounded w-20" />
        </div>
      </div>
    </div>
  );
} 