import { eq } from "drizzle-orm";

import { db } from "@/db";
import { heroContent } from "@/db/schema";
import { HERO_CONTENT_ID } from "@/lib/schemas/heroSchema";
import type { HeroDbRow } from "@/types/hero";

export async function getHeroContent(): Promise<HeroDbRow | null> {
  const rows = await db
    .select()
    .from(heroContent)
    .where(eq(heroContent.id, HERO_CONTENT_ID))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image_url: row.imageUrl,
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : new Date().toISOString(),
  };
}
