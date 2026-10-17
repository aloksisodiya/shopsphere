import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

function readStoredCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (product, quantity = 1) =>
    setItems((prev) => {
      const max = Math.max(product.stock, 0);
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, product: { ...i.product, stock: product.stock }, quantity: Math.min(i.quantity + quantity, max) }
            : i
        );
      }
      const { id, name, price, imageUrl, stock } = product;
      return [...prev, { product: { id, name, price, imageUrl, stock }, quantity: Math.min(quantity, max) }];
    });

  const setQuantity = (productId, quantity) =>
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.product.stock)) }
          : i
      )
    );

  const remove = (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId));
  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    return { items, count, subtotal, add, setQuantity, remove, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
