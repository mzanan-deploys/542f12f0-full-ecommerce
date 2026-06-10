import { authClient } from "@/lib/auth/authClient";
import type { UserSessionData } from "@/types/auth";

export function useAuth() {
  const { data, isPending } = authClient.useSession();
  const user = data?.user ?? null;

  const sessionData: UserSessionData = user
    ? {
        name: user.name || user.email?.split("@")[0],
        email: user.email,
        avatarUrl: user.image,
      }
    : {};

  return {
    user,
    sessionData,
    isLoading: isPending,
    isAuthenticated: !!user,
  };
}
