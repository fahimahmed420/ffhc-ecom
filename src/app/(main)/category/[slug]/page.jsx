"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronDown, SlidersHorizontal } from "lucide-react";

const categoryMap = {
  "glamour-and-beauty": "Glamour & Beauty",
  "intimate-and-personal-care": "Intimate & Personal Care",
  "auto-parts": "Auto Parts",
  fashion: "Fashion",
  "tools-and-hardware": "Tools & Hardware",
  stationery: "Stationery",
  "mother-and-baby": "Mother & Baby",
  "travel-and-accessories": "Travel & Accessories",
  "home-and-kitchen": "Home & Kitchen",
};

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const categoryName = categoryMap[slug] || "All";

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSort, setShowSort] = useState(false);

  const loaderRef = useRef(null);
  const fetching = useRef(false);

  const fetchProducts = useCallback(
    async (reset = false) => {
      if (fetching.current) return;
      fetching.current = true;
      setLoading(true);
      try {
        const currentPage = reset ? 0 : page;
        const res = await fetch(
          `/api/products?category=${encodeURIComponent(categoryName)}&page=${currentPage}&limit=12&sort=${sort}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        const newProducts = data.products || [];
        setProducts((prev) => reset ? newProducts : [...prev, ...newProducts]);
        setHasMore(Boolean(data.hasMore));
      } catch (err) { console.error(err); }
      setLoading(false);
      setInitialLoading(false);
      fetching.current = false;
    },
    [categoryName, page, sort]
  );

  useEffect(() => {
    setProducts([]); setPage(0); setHasMore(true); setInitialLoading(true);
    fetchProducts(true);
  }, [categoryName, sort]);

  useEffect(() => { if (page > 0) fetchProducts(); }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !fetching.current) setPage((p) => p + 1);
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  const SORT_LABELS = { default: "Newest", asc: "Price: Low → High", desc: "Price: High → Low" };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">

        {/* Header */}
        <div className="py-4 md:py-8">
          <Link href="/collections" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition mb-3">
            <ChevronLeft size={13} /> All Products
          </Link>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-gray-900">{categoryName}</h1>
              {!initialLoading && (
                <p className="text-xs text-gray-400 mt-0.5">{products.length} products</p>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSort((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-gray-400 transition"
              >
                <SlidersHorizontal size={13} />
                {SORT_LABELS[sort]}
                <ChevronDown size={12} className={`transition ${showSort ? "rotate-180" : ""}`} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
                  {Object.entries(SORT_LABELS).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => { setSort(val); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition ${sort === val ? "bg-gray-900 text-white" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        {initialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-3">🛍️</p>
            <h2 className="text-lg font-bold text-gray-800 mb-1">No products yet</h2>
            <p className="text-sm text-gray-400 mb-6">Check back soon — we're adding more products regularly.</p>
            <Link href="/collections" className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => {
              const final = product.discountPrice > 0 ? product.discountPrice : product.price;
              const discount = product.discountPrice > 0 && product.price > product.discountPrice
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0;

              return (
                <Link key={product._id} href={`/collections/${product._id}`} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <Image
                        src={product.images?.[0] || product.thumbnail || "/fallback.png"}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-400"
                        sizes="(max-width:640px) 50vw, 25vw"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-2">{product.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">৳{Number(final).toFixed(0)}</span>
                        {discount > 0 && (
                          <span className="text-[11px] text-gray-400 line-through">৳{Number(product.price).toFixed(0)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

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
