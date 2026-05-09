"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

export default function Collections() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");
  const [categories, setCategories] = useState([]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);
  const fetchingRef = useRef(false);

  // ===============================
  // LOAD LOCAL STORAGE
  // ===============================
  useEffect(() => {
    const w = localStorage.getItem("wishlist");
    const c = localStorage.getItem("cart");

    if (w) setWishlist(JSON.parse(w));
    if (c) setCart(JSON.parse(c));
  }, []);

  // ===============================
  // FETCH CATEGORIES (✅ FIX)
  // ===============================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  // ===============================
  // HELPERS
  // ===============================
  const updateWishlist = (list) => {
    setWishlist(list);
    localStorage.setItem("wishlist", JSON.stringify(list));
  };

  const updateCart = (list) => {
    setCart(list);
    localStorage.setItem("cart", JSON.stringify(list));
  };

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      updateWishlist(wishlist.filter((i) => i !== id));
      toast("Removed from wishlist ❌");
    } else {
      updateWishlist([...wishlist, id]);
      toast.success("Added to wishlist ❤️");
    }
  };

  const addToCart = (product) => {
    if (cart.includes(product._id)) {
      toast("Already in cart ⚠️");
      return;
    }

    const updated = [...cart, product._id];
    updateCart(updated);
    toast.success("Added to cart 🛒");
  };

  // ===============================
  // FETCH PRODUCTS (✅ FIXED)
  // ===============================
  const fetchProducts = useCallback(
    async (reset = false) => {
      if (fetchingRef.current) return;
      if (!hasMore && !reset) return;

      fetchingRef.current = true;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/products?page=${
            reset ? 0 : page
          }&limit=12&category=${encodeURIComponent(
            selectedCategory,
          )}&sort=${sortOrder}`,
        );

        const data = await res.json();
        const newProducts = data.products || [];

        setProducts((prev) => {
          if (reset) return newProducts;

          const ids = new Set(prev.map((p) => p._id));
          const filtered = newProducts.filter((p) => !ids.has(p._id));

          return [...prev, ...filtered];
        });

        setHasMore(data.hasMore);
      } catch (err) {
        console.error("Product fetch error:", err);
      }

      setLoading(false);
      fetchingRef.current = false;
    },
    [page, selectedCategory, sortOrder, hasMore],
  );

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    fetchProducts(true);
  }, []);

  // ===============================
  // CATEGORY / SORT CHANGE
  // ===============================
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProducts(true);
  }, [selectedCategory, sortOrder]);

  // ===============================
  // PAGINATION
  // ===============================
  useEffect(() => {
    if (page === 0) return;
    fetchProducts();
  }, [page]);

  // ===============================
  // INFINITE SCROLL
  // ===============================
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
        setPage((prev) => prev + 1);
      }
    });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  // ===============================
  // UI
  // ===============================
  return (
    <section className="px-4 md:px-12 py-10 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold">Latest Products</h1>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 rounded-xl border"
        >
          <option value="default">Sort</option>
          <option value="asc">Price: Low → High</option>
          <option value="desc">Price: High → Low</option>
        </select>
      </div>

      {/* CATEGORIES */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-1.5 rounded-full text-sm flex items-center gap-1 ${
              selectedCategory === cat.name
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {cat.name}
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-black/10">
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div key={product._id} whileHover={{ scale: 1.03 }}>
            <Link href={`/collections/${product._id}`}>
              <div className="bg-white rounded-xl overflow-hidden shadow">
                <div className="relative h-[220px]">
                  <Image
                    src={product.images?.[0] || product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(product._id);
                    }}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full"
                  >
                    {wishlist.includes(product._id) ? (
                      <AiFillHeart className="text-red-500" />
                    ) : (
                      <AiOutlineHeart />
                    )}
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="text-sm">{product.title}</h3>

                  <div className="flex justify-between items-center mt-3 gap-3">
                    {/* PRICE */}
                    <div className="flex flex-col">
                      {/* FINAL PRICE */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-black text-base">
                          ৳
                          {(product.discountPrice > 0
                            ? product.discountPrice
                            : product.price
                          ).toFixed(2)}
                        </p>

                        {/* OLD PRICE */}
                        {product.discountPrice > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ৳{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CART */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                      <AiOutlineShoppingCart className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* LOADER */}
      <div ref={loaderRef} className="h-10"></div>
    </section>
  );
}
