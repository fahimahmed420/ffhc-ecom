"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// ✅ CATEGORY MAP
const categoryMap = {
  "glamour-and-beauty": "Glamour & Beauty",
  "intimate-and-personal-care": "Intimate & Personal Care",
  "auto-parts": "Auto Parts",
  fashion: "Fashion",
  "tools-and-hardware": "Tools & Hardware",
  stationery: "Stationery",
  "mother-and-baby": "Mother & Baby",
  "travel-and-accessories": "Travel & Accessories",
  "home-and-kitchen": "Home & kitchen",
};

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();

  // ✅ Exact DB Category Name
  const categoryName = categoryMap[slug] || "All";

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);
  const fetching = useRef(false);

  // ===============================
  // FETCH PRODUCTS
  // ===============================
  const fetchProducts = useCallback(
    async (reset = false) => {
      if (fetching.current) return;

      fetching.current = true;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/products?category=${encodeURIComponent(
            categoryName,
          )}&page=${reset ? 0 : page}&limit=12&sort=${sort}`,
        );

        const data = await res.json();

        const newProducts = data.products || [];

        setProducts((prev) =>
          reset ? newProducts : [...prev, ...newProducts],
        );

        setHasMore(data.hasMore);
      } catch (err) {
        console.error("Fetch error:", err);
      }

      setLoading(false);
      fetching.current = false;
    },
    [categoryName, page, sort],
  );

  // ===============================
  // RESET WHEN CATEGORY/SORT CHANGES
  // ===============================
  useEffect(() => {
    setPage(0);
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
      if (entries[0].isIntersecting && hasMore) {
        setPage((p) => p + 1);
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-10">
    
      {/* PREMIUM BANNER */}
      <div className="relative overflow-hidden rounded-[32px] mb-8 md:mb-10">
        {/* BACKGROUND */}
        <div className="h-[220px] bg-gradient-to-br from-black via-gray-900 to-gray-700" />

        {/* GLOW EFFECT */}
        <div className="absolute top-[-60px] right-[-60px] w-52 h-52 bg-white/10 rounded-full blur-3xl" />

        <div className="absolute bottom-[-80px] left-[-40px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        {/* GRID EFFECT */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <p className="text-white/70 text-sm md:text-base mb-3 tracking-wide uppercase">
            Premium Collection
          </p>

          <h1 className="text-white text-4xl md:text-6xl font-black tracking-tight max-w-3xl">
            {categoryName}
          </h1>

          <p className="text-white/70 mt-4 max-w-xl text-sm md:text-base">
            Explore high-quality products carefully selected for your lifestyle.
          </p>
        </div>
      </div>

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-xl">Products</h2>

          <p className="text-sm text-gray-500 mt-1">
            {products.length} items found
          </p>
        </div>

        {/* SORT */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 px-4 py-2 rounded-xl outline-none bg-white"
        >
          <option value="default">Default</option>
          <option value="asc">Low → High</option>
          <option value="desc">High → Low</option>
        </select>
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <motion.div
            key={product._id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={`/collections/${product._id}`}>
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* IMAGE */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={
                      product.images?.[0] ||
                      product.thumbnail ||
                      "/fallback.png"
                    }
                    alt={product.title}
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  <h3 className="text-sm font-medium line-clamp-2 min-h-[40px]">
                    {product.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2">
                    <p className="font-bold text-lg">৳{product.price}</p>

                    {product.discountPrice > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ৳{product.discountPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center mt-10">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      )}

      {/* OBSERVER */}
      <div ref={loaderRef} className="h-10" />

      {/* EMPTY */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold mb-2">No products found</h3>

          <p className="text-gray-500">
            This category doesn't have products yet.
          </p>
        </div>
      )}
    </section>
  );
}
