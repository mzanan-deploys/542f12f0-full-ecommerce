'use client';

import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface SortableHeaderProps {
  title: string;
  sortKey: string;
  currentSort: string;
  currentOrder: string;
  currentPage: number;
}

export function SortableHeader({ 
  title, 
  sortKey, 
  currentSort, 
  currentOrder, 
  currentPage 
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey;
  const nextOrder = isActive && currentOrder === 'asc' ? 'desc' : 'asc';
  
  const getSortIcon = () => {
    if (!isActive) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return currentOrder === 'asc' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const href = `/admin/dashboard?page=${currentPage}&sortBy=${sortKey}&sortOrder=${nextOrder}`;

  return (
    <TableHead>
      <Link href={href}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 hover:bg-accent flex items-center justify-start !p-0 text-left font-bold w-full"
        >
          <span>{title}</span>
          {getSortIcon()}
        </Button>
      </Link>
    </TableHead>
  );
} 