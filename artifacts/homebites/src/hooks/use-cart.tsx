import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { OrderItem } from "@workspace/api-client-react";

interface CartContextType {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (kind: "dish" | "product", refId: number) => void;
  updateQty: (kind: "dish" | "product", refId: number, quantity: number) => void;
  clear: () => void;
  totals: {
    subtotal: number;
    count: number;
  };
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "homebites_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load cart", err);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (newItem: OrderItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.kind === newItem.kind && i.refId === newItem.refId
      );
      if (existing) {
        return prev.map((i) =>
          i.kind === newItem.kind && i.refId === newItem.refId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (kind: "dish" | "product", refId: number) => {
    setItems((prev) => prev.filter((i) => !(i.kind === kind && i.refId === refId)));
  };

  const updateQty = (kind: "dish" | "product", refId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(kind, refId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.kind === kind && i.refId === refId ? { ...i, quantity } : i
      )
    );
  };

  const clear = () => setItems([]);

  const totals = {
    subtotal: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clear, totals }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
