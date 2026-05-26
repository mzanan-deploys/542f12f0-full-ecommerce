'use client'

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ActionButtons } from '@/components/shared/ActionButtons/ActionButtons';
import { SortableHeader } from '@/components/admin/data-table/SortableTableHead/SortableHeader';
import { Pagination } from '@/components/ui/pagination';
import { TableLoadingRow } from '@/components/admin/data-table/TableLoadingRow/TableLoadingRow';
import { deleteCategoryAction } from '@/lib/actions/categoryActions';
import type { ProductCategoryRow } from '@/types/category';

interface CategoriesTableProps {
  categories: ProductCategoryRow[];
  onEdit: (category: ProductCategoryRow) => void;
  onDeleted: (categoryId: string) => void;
  isLoading?: boolean;
  refreshData?: () => void;
}

type SortKey = 'name' | 'size_guide_templates' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

export default function CategoriesTable({
  categories,
  onEdit,
  onDeleted,
  isLoading,
  refreshData,
}: CategoriesTableProps) {
  const [search, setSearch] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDelete = async (categoryId: string) => {
    const result = await deleteCategoryAction(categoryId);
    if (result.success) {
      onDeleted(categoryId);
      return result;
    } else {
      return result;
    }
  };

  const handleSort = (key: string) => {
    const sortKeyTyped = key as SortKey;
    if (sortKey === sortKeyTyped) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(sortKeyTyped);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCategories = React.useMemo(() => {
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortKey) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'size_guide_templates':
          aValue = a.size_guide_templates?.name || '';
          bValue = b.size_guide_templates?.name || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at ?? 0);
          bValue = new Date(b.created_at ?? 0);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at ?? 0);
          bValue = new Date(b.updated_at ?? 0);
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
  }, [categories, search, sortKey, sortDirection, currentPage, itemsPerPage]);

  const totalFilteredCount = React.useMemo(() => {
    return categories.filter(category => 
      category.name.toLowerCase().includes(search.toLowerCase())
    ).length;
  }, [categories, search]);

  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter categories..."
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
                  title="Size Guide" 
                  sortKey="size_guide_templates" 
                  currentSort={sortKey} 
                  currentOrder={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader 
                  title="Created At" 
                  sortKey="created_at" 
                  currentSort={sortKey} 
                  currentOrder={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader 
                  title="Updated At" 
                  sortKey="updated_at" 
                  currentSort={sortKey} 
                  currentOrder={sortDirection}
                  onSort={handleSort}
                />
                <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRow colSpan={5} />
              ) : filteredAndSortedCategories?.length ? (
                filteredAndSortedCategories.map((category) => (
                  <TableRow 
                    key={category.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onEdit(category)}
                  >
                    <TableCell>
                      <div className="capitalize">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      {category.size_guide_templates?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(category.created_at ?? 0).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(category.updated_at ?? 0).toLocaleDateString()}
                  </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ActionButtons
                        itemId={category.id}
                        itemName={category.name}
                        entityName="Category"
                        onEdit={() => onEdit(category)}
                        deleteAction={handleDelete}
                        refreshData={refreshData}
                      />
                      </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No categories available.
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