'use client';

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/formatting";
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader } from '@/components/admin/data-table/SortableTableHead/SortableHeader';
import { DataTableSkeleton } from '@/components/admin/data-table/DataTable/DataTableSkeleton';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  user_email?: string;
}

interface DashboardStatsProps {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  recentOrders: Order[];
  isLoading?: boolean;
}

type SortKey = 'id' | 'created_at' | 'status' | 'total_amount';
type SortDirection = 'asc' | 'desc';

export default function DashboardStats({
  totalRevenue,
  totalOrders,
  pendingOrders,
  totalProducts,
  recentOrders,
  isLoading = false
}: DashboardStatsProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key: string) => {
    const sortKeyTyped = key as SortKey;
    if (sortKey === sortKeyTyped) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(sortKeyTyped);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    if (!recentOrders) return [];

    const filtered = recentOrders.filter(order => 
      order.id.toString().includes(search.toLowerCase()) ||
      order.status.toLowerCase().includes(search.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortKey) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'total_amount':
          aValue = parseFloat(a.total_amount.toString());
          bValue = parseFloat(b.total_amount.toString());
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
  }, [recentOrders, search, sortKey, sortDirection, currentPage, itemsPerPage]);

  const totalFilteredCount = useMemo(() => {
    if (!recentOrders) return 0;
    return recentOrders.filter(order => 
      order.id.toString().includes(search.toLowerCase()) ||
      order.status.toLowerCase().includes(search.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(search.toLowerCase())
    ).length;
  }, [recentOrders, search]);

  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded w-20" />
                <div className="h-4 bg-muted animate-pulse rounded w-4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-24 mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-32" />
          </CardHeader>
          <CardContent>
            <DataTableSkeleton columns={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            💰
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            📦
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            ⏳
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Orders to process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            📋
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Products in catalog</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter orders..."
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
                      title="Order ID" 
                      sortKey="id" 
                      currentSort={sortKey} 
                      currentOrder={sortDirection}
                      onSort={handleSort}
                    />
                    <TableHead className="font-bold">Email</TableHead>
                    <SortableHeader 
                      title="Status" 
                      sortKey="status" 
                      currentSort={sortKey} 
                      currentOrder={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader 
                      title="Amount" 
                      sortKey="total_amount" 
                      currentSort={sortKey} 
                      currentOrder={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader 
                      title="Date" 
                      sortKey="created_at" 
                      currentSort={sortKey} 
                      currentOrder={sortDirection}
                      onSort={handleSort}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedOrders?.length ? (
                    filteredAndSortedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.user_email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'completed' ? 'default' : 
                            order.status === 'pending' ? 'secondary' :
                            order.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No orders found.
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
        </CardContent>
      </Card>
    </div>
  );
}