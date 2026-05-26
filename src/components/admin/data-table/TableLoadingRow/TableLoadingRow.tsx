import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface TableLoadingRowProps {
  colSpan: number;
}

export function TableLoadingRow({ colSpan }: TableLoadingRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <div className="flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </TableCell>
    </TableRow>
  );
} 