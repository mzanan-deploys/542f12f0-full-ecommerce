import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  cached = new Resend(key);
  return cached;
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "orders@example.com";
}

export function getStoreName(): string {
  return process.env.NEXT_PUBLIC_STORE_NAME ?? "Store";
}

export function getSupportEmail(): string | undefined {
  return process.env.SUPPORT_EMAIL || undefined;
}
