import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { sizeGuideTemplates } from "@/db/schema";
import { sizeGuideTemplateSelector } from "@/lib/db/selectors";

export async function GET() {
  try {
    const rows = await db
      .select(sizeGuideTemplateSelector)
      .from(sizeGuideTemplates)
      .orderBy(desc(sizeGuideTemplates.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
