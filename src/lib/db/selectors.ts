import {
  adminUsers,
  appSettings,
  categorySizes,
  countryShippingPrices,
  heroContent,
  homepageLayout,
  orderItems,
  orders,
  pageComponents,
  productCategories,
  productImages,
  productVariants,
  products,
  setImages,
  setProducts,
  sets,
  sizeGuideTemplates,
} from "@/db/schema";

export const productSelector = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  description: products.description,
  price: products.price,
  is_featured: products.isFeatured,
  is_active: products.isActive,
  category_id: products.categoryId,
  stock_quantity: products.stockQuantity,
  created_at: products.createdAt,
  updated_at: products.updatedAt,
} as const;

export const productImageSelector = {
  id: productImages.id,
  product_id: productImages.productId,
  image_url: productImages.imageUrl,
  alt_text: productImages.altText,
  position: productImages.position,
  created_at: productImages.createdAt,
} as const;

export const productVariantSelector = {
  id: productVariants.id,
  product_id: productVariants.productId,
  size_name: productVariants.sizeName,
  created_at: productVariants.createdAt,
  updated_at: productVariants.updatedAt,
} as const;

export const productCategorySelector = {
  id: productCategories.id,
  name: productCategories.name,
  size_guide_id: productCategories.sizeGuideId,
  created_at: productCategories.createdAt,
  updated_at: productCategories.updatedAt,
} as const;

export const categorySizeSelector = {
  id: categorySizes.id,
  category_id: categorySizes.categoryId,
  size_name: categorySizes.sizeName,
  display_order: categorySizes.displayOrder,
  created_at: categorySizes.createdAt,
} as const;

export const setSelector = {
  id: sets.id,
  name: sets.name,
  slug: sets.slug,
  description: sets.description,
  is_active: sets.isActive,
  type: sets.type,
  layout_type: sets.layoutType,
  show_title_on_home: sets.showTitleOnHome,
  total_price: sets.totalPrice,
  final_price: sets.finalPrice,
  discount_percentage: sets.discountPercentage,
  created_at: sets.createdAt,
  updated_at: sets.updatedAt,
} as const;

export const setImageSelector = {
  id: setImages.id,
  set_id: setImages.setId,
  image_url: setImages.imageUrl,
  alt_text: setImages.altText,
  position: setImages.position,
  created_at: setImages.createdAt,
} as const;

export const setProductSelector = {
  set_id: setProducts.setId,
  product_id: setProducts.productId,
  position: setProducts.position,
  quantity: setProducts.quantity,
} as const;

export const orderSelector = {
  id: orders.id,
  user_id: orders.userId,
  shipping_name: orders.shippingName,
  shipping_address1: orders.shippingAddress1,
  shipping_address2: orders.shippingAddress2,
  shipping_city: orders.shippingCity,
  shipping_state: orders.shippingState,
  shipping_postal_code: orders.shippingPostalCode,
  shipping_country: orders.shippingCountry,
  shipping_phone: orders.shippingPhone,
  shipping_email: orders.shippingEmail,
  total_amount: orders.totalAmount,
  payment_intent_id: orders.paymentIntentId,
  status: orders.status,
  shipping_status: orders.shippingStatus,
  stripe_session_id: orders.stripeSessionId,
  order_details: orders.orderDetails,
  created_at: orders.createdAt,
  updated_at: orders.updatedAt,
} as const;

export const orderItemSelector = {
  id: orderItems.id,
  order_id: orderItems.orderId,
  product_variant_id: orderItems.productVariantId,
  quantity: orderItems.quantity,
  price_at_purchase: orderItems.priceAtPurchase,
  product_name: orderItems.productName,
  product_size: orderItems.productSize,
  created_at: orderItems.createdAt,
} as const;

export const heroContentSelector = {
  id: heroContent.id,
  title: heroContent.title,
  subtitle: heroContent.subtitle,
  image_url: heroContent.imageUrl,
  updated_at: heroContent.updatedAt,
} as const;

export const pageComponentSelector = {
  id: pageComponents.id,
  type: pageComponents.type,
  content: pageComponents.content,
  position: pageComponents.position,
  page_path: pageComponents.pagePath,
  is_active: pageComponents.isActive,
  display_order: pageComponents.displayOrder,
  affiliation: pageComponents.affiliation,
  created_at: pageComponents.createdAt,
  updated_at: pageComponents.updatedAt,
} as const;

export const homepageLayoutSelector = {
  item_id: homepageLayout.itemId,
  item_type: homepageLayout.itemType,
  display_order: homepageLayout.displayOrder,
  page_path: homepageLayout.pagePath,
  created_at: homepageLayout.createdAt,
  updated_at: homepageLayout.updatedAt,
} as const;

export const countryShippingPriceSelector = {
  id: countryShippingPrices.id,
  country_code: countryShippingPrices.countryCode,
  country_name: countryShippingPrices.countryName,
  shipping_price: countryShippingPrices.shippingPrice,
  min_delivery_days: countryShippingPrices.minDeliveryDays,
  max_delivery_days: countryShippingPrices.maxDeliveryDays,
  created_at: countryShippingPrices.createdAt,
  updated_at: countryShippingPrices.updatedAt,
} as const;

export const sizeGuideTemplateSelector = {
  id: sizeGuideTemplates.id,
  name: sizeGuideTemplates.name,
  guide_data: sizeGuideTemplates.guideData,
  created_at: sizeGuideTemplates.createdAt,
  updated_at: sizeGuideTemplates.updatedAt,
} as const;

export const appSettingSelector = {
  key: appSettings.key,
  value: appSettings.value,
} as const;

export const adminUserSelector = {
  id: adminUsers.id,
  full_name: adminUsers.fullName,
  created_at: adminUsers.createdAt,
  updated_at: adminUsers.updatedAt,
} as const;
