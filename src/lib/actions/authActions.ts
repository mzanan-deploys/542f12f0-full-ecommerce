"use server";

import { redirect } from "next/navigation";

export async function logoutUserAction(): Promise<void> {
  redirect("/admin/login");
}
