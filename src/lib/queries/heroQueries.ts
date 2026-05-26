import { useQuery } from "@tanstack/react-query";
import { HERO_CONTENT_ID } from "@/lib/schemas/heroSchema";
import type { HeroDbRow } from "@/types/hero";

async function fetchHeroContent(): Promise<HeroDbRow | null> {
  const res = await fetch("/api/hero-content", { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to load hero content (${res.status})`);
  }
  return (await res.json()) as HeroDbRow | null;
}

export function useHeroContent() {
  return useQuery<HeroDbRow | null, Error>({
    queryKey: ["heroContent", HERO_CONTENT_ID],
    queryFn: fetchHeroContent,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
