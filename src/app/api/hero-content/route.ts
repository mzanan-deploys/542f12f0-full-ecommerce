import { NextResponse } from "next/server";
import { getHeroContent } from "@/lib/queries/heroQueries.server";

export async function GET() {
  const data = await getHeroContent();
  if (!data) {
    return NextResponse.json(null, { status: 404 });
  }
  return NextResponse.json(data);
}
