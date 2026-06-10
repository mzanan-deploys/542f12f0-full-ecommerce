import React from "react";
import Home from "@/components/ecommerce/home/Home/Home";
import { getHomepageItems, getAboutContent } from "@/lib/helpers/homeHelpers";
import { getHeroContent } from "@/lib/queries/heroQueries.server";
import type { HomePageItemOrchestrator, AboutContentData } from "@/types/home";
import { generateMetadata } from "@/lib/utils/seo";

export const revalidate = 60;

export default async function HomePage() {
  let homepageItems: HomePageItemOrchestrator[] = [];
  let aboutContent: AboutContentData | null = null;
  let heroContent = null;

  try {
    [homepageItems, aboutContent, heroContent] = await Promise.all([
      getHomepageItems(),
      getAboutContent(),
      getHeroContent(),
    ]);
  } catch (e) {
    console.error("Error fetching homepage data:", e);
  }

  return (
    <div className="relative">
      <Home
        homepageItemsData={homepageItems}
        aboutContentData={aboutContent}
        heroContentData={heroContent}
      />
    </div>
  );
}

export const metadata = generateMetadata({
  title: "Home",
  description:
    "Discover our latest collections: production-ready sets curated for the modern wardrobe.",
  keywords: ["online store", "fashion", "premium", "collections"],
  canonicalUrl: "/",
});
