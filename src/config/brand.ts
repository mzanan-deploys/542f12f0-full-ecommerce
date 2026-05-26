const ENV_NAME = process.env.NEXT_PUBLIC_STORE_NAME;
const ENV_TITLE = process.env.NEXT_PUBLIC_STORE_TITLE;
const ENV_DESCRIPTION = process.env.NEXT_PUBLIC_STORE_DESCRIPTION;
const ENV_KEYWORDS = process.env.NEXT_PUBLIC_STORE_KEYWORDS;

const ENV_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const ENV_SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
const ENV_CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE;

const ENV_FACEBOOK = process.env.NEXT_PUBLIC_FACEBOOK_URL;
const ENV_INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const ENV_TWITTER = process.env.NEXT_PUBLIC_TWITTER_URL;
const ENV_TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE;

const ENV_PRIMARY_LABEL = process.env.NEXT_PUBLIC_CATEGORY_PRIMARY_LABEL;
const ENV_PRIMARY_DESCRIPTION = process.env.NEXT_PUBLIC_CATEGORY_PRIMARY_DESCRIPTION;
const ENV_SECONDARY_LABEL = process.env.NEXT_PUBLIC_CATEGORY_SECONDARY_LABEL;
const ENV_SECONDARY_DESCRIPTION = process.env.NEXT_PUBLIC_CATEGORY_SECONDARY_DESCRIPTION;

export const BRAND_CONFIG = {
  name: ENV_NAME ?? "Store",
  title: ENV_TITLE ?? "Store — Modern ecommerce",
  description: ENV_DESCRIPTION ?? "Production-ready ecommerce template.",
  keywords: ENV_KEYWORDS ? ENV_KEYWORDS.split(",").map((k) => k.trim()) : ["ecommerce", "store"],

  contact: {
    email: ENV_CONTACT_EMAIL ?? "contact@example.com",
    supportEmail: ENV_SUPPORT_EMAIL ?? "support@example.com",
    phone: ENV_CONTACT_PHONE ?? "",
  },

  social: {
    facebook: ENV_FACEBOOK ?? "",
    instagram: ENV_INSTAGRAM ?? "",
    twitter: ENV_TWITTER ?? "",
    twitterHandle: ENV_TWITTER_HANDLE ?? "",
  },

  categories: {
    primary: {
      id: "DAY" as const,
      label: ENV_PRIMARY_LABEL ?? "Day",
      description: ENV_PRIMARY_DESCRIPTION ?? "Casual and comfortable daytime wear",
    },
    secondary: {
      id: "NIGHT" as const,
      label: ENV_SECONDARY_LABEL ?? "Night",
      description: ENV_SECONDARY_DESCRIPTION ?? "Bold and stylish evening wear",
    },
  },
} as const;

export type CategoryType = "DAY" | "NIGHT";
export const CATEGORY_TYPES = ["DAY", "NIGHT"] as const;
