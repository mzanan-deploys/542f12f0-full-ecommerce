import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth/authClient";

export type AdminLoginMode = "login" | "setup";

export function useAdminLoginForm(mode: AdminLoginMode) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");

    const { error: authError } =
      mode === "setup"
        ? await authClient.signUp.email({ email, password, name: name || email.split("@")[0] })
        : await authClient.signIn.email({ email, password });

    if (authError) {
      setError(authError.message ?? "Authentication failed.");
      setIsPending(false);
      return;
    }

    const redirectTo = searchParams.get("redirect");
    router.push(redirectTo?.startsWith("/admin") ? redirectTo : "/admin/dashboard");
    router.refresh();
  }

  return { handleSubmit, error, isPending };
}
