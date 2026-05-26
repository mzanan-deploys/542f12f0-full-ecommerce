import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CacheStore, CacheEntry } from '@/types/ui';



const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const useCacheStore = create<CacheStore>()(
  persist(
    (set, get): CacheStore => ({
      cache: {},
      
      set: <T>(key: string, data: T, ttl = DEFAULT_TTL) => {
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: {
              data,
              timestamp: Date.now(),
              ttl,
            },
          },
        }));
      },
      
      get: <T>(key: string): T | null => {
        const entry = get().cache[key];
        if (!entry) return null;
        
        if (get().isExpired(key)) {
          get().remove(key);
          return null;
        }
        
        return entry.data as T;
      },
      
      remove: (key: string) => {
        set((state) => {
          const newCache = { ...state.cache };
          delete newCache[key];
          return { cache: newCache };
        });
      },
      
      clear: () => {
        set({ cache: {} });
      },
      
      isExpired: (key: string) => {
        const entry = get().cache[key];
        if (!entry) return true;
        return Date.now() - entry.timestamp > entry.ttl;
      },
      
      cleanup: () => {
        const cache = get().cache;
        const newCache: Record<string, CacheEntry> = {};
        
        Object.entries(cache).forEach(([key, entry]) => {
          if (Date.now() - entry.timestamp <= entry.ttl) {
            newCache[key] = entry;
          }
        });
        
        set({ cache: newCache });
      },
    }),
    {
      name: 'store-cache',
      partialize: (state) => ({ cache: state.cache }),
    }
  )
);

// Cleanup expired entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    useCacheStore.getState().cleanup();
  }, 10 * 60 * 1000);
} 