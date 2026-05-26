'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableTableHeadProps {
  title: string;
  sortKey: string;
  currentSort: string;
  currentOrder: string;
  page: number;
  basePath: string;
}

export function SortableTableHead({
  title,
  sortKey,
  currentSort,
  currentOrder,
  page,
  basePath,
}: SortableTableHeadProps) {
  const isActive = currentSort === sortKey;
  const nextOrder = isActive && currentOrder === 'asc' ? 'desc' : 'asc';

  const getSortIcon = () => {
    if (!isActive) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return currentOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const href = `${basePath}?page=${page}&sortby=${sortKey}&sortdir=${nextOrder}`;

  return (
    <TableHead>
      <Link href={href}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 hover:bg-accent flex items-center justify-start text-left font-bold w-full !p-0"
        >
          <span>{title}</span>
          {getSortIcon()}
        </Button>
      </Link>
    </TableHead>
  );
} 