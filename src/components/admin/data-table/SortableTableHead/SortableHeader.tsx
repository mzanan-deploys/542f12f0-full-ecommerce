'use client';

import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableHeaderProps {
  title: string;
  sortKey: string;
  currentSort: string;
  currentOrder: string;
  onSort: (key: string) => void;
}

export function SortableHeader({
  title,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey;

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

  return (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => onSort(sortKey)}
        className="h-auto !p-0 font-bold hover:bg-transparent text-left justify-start w-full"
      >
        {title}
        {getSortIcon()}
      </Button>
    </TableHead>
  );
} 