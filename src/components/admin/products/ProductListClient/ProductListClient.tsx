'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from "@/lib/utils/formatting";
import { SortableHeader } from '@/components/admin/data-table/SortableTableHead/SortableHeader';
import { Pagination } from '@/components/ui/pagination';
import { TableLoadingRow } from '@/components/admin/data-table/TableLoadingRow/TableLoadingRow';
import { DataTableActions } from '@/components/admin/data-table/DataTable/DataTableActions';
import { deleteProduct } from '@/lib/actions/productActions';
import { useProductsList } from '@/lib/queries/productQueries.client';
import { DEFAULT_PAGE_SIZE } from '@/config/dataGrid';

type SortKey = 'name' | 'slug' | 'price' | 'is_active' | 'created_at';
type SortDirection = 'asc' | 'desc';

export function ProductListClient() {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = DEFAULT_PAGE_SIZE;

  const handleSort = (key: string) => {
    const sortKeyTyped = key as SortKey;
    if (sortKey === sortKeyTyped) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(sortKeyTyped);
      setSortDirection('asc');
    }
  };

    const {
        data: queryResult,
    isLoading,
        error: queryErrorObject,
  } = useProductsList({
    offset: 0,
    limit: 1000,
    orderBy: 'name',
    orderAsc: true,
    filters: {},
  });
    
  const allProducts = queryResult?.data?.products || [];
    const currentError = queryErrorObject ? (queryErrorObject as Error).message : null;

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = allProducts.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.slug.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortKey) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'slug':
          aValue = a.slug;
          bValue = b.slug;
          break;
        case 'price':
          aValue = parseFloat(a.price.toString());
          bValue = parseFloat(b.price.toString());
          break;
        case 'is_active':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
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
  }, [allProducts, search, sortKey, sortDirection, currentPage, itemsPerPage]);

  const totalFilteredCount = useMemo(() => {
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.slug.toLowerCase().includes(search.toLowerCase())
    ).length;
  }, [allProducts, search]);

  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

    return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter products by name..."
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
                <TableHead className="font-bold">Image</TableHead>
                <SortableHeader 
                  title="Name" 
                  sortKey="name" 
                  currentSort={sortKey} 
                  currentOrder={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader 
                  title="Slug" 
                  sortKey="slug" 
                  currentSort={sortKey} 
                  currentOrder={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader 
                  title="Price" 
                  sortKey="price" 
                  currentSort={sortKey} 
                  currentOrder={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader 
                  title="Status" 
                  sortKey="is_active" 
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
                <TableHead className="font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRow colSpan={7} />
              ) : currentError ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-destructive">
                    Error loading products: {currentError}
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedProducts?.length ? (
                filteredAndSortedProducts.map((product) => (
                  <TableRow 
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                  >
                    <TableCell>
                      <div className="w-10 h-10 flex items-center justify-center p-1">
                        {product.product_images?.[0]?.image_url ? (
                          <Image
                            src={product.product_images[0].image_url}
                            alt={product.name ?? "Product image"}
                            width={40}
                            height={40}
                            className="rounded object-cover w-full h-full border"
                          />
                        ) : (
                          <div className="w-full h-full rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{product.name}</span>
                    </TableCell>
                    <TableCell>{product.slug}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(String(product.price)) || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'outline'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(product.created_at ?? 0).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DataTableActions
                        itemId={product.id}
            entityName="Product"
            editItemLinkPattern="/admin/products/[id]/edit"
                        deleteItemAction={deleteProduct}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No products found.
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