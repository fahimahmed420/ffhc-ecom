"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DashboardHome() {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD WISHLIST
  // =========================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistIds(stored);
  }, []);

  // =========================
  // FETCH PRODUCTS
  // =========================
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!wishlistIds.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `/api/products?ids=${wishlistIds.join(",")}`
        );

        const data = await res.json();
        setWishlistProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="space-y-6">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black to-gray-800 text-white p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

        <h2 className="text-sm tracking-widest uppercase text-gray-300">
          Dashboard Overview
        </h2>

        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Welcome back 👋
        </h1>

        <p className="text-gray-300 mt-2 text-sm">
          Track your activity, wishlist, and shopping insights in one place.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Wishlist Items
          </p>
          <h3 className="text-2xl font-bold mt-2">
            {wishlistIds.length}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Saved products for later
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Estimated Wishlist Value
          </p>
          <h3 className="text-2xl font-bold mt-2">
            ৳
            {wishlistProducts
              .reduce((acc, p) => {
                const price =
                  p.discountPrice > 0 ? p.discountPrice : p.price;
                return acc + price;
              }, 0)
              .toFixed(0)}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Total potential spending
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Shopping Activity
          </p>
          <h3 className="text-2xl font-bold mt-2">
            Active
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Based on recent wishlist activity
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            Complete your profile
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Improve recommendations and checkout experience
          </p>
        </div>

        <Link href="/dashboard/profile">
          <button className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition">
            Go to Profile
          </button>
        </Link>
      </div>

      {/* WISHLIST */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm tracking-widest uppercase text-gray-500">
            Wishlist Preview
          </h2>

          <span className="text-xs text-gray-400">
            {wishlistIds.length} items
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : wishlistProducts.length === 0 ? (
          <p className="text-sm text-gray-400">
            No wishlist items yet
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {wishlistProducts.slice(0, 4).map((product) => (
              <Link
                key={product._id}
                href={`/collections/${product._id}`}
                className="group border border-gray-200 shadow rounded-xl overflow-hidden hover:shadow-md transition"
              >
                {/* IMAGE (NEXT IMAGE FIX) */}
                <div className="relative h-28 bg-gray-50 overflow-hidden">
                  <Image
                    src={
                      product.images?.[0] ||
                      product.thumbnail ||
                      "/fallback.png"
                    }
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-2">
                  <p className="text-xs line-clamp-1">
                    {product.title}
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    ৳
                    {(product.discountPrice > 0
                      ? product.discountPrice
                      : product.price
                    ).toFixed(0)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}