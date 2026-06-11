import { BRAND_CONFIG } from "@/config/brand";

export const SOCIAL_LINKS = {
  FACEBOOK: BRAND_CONFIG.social.facebook,
  INSTAGRAM: BRAND_CONFIG.social.instagram,
  TWITTER: BRAND_CONFIG.social.twitter,
  STRIPE_DASHBOARD: "https://dashboard.stripe.com/dashboard",
} as const;

export const CONTACT_INFO = {
  EMAIL: BRAND_CONFIG.contact.email,
  SUPPORT_EMAIL: BRAND_CONFIG.contact.supportEmail,
  PHONE: BRAND_CONFIG.contact.phone,
  WEBSITE_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const;

export const COMPANY_INFO = {
  NAME: BRAND_CONFIG.name,
  TWITTER_HANDLE: BRAND_CONFIG.social.twitterHandle,
  DESCRIPTION: BRAND_CONFIG.description,
} as const;
