import { create } from "zustand";

export interface MobileCartItem {
  id: string;
  productId: string;
  title: string;
  priceToman: number;
  quantity: number;
  sellerName: string;
  variantLabel?: string;
}

interface CartState {
  items: MobileCartItem[];
  addItem: (item: MobileCartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [
    {
      id: "cart-1",
      productId: "prod-rc-cat-adult",
      title: "غذای خشک گربه بالغ رویال کنین مدل فیت ۳۲",
      priceToman: 2190000,
      quantity: 1,
      sellerName: "پت‌شاپ نیاوران",
      variantLabel: "۲ کیلوگرم",
    },
  ],

  addItem: (newItem) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === newItem.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
          ),
        };
      }
      return { items: [...state.items, newItem] };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, delta) =>
    set((state) => ({
      items: state.items
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as MobileCartItem[],
    })),

  clearCart: () => set({ items: [] }),
}));
