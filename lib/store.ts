import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  itemCount: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (i) => i.id === item.id && i.size === item.size
        );

        if (existingItemIndex !== -1) {
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...items, item] });
        }
      },
      
      removeItem: (id, size) => {
        const { items } = get();
        set({
          items: items.filter(
            (item) => !(item.id === id && item.size === size)
          ),
        });
      },
      
      updateQuantity: (id, quantity, size) => {
        const { items } = get();
        const updatedItems = items.map((item) => {
          if (item.id === id && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ items: updatedItems });
      },
      
      clearCart: () => set({ items: [] }),
      
      itemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      totalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
    }
  )
); 