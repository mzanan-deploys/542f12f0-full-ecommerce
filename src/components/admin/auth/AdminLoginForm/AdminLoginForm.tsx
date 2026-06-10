"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLoginForm, type AdminLoginMode } from "./useAdminLoginForm";

type AdminLoginFormProps = {
  mode: AdminLoginMode;
};

function AdminLoginFormInner({ mode }: AdminLoginFormProps) {
  const { handleSubmit, error, isPending } = useAdminLoginForm(mode);
  const isSetup = mode === "setup";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSetup ? "Create your admin account" : "Admin login"}</CardTitle>
        <CardDescription>
          {isSetup
            ? "This store has no admin yet. Set up the first and only admin account."
            : "Sign in to manage your store."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSetup && (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" autoComplete="name" />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSetup ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSetup ? "Create account" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminLoginForm(props: AdminLoginFormProps) {
  return (
    <Suspense>
      <AdminLoginFormInner {...props} />
    </Suspense>
  );
}
