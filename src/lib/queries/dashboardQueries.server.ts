import { asc, desc, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { orders } from "@/db/schema";
import type { DashboardData, DashboardSearchParams, SaleOrder } from "@/types/dashboard";

const sortColumnMap: Record<string, PgColumn> = {
  customer: orders.shippingName,
  date: orders.createdAt,
  country: orders.shippingCountry,
  total: orders.totalAmount,
  payment_status: orders.status,
  shipping_status: orders.shippingStatus,
  created_at: orders.createdAt,
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function getDashboardData(
  searchParams: DashboardSearchParams,
): Promise<DashboardData> {
  let currentPage = 1;
  const pageRaw = firstParam(searchParams.page);
  if (pageRaw) {
    const pageNumber = parseInt(pageRaw, 10);
    if (!isNaN(pageNumber) && pageNumber > 0) currentPage = pageNumber;
  }

  const sortBy = firstParam(searchParams.sortBy) || "created_at";
  const sortOrder = firstParam(searchParams.sortOrder) || "desc";
  const isAscending = sortOrder === "asc";

  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;
  const column = sortColumnMap[sortBy] ?? orders.createdAt;
  const orderClause: SQL<unknown> = isAscending ? asc(column) : desc(column);

  const countRows = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
  const totalCount = countRows[0]?.count ?? 0;

  const rows = await db
    .select({
      id: orders.id,
      created_at: orders.createdAt,
      shipping_status: orders.shippingStatus,
      status: orders.status,
      order_details: orders.orderDetails,
      shipping_name: orders.shippingName,
      shipping_email: orders.shippingEmail,
      shipping_country: orders.shippingCountry,
      total_amount: orders.totalAmount,
      user_id: orders.userId,
    })
    .from(orders)
    .orderBy(orderClause)
    .limit(itemsPerPage)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return {
    orders: rows as unknown as SaleOrder[],
    totalCount,
    currentPage,
    totalPages,
    sortBy,
    sortOrder,
  };
}
