"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, Minus, Plus, Trash2, ArrowRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

/* ─── Loading skeleton ───────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-40 md:py-10 animate-pulse">
      <div className="h-7 w-36 bg-gray-200 rounded-xl mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-28" />
        ))}
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyCart() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center pb-24">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <ShoppingBag size={32} className="text-gray-300" />
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-sm text-gray-400 mb-7 max-w-xs">
        Looks like you haven't added anything yet. Browse our products and find something you love.
      </p>
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-gray-700 transition"
      >
        Browse Products <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ─── Qty stepper ────────────────────────────────────────────────────────── */
function QtyStepper({ qty, onDec, onInc, maxed }) {
  return (
    <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onDec}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
      >
        <Minus size={13} />
      </button>
      <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
      <button
        onClick={onInc}
        disabled={maxed}
        className={`w-8 h-8 flex items-center justify-center transition ${maxed ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

/* ─── Cart item card ─────────────────────────────────────────────────────── */
function CartItem({ item, selected, onToggle, onRemove, onDec, onInc }) {
  const itemId = String(item._id);
  const discount = item.discountPrice > 0 && item.discountPrice < item.price;
  const pct = discount ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : 0;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${selected ? "border-gray-900 shadow-sm" : "border-gray-100"}`}>
      <div className="flex gap-3 p-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(itemId)}
          className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
            selected ? "bg-gray-900 border-gray-900" : "border-gray-300 bg-white"
          }`}
        >
          {selected && <Check size={11} strokeWidth={3} className="text-white" />}
        </button>

        {/* Image */}
        <Link href={`/collections/${itemId}`} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={item.images?.[0] || item.thumbnail || "/fallback.png"}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
          {pct > 0 && (
            <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              -{pct}%
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link href={`/collections/${itemId}`}>
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:underline">
                {item.title}
              </h3>
            </Link>
            <p className="text-[11px] text-gray-400 mt-0.5">{item.category}</p>
          </div>

          {/* Price + controls row */}
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-base font-black text-gray-900">৳{item.discountedPrice}</span>
              {discount && (
                <span className="text-xs text-gray-400 line-through ml-1.5">৳{item.price}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <QtyStepper
                qty={item.qty}
                onDec={() => onDec(itemId)}
                onInc={() => onInc(itemId)}
                maxed={item.qty >= item.stock}
              />
              <button
                onClick={() => onRemove(itemId)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Line total — only show when selected */}
      {selected && (
        <div className="px-3.5 py-2 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
          <span className="text-xs text-gray-400">{item.qty} × ৳{item.discountedPrice}</span>
          <span className="text-sm font-black text-gray-900">৳{(item.discountedPrice * item.qty).toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, updateQty, removeItem } = useCart();
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  /* Fetch products */
  useEffect(() => {
    if (!user?.uid || cart.length === 0) { setProducts([]); return; }
    const ids = cart.map((item) => (typeof item === "string" ? item : item.id));
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(console.error);
  }, [cart, user?.uid]);

  /* Merge products + cart qty */
  const merged = useMemo(() =>
    products.map((p) => {
      const item = cart.find((c) =>
        typeof c === "string" ? c === String(p._id) : c.id === String(p._id)
      );
      const qty = typeof item === "string" ? 1 : item?.qty || 1;
      return { ...p, qty, discountedPrice: p.discountPrice > 0 ? p.discountPrice : p.price };
    }),
  [products, cart]);

  const allSelected = merged.length > 0 && selectedItems.length === merged.length;
  const toggleSelectAll = () =>
    setSelectedItems(allSelected ? [] : merged.map((p) => String(p._id)));
  const toggleSelect = (id) =>
    setSelectedItems((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleRemove = async (id) => {
    await removeItem(id);
    setSelectedItems((prev) => prev.filter((x) => x !== id));
  };

  const subtotal = merged.reduce(
    (acc, item) => selectedItems.includes(String(item._id)) ? acc + item.discountedPrice * item.qty : acc,
    0
  );
  const selectedCount = selectedItems.length;

  if (loading) return <Skeleton />;
  if (!user?.uid || merged.length === 0) return <EmptyCart />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 leading-tight">Shopping Cart</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{merged.length} item{merged.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Select all */}
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${allSelected ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
              {allSelected && <Check size={11} strokeWidth={3} className="text-white" />}
            </div>
            Select All
          </button>
        </div>

        {/* ── Two-col on desktop ── */}
        <div className="grid lg:grid-cols-3 gap-5 pb-40 lg:pb-12">

          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {merged.map((item) => (
              <CartItem
                key={String(item._id)}
                item={item}
                selected={selectedItems.includes(String(item._id))}
                onToggle={toggleSelect}
                onRemove={handleRemove}
                onDec={(id) => updateQty(id, -1)}
                onInc={(id) => updateQty(id, 1)}
              />
            ))}

            <Link href="/collections" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mt-2 w-fit">
              <ChevronLeft size={14} /> Continue Shopping
            </Link>
          </div>

          {/* ── Desktop summary ── */}
          <div className="hidden lg:block sticky top-24 h-fit">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-500">
                  <span>Selected</span>
                  <span className="font-semibold text-gray-900">{selectedCount} item{selectedCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">৳{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-gray-900">৳{subtotal.toFixed(0)}</span>
              </div>

              {selectedCount === 0 ? (
                <button disabled className="w-full py-3.5 rounded-2xl bg-gray-200 text-gray-400 font-semibold text-sm cursor-not-allowed">
                  Select items to checkout
                </button>
              ) : (
                <Link href={`/checkout?items=${selectedItems.join(",")}`}>
                  <button className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight size={15} />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky checkout bar (above bottom nav) ── */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-40 px-3 pb-2">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400 leading-none mb-0.5">
              {selectedCount > 0 ? `${selectedCount} item${selectedCount !== 1 ? "s" : ""} selected` : "No items selected"}
            </p>
            <p className="text-xl font-black text-gray-900 leading-none">৳{subtotal.toFixed(0)}</p>
          </div>

          {selectedCount === 0 ? (
            <button disabled className="flex-shrink-0 px-6 py-3 rounded-xl bg-gray-200 text-gray-400 font-bold text-sm cursor-not-allowed">
              Checkout
            </button>
          ) : (
            <Link href={`/checkout?items=${selectedItems.join(",")}`} className="flex-shrink-0">
              <button className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition flex items-center gap-1.5">
                Checkout <ArrowRight size={13} />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
