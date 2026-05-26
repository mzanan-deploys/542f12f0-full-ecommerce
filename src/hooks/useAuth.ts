import { useUser } from "@clerk/nextjs";
import type { UserSessionData } from "@/types/auth";

export function useAuth() {
  const { user, isLoaded } = useUser();

  const sessionData: UserSessionData = user
    ? {
        name: user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress?.split("@")[0],
        email: user.primaryEmailAddress?.emailAddress,
        avatarUrl: user.imageUrl,
      }
    : {};

  return {
    user,
    sessionData,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
  };
}
