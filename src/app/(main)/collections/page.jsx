"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, SlidersHorizontal, Filter, X, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

function ProductCard({ product, wishlisted, onWishlist }) {
  const { cart, addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const isInCart = cart.some((item) =>
    typeof item === "string" ? item === product._id : item.id === product._id
  );

  const discount =
    product.discountPrice > 0 && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleCart = async (e) => {
    e.preventDefault();
    if (isInCart) return;
    try {
      setAdding(true);
      await addToCart(product._id);
      toast.success("Added to cart");
    } catch { toast.error("Failed"); }
    finally { setAdding(false); }
  };

  return (
    <Link href={`/collections/${product._id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={product.images?.[0] || product.thumbnail || "/fallback.png"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-400"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); onWishlist(product._id); }}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition"
          >
            <Heart
              size={13}
              className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[10px] text-gray-400 mb-0.5 truncate">{product.category}</p>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>
          <div className="flex items-center justify-between gap-1">
            <div>
              <span className="text-sm font-bold text-gray-900">৳{Number(finalPrice).toFixed(0)}</span>
              {discount > 0 && (
                <span className="text-[11px] text-gray-400 line-through ml-1.5">৳{Number(product.price).toFixed(0)}</span>
              )}
            </div>
            <button
              onClick={handleCart}
              disabled={isInCart || adding}
              className={`w-7 h-7 rounded-full flex items-center justify-center border transition shrink-0 ${
                isInCart
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-200 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900"
              }`}
            >
              {adding
                ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <ShoppingCart size={12} />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Collections() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const loaderRef = useRef(null);
  const fetchingRef = useRef(false);

  /* Wishlist */
  useEffect(() => {
    const w = localStorage.getItem("wishlist");
    if (w) setWishlist(JSON.parse(w));
  }, []);

  const toggleWishlist = (id) => {
    const updated = wishlist.includes(id)
      ? wishlist.filter((i) => i !== id)
      : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    toast(updated.includes(id) ? "Added to wishlist ❤️" : "Removed from wishlist");
  };

  /* Categories */
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  /* Fetch */
  const fetchProducts = useCallback(
    async (pageToLoad = 0, reset = false) => {
      if (fetchingRef.current) return;
      if (!hasMore && pageToLoad !== 0) return;
      fetchingRef.current = true;
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: pageToLoad.toString(), limit: "12",
          category: selectedCategory, sort: sortOrder, search,
        });
        const res = await fetch(`/api/products?${query}`);
        const data = await res.json();
        const newProducts = data.products || [];
        setProducts((prev) => {
          if (reset) return newProducts;
          const ids = new Set(prev.map((p) => p._id));
          return [...prev, ...newProducts.filter((p) => !ids.has(p._id))];
        });
        setHasMore(data.hasMore);
      } catch { toast.error("Failed to load products"); }
      finally { setLoading(false); setInitialLoading(false); fetchingRef.current = false; }
    },
    [selectedCategory, sortOrder, search, hasMore]
  );

  /* Reset on filter change */
  useEffect(() => {
    setProducts([]); setHasMore(true); setInitialLoading(true);
    fetchingRef.current = false; setPage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, sortOrder, search]);

  useEffect(() => { fetchProducts(page, page === 0); }, [page, fetchProducts]);

  /* Infinite scroll */
  useEffect(() => {
    if (initialLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !fetchingRef.current && products.length > 0)
          setPage((p) => p + 1);
      },
      { threshold: 0.2, rootMargin: "200px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, initialLoading, products.length]);

  const SORT_LABELS = { default: "Newest", asc: "Price: Low → High", desc: "Price: High → Low" };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">

        {/* ── Header ── */}
        <div className="py-4 md:py-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-gray-900">
              {search ? `"${search}"` : selectedCategory === "All" ? "All Products" : selectedCategory}
            </h1>
            {!initialLoading && (
              <p className="text-xs text-gray-400 mt-0.5">{products.length} products</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter button */}
            {!search && (
              <div className="relative">
                <button
                  onClick={() => { setShowFilter((v) => !v); setShowSort(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 bg-white border rounded-xl text-xs font-semibold transition ${
                    selectedCategory !== "All"
                      ? "border-gray-900 text-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <Filter size={13} />
                  {selectedCategory === "All" ? "Category" : selectedCategory}
                  <ChevronDown size={12} className={`transition ${showFilter ? "rotate-180" : ""}`} />
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-[180px] max-h-64 overflow-y-auto">
                    {[{ name: "All" }, ...categories.filter((c) => c.name !== "All")].map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => { setSelectedCategory(cat.name); setShowFilter(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition ${
                          selectedCategory === cat.name
                            ? "bg-gray-900 text-white"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sort button */}
            <div className="relative">
              <button
                onClick={() => { setShowSort((v) => !v); setShowFilter(false); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-gray-400 transition"
              >
                <SlidersHorizontal size={13} />
                {SORT_LABELS[sortOrder]}
                <ChevronDown size={12} className={`transition ${showSort ? "rotate-180" : ""}`} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
                  {Object.entries(SORT_LABELS).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => { setSortOrder(val); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition ${sortOrder === val ? "bg-gray-900 text-white" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Product grid ── */}
        {initialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 py-2">
            {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-lg font-bold text-gray-800 mb-2">No products found</h2>
            <p className="text-sm text-gray-400 mb-6">Try a different category or search term</p>
            <button
              onClick={() => { setSelectedCategory("All"); }}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 py-2">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                wishlisted={wishlist.includes(p._id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}

        {/* Loading spinner */}
        {loading && !initialLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <p className="text-center text-xs text-gray-400 py-8">All products loaded</p>
        )}

        <div ref={loaderRef} className="h-10" />
      </div>
    </div>
  );
}
