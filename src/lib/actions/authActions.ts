"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth/auth";

export async function logoutUserAction(): Promise<void> {
  await getAuth()
    .api.signOut({ headers: await headers() })
    .catch(() => null);
  redirect("/admin/login");
}
