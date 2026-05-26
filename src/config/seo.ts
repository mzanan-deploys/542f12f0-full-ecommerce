import type { Metadata } from "next";

import { BRAND_CONFIG } from "./brand";

export const seoConfig = {
  siteName: BRAND_CONFIG.name,
  siteUrl: process.env.NEXT_PUBLIC_APP_URL,
  defaultTitle: BRAND_CONFIG.title,
  defaultDescription: BRAND_CONFIG.description,
  defaultKeywords: BRAND_CONFIG.keywords as string[],
  defaultImage: "/og-image.png",
  twitterHandle: BRAND_CONFIG.social.twitterHandle,
  locale: "en_US",
  organization: {
    name: BRAND_CONFIG.name,
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: "/logo.png",
    description: BRAND_CONFIG.description,
    contactPoint: {
      telephone: BRAND_CONFIG.contact.phone,
      contactType: "Customer Service",
      email: BRAND_CONFIG.contact.email,
    },
    sameAs: [
      BRAND_CONFIG.social.facebook,
      BRAND_CONFIG.social.instagram,
      BRAND_CONFIG.social.twitter,
    ].filter(Boolean),
  },
} as const;

export const baseMetadata: Metadata = {
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.defaultDescription,
  keywords: seoConfig.defaultKeywords,
  authors: [{ name: seoConfig.siteName }],
  creator: seoConfig.siteName,
  metadataBase: seoConfig.siteUrl ? new URL(seoConfig.siteUrl) : undefined,
  openGraph: {
    type: "website",
    locale: seoConfig.locale,
    url: seoConfig.siteUrl,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    siteName: seoConfig.siteName,
    images: [
      {
        url: seoConfig.defaultImage,
        width: 1200,
        height: 630,
        alt: seoConfig.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    site: seoConfig.twitterHandle,
    creator: seoConfig.twitterHandle,
    images: [seoConfig.defaultImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
