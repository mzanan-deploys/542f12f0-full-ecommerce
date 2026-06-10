import { getAuth } from "@/lib/auth/auth";

export async function GET(req: Request) {
  return getAuth().handler(req);
}

export async function POST(req: Request) {
  return getAuth().handler(req);
}
