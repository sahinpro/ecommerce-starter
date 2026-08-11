'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WishlistState = {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
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
    { name: 'sukoon-wishlist' }
  )
);
