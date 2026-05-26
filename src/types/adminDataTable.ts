import type { SortingState, Table } from "@tanstack/react-table";
import type { ActionResponse } from "./actions";
import type { ColumnDef } from "@tanstack/react-table";
import type { PaginationState, ColumnFiltersState, VisibilityState, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

export type DataItem = {
    id: string;
    [key: string]: any;
};

export type FetchDataParams = {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderAsc?: boolean;
    filters?: Record<string, any>;
};

export type FetchDataResponse<T extends DataItem> = ActionResponse<{
    items: T[];
    totalPages: number | null;
    count?: number | null;
}>;

export type FetchDataAction<T extends DataItem> = (params: FetchDataParams) => Promise<FetchDataResponse<T>>;

export interface UseDataTableProps<T extends DataItem> {
    columns: ColumnDef<T>[];
    fetchDataAction?: FetchDataAction<T>;
    initialPageSize?: number;
    initialSortBy?: SortingState;
    filterColumnId?: string;
    validSortKeys?: (keyof T | string)[];
    data?: T[];
    pageCount?: number;
    isLoading?: boolean;
    error?: string | null;
    pagination?: PaginationState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    rowSelection?: RowSelectionState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    onSortingChange?: OnChangeFn<SortingState>;
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
    onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export interface UseDataTableReturn<T extends DataItem> {
    table: Table<T>;
    isLoading: boolean;
    error: string | null;
    fetchData: () => Promise<void>;
} 