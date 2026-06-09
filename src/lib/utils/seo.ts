import type { Metadata } from "next";

import { BRAND_CONFIG } from "@/config/brand";
import { seoConfig } from "@/config/seo";

const BRAND = BRAND_CONFIG.name;

export interface SEOConfig {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const title = config.title;
  const description = config.description || seoConfig.defaultDescription;
  const url = config.canonicalUrl ? `${seoConfig.siteUrl}${config.canonicalUrl}` : seoConfig.siteUrl;
  const image = config.image || `${seoConfig.siteUrl}${seoConfig.defaultImage}`;

  const titlePrefix = config.noIndex ? `${BRAND} Admin` : seoConfig.siteName;

  return {
    title,
    description,
    keywords: config.keywords?.join(", "),
    ...(config.noIndex && { robots: "noindex, nofollow" }),

    openGraph: {
      type: "website",
      siteName: seoConfig.siteName,
      title: `${titlePrefix} - ${title}`,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${titlePrefix} - ${title}`,
      description,
      images: [image],
    },

    alternates: {
      canonical: url,
    },
  };
}

export const seoConfigs = {
  home: {
    title: "Home",
    description: `Discover ${BRAND}'s latest collections.`,
    keywords: ["online store", "ecommerce", "collections"],
    canonicalUrl: "/",
  },
  admin: {
    title: "Admin Dashboard",
    description: `${BRAND} administration panel for managing products, orders, and content.`,
    noIndex: true,
  },
  adminDashboard: {
    title: "Dashboard",
    description: `${BRAND} admin dashboard with analytics and overview.`,
    noIndex: true,
  },
  adminProducts: {
    title: "Products",
    description: `Manage ${BRAND} products and inventory.`,
    noIndex: true,
  },
  adminSets: {
    title: "Sets",
    description: `Manage ${BRAND} product sets and collections.`,
    noIndex: true,
  },
  adminOrders: {
    title: "Orders",
    description: "View and manage customer orders.",
    noIndex: true,
  },
  adminSettings: {
    title: "Settings",
    description: `Configure ${BRAND} application settings.`,
    noIndex: true,
  },
  cart: {
    title: "Shopping Cart",
    description: `Review your selected ${BRAND} items before checkout.`,
    canonicalUrl: "/cart",
  },
  checkout: {
    title: "Checkout",
    description: `Complete your ${BRAND} purchase with secure payment.`,
    noIndex: true,
  },
  contact: {
    title: "Contact Us",
    description: `Get in touch with ${BRAND} for questions about our collections.`,
    canonicalUrl: "/contact",
  },
  about: {
    title: "About",
    description: `Learn about ${BRAND}'s story.`,
    keywords: [`about ${BRAND}`, "company story"],
    canonicalUrl: "/about",
  },
  privacy: {
    title: "Privacy Policy",
    description: `${BRAND}'s privacy policy and data protection practices.`,
    canonicalUrl: "/privacy",
  },
  terms: {
    title: "Terms & Conditions",
    description: `Terms and conditions for using ${BRAND}'s website and services.`,
    canonicalUrl: "/terms",
  },
};

export function generateSetMetadata(setData: {
  name: string;
  description?: string | null;
  type?: "DAY" | "NIGHT";
  imageUrl?: string;
}) {
  const brandName = setData.type || BRAND;
  const keywords = [
    BRAND.toLowerCase(),
    setData.type?.toLowerCase() || "collection",
    setData.name.toLowerCase(),
  ];

  return generateMetadata({
    title: setData.name,
    description:
      setData.description ||
      `${setData.name}: ${brandName} collection from ${BRAND}.`,
    keywords,
    image: setData.imageUrl,
  });
}

export function generateProductMetadata(productData: {
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string;
}) {
  const description =
    productData.description ||
    `${productData.name}: Available now at ${BRAND}. Starting at $${productData.price}.`;
  const keywords = [BRAND.toLowerCase(), productData.name.toLowerCase()];

  return generateMetadata({
    title: productData.name,
    description,
    keywords,
    image: productData.imageUrl,
  });
}
