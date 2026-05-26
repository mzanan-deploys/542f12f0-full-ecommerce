"use client";

import { type ReactNode, createContext, useRef, useContext, useEffect } from "react";
import { type StoreApi, useStore } from "zustand";
import { type Store, createStore, defaultInitState } from "@/stores/store";

export const StoreContext = createContext<StoreApi<Store> | null>(null);

export interface StoreProviderProps {
  children: ReactNode;
}

interface StoreWithPersistAPI extends StoreApi<Store> {
  persist: {
    onFinishHydration: (listener: (state: Store) => void) => () => void;
    hasHydrated: () => boolean;
  };
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<StoreApi<Store> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createStore(defaultInitState);
  }

  useEffect(() => {
    const store = storeRef.current;
    if (store) {
      store.getState().initializeHomeType();

      const storeWithPersist = store as StoreWithPersistAPI;

      if (storeWithPersist.persist && 
          typeof storeWithPersist.persist.onFinishHydration === 'function' && 
          typeof storeWithPersist.persist.hasHydrated === 'function') {
        
        let unsubFinishHydration: (() => void) | undefined;

        const handleHydration = () => {
          storeRef.current?.setState({ _isHydrated: true });
        };

        unsubFinishHydration = storeWithPersist.persist.onFinishHydration(handleHydration);

        const alreadyHydrated = storeWithPersist.persist.hasHydrated();
        if (alreadyHydrated) {
          handleHydration();
        }
        
        return () => {
          if (unsubFinishHydration) {
            unsubFinishHydration();
          }
        };
      } else {
        console.error(
          "[StoreProvider] Zustand persist API (onFinishHydration/hasHydrated) not found on store instance. " + 
          "The store will not be marked as hydrated by StoreProvider. " + 
          "Check persist middleware setup in store.ts."
        );
      }
    }
  }, []);

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export const useAppStore = <T,>(selector: (store: Store) => T): T => {
  const storeContext = useContext(StoreContext);

  if (!storeContext) {
    throw new Error(`useAppStore must be used within StoreProvider`);
  }

  return useStore(storeContext, selector);
}; 