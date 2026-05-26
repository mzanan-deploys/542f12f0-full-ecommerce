export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  is_featured: boolean | null;
  is_active: boolean | null;
  category_id: string | null;
  stock_quantity: number | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  position: number | null;
  created_at: Date | string | null;
}

export interface VariantRow {
  id: string;
  product_id: string;
  size_name: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface ProductCategoryRow {
  id: string;
  name: string;
  size_guide_id: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface SetRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  type: string | null;
  layout_type: string | null;
  show_title_on_home: boolean | null;
  total_price: string | null;
  final_price: string | null;
  discount_percentage: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface SetImageRow {
  id: string;
  set_id: string;
  image_url: string;
  alt_text: string | null;
  position: number | null;
  created_at: Date | string | null;
}

export interface SetProductRow {
  set_id: string;
  product_id: string;
  position: number | null;
  quantity: number | null;
}

export type ProductWithPosition = ProductRow & {
  position: number | null;
  product_images: ProductImageRow[] | null;
};

export type ProductWithIncludes = ProductRow & {
  product_images: ProductImageRow[] | null;
  product_variants: VariantRow[] | null;
  sets: Pick<SetRow, "id" | "name" | "slug">[] | null;
};

export interface PageComponentContent {
  title?: string;
  text?: string;
  imageUrl?: string;
  bgTheme?: "light" | "dark";
}

export interface PageComponent {
  id: string;
  type: string;
  content: PageComponentContent | unknown;
  position: unknown;
  page_path: string;
  is_active: boolean;
  display_order: number | null;
  affiliation: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export type PageComponentInsert = Partial<PageComponent>;
export type PageComponentUpdate = Partial<PageComponent>;

export type Product = ProductRow;
export type Set = SetRow;

export interface StaticSectionItem {
  id: string;
  type: "static";
  item_type: "static";
  title: string;
  subtitle?: string;
  className?: string;
}

export interface HomepageLayoutRow {
  item_id: string;
  item_type: string;
  display_order: number;
  page_path: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface SetProductWithProductDetails extends SetProductRow {
  products: Product & { product_images: ProductImageRow[] };
}

export type SortablePageItem = PageComponent & {
  item_type: "page_component";
  display_order: number;
};

export type SortableSetItem = SetRow & {
  item_type: "set";
  display_order: number;
};

export type SortableStaticItem = StaticSectionItem & {
  item_type: "static";
};

export type SortableListItem =
  | SortablePageItem
  | SortableSetItem
  | SortableStaticItem;
