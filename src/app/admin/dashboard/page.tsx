import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingBag, Package } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShippingActionButtons } from '@/components/admin/buttons/ShippingActionButtons/ShippingActionButtons';
import { SyncOrdersButton } from '@/components/admin/buttons/SyncOrdersButton/SyncOrdersButton';
import { SortableTableHead } from '@/components/admin/data-table/SortableTableHead/SortableTableHead';
import { asc, desc, eq, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { db } from '@/db';
import { orders, products } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/authz';
import { syncStuckOrdersAction, updateOrderStatusAction } from './actions';
import { generateMetadata } from '@/lib/utils/seo';
import { SOCIAL_LINKS } from '@/lib/constants/social';
import { BRAND_CONFIG } from '@/config/brand';

export const metadata = generateMetadata({
  title: 'Dashboard',
  description: 'Admin dashboard overview with key metrics and recent orders',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;



interface SearchParams {
  page?: string;
  limit?: string;
  sortby?: string;
  sortdir?: 'asc' | 'desc';
}

interface DashboardPageProps {
  searchParams: Promise<SearchParams>;
}

async function getDashboardStats() {
  try {
    const [ordersCount, revenueRows, productsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(orders),
      db.select({ total: orders.totalAmount }).from(orders).where(eq(orders.status, 'paid')),
      db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.isActive, true)),
    ]);

    const totalRevenue = revenueRows.reduce(
      (sum, row) => sum + parseFloat(row.total ?? '0'),
      0,
    );

    return {
      totalOrders: ordersCount[0]?.count ?? 0,
      totalRevenue,
      totalProducts: productsCount[0]?.count ?? 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { totalOrders: 0, totalRevenue: 0, totalProducts: 0 };
  }
}

async function DashboardContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  try {
    await requireAdmin();
  } catch {
    redirect('/admin/login');
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const limit = parseInt(resolvedSearchParams.limit || '10');
  const sortby = resolvedSearchParams.sortby || 'created_at';
  const sortdir = resolvedSearchParams.sortdir || 'desc';
  const offset = (page - 1) * limit;

  const stats = await getDashboardStats();

  const sortColumnMap: Record<string, PgColumn> = {
    id: orders.id,
    shipping_name: orders.shippingName,
    total_amount: orders.totalAmount,
    status: orders.status,
    shipping_status: orders.shippingStatus,
    created_at: orders.createdAt,
  };
  const orderColumn = sortColumnMap[sortby] ?? orders.createdAt;
  const orderClause = sortdir === 'asc' ? asc(orderColumn) : desc(orderColumn);

  const countRows = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
  const count = countRows[0]?.count ?? 0;

  const orderRows = await db
    .select({
      id: orders.id,
      shipping_name: orders.shippingName,
      shipping_email: orders.shippingEmail,
      total_amount: orders.totalAmount,
      status: orders.status,
      shipping_status: orders.shippingStatus,
      created_at: orders.createdAt,
    })
    .from(orders)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your {BRAND_CONFIG.name} admin dashboard</p>
        </div>
        <form action={async () => { 'use server'; await syncStuckOrdersAction(); }}>
          <SyncOrdersButton />
        </form>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Products in catalog</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest orders and their current status
              </p>
            </div>
            <Link href={SOCIAL_LINKS.STRIPE_DASHBOARD} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                View All Orders
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead 
                    title="Order ID" 
                    sortKey="id" 
                    currentSort={sortby} 
                    currentOrder={sortdir}
                    page={page}
                    basePath="/admin/dashboard"
                  />
                  <SortableTableHead 
                    title="Customer" 
                    sortKey="shipping_name" 
                    currentSort={sortby} 
                    currentOrder={sortdir}
                    page={page}
                    basePath="/admin/dashboard"
                  />
                  <SortableTableHead 
                    title="Amount" 
                    sortKey="total_amount" 
                    currentSort={sortby} 
                    currentOrder={sortdir}
                    page={page}
                    basePath="/admin/dashboard"
                  />
                  <SortableTableHead 
                    title="Status" 
                    sortKey="status" 
                    currentSort={sortby} 
                    currentOrder={sortdir}
                    page={page}
                    basePath="/admin/dashboard"
                  />
                  <SortableTableHead 
                    title="Created" 
                    sortKey="created_at" 
                    currentSort={sortby} 
                    currentOrder={sortdir}
                    page={page}
                    basePath="/admin/dashboard"
                  />
                  <SortableTableHead 
                    title="Shipping" 
                    sortKey="shipping_status" 
                    currentSort={sortby} 
                    currentOrder={sortdir}
                    page={page}
                    basePath="/admin/dashboard"
                  />
                  <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderRows.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        #{order.id.slice(-8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{order.shipping_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{order.shipping_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>${parseFloat(order.total_amount ?? '0').toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'paid' ? 'default' :
                        order.status === 'processing' ? 'secondary' :
                        'outline'
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        order.shipping_status === 'delivered' ? 'default' :
                        order.shipping_status === 'in_transit' ? 'secondary' :
                        'outline'
                      }>
                        {order.shipping_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ShippingActionButtons
                        orderId={order.id}
                        currentShippingStatus={order.shipping_status as 'pending' | 'in_transit' | 'delivered'}
                        currentPage={page}
                        action={updateOrderStatusAction}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/admin/dashboard"
            searchParams={new URLSearchParams(
              Object.entries(resolvedSearchParams).reduce((acc, [key, value]) => {
                if (value) {
                  acc[key] = value;
                }
                return acc;
              }, {} as Record<string, string>),
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <DashboardContent searchParams={searchParams} />
  );
} 