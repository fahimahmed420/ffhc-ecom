"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({
  children,
}) => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);

  const [selectedItems, setSelectedItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [initialized, setInitialized] =
    useState(false);

  /* ======================================================
     FETCH CART
  ====================================================== */

  const fetchCart = useCallback(
    async () => {
      if (!user?.uid) {
        setCart([]);
        setSelectedItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `/api/cart?userId=${user.uid}`,
        );

        const data = await res.json();

        if (data.success) {
          setCart(data.cart || []);
        }
      } catch (err) {
        console.error(
          "Cart fetch error:",
          err,
        );

        toast.error(
          "Failed to load cart",
        );
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [user?.uid],
  );

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ======================================================
     CLEAN INVALID SELECTED ITEMS
  ====================================================== */

  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) =>
        cart.some((item) =>
          typeof item === "string"
            ? item === id
            : item.id === id,
        ),
      ),
    );
  }, [cart]);

  /* ======================================================
     SYNC CART
  ====================================================== */

  const syncCart = async (
    updatedCart,
  ) => {
    if (!user?.uid) return;

    try {
      await fetch("/api/cart", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          userId: user.uid,
          items: updatedCart,
        }),
      });
    } catch (err) {
      console.error(
        "Cart sync error:",
        err,
      );

      toast.error(
        "Cart sync failed",
      );
    }
  };

  /* ======================================================
     ADD TO CART
  ====================================================== */

  const addToCart = async (
    productId,
  ) => {
    if (!user?.uid) {
      toast.error(
        "Please login first",
      );

      return false;
    }

    let added = false;

    setCart((prev) => {
      const exists = prev.find(
        (item) =>
          typeof item === "string"
            ? item === productId
            : item.id === productId,
      );

      if (exists) {
        return prev;
      }

      added = true;

      const updated = [
        ...prev,
        {
          id: productId,
          qty: 1,
        },
      ];

      syncCart(updated);

      return updated;
    });

    setTimeout(() => {
      if (added) {
        toast.success(
          "Added to cart 🛒",
        );
      } else {
        toast(
          "Already in cart",
        );
      }
    }, 0);

    return added;
  };

  /* ======================================================
     REMOVE ITEM
  ====================================================== */

  const removeItem = async (
    productId,
  ) => {
    if (!user?.uid) {
      toast.error(
        "Please login first",
      );

      return;
    }

    setCart((prev) => {
      const updated = prev.filter(
        (item) =>
          typeof item === "string"
            ? item !== productId
            : item.id !== productId,
      );

      syncCart(updated);

      return updated;
    });

    setSelectedItems((prev) =>
      prev.filter(
        (id) => id !== productId,
      ),
    );

    toast.success("Item removed");
  };

  /* ======================================================
     UPDATE QTY
  ====================================================== */

  const updateQty = async (
    productId,
    delta,
  ) => {
    if (!user?.uid) {
      toast.error(
        "Please login first",
      );

      return;
    }

    setCart((prev) => {
      const updated = prev.map(
        (item) => {
          if (
            typeof item === "string"
          ) {
            if (
              item === productId
            ) {
              return {
                id: productId,

                qty: Math.max(
                  1,
                  1 + delta,
                ),
              };
            }

            return item;
          }

          if (
            item.id === productId
          ) {
            return {
              ...item,

              qty: Math.max(
                1,
                item.qty + delta,
              ),
            };
          }

          return item;
        },
      );

      syncCart(updated);

      return updated;
    });

    toast.success(
      "Cart updated",
    );
  };

  /* ======================================================
     CLEAR CART
  ====================================================== */

  const clearCart = async () => {
    if (!user?.uid) {
      toast.error(
        "Please login first",
      );

      return;
    }

    setCart([]);

    setSelectedItems([]);

    await syncCart([]);

    toast.success("Cart cleared");
  };

  /* ======================================================
     SELECTED ITEMS HELPERS
  ====================================================== */

  const toggleSelectedItem = (
    productId,
  ) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter(
            (id) =>
              id !== productId,
          )
        : [...prev, productId],
    );
  };

  const clearSelectedItems =
    () => {
      setSelectedItems([]);
    };

  const selectAllItems = () => {
    const ids = cart.map((item) =>
      typeof item === "string"
        ? item
        : item.id,
    );

    setSelectedItems(ids);
  };

  /* ======================================================
     CART COUNT
  ====================================================== */

  const cartCount = cart.reduce(
    (acc, item) => {
      if (
        typeof item === "string"
      ) {
        return acc + 1;
      }

      return (
        acc + (item.qty || 1)
      );
    },
    0,
  );

  /* ======================================================
     CONTEXT VALUE
  ====================================================== */

  const value = {
    cart,
    selectedItems,

    loading,
    initialized,

    setSelectedItems,

    addToCart,
    removeItem,
    updateQty,
    clearCart,

    toggleSelectedItem,
    clearSelectedItems,
    selectAllItems,

    cartCount,

    refetchCart: fetchCart,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ======================================================
   HOOK
====================================================== */

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider",
    );
  }

  return context;
};