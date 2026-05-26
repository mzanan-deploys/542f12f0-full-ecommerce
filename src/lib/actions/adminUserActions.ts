"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import type { AdminUserActionResult } from "@/types/adminUser";

export async function createAdminUserAction(
  prevState: AdminUserActionResult | null,
  formData: FormData,
): Promise<AdminUserActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string) || "";

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  try {
    const clerk = await clerkClient();
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || undefined;

    const created = await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName: firstName || undefined,
      lastName,
      skipPasswordChecks: false,
    });

    await db
      .insert(adminUsers)
      .values({ id: created.id, fullName: fullName || null })
      .onConflictDoNothing();

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `Admin user ${email} created successfully.`,
      userId: created.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[createAdminUserAction]", message);
    return { success: false, message: `Failed to create admin user: ${message}` };
  }
}
