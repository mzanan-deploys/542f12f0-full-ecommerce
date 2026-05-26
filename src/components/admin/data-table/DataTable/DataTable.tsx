'use client'

import { ColumnDef, flexRender } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pagination } from '@/components/ui/pagination';
import type { DataItem, UseDataTableReturn } from "@/types/adminDataTable";
import { memo } from "react";

interface DataTableProps<T extends DataItem> {
    hookResult: UseDataTableReturn<T>;
    columns: ColumnDef<T>[];
    filterColumnId?: string;
    searchPlaceholder?: string;
    entityName?: string;
    editItemLinkPattern?: string;
    newItemLink?: string;
    deleteItemAction?: (id: string) => Promise<any>; 
}

const DataTableComponent = <T extends DataItem>({
    hookResult,
    columns,
    filterColumnId = 'name',
    searchPlaceholder = "Filter items...",
    entityName = "item"
}: DataTableProps<T>) => {
    const { table, isLoading, error } = hookResult;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-destructive p-4">
                Error loading {entityName}s: {error}
            </div>
        );
    }

    if (!table) {
        return (
             <div className="flex justify-center items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2">Initializing table...</span>
            </div>
        ); 
    }

    const filterColumn = table.getColumn(filterColumnId);
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();

    const handlePageChange = (newPage: number) => {
        table.setPageIndex(newPage - 1);
    };

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                {filterColumn && (
                    <Input
                        placeholder={searchPlaceholder}
                        value={(filterColumn.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            filterColumn.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                )}
            </div>
            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead 
                                            key={header.id} 
                                            className="whitespace-nowrap"
                                            style={{ 
                                                width: header.getSize() !== 150 ? header.getSize() : undefined,
                                                minWidth: header.id === 'select' ? '50px' : 
                                                         header.id === 'image' ? '80px' :
                                                         header.id === 'actions' ? '120px' : '150px'
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                     ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                             {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell 
                                                key={cell.id}
                                                className="max-w-0"
                                            >
                                                <div className="truncate" title={typeof cell.getValue() === 'string' ? cell.getValue() as string : undefined}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell 
                                        colSpan={columns.length}
                                        className="p-4 text-center"
                                    >
                                        No {entityName}s found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent; 