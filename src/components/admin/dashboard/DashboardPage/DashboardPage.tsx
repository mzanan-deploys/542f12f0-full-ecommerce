'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import { SyncOrdersButton } from '@/components/admin/buttons/SyncOrdersButton/SyncOrdersButton';
import { SortableHeader } from '@/components/admin/dashboard/SortableHeader/SortableHeader';
import type { DashboardData } from '@/types/dashboard';
import { updateOrderStatusAction } from '@/lib/actions/dashboardActions';

interface DashboardPageProps {
  data: DashboardData;
  syncAction: () => Promise<void>;
}

export function DashboardPage({ data, syncAction }: DashboardPageProps) {
  const { orders, currentPage, totalPages, sortBy, sortOrder } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <form action={syncAction}>
          <SyncOrdersButton />
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <SortableHeader
                  title="Order ID"
                  sortKey="id"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  currentPage={currentPage}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  title="Customer"
                  sortKey="shipping_name"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  currentPage={currentPage}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  title="Total"
                  sortKey="total_amount"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  currentPage={currentPage}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  title="Status"
                  sortKey="status"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  currentPage={currentPage}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  title="Date"
                  sortKey="created_at"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  currentPage={currentPage}
                />
              </TableHead>
              <TableHead>Shipping</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const orderDate = new Date(order.created_at);
              const timeAgo = formatDistanceToNow(orderDate, { addSuffix: true });
              
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.shipping_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.shipping_email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.total_amount ? formatCurrency(order.total_amount) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{orderDate.toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{timeAgo}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <form action={async (formData: FormData) => {
                      const result = await updateOrderStatusAction(formData);
                      if (!result.success) {
                        console.error('Failed to update order status:', result.error);
                      }
                    }}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="currentPage" value={currentPage} />
                      <select 
                        name="shippingStatus" 
                        defaultValue={order.shipping_status || 'pending'}
                        onChange={(e) => {
                          (e.target.closest('form') as HTMLFormElement)?.requestSubmit();
                        }}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(newPage) => {
          const url = `/admin/dashboard?page=${newPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
          window.location.href = url;
        }}
      />
    </div>
  );
} 