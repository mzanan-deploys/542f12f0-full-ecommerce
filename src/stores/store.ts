import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCartSlice } from './cartStore';
import { createHomeTypeSlice } from './homeTypeStore';
import type { Store, State } from '@/types/store';

export type { Store };

export const defaultInitState: State = {
  count: 0,
};

export const createStore = (initState: State = defaultInitState) => {
  return create<Store>()(
    persist(
      (set, get, api) => ({
    ...createCartSlice(set, get, api),
    ...createHomeTypeSlice(set, get, api),
    ...initState,
        _isHydrated: false,
        increment: (qty) => set((old) => ({ count: old.count + qty })),
        decrement: (qty) => set((old) => ({ count: old.count - qty })),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          cartItems: state.cartItems,
          isCartSidebarOpen: state.isCartSidebarOpen,
        }),
      }
    )
  );
}; 