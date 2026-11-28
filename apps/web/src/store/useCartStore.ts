import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  key: string; // productId + wood + finish + fabric
  productId: string;
  slug: string;
  name: string;
  sku: string;
  primaryImage: string;
  price: number;
  woodName?: string;
  finishName?: string;
  fabricName?: string;
  qty: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "key" | "qty">) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        const key = `${item.productId}::${item.woodName || ""}::${item.finishName || ""}::${item.fabricName || ""}`;
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, qty: i.qty + 1 } : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [{ ...item, key, qty: 1 }, ...get().items],
            isOpen: true,
          });
        }
      },

      removeItem: (key) =>
        set({ items: get().items.filter((i) => i.key !== key) }),

      updateQty: (key, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
        } else {
          set({
            items: get().items.map((i) => (i.key === key ? { ...i, qty } : i)),
          });
        }
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "sc-cart",
      version: 1,
      partialize: (state) => ({ items: state.items }),
    }
  )
);
