"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  playbackRate?: number;
  autoPlay?: boolean;
};

export const LazyVideo = ({
  src,
  poster,
  className,
  playbackRate = 1,
  autoPlay = true,
}: Props) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.loaded = "false";

    const load = () => {
      if (el.dataset.loaded === "true") return;
      el.dataset.loaded = "true";
      el.src = src;
      el.load();
      if (autoPlay) el.play().catch(() => {});
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            load();
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "50% 0px" },
    );

    io.observe(el);

    const handleVisibility = () => {
      if (document.hidden) el.pause();
      else if (autoPlay && el.dataset.loaded === "true") el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      className={className}
      suppressHydrationWarning
    />
  );
};
