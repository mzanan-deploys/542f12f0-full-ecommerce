import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  appSettings,
  homepageLayout,
  pageComponents,
  productImages,
  products,
  setImages,
  setProducts,
  sets,
} from "@/db/schema";
import {
  pageComponentSelector,
  productImageSelector,
  productSelector,
  setImageSelector,
  setSelector,
} from "@/lib/db/selectors";
import { APP_SETTINGS_ABOUT_KEY } from "@/lib/constants/home";
import type { PageComponent, SetRow } from "@/types/db";
import type { AboutContentData, HomePageItemOrchestrator } from "@/types/home";

export async function getHomepageItems(): Promise<HomePageItemOrchestrator[]> {
  try {
    const layout = await db
      .select({
        item_id: homepageLayout.itemId,
        item_type: homepageLayout.itemType,
        display_order: homepageLayout.displayOrder,
        page_path: homepageLayout.pagePath,
      })
      .from(homepageLayout)
      .where(eq(homepageLayout.pagePath, "/"))
      .orderBy(asc(homepageLayout.displayOrder));

    if (layout.length === 0) return [];

    const componentIds = layout.filter((i) => i.item_type === "page_component").map((i) => i.item_id);
    const setIds = layout.filter((i) => i.item_type === "set").map((i) => i.item_id);

    const [fetchedComponents, fetchedSets] = await Promise.all([
      componentIds.length
        ? (db
            .select(pageComponentSelector)
            .from(pageComponents)
            .where(and(inArray(pageComponents.id, componentIds), eq(pageComponents.isActive, true))) as Promise<PageComponent[]>)
        : Promise.resolve([] as PageComponent[]),
      setIds.length
        ? (db
            .select(setSelector)
            .from(sets)
            .where(and(inArray(sets.id, setIds), eq(sets.isActive, true))) as Promise<SetRow[]>)
        : Promise.resolve([] as SetRow[]),
    ]);

    let imagesBySetId: Record<string, Array<Record<string, unknown>>> = {};
    let productsBySetId: Record<string, Array<{ position: number | null; products: Record<string, unknown> & { product_images: Array<Record<string, unknown>> } }>> = {};
    if (fetchedSets.length) {
      const setIdList = fetchedSets.map((s) => s.id);
      const [imgs, productRows] = await Promise.all([
        db
          .select(setImageSelector)
          .from(setImages)
          .where(inArray(setImages.setId, setIdList))
          .orderBy(asc(setImages.position)),
        db
          .select({
            set_id: setProducts.setId,
            position: setProducts.position,
            ...productSelector,
          })
          .from(setProducts)
          .innerJoin(products, eq(products.id, setProducts.productId))
          .where(inArray(setProducts.setId, setIdList))
          .orderBy(asc(setProducts.position)),
      ]);
      imagesBySetId = imgs.reduce<typeof imagesBySetId>((acc, img) => {
        (acc[img.set_id] ??= []).push(img);
        return acc;
      }, {});

      const productIds = productRows.map((p) => p.id);
      const productImagesRows = productIds.length
        ? await db
            .select(productImageSelector)
            .from(productImages)
            .where(inArray(productImages.productId, productIds))
            .orderBy(asc(productImages.position))
        : [];

      productsBySetId = productRows.reduce<typeof productsBySetId>((acc, row) => {
        const { set_id, position, ...productFields } = row;
        const imgs = productImagesRows.filter((img) => img.product_id === productFields.id);
        (acc[set_id] ??= []).push({
          position,
          products: { ...productFields, product_images: imgs },
        });
        return acc;
      }, {});
    }

    const componentMap = new Map(fetchedComponents.map((c) => [c.id, c]));
    const setMap = new Map(
      fetchedSets.map((s) => [
        s.id,
        {
          ...s,
          set_images: imagesBySetId[s.id] ?? [],
          set_products: productsBySetId[s.id] ?? [],
        },
      ]),
    );

    const finalItems: HomePageItemOrchestrator[] = [];
    for (const layoutItem of layout) {
      if (layoutItem.item_type === "page_component") {
        const component = componentMap.get(layoutItem.item_id);
        if (component) finalItems.push({ ...component, item_type: "page_component" });
      } else if (layoutItem.item_type === "set") {
        const set = setMap.get(layoutItem.item_id);
        if (set && set.set_products.length > 0) {
          finalItems.push({ ...set, item_type: "set" } as HomePageItemOrchestrator);
        }
      }
    }
    return finalItems;
  } catch (error) {
    console.error("[getHomepageItems]", error);
    return [];
  }
}

export async function getAboutContent(): Promise<AboutContentData | null> {
  try {
    const [row] = await db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, APP_SETTINGS_ABOUT_KEY))
      .limit(1);

    if (!row || !row.value || typeof row.value !== "string") return null;

    const content = JSON.parse(row.value) as AboutContentData;
    return {
      text_content: content.text_content || null,
      image_urls: Array.isArray(content.image_urls)
        ? content.image_urls.filter((img) => typeof img === "string" || img === null)
        : [],
      image_aspect_ratio: content.image_aspect_ratio || "square",
    };
  } catch (error) {
    console.error("[getAboutContent]", error);
    return null;
  }
}
