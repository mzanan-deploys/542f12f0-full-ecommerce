import { StateCreator } from 'zustand';
import type { Store, SetType, HomeTypeSlice } from '@/types/store';

const SESSION_STORAGE_KEY = 'homeSelectedType';
const DEFAULT_TYPE: SetType = 'DAY';

export const createHomeTypeSlice: StateCreator<
  Store,
  [],
  [],
  HomeTypeSlice
> = (set, get) => ({
  selectedHomeType: DEFAULT_TYPE,
  setSelectedHomeType: (type) => {
    set({ selectedHomeType: type });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, type);
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
    }
  },
  initializeHomeType: () => {
    if (typeof window !== 'undefined') {
      try {
        const storedType = localStorage.getItem(SESSION_STORAGE_KEY) as SetType;
        
        if (storedType === 'DAY' || storedType === 'NIGHT') {
          if (storedType !== get().selectedHomeType) {
            set({ selectedHomeType: storedType });
          }
        } else {
          set({ selectedHomeType: 'DAY' });
          localStorage.setItem(SESSION_STORAGE_KEY, 'DAY');
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }
    }
  },
}); 