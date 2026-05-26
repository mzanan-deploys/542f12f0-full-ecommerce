"use server";

import { asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { homepageLayout, pageComponents } from "@/db/schema";
import { homepageLayoutSelector, pageComponentSelector } from "@/lib/db/selectors";
import type { ActionResponse } from "@/types/actions";
import type { PageComponent, PageComponentContent } from "@/types/db";
import type { PageComponentType } from "@/types/homeDesign";

export async function getHomepageLayoutDataAction(
  pagePath: string,
): Promise<ActionResponse<Array<Record<string, unknown>>>> {
  try {
    const data = await db
      .select(homepageLayoutSelector)
      .from(homepageLayout)
      .where(eq(homepageLayout.pagePath, pagePath))
      .orderBy(asc(homepageLayout.displayOrder));

    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[getHomepageLayoutDataAction]", message);
    return { success: false, error: message };
  }
}

export async function createPageComponentAction(args: {
  title: string;
  text: string;
  affiliation: "DAY" | "NIGHT";
  pagePath?: string;
  type?: PageComponentType;
}): Promise<ActionResponse<PageComponent>> {
  const { title, text, affiliation, pagePath = "/", type = "text" } = args;

  try {
    const [last] = await db
      .select({ displayOrder: homepageLayout.displayOrder })
      .from(homepageLayout)
      .where(eq(homepageLayout.pagePath, pagePath))
      .orderBy(desc(homepageLayout.displayOrder))
      .limit(1);

    const nextDisplayOrder = last?.displayOrder != null ? last.displayOrder + 1 : 0;

    const derivedBgTheme = affiliation === "DAY" ? "light" : "dark";
    const content: PageComponentContent = {
      title: title || undefined,
      text,
      bgTheme: derivedBgTheme,
    };

    const defaultPosition = { x: 0, y: nextDisplayOrder };

    const [newDbComponent] = await db
      .insert(pageComponents)
      .values({
        type,
        content,
        pagePath,
        isActive: true,
        affiliation,
        displayOrder: nextDisplayOrder,
        position: defaultPosition,
      })
      .returning(pageComponentSelector);

    if (!newDbComponent) {
      return { success: false, error: "Failed to create page component." };
    }

    try {
      await db.insert(homepageLayout).values({
        itemId: newDbComponent.id,
        itemType: "page_component",
        displayOrder: nextDisplayOrder,
        pagePath,
      });
    } catch (layoutError) {
      await db.delete(pageComponents).where(eq(pageComponents.id, newDbComponent.id));
      const message = layoutError instanceof Error ? layoutError.message : "Unknown error";
      return { success: false, error: `Failed to add component to layout: ${message}` };
    }

    return { success: true, data: newDbComponent as PageComponent };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[createPageComponentAction]", message);
    return { success: false, error: message };
  }
}

export async function getPageComponentsByIdsAction(
  componentIds: string[],
): Promise<ActionResponse<PageComponent[]>> {
  if (!componentIds || componentIds.length === 0) {
    return { success: true, data: [] };
  }
  try {
    const data = await db
      .select(pageComponentSelector)
      .from(pageComponents)
      .where(inArray(pageComponents.id, componentIds));

    return { success: true, data: data as PageComponent[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
