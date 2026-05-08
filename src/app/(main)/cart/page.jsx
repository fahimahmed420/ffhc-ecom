"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= CHECKED ITEMS =================
  const [selectedItems, setSelectedItems] = useState([]);

  // ================= LOAD CART =================
  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("cart")) || [];

    setCart(stored);
  }, []);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    if (cart.length === 0) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const ids = cart.map((item) =>
          typeof item === "string"
            ? item
            : item.id,
        );

        const res = await fetch(
          `/api/products?ids=${ids.join(",")}`,
        );

        const data = await res.json();

        setProducts(data.products || []);

        // ✅ IMPORTANT:
        // DO NOT AUTO SELECT ITEMS
        // This keeps all unchecked on reload
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [cart]);

  // ================= HELPERS =================
  const getQty = (id) => {
    const item = cart.find((c) =>
      typeof c === "string"
        ? c === id
        : c.id === id,
    );

    return typeof item === "string"
      ? 1
      : item?.qty || 1;
  };

  // ================= UPDATE QTY =================
  const updateQty = (id, delta) => {
    const updated = cart.map((item) => {
      if (typeof item === "string") {
        if (item === id) {
          return {
            id,
            qty: Math.max(1, 1 + delta),
          };
        }

        return item;
      }

      if (item.id === id) {
        return {
          ...item,
          qty: Math.max(1, item.qty + delta),
        };
      }

      return item;
    });

    // ✅ ONLY UPDATE CART
    // DO NOT TOUCH selectedItems
    setCart(updated);

    localStorage.setItem(
      "cart",
      JSON.stringify(updated),
    );
  };

  // ================= REMOVE ITEM =================
  const removeItem = (id) => {
    const updated = cart.filter((item) =>
      typeof item === "string"
        ? item !== id
        : item.id !== id,
    );

    setCart(updated);

    localStorage.setItem(
      "cart",
      JSON.stringify(updated),
    );

    // remove from selected items too
    setSelectedItems((prev) =>
      prev.filter((itemId) => itemId !== id),
    );
  };

  // ================= MERGE =================
  const merged = useMemo(() => {
    return products.map((p) => {
      const qty = getQty(p._id);

      const discountedPrice =
        p.discountPrice > 0
          ? p.discountPrice
          : p.price;

      return {
        ...p,
        qty,
        discountedPrice,
      };
    });
  }, [products, cart]);

  // ================= SELECT ITEM =================
  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    );
  };

  // ================= SELECT ALL =================
  const allSelected =
    merged.length > 0 &&
    selectedItems.length === merged.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        merged.map((p) => p._id),
      );
    }
  };

  // ================= SUBTOTAL =================
  const subtotal = merged.reduce((acc, item) => {
    if (!selectedItems.includes(item._id))
      return acc;

    return (
      acc +
      item.discountedPrice * item.qty
    );
  }, 0);

  // ================= UI =================
  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400">
        Loading your cart...
      </div>
    );
  }

  // ================= EMPTY =================
  if (merged.length === 0) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-3xl font-semibold mb-5">
          Your cart feels lonely 🛒
        </h2>

        <Link
          href="/collections"
          className="inline-flex px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-14">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">

        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Shopping Cart
          </h1>

          <p className="text-gray-500 mt-2">
            {merged.length} items in your cart
          </p>
        </div>

        {/* SELECT ALL */}
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-3 text-sm font-medium"
        >
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition ${
              allSelected
                ? "bg-black border-black text-white"
                : "border-gray-300 bg-white"
            }`}
          >
            {allSelected && (
              <Check size={14} />
            )}
          </div>

          Select All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">

        {/* ITEMS */}
        <div className="lg:col-span-2 space-y-5">

          {merged.map((item) => {
            const isSelected =
              selectedItems.includes(item._id);

            return (
              <motion.div
                key={item._id}
                whileHover={{ y: -2 }}
                className={`group relative flex gap-5 p-5 rounded-3xl border transition-all duration-300 ${
                  isSelected
                    ? "border-black shadow-lg bg-white"
                    : "border-gray-200 bg-gray-50/60"
                }`}
              >

                {/* CHECKBOX */}
                <button
                  onClick={() =>
                    toggleSelect(item._id)
                  }
                  className={`mt-1 min-w-5 h-5 rounded border flex items-center justify-center transition ${
                    isSelected
                      ? "bg-black border-black text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check size={13} />
                  )}
                </button>

                {/* IMAGE */}
                <Link
                  href={`/collections/${item._id}`}
                  className="relative w-28 h-28 rounded-2xl overflow-hidden bg-white border border-gray-100"
                >
                  <Image
                    src={
                      item.images?.[0] ||
                      item.thumbnail ||
                      "/fallback.png"
                    }
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </Link>

                {/* CONTENT */}
                <div className="flex-1">

                  <Link
                    href={`/collections/${item._id}`}
                  >
                    <h3 className="font-semibold text-lg line-clamp-2 hover:underline">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.category}
                  </p>

                  {/* PRICE */}
                  <div className="flex items-center gap-3 mt-4">

                    <span className="text-2xl font-bold">
                      $
                      {item.discountedPrice.toFixed(
                        2,
                      )}
                    </span>

                    {item.discountPrice > 0 && (
                      <span className="line-through text-gray-400">
                        ${item.price}
                      </span>
                    )}
                  </div>

                  {/* QTY */}
                  <div className="flex items-center gap-3 mt-5">

                    <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">

                      <button
                        onClick={() =>
                          updateQty(
                            item._id,
                            -1,
                          )
                        }
                        className="w-10 h-10 hover:bg-gray-100 transition"
                      >
                        −
                      </button>

                      <span className="w-10 text-center font-semibold">
                        {item.qty}
                      </span>

                      <button
                        onClick={() =>
                          updateQty(
                            item._id,
                            1,
                          )
                        }
                        className="w-10 h-10 hover:bg-gray-100 transition"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(item._id)
                      }
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="flex flex-col items-end justify-between">

                  <p className="text-xl font-bold">
                    $
                    {(
                      item.discountedPrice *
                      item.qty
                    ).toFixed(2)}
                  </p>

                  {!isSelected && (
                    <span className="text-xs text-gray-400">
                      Not selected
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="sticky top-24 h-fit">

          <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-xl">

            <h2 className="text-2xl font-bold mb-8">
              Order Summary
            </h2>

            {/* SELECTED */}
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Selected Items</span>

              <span className="font-semibold">
                {selectedItems.length}
              </span>
            </div>

            {/* SUBTOTAL */}
            <div className="flex justify-between items-end border-t border-b py-6 mb-6">

              <span className="text-lg font-medium">
                Subtotal
              </span>

              <span className="text-4xl font-black tracking-tight">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* CHECKOUT */}
            <Link href="/checkout">
              <button
                disabled={
                  selectedItems.length === 0
                }
                className="w-full py-4 rounded-2xl bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Proceed to Checkout →
              </button>
            </Link>

            {/* CONTINUE */}
            <Link
              href="/collections"
              className="block text-center mt-5 text-sm text-gray-500 hover:text-black transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}