"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";

import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/context/CartContext";

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

  const loaderRef = useRef(null);
  const fetchingRef = useRef(false);

  const { cart, addToCart } = useCart();

  // ================= WISHLIST =================
  useEffect(() => {
    const w = localStorage.getItem("wishlist");
    if (w) setWishlist(JSON.parse(w));
  }, []);

  const updateWishlist = (list) => {
    setWishlist(list);
    localStorage.setItem("wishlist", JSON.stringify(list));
  };

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      updateWishlist(wishlist.filter((i) => i !== id));
      toast("Removed from wishlist");
      return;
    }
    updateWishlist([...wishlist, id]);
    toast.success("Added to wishlist ❤️");
  };

  // ================= CART =================
  const handleAddToCart = (product) => {
    const exists = cart.some((item) => item.id === product._id);

    if (exists) {
      toast("Already in cart");
      return;
    }

    addToCart(product._id, 1);
    toast.success("Added to cart 🛒");
  };

  // ================= FETCH =================
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const fetchProducts = useCallback(
    async (reset = false) => {
      if (fetchingRef.current) return;
      if (!hasMore && !reset) return;

      fetchingRef.current = true;
      setLoading(true);

      try {
        const currentPage = reset ? 0 : page;

        const query = new URLSearchParams({
          page: currentPage,
          limit: "12",
          category: selectedCategory,
          sort: sortOrder,
          search,
        });

        const res = await fetch(`/api/products?${query}`);

        const data = await res.json();

        const newProducts = data.products || [];

        setProducts((prev) => {
          if (reset) return newProducts;

          const ids = new Set(prev.map((p) => p._id));
          const filtered = newProducts.filter((p) => !ids.has(p._id));

          return [...prev, ...filtered];
        });

        setHasMore(data.hasMore);
      } finally {
        setLoading(false);
        setInitialLoading(false);
        fetchingRef.current = false;
      }
    },
    [page, selectedCategory, sortOrder, search, hasMore],
  );

  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    setInitialLoading(true);
    fetchProducts(true);
  }, [selectedCategory, sortOrder, search]);

  useEffect(() => {
    if (page === 0) return;
    fetchProducts();
  }, [page]);

  // ================= INFINITE SCROLL =================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.2 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  // ================= PRICE =================
  const getPrice = (p) => {
    return p.discountPrice > 0 ? p.discountPrice : p.price;
  };

  return (
    <section className="px-4 md:px-12 py-10 max-w-7xl mx-auto min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="mb-8 flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
            {search ? `Search: "${search}"` : "Latest Products"}
          </h1>

          <p className="text-gray-500 mt-1">{products.length} products found</p>
        </div>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700"
        >
          <option value="default">Newest</option>
          <option value="asc">Price: Low → High</option>
          <option value="desc">Price: High → Low</option>
        </select>
      </div>

      {/* CATEGORIES (MOBILE FIX) */}
      {!search && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat.name)}
                className={`
            whitespace-nowrap px-3 py-1.5 rounded-full text-xs
            border transition
            ${
              selectedCategory === cat.name
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }
          `}
              >
                {cat.name}
                {cat.count > 0 && (
                  <span className="ml-1 text-[10px] opacity-60">
                    ({cat.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((product) => {
          const isInCart = cart.some((i) => i.id === product._id);

          return (
            <motion.div key={product._id} whileHover={{ y: -3 }}>
              <Link href={`/collections/${product._id}`}>
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition">
                  {/* IMAGE */}
                  <div className="relative h-[220px] bg-gray-100">
                    <Image
                      src={product.images?.[0] || product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />

                    {/* WISHLIST */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product._id);
                      }}
                      className="absolute top-3 right-3 bg-white/90 p-2 rounded-full"
                    >
                      {wishlist.includes(product._id) ? (
                        <AiFillHeart className="text-red-500" />
                      ) : (
                        <AiOutlineHeart />
                      )}
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 line-clamp-1">
                      {product.title}
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {product.category}
                    </p>

                    {/* PRICE */}
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        {product.discountPrice > 0 ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400 line-through">
                              ৳{Number(product.price).toFixed(0)}
                            </p>
                            <p className="font-semibold text-gray-900">
                              ৳{Number(product.discountPrice).toFixed(0)}
                            </p>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-900">
                            ৳{Number(product.price).toFixed(0)}
                          </p>
                        )}
                      </div>

                      {/* CART */}
                      <button
                        disabled={isInCart}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className={`p-2 rounded-full border transition ${
                          isInCart
                            ? "bg-gray-100 text-gray-400"
                            : "hover:bg-gray-900 hover:text-white"
                        }`}
                      >
                        <AiOutlineShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div ref={loaderRef} className="h-20" />
    </section>
  );
}
