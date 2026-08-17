'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CLIENT_COMMERCE } from './client-commerce';

const MAX_RECENT = 8;

type RecentlyViewedState = {
  productIds: string[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  track: (productId: string) => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      track: (productId) => {
        if (!productId) return;
        set((state) => ({
          productIds: [productId, ...state.productIds.filter((id) => id !== productId)].slice(
            0,
            MAX_RECENT
          )
        }));
      }
    }),
    {
      name: CLIENT_COMMERCE.recentlyViewedStorageKey,
      version: CLIENT_COMMERCE.storageVersion,
      partialize: (state) => ({ productIds: state.productIds }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
