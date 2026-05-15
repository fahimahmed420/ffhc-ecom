"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  IoMdStar,
  IoMdStarHalf,
  IoMdStarOutline,
} from "react-icons/io";

/* ================= Skeleton ================= */
function BestSellingSkeleton() {
  return (
    <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-12 animate-pulse" />

      <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden border border-gray-100 bg-white animate-pulse"
          >
            <div className="w-full aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= Main ================= */
export default function BestSelling() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateAvg = (reviews = []) => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
      reviews.length
    );
  };

  const renderStars = (rating = 0) => {
    return Array.from({ length: 5 }).map((_, i) => {
      if (i < Math.floor(rating))
        return <IoMdStar key={i} />;
      if (i + 0.5 < rating)
        return <IoMdStarHalf key={i} />;
      return <IoMdStarOutline key={i} />;
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products/best-selling");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <BestSellingSkeleton />;

  return (
    <section className="px-6 md:px-12 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
          Best Selling Products
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Top picks loved by customers
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
        {products.map((p, i) => {
          const rating =
            p.avgRating !== undefined
              ? p.avgRating
              : calculateAvg(p.reviews);

          return (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.05,
                duration: 0.4,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              onClick={() =>
                router.push(`/collections/${p._id}`)
              }
              className="
                group
                cursor-pointer
                rounded-2xl
                overflow-hidden
                bg-white
                border border-gray-100
                shadow-sm
                hover:shadow-2xl
                transition-all duration-300
              "
            >
              {/* IMAGE */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Image
                  src={p.thumbnail || "/fallback.png"}
                  alt={p.title}
                  fill
                  className="
                    object-cover
                    group-hover:scale-110
                    transition-transform duration-500
                  "
                />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* rating badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow">
                  <span className="text-yellow-500 flex gap-[2px]">
                    {renderStars(rating)}
                  </span>
                  <span className="text-[10px] text-gray-600 ml-1">
                    {rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* INFO */}
              <div className="p-4 relative">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-black transition">
                  {p.title}
                </h3>

                <p className="text-sm font-semibold text-gray-600 mt-1">
                  ৳{p.discountPrice}
                </p>

                {/* animated underline */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-300" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}