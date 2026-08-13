'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { findVariant } from '@/features/catalog/adapters';

import type { CartItem, Product, ProductColor } from '../api/types';
import { CLIENT_COMMERCE } from './client-commerce';

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addItem: (params: {
    product: Product;
    size: string;
    color: ProductColor;
    quantity?: number;
  }) => { ok: true } | { ok: false; error: string };
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  /** Distinct lines in the bag (header badge). */
  itemCount: () => number;
  /** Sum of quantities across all lines. */
  totalQuantity: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addItem: ({ product, size, color, quantity = 1 }) => {
        const variant = findVariant(product, size, color.id);
        if (!variant) {
          return { ok: false, error: 'Selected size and color are unavailable.' };
        }
        if (variant.stock_quantity < 1) {
          return { ok: false, error: 'This variant is out of stock.' };
        }

        const id = variant.id;
        const existing = get().items.find((i) => i.variant_id === variant.id);
        const nextQty = (existing?.quantity ?? 0) + quantity;
        if (nextQty > variant.stock_quantity) {
          return {
            ok: false,
            error: `Sorry, only ${variant.stock_quantity} items are available.`
          };
        }

        const image = product.images[0];
        const price = variant.price || product.price;

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variant_id === variant.id ? { ...i, quantity: nextQty } : i
            )
          });
          return { ok: true };
        }

        set({
          items: [
            ...get().items,
            {
              id,
              product_id: product.id,
              variant_id: variant.id,
              slug: product.slug,
              name: product.name,
              size,
              color: color.name,
              color_hex: color.hex,
              price,
              quantity,
              image_url: image?.url ?? ''
            }
          ]
        });
        return { ok: true };
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i))
        });
      },
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.length,
      totalQuantity: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    }),
    {
      name: CLIENT_COMMERCE.cartStorageKey,
      version: CLIENT_COMMERCE.storageVersion,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
