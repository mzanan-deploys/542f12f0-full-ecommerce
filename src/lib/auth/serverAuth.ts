import { isAdmin as isAdminFromAuthz, requireAdmin as requireAdminFromAuthz, getCurrentUserId } from "./authz";

export async function verifyAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  return isAdminFromAuthz(userId);
}

export { getCurrentUserId, requireAdminFromAuthz as requireAdmin };
