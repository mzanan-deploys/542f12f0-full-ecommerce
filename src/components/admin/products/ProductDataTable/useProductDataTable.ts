'use client'

import { 
    SortingState, 
    ColumnFiltersState, 
    VisibilityState,
    PaginationState,
    RowSelectionState,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { getProductsListAction } from "@/lib/actions/productActions";
import { toast } from 'sonner';
import { useDebounce } from "@/hooks/useDebounce";
import { columns as defineColumns } from "./ProductDataTableColumns";
import type { ProductRow } from "@/types/db";
import type { AdminProductTableItem, AdminProductTableSortKeys, UseProductDataTableReturn } from "@/types/admin";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useProductDataTable(): UseProductDataTableReturn { 
    const [data, setData] = useState<AdminProductTableItem[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageCount, setPageCount] = useState(0);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const debouncedColumnFilters = useDebounce(columnFilters, 300);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const offset = pagination.pageIndex * pagination.pageSize;
        
        const validSortKeys: (keyof ProductRow)[] = 
            ['id', 'name', 'slug', 'price', 'is_active', 'created_at', 'updated_at'];
        
        let orderBy: AdminProductTableSortKeys = undefined; 
        if (sorting[0]?.id && validSortKeys.includes(sorting[0].id as keyof ProductRow)) {
             orderBy = sorting[0].id as AdminProductTableSortKeys;
        }
        const orderAsc = sorting[0]?.desc === false;

        const nameFilter = debouncedColumnFilters.find(f => f.id === 'name')?.value as string | undefined;
        
        const filters: Record<string, any> = {};
        if (nameFilter) filters.name = nameFilter;

        const result = await getProductsListAction({
            limit: pagination.pageSize,
            offset,
            orderBy: orderBy,
            orderAsc,
            filters: filters,
        });

        if (result.error || !result.data) {
            const errorMessage = result.error || "Failed to fetch product data";
            setError(errorMessage);
            setData([]);
            setPageCount(0);
            toast.error(`Failed to fetch products: ${errorMessage}`);
        } else {
            setData(result.data.products as AdminProductTableItem[]); 
            const fetchedPageCount = result.data.totalPages ?? 0; 
            setPageCount(fetchedPageCount); 
            if (pagination.pageIndex >= fetchedPageCount && fetchedPageCount > 0) {
                 setPagination(prev => ({ ...prev, pageIndex: 0 }));
             } else if (pagination.pageIndex < 0) {
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
             }
        }
        setIsLoading(false);
    }, [pagination, sorting, debouncedColumnFilters]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]); 

    const columns = useMemo(() => 
        defineColumns(fetchData),
        [fetchData]
    );

    const table = useReactTable({
        data: data ?? [], 
        columns,
        pageCount: pageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true, 
        manualSorting: true,    
        manualFiltering: true, 
        enableRowSelection: true, 
    });

    return {
        table, 
        isLoading,
        error,
    };
} 