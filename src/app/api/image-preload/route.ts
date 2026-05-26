import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import {
  appSettings,
  heroContent,
  productImages,
  setImages,
} from "@/db/schema";

export async function GET() {
  try {
    const [setImagesRows, productImagesRows, heroRow, aboutRow] = await Promise.all([
      db.select({ imageUrl: setImages.imageUrl }).from(setImages),
      db.select({ imageUrl: productImages.imageUrl }).from(productImages),
      db
        .select({ imageUrl: heroContent.imageUrl })
        .from(heroContent)
        .where(eq(heroContent.id, 1))
        .limit(1),
      db
        .select({ value: appSettings.value })
        .from(appSettings)
        .where(eq(appSettings.key, "about_content"))
        .limit(1),
    ]);

    const urls: string[] = [];
    for (const row of setImagesRows) if (row.imageUrl) urls.push(row.imageUrl);
    for (const row of productImagesRows) if (row.imageUrl) urls.push(row.imageUrl);
    if (heroRow[0]?.imageUrl) urls.push(heroRow[0].imageUrl);

    const aboutValue = aboutRow[0]?.value;
    if (aboutValue && typeof aboutValue === "string") {
      try {
        const parsed = JSON.parse(aboutValue) as { image_urls?: unknown };
        if (Array.isArray(parsed.image_urls)) {
          urls.push(
            ...parsed.image_urls.filter((u): u is string => typeof u === "string"),
          );
        }
      } catch {}
    }

    return NextResponse.json(urls);
  } catch (error) {
    console.error("[image-preload]", error);
    return NextResponse.json([], { status: 200 });
  }
}
