import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  decimal,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const layoutTypeEnum = pgEnum("layout_type", [
  "SINGLE_COLUMN",
  "SPLIT_SMALL_LEFT",
  "SPLIT_SMALL_RIGHT",
  "STAGGERED_THREE",
  "TWO_HORIZONTAL",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

// ─────────────────────────────────────────────────────────────────────────────
// admin_users
// Pre-refactor: PK was UUID with FK to auth.users(id). Post-refactor: id is
// Clerk userId (text). No FK because users live in Clerk, not Postgres.
// Mirror row created via Clerk webhook on user creation (see Fase 3.2).
// ─────────────────────────────────────────────────────────────────────────────

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────────────────────────────────────
// size_guide_templates (declared before product_categories to satisfy FK)
// ─────────────────────────────────────────────────────────────────────────────

export const sizeGuideTemplates = pgTable(
  "size_guide_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    guideData: jsonb("guide_data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    nameNotEmpty: check(
      "size_guide_templates_name_not_empty",
      sql`char_length(trim(both from ${table.name})) > 0`,
    ),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// product_categories
// ─────────────────────────────────────────────────────────────────────────────

export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  sizeGuideId: uuid("size_guide_id").references(() => sizeGuideTemplates.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────────────────────────────────────
// category_sizes
// ─────────────────────────────────────────────────────────────────────────────

export const categorySizes = pgTable("category_sizes", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => productCategories.id),
  sizeName: text("size_name").notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// products
// ─────────────────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    price: numeric("price").notNull(),
    isFeatured: boolean("is_featured").default(false),
    isActive: boolean("is_active").default(true),
    categoryId: uuid("category_id").references(() => productCategories.id),
    stockQuantity: integer("stock_quantity").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    priceNonNeg: check("products_price_non_negative", sql`${table.price} >= 0`),
    stockNonNeg: check(
      "products_stock_non_negative",
      sql`${table.stockQuantity} >= 0`,
    ),
    categoryIdx: index("idx_products_category_id").on(table.categoryId),
    isActiveIdx: index("idx_products_is_active").on(table.isActive),
    slugIdx: index("idx_products_slug").on(table.slug),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// product_images
// Pre-refactor: image_url pointed to Supabase Storage. Post-refactor: points
// to Vercel Blob URLs (https://*.public.blob.vercel-storage.com/...).
// ─────────────────────────────────────────────────────────────────────────────

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  position: smallint("position").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// product_variants
// ─────────────────────────────────────────────────────────────────────────────

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  sizeName: text("size_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────────────────────────────────────
// sets
// Note: NOIR-specific concept (DAY/NIGHT segmentation). Kept generic via type
// column: buyer can rename DAY/NIGHT to whatever fits their brand or remove.
// ─────────────────────────────────────────────────────────────────────────────

export const sets = pgTable(
  "sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    type: text("type"),
    layoutType: text("layout_type"),
    showTitleOnHome: boolean("show_title_on_home").default(true),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).default("0"),
    finalPrice: decimal("final_price", { precision: 10, scale: 2 }).default("0"),
    discountPercentage: decimal("discount_percentage", {
      precision: 5,
      scale: 2,
    }).default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    typeCheck: check(
      "sets_type_check",
      sql`${table.type} = ANY (ARRAY['DAY','NIGHT'])`,
    ),
    layoutCheck: check(
      "sets_layout_type_check",
      sql`${table.layoutType} = ANY (ARRAY['SINGLE_COLUMN','SPLIT_SMALL_LEFT','SPLIT_SMALL_RIGHT','STAGGERED_THREE','TWO_HORIZONTAL'])`,
    ),
    isActiveIdx: index("idx_sets_is_active").on(table.isActive),
    slugIdx: index("idx_sets_slug").on(table.slug),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// set_images
// ─────────────────────────────────────────────────────────────────────────────

export const setImages = pgTable("set_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  setId: uuid("set_id")
    .notNull()
    .references(() => sets.id),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  position: smallint("position").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// set_products (composite PK)
// ─────────────────────────────────────────────────────────────────────────────

export const setProducts = pgTable(
  "set_products",
  {
    setId: uuid("set_id")
      .notNull()
      .references(() => sets.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    position: smallint("position").default(0),
    quantity: integer("quantity"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.setId, table.productId] }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// orders
// Pre-refactor: user_id FK to auth.users(id). Post-refactor: text storing
// Clerk userId. No FK (Clerk owns users).
// ─────────────────────────────────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id"),
    shippingName: text("shipping_name").notNull(),
    shippingAddress1: text("shipping_address1").notNull(),
    shippingAddress2: text("shipping_address2"),
    shippingCity: text("shipping_city").notNull(),
    shippingState: text("shipping_state"),
    shippingPostalCode: text("shipping_postal_code").notNull(),
    shippingCountry: text("shipping_country").notNull(),
    shippingPhone: text("shipping_phone"),
    shippingEmail: text("shipping_email"),
    totalAmount: numeric("total_amount").notNull(),
    paymentIntentId: text("payment_intent_id").notNull().unique(),
    status: text("status").default("processing").notNull(),
    shippingStatus: text("shipping_status").default("pending"),
    stripeSessionId: text("stripe_session_id"),
    orderDetails: jsonb("order_details"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    shippingStatusCheck: check(
      "orders_shipping_status_check",
      sql`${table.shippingStatus} = ANY (ARRAY['pending','in_transit','delivered'])`,
    ),
    userIdx: index("idx_orders_user_id").on(table.userId),
    statusIdx: index("idx_orders_status").on(table.status),
    createdAtIdx: index("idx_orders_created_at").on(table.createdAt),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// order_items
// ─────────────────────────────────────────────────────────────────────────────

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull(),
    priceAtPurchase: numeric("price_at_purchase").notNull(),
    productName: text("product_name").notNull(),
    productSize: text("product_size"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    quantityPositive: check(
      "order_items_quantity_positive",
      sql`${table.quantity} > 0`,
    ),
    priceNonNeg: check(
      "order_items_price_non_negative",
      sql`${table.priceAtPurchase} >= 0`,
    ),
    orderIdx: index("idx_order_items_order_id").on(table.orderId),
    variantIdx: index("idx_order_items_product_variant_id").on(
      table.productVariantId,
    ),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// app_settings: key-value store
// ─────────────────────────────────────────────────────────────────────────────

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});

// ─────────────────────────────────────────────────────────────────────────────
// hero_content: single-row table (id always 1)
// ─────────────────────────────────────────────────────────────────────────────

export const heroContent = pgTable("hero_content", {
  id: integer("id").primaryKey().default(1),
  title: text("title"),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────────────────────────────────────
// page_components
// ─────────────────────────────────────────────────────────────────────────────

export const pageComponents = pgTable(
  "page_components",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    content: jsonb("content").notNull(),
    position: jsonb("position").notNull(),
    pagePath: text("page_path").default("/").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    displayOrder: integer("display_order"),
    affiliation: text("affiliation").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    typeCheck: check(
      "page_components_type_check",
      sql`${table.type} = ANY (ARRAY['text','about'])`,
    ),
    affiliationCheck: check(
      "page_components_affiliation_check",
      sql`${table.affiliation} = ANY (ARRAY['DAY','NIGHT'])`,
    ),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// homepage_layout (composite PK)
// ─────────────────────────────────────────────────────────────────────────────

export const homepageLayout = pgTable(
  "homepage_layout",
  {
    itemId: uuid("item_id").notNull(),
    itemType: text("item_type").notNull(),
    displayOrder: smallint("display_order").default(0).notNull(),
    pagePath: text("page_path").default("/").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.itemId, table.pagePath] }),
    itemTypeCheck: check(
      "homepage_layout_item_type_check",
      sql`(${table.itemType} = ANY (ARRAY['page_component','set'])) AND char_length(trim(both from ${table.itemType})) > 0`,
    ),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// country_shipping_prices
// ─────────────────────────────────────────────────────────────────────────────

export const countryShippingPrices = pgTable("country_shipping_prices", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  countryCode: text("country_code").notNull().unique(),
  countryName: text("country_name"),
  shippingPrice: numeric("shipping_price").default("0").notNull(),
  minDeliveryDays: integer("min_delivery_days").default(3),
  maxDeliveryDays: integer("max_delivery_days").default(7),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────────────────────────────────────
// Type exports for app code
// ─────────────────────────────────────────────────────────────────────────────

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;

export type SizeGuideTemplate = typeof sizeGuideTemplates.$inferSelect;
export type NewSizeGuideTemplate = typeof sizeGuideTemplates.$inferInsert;

export type CategorySize = typeof categorySizes.$inferSelect;
export type NewCategorySize = typeof categorySizes.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

export type SetImage = typeof setImages.$inferSelect;
export type NewSetImage = typeof setImages.$inferInsert;

export type SetProduct = typeof setProducts.$inferSelect;
export type NewSetProduct = typeof setProducts.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;

export type HeroContent = typeof heroContent.$inferSelect;
export type NewHeroContent = typeof heroContent.$inferInsert;

export type PageComponent = typeof pageComponents.$inferSelect;
export type NewPageComponent = typeof pageComponents.$inferInsert;

export type HomepageLayout = typeof homepageLayout.$inferSelect;
export type NewHomepageLayout = typeof homepageLayout.$inferInsert;

export type CountryShippingPrice = typeof countryShippingPrices.$inferSelect;
export type NewCountryShippingPrice = typeof countryShippingPrices.$inferInsert;
