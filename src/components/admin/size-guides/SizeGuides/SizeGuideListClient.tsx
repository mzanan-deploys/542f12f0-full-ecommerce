'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SortableHeader } from '@/components/admin/data-table/SortableTableHead/SortableHeader';
import { Pagination } from '@/components/ui/pagination';
import { TableLoadingRow } from '@/components/admin/data-table/TableLoadingRow/TableLoadingRow';
import { DataTableActions } from '@/components/admin/data-table/DataTable/DataTableActions';
import { deleteSizeGuideTemplate } from "@/lib/actions/sizeGuideActions";
import { useAdminSizeGuidesList } from '@/lib/queries/sizeGuideQueries';
import { DEFAULT_PAGE_SIZE } from '@/config/dataGrid';
import { useCacheStore } from '@/store/cacheStore';

type SortKey = 'name' | 'created_at';
type SortDirection = 'asc' | 'desc';

export function SizeGuideListClient() {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = DEFAULT_PAGE_SIZE;
    const queryClient = useQueryClient();
  const cache = useCacheStore();

  useEffect(() => {
    const cacheKeyPattern = 'admin-size-guides-';
    const cacheEntries = cache.cache;
    Object.keys(cacheEntries).forEach(key => {
      if (key.startsWith(cacheKeyPattern)) {
        cache.remove(key);
      }
    });
  }, [cache]);

  const handleSort = (key: string) => {
    const sortKeyTyped = key as SortKey;
    if (sortKey === sortKeyTyped) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(sortKeyTyped);
      setSortDirection('asc');
        }
  };

    const refreshData = useCallback(() => {
    const cacheKeyPattern = 'admin-size-guides-';
    const cacheEntries = cache.cache;
    Object.keys(cacheEntries).forEach(key => {
      if (key.startsWith(cacheKeyPattern)) {
        cache.remove(key);
      }
    });
        queryClient.invalidateQueries({ queryKey: ['adminSizeGuides'] });
    }, [queryClient, cache]);

  const {
    data: queryResult,
    isLoading,
    error: queryErrorObject,
  } = useAdminSizeGuidesList({
    offset: 0,
    limit: 1000,
    orderBy: 'name',
    orderAsc: true,
    filters: {},
  });

  const allTemplates = queryResult?.data?.templates || [];
  const currentError = queryErrorObject ? (queryErrorObject as Error).message : null;

  const filteredAndSortedTemplates = React.useMemo(() => {
    const filtered = allTemplates.filter(template => 
      template.name.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortKey) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'created_at':
          aValue = new Date(a.created_at ?? 0);
          bValue = new Date(b.created_at ?? 0);
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [allTemplates, search, sortKey, sortDirection, currentPage, itemsPerPage]);

  const totalFilteredCount = React.useMemo(() => {
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(search.toLowerCase())
    ).length;
  }, [allTemplates, search]);

  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

    return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader 
                  title="Name" 
                  sortKey="name" 
                  currentSort={sortKey} 
                  currentOrder={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader 
                  title="Created" 
                  sortKey="created_at" 
                  currentSort={sortKey} 
                  currentOrder={sortDirection}
                  onSort={handleSort}
                />
                <TableHead className="font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRow colSpan={3} />
              ) : currentError ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-destructive">
                    Error loading size guide templates: {currentError}
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedTemplates?.length ? (
                filteredAndSortedTemplates.map((template) => (
                  <TableRow 
                    key={template.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/size-guides/${template.id}/edit`)}
                  >
                    <TableCell>
                      <span className="font-medium">{template.name}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at ?? 0).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DataTableActions
                        itemId={template.id}
            entityName="Size Guide Template"
            editItemLinkPattern="/admin/size-guides/[id]/edit"
                        deleteItemAction={deleteSizeGuideTemplate}
                        refreshData={refreshData}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No size guide templates found.
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
        onPageChange={setCurrentPage}
      />
    </>
    );
} 