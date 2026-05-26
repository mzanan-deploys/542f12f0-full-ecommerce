import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignIn
        path="/admin/login"
        routing="path"
        signUpUrl="/admin/sign-up"
        forceRedirectUrl="/admin/dashboard"
      />
    </main>
  );
}
