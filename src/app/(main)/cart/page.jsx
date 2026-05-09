"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= CHECKED ITEMS =================
  const [selectedItems, setSelectedItems] = useState([]);

  // ================= LOAD CART =================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
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
          typeof item === "string" ? item : item.id,
        );

        const res = await fetch(`/api/products?ids=${ids.join(",")}`);

        const data = await res.json();

        setProducts(data.products || []);
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
      typeof c === "string" ? c === id : c.id === id,
    );

    return typeof item === "string" ? 1 : item?.qty || 1;
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

    setCart(updated);

    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ================= REMOVE ITEM =================
  const removeItem = (id) => {
    const updated = cart.filter((item) =>
      typeof item === "string" ? item !== id : item.id !== id,
    );

    setCart(updated);

    localStorage.setItem("cart", JSON.stringify(updated));

    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  // ================= MERGE =================
  const merged = useMemo(() => {
    return products.map((p) => {
      const qty = getQty(p._id);

      const discountedPrice = p.discountPrice > 0 ? p.discountPrice : p.price;

      return {
        ...p,
        qty,
        discountedPrice,
      };
    });
  }, [products, cart]);

  // ================= SELECT =================
  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // ================= SELECT ALL =================
  const allSelected =
    merged.length > 0 && selectedItems.length === merged.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(merged.map((p) => p._id));
    }
  };

  // ================= SUBTOTAL =================
  const subtotal = merged.reduce((acc, item) => {
    if (!selectedItems.includes(item._id)) return acc;

    return acc + item.discountedPrice * item.qty;
  }, 0);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading your cart...
      </div>
    );
  }

  // ================= EMPTY =================
  if (merged.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>

        <h2 className="text-2xl md:text-4xl font-bold mb-3">
          Your cart feels lonely 🛒
        </h2>

        <p className="text-gray-500 mb-8 max-w-md">
          Discover premium products and add your favorites to the cart.
        </p>

        <Link
          href="/collections"
          className="inline-flex px-7 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6 md:py-10 pb-56 lg:pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Shopping Cart
          </h1>

          <p className="text-gray-500 mt-2 text-sm md:text-base">
            {merged.length} items in your cart
          </p>
        </div>

        {/* SELECT ALL */}
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-3 text-sm font-medium w-fit"
        >
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition ${
              allSelected
                ? "bg-black border-black text-white"
                : "border-gray-300 bg-white"
            }`}
          >
            {allSelected && <Check size={14} />}
          </div>

          Select All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 xl:gap-10">
        {/* ITEMS */}
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          {merged.map((item) => {
            const isSelected = selectedItems.includes(item._id);

            return (
              <motion.div
                key={item._id}
                whileHover={{ y: -2 }}
                className={`relative rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "border-black shadow-lg bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="p-4 sm:p-5">
                  {/* TOP */}
                  <div className="flex gap-3 sm:gap-5">
                    {/* CHECKBOX */}
                    <button
                      onClick={() => toggleSelect(item._id)}
                      className={`mt-1 min-w-5 h-5 rounded border flex items-center justify-center transition ${
                        isSelected
                          ? "bg-black border-black text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={13} />}
                    </button>

                    {/* IMAGE */}
                    <Link
                      href={`/collections/${item._id}`}
                      className="relative min-w-[90px] w-[90px] h-[90px] sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100"
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
                    <div className="flex-1 min-w-0">
                      <Link href={`/collections/${item._id}`}>
                        <h3 className="font-semibold text-sm sm:text-lg line-clamp-2 hover:underline">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {item.category}
                      </p>

                      {/* PRICE */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xl sm:text-2xl font-black">
                          ৳{item.discountedPrice.toFixed(2)}
                        </span>

                        {item.discountPrice > 0 && (
                          <span className="line-through text-gray-400 text-sm">
                            ৳{item.price}
                          </span>
                        )}
                      </div>

                      {/* CONTROLS */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                        {/* QTY */}
                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQty(item._id, -1)}
                            className="w-9 h-9 sm:w-10 sm:h-10 hover:bg-gray-100 transition text-lg"
                          >
                            -
                          </button>

                          <span className="w-10 text-center font-semibold text-sm sm:text-base">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => updateQty(item._id, 1)}
                            className="w-9 h-9 sm:w-10 sm:h-10 hover:bg-gray-100 transition text-lg"
                          >
                            +
                          </button>
                        </div>

                        {/* REMOVE */}
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM TOTAL */}
                  <div className="mt-5 pt-4 border-t flex items-center justify-between">
                    <div>
                      {!isSelected && (
                        <span className="text-xs text-gray-400">
                          Not selected
                        </span>
                      )}
                    </div>

                    <p className="text-lg sm:text-2xl font-black">
                      ৳{(item.discountedPrice * item.qty).toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* DESKTOP SUMMARY */}
        <div className="hidden lg:block sticky top-24 h-fit">
          <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-xl">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>

            <div className="flex justify-between mb-4 text-gray-600">
              <span>Selected Items</span>

              <span className="font-semibold">{selectedItems.length}</span>
            </div>

            <div className="flex justify-between items-end border-t border-b py-6 mb-6">
              <span className="text-lg font-medium">Subtotal</span>

              <span className="text-4xl font-black tracking-tight">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            <Link href="/checkout">
              <button
                disabled={selectedItems.length === 0}
                className="w-full py-4 rounded-2xl bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Proceed to Checkout →
              </button>
            </Link>

            <Link
              href="/collections"
              className="block text-center mt-5 text-sm text-gray-500 hover:text-black transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING SUMMARY */}
      <div className="lg:hidden fixed bottom-25 left-3 right-3 z-40">
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-4">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT */}
            <div className="min-w-0">
              <p className="text-xs text-gray-500">
                {selectedItems.length} item selected
              </p>

              <h3 className="text-2xl font-black truncate">
                ৳{subtotal.toFixed(2)}
              </h3>
            </div>

            {/* BUTTON */}
            <Link href="/checkout" className="w-[55%]">
              <button
                disabled={selectedItems.length === 0}
                className="w-full py-3 rounded-2xl bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}