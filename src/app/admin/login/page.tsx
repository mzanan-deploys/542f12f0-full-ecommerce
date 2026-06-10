import { count } from "drizzle-orm";

import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm/AdminLoginForm";
import { db } from "@/db";
import { user } from "@/db/schema";

export const dynamic = "force-dynamic";

async function hasAdminAccount(): Promise<boolean> {
  try {
    const [{ value }] = await db.select({ value: count() }).from(user);
    return value > 0;
  } catch {
    return true;
  }
}

export default async function LoginPage() {
  const hasAdmin = await hasAdminAccount();

  return (
    <main className="flex w-full min-h-screen items-center justify-center p-4">
      <AdminLoginForm mode={hasAdmin ? "login" : "setup"} />
    </main>
  );
}
