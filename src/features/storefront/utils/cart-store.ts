'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CartItem, Product, ProductColor } from '../api/types';

type CartState = {
  items: CartItem[];
  addItem: (params: {
    product: Product;
    size: string;
    color: ProductColor;
    quantity?: number;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
};

function buildCartItemId(productId: string, size: string, colorId: string) {
  return `${productId}-${size}-${colorId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: ({ product, size, color, quantity = 1 }) => {
        const id = buildCartItemId(product.id, size, color.id);
        const existing = get().items.find((i) => i.id === id);
        const image = product.images[0];

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + quantity } : i
            )
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              id,
              product_id: product.id,
              variant_id: `${product.id}-${color.id}-${size}`,
              slug: product.slug,
              name: product.name,
              size,
              color: color.name,
              color_hex: color.hex,
              price: product.price,
              quantity,
              image_url: image?.url ?? ''
            }
          ]
        });
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
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    }),
    { name: 'sukoon-cart' }
  )
);
