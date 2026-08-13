'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CLIENT_COMMERCE } from './client-commerce';

type WishlistState = {
  productIds: string[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      toggle: (productId) => {
        const exists = get().productIds.includes(productId);
        set({
          productIds: exists
            ? get().productIds.filter((id) => id !== productId)
            : [...get().productIds, productId]
        });
      },
      has: (productId) => get().productIds.includes(productId),
      count: () => get().productIds.length
    }),
    {
      name: CLIENT_COMMERCE.wishlistStorageKey,
      version: CLIENT_COMMERCE.storageVersion,
      partialize: (state) => ({ productIds: state.productIds }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
