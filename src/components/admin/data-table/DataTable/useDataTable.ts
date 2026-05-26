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
import { toast } from 'sonner';
import { useDebounce } from "@/hooks/useDebounce";
import type {
    DataItem,
    UseDataTableProps,
    UseDataTableReturn
} from "@/types/adminDataTable";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

export function useDataTable<T extends DataItem>({
    columns,
    fetchDataAction,
    initialPageSize = 10,
    initialSortBy = [],
    filterColumnId = 'name',
    validSortKeys = ['created_at'],
    data: externalData,
    pageCount: externalPageCount,
    isLoading: externalIsLoading,
    error: externalError,
    pagination: controlledPagination,
    sorting: controlledSorting,
    columnFilters: controlledColumnFilters,
    columnVisibility: controlledColumnVisibility,
    rowSelection: controlledRowSelection,
    onPaginationChange: onControlledPaginationChange,
    onSortingChange: onControlledSortingChange,
    onColumnFiltersChange: onControlledColumnFiltersChange,
    onColumnVisibilityChange: onControlledColumnVisibilityChange,
    onRowSelectionChange: onControlledRowSelectionChange,
}: UseDataTableProps<T>): UseDataTableReturn<T> {
    const [internalPagination, setInternalPagination] = useState<PaginationState>(() => 
        controlledPagination ?? { pageIndex: 0, pageSize: initialPageSize }
    );
    const [internalSorting, setInternalSorting] = useState<SortingState>(() => 
        controlledSorting ?? initialSortBy
    );
    const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>(() =>
        controlledColumnFilters ?? []
    );
    const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>(() =>
        controlledColumnVisibility ?? {}
    );
    const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>(() => 
        controlledRowSelection ?? {}
    );

    const pagination = controlledPagination ?? internalPagination;
    const sorting = controlledSorting ?? internalSorting;
    const columnFilters = controlledColumnFilters ?? internalColumnFilters;
    const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility;
    const rowSelection = controlledRowSelection ?? internalRowSelection;

    const setPagination: Dispatch<SetStateAction<PaginationState>> = 
        onControlledPaginationChange ?? setInternalPagination;
    const setSorting: Dispatch<SetStateAction<SortingState>> = 
        onControlledSortingChange ?? setInternalSorting;
    const setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>> = 
        onControlledColumnFiltersChange ?? setInternalColumnFilters;
    const setColumnVisibility: Dispatch<SetStateAction<VisibilityState>> = 
        onControlledColumnVisibilityChange ?? setInternalColumnVisibility;
    const setRowSelection: Dispatch<SetStateAction<RowSelectionState>> = 
        onControlledRowSelectionChange ?? setInternalRowSelection;

    const [internalData, setInternalData] = useState<T[]>(externalData ?? []);
    const [internalIsLoading, setInternalIsLoading] = useState(externalIsLoading ?? !externalData);
    const [internalError, setInternalError] = useState<string | null>(externalError ?? null);
    const [internalPageCount, setInternalPageCount] = useState(externalPageCount ?? 0);

    const debouncedColumnFilters = useDebounce(columnFilters, 300);

    useEffect(() => {
        if (externalData !== undefined) {
            setInternalData(externalData);
            return;
        }

        if (!fetchDataAction) {
            setInternalIsLoading(false);
            setInternalError("fetchDataAction is required when external data is not provided.");
            toast.error("DataTable configuration error: fetchDataAction missing.");
            return;
        }

        let isMounted = true;
        const fetchDataInternal = async () => {
            setInternalIsLoading(true);
            setInternalError(null);
            const offset = pagination.pageIndex * pagination.pageSize;

            let orderBy: string | undefined = undefined;
            if (sorting[0]?.id && validSortKeys.includes(sorting[0].id as keyof T)) {
                orderBy = sorting[0].id as string;
            }
            const orderAsc = sorting[0]?.desc === false;

            const filterValue = debouncedColumnFilters.find(f => f.id === filterColumnId)?.value as string | undefined;

            const filters: Record<string, any> = {};
            if (filterValue) filters[filterColumnId] = filterValue;

            const result = await fetchDataAction({
                limit: pagination.pageSize,
                offset,
                orderBy: orderBy,
                orderAsc,
                filters: filters,
            });

            if (!isMounted) return;

            if (result.error || !result.data) {
                const errorMessage = result.error || "Failed to fetch data";
                setInternalError(errorMessage);
                setInternalData([]);
                setInternalPageCount(0);
                toast.error(`Failed to fetch data: ${errorMessage}`);
            } else {
                setInternalData(result.data.items as T[]);
                const fetchedPageCount = result.data.totalPages ?? 0;
                setInternalPageCount(fetchedPageCount);
                setInternalError(null);

                if (!controlledPagination && pagination.pageIndex >= fetchedPageCount && fetchedPageCount > 0) {
                    setPagination((prev: PaginationState) => ({ ...prev, pageIndex: Math.max(0, fetchedPageCount - 1) }));
                }
            }
            setInternalIsLoading(false);
        };
    
        fetchDataInternal();
    
        return () => {
            isMounted = false;
        };
    }, [
        externalData,
        fetchDataAction,
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
        debouncedColumnFilters,
        filterColumnId,
        validSortKeys,
        controlledPagination,
        setPagination
    ]);

    useEffect(() => {
        if (externalData !== undefined) {
            setInternalData(externalData);
        }
    }, [externalData]);

    useEffect(() => {
        if (externalPageCount !== undefined) {
            setInternalPageCount(externalPageCount);
        }
    }, [externalPageCount]);

    useEffect(() => {
        if (externalIsLoading !== undefined) {
            setInternalIsLoading(externalIsLoading);
        }
    }, [externalIsLoading]);

    useEffect(() => {
        if (externalError !== undefined) {
            setInternalError(externalError);
        }
    }, [externalError]);

    useEffect(() => {
        if (controlledPagination) setInternalPagination(controlledPagination);
    }, [controlledPagination]);

    useEffect(() => {
        if (controlledSorting) setInternalSorting(controlledSorting);
    }, [controlledSorting]);

    useEffect(() => {
        if (controlledColumnFilters) setInternalColumnFilters(controlledColumnFilters);
    }, [controlledColumnFilters]);

    useEffect(() => {
        if (controlledColumnVisibility) setInternalColumnVisibility(controlledColumnVisibility);
    }, [controlledColumnVisibility]);

    useEffect(() => {
        if (controlledRowSelection) setInternalRowSelection(controlledRowSelection);
    }, [controlledRowSelection]);

    const manualFetch = useCallback(async () => {
        if (externalData !== undefined || !fetchDataAction) {
            return;
        }
        setInternalIsLoading(true);
        setInternalError(null);
        const offset = pagination.pageIndex * pagination.pageSize;
        let orderBy: string | undefined = undefined;
        if (sorting[0]?.id && validSortKeys.includes(sorting[0].id as keyof T)) {
            orderBy = sorting[0].id as string;
        }
        const orderAsc = sorting[0]?.desc === false;
        const filterValue = columnFilters.find(f => f.id === filterColumnId)?.value as string | undefined;
        const filters: Record<string, any> = {};
        if (filterValue) filters[filterColumnId] = filterValue;

        const result = await fetchDataAction({ limit: pagination.pageSize, offset, orderBy, orderAsc, filters });

        if (result.error || !result.data) {
            setInternalError(result.error || "Failed to fetch data");
            setInternalData([]);
            setInternalPageCount(0);
        } else {
            setInternalData(result.data.items as T[]);
            setInternalPageCount(result.data.totalPages ?? 0);
            setInternalError(null);
        }
        setInternalIsLoading(false);
    }, [pagination.pageIndex, pagination.pageSize, sorting, columnFilters, fetchDataAction, filterColumnId, validSortKeys, externalData]);

    const table = useReactTable<T>({
        data: internalData ?? [],
        columns,
        pageCount: internalPageCount,
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
        isLoading: internalIsLoading,
        error: internalError,
        fetchData: manualFetch,
    };
} 