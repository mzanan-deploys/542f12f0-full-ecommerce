import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

import { db } from "@/db";
import {
  appSettings,
  categorySizes,
  heroContent,
  homepageLayout,
  productCategories,
  productImages,
  productVariants,
  products,
  setImages,
  setProducts,
  sets,
} from "@/db/schema";

const CATEGORIES = [
  { name: "Tops", sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Bottoms", sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Accessories", sizes: ["One Size"] },
];

const PRODUCTS = [
  { name: "Linen Shirt", categoryIdx: 0, price: "89.00", imageQuery: "linen-shirt" },
  { name: "Cotton Tee", categoryIdx: 0, price: "39.00", imageQuery: "white-tshirt" },
  { name: "Wool Sweater", categoryIdx: 0, price: "129.00", imageQuery: "wool-sweater" },
  { name: "Slim Jeans", categoryIdx: 1, price: "99.00", imageQuery: "denim-jeans" },
  { name: "Linen Pants", categoryIdx: 1, price: "109.00", imageQuery: "linen-pants" },
  { name: "Cargo Shorts", categoryIdx: 1, price: "69.00", imageQuery: "cargo-shorts" },
  { name: "Leather Belt", categoryIdx: 2, price: "59.00", imageQuery: "leather-belt" },
  { name: "Canvas Tote", categoryIdx: 2, price: "45.00", imageQuery: "canvas-tote-bag" },
  { name: "Wool Beanie", categoryIdx: 2, price: "35.00", imageQuery: "beanie-hat" },
  { name: "Silk Scarf", categoryIdx: 2, price: "55.00", imageQuery: "silk-scarf" },
];

const SETS = [
  { name: "Spring Essentials", type: "DAY", layoutType: "STAGGERED_THREE", productIdxs: [0, 1, 4], imageQuery: "spring-fashion" },
  { name: "Evening Casual", type: "NIGHT", layoutType: "TWO_HORIZONTAL", productIdxs: [2, 3], imageQuery: "evening-outfit" },
  { name: "Travel Kit", type: "DAY", layoutType: "SPLIT_SMALL_LEFT", productIdxs: [7, 8, 9], imageQuery: "travel-accessories" },
  { name: "Weekend Mood", type: "NIGHT", layoutType: "SINGLE_COLUMN", productIdxs: [5, 6], imageQuery: "casual-weekend-style" },
];

const HERO = {
  title: "Your store, ready to ship",
  subtitle: "Demo content seeded automatically. Make it yours from the admin panel.",
  imageQuery: "minimal-fashion-store",
};

const ABOUT = {
  text_content:
    "Tell your story here. This section, the hero and the whole homepage layout are editable from the admin panel.",
  image_urls: null,
  image_aspect_ratio: "portrait",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function demoImageUrl(seed: string, width = 800, height = 1000) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

async function seed() {
  console.log("Seeding categories...");
  const insertedCategories = await db
    .insert(productCategories)
    .values(CATEGORIES.map((c) => ({ name: c.name })))
    .returning();

  console.log("Seeding category sizes...");
  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = insertedCategories[i];
    const sizes = CATEGORIES[i].sizes;
    await db.insert(categorySizes).values(
      sizes.map((sizeName, order) => ({
        categoryId: category.id,
        sizeName,
        displayOrder: order,
      })),
    );
  }

  console.log("Seeding products...");
  const insertedProducts = await db
    .insert(products)
    .values(
      PRODUCTS.map((p) => ({
        name: p.name,
        slug: slugify(p.name),
        description: `${p.name}: production-ready demo product. Replace with your own copy.`,
        price: p.price,
        isFeatured: false,
        isActive: true,
        categoryId: insertedCategories[p.categoryIdx].id,
        stockQuantity: 25,
      })),
    )
    .returning();

  console.log("Seeding product images...");
  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = insertedProducts[i];
    await db.insert(productImages).values({
      productId: product.id,
      imageUrl: demoImageUrl(PRODUCTS[i].imageQuery),
      altText: product.name,
      position: 0,
    });
  }

  console.log("Seeding product variants...");
  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = insertedProducts[i];
    const sizes = CATEGORIES[PRODUCTS[i].categoryIdx].sizes;
    await db.insert(productVariants).values(
      sizes.map((sizeName) => ({
        productId: product.id,
        sizeName,
      })),
    );
  }

  console.log("Seeding sets...");
  const insertedSets = await db
    .insert(sets)
    .values(
      SETS.map((s) => ({
        name: s.name,
        slug: slugify(s.name),
        description: `${s.name}: demo set, replace with your curated picks.`,
        isActive: true,
        type: s.type,
        layoutType: s.layoutType,
        showTitleOnHome: true,
        totalPrice: "0",
        finalPrice: "0",
        discountPercentage: "0",
      })),
    )
    .returning();

  console.log("Linking products to sets...");
  for (let i = 0; i < SETS.length; i++) {
    const set = insertedSets[i];
    await db.insert(setProducts).values(
      SETS[i].productIdxs.map((idx, position) => ({
        setId: set.id,
        productId: insertedProducts[idx].id,
        position,
        quantity: 1,
      })),
    );
  }

  console.log("Seeding set images...");
  await db.insert(setImages).values(
    insertedSets.map((set, i) => ({
      setId: set.id,
      imageUrl: demoImageUrl(SETS[i].imageQuery, 1200, 800),
      altText: set.name,
      position: 0,
    })),
  );

  console.log("Seeding hero content...");
  await db
    .insert(heroContent)
    .values({
      id: 1,
      title: HERO.title,
      subtitle: HERO.subtitle,
      imageUrl: demoImageUrl(HERO.imageQuery, 1920, 1080),
    })
    .onConflictDoNothing();

  console.log("Seeding homepage layout...");
  await db
    .insert(homepageLayout)
    .values(
      insertedSets.map((set, i) => ({
        itemId: set.id,
        itemType: "set",
        displayOrder: i,
        pagePath: "/",
      })),
    )
    .onConflictDoNothing();

  console.log("Seeding about content...");
  await db
    .insert(appSettings)
    .values({ key: "about_content", value: JSON.stringify(ABOUT) })
    .onConflictDoNothing();

  console.log("Seed complete.");
  console.log(
    `Inserted: ${insertedCategories.length} categories, ${insertedProducts.length} products, ${insertedSets.length} sets.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
