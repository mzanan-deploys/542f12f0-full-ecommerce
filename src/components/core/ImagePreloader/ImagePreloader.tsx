"use client";

import { useEffect, useRef, useState } from "react";

import { useImagePreloader } from "@/hooks/useImagePreloader";

interface ImagePreloaderProps {
  enabled?: boolean;
}

export default function ImagePreloader({ enabled = true }: ImagePreloaderProps) {
  const [allImageUrls, setAllImageUrls] = useState<string[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const controller = new AbortController();

    fetch("/api/image-preload", { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((urls: string[]) => {
        const unique = Array.from(new Set(urls)).filter(
          (url) =>
            url &&
            typeof url === "string" &&
            url.trim() !== "" &&
            !url.includes("placeholder"),
        );
        setAllImageUrls(unique);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error preloading images:", err);
        }
      });

    return () => controller.abort();
  }, [enabled]);

  useImagePreloader(allImageUrls, { enabled: allImageUrls.length > 0, priority: true });

  return null;
}
