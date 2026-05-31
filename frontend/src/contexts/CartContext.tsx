import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, itemType: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("utv_cart");
    return stored ? JSON.parse(stored) : [];
  });

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("utv_cart", JSON.stringify(newItems));
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.item_id === item.item_id && i.item_type === item.item_type);
      let newItems: CartItem[];
      if (existing) {
        newItems = prev.map((i) =>
          i.item_id === item.item_id && i.item_type === item.item_type
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        newItems = [...prev, item];
      }
      localStorage.setItem("utv_cart", JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const removeItem = useCallback((itemId: string, itemType: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => !(i.item_id === itemId && i.item_type === itemType));
      localStorage.setItem("utv_cart", JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("utv_cart");
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
