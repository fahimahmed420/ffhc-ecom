"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // prevent duplicate fetch
  const [initialized, setInitialized] = useState(false);

  // ======================================================
  // FETCH CART
  // ======================================================
  const fetchCart = useCallback(async () => {
    if (!user?.uid) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/cart?userId=${user.uid}`);
      const data = await res.json();

      if (data.success) {
        setCart(data.cart || []);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ======================================================
  // SYNC CART TO DB
  // ======================================================
  const syncCart = async (updatedCart) => {
    if (!user?.uid) return;

    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          items: updatedCart,
        }),
      });
    } catch (err) {
      console.error("Cart sync error:", err);
    }
  };

  // ======================================================
  // ADD TO CART
  // ======================================================
  const addToCart = async (productId) => {
    if (!user?.uid) return;

    setCart((prev) => {
      const exists = prev.find((item) =>
        typeof item === "string"
          ? item === productId
          : item.id === productId
      );

      if (exists) return prev;

      const updated = [...prev, { id: productId, qty: 1 }];

      syncCart(updated);

      return updated;
    });
  };

  // ======================================================
  // REMOVE ITEM
  // ======================================================
  const removeItem = async (productId) => {
    setCart((prev) => {
      const updated = prev.filter((item) =>
        typeof item === "string"
          ? item !== productId
          : item.id !== productId
      );

      syncCart(updated);

      return updated;
    });
  };

  // ======================================================
  // UPDATE QTY
  // ======================================================
  const updateQty = async (productId, delta) => {
    setCart((prev) => {
      const updated = prev.map((item) => {
        if (typeof item === "string") {
          if (item === productId) {
            return { id: productId, qty: Math.max(1, 1 + delta) };
          }
          return item;
        }

        if (item.id === productId) {
          return {
            ...item,
            qty: Math.max(1, item.qty + delta),
          };
        }

        return item;
      });

      syncCart(updated);

      return updated;
    });
  };

  // ======================================================
  // CLEAR CART
  // ======================================================
  const clearCart = async () => {
    setCart([]);
    await syncCart([]);
  };

  // ======================================================
  // CART COUNT
  // ======================================================
  const cartCount = cart.reduce((acc, item) => {
    if (typeof item === "string") return acc + 1;
    return acc + (item.qty || 1);
  }, 0);

  // ======================================================
  // CONTEXT VALUE
  // ======================================================
  const value = {
    cart,
    loading,
    initialized,

    addToCart,
    removeItem,
    updateQty,
    clearCart,

    cartCount,
    refetchCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ======================================================
// HOOK
// ======================================================
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};