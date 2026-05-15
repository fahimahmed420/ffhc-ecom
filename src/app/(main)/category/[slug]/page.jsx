"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// ===============================
// CATEGORY MAP (SAFE FIXED)
// ===============================
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

export default function CategoryPage() {
  const { slug } = useParams();

  const categoryName = categoryMap[slug] || "All";

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);
  const fetching = useRef(false);

  // ===============================
  // FETCH PRODUCTS (FIXED)
  // ===============================
  const fetchProducts = useCallback(
    async (reset = false) => {
      if (fetching.current) return;

      fetching.current = true;
      setLoading(true);

      try {
        const currentPage = reset ? 0 : page;

        const res = await fetch(
          `/api/products?category=${encodeURIComponent(
            categoryName
          )}&page=${currentPage}&limit=12&sort=${sort}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        const newProducts = data.products || [];

        setProducts((prev) =>
          reset ? newProducts : [...prev, ...newProducts]
        );

        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        console.error("Fetch error:", err);
      }

      setLoading(false);
      fetching.current = false;
    },
    [categoryName, page, sort]
  );

  // ===============================
  // RESET ON CATEGORY/SORT CHANGE
  // ===============================
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    fetchProducts(true);
  }, [categoryName, sort]);

  // ===============================
  // LOAD MORE
  // ===============================
  useEffect(() => {
    if (page === 0) return;
    fetchProducts();
  }, [page]);

  // ===============================
  // INFINITE SCROLL
  // ===============================
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !fetching.current) {
        setPage((p) => p + 1);
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  // ===============================
  // PRICE FORMAT
  // ===============================
  const getPrice = (p) => {
    const price = Number(p.price || 0);
    const discount = Number(p.discountPrice || 0);

    return {
      original: price,
      final: discount > 0 ? discount : price,
      hasDiscount: discount > 0,
    };
  };

  // ===============================
  // UI
  // ===============================
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-12 py-20">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          {categoryName}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {products.length} products found
        </p>
      </div>

      {/* SORT BAR */}
      <div className="flex justify-end mb-6">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 px-4 py-2 rounded-xl bg-white text-sm"
        >
          <option value="default">Newest</option>
          <option value="asc">Price: Low → High</option>
          <option value="desc">Price: High → Low</option>
        </select>
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const price = getPrice(product);

          return (
            <motion.div
              key={product._id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/collections/${product._id}`}>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition">

                  {/* IMAGE */}
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={
                        product.images?.[0] ||
                        product.thumbnail ||
                        "/fallback.png"
                      }
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium line-clamp-2 text-gray-800 min-h-[40px]">
                      {product.title}
                    </h3>

                    {/* PRICE */}
                    <div className="mt-3 flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        ৳{price.final.toFixed(0)}
                      </p>

                      {price.hasDiscount && (
                        <p className="text-xs text-gray-400 line-through">
                          ৳{price.original.toFixed(0)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center mt-10">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
        </div>
      )}

      {/* INFINITE SCROLL TRIGGER */}
      <div ref={loaderRef} className="h-10" />

      {/* EMPTY STATE */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-800">
            No products found
          </h2>
          <p className="text-gray-500 mt-2">
            Try another category or check back later
          </p>
        </div>
      )}
    </section>
  );
}