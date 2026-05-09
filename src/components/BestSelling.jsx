"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoMdStar, IoMdStarHalf, IoMdStarOutline } from "react-icons/io";

/* ================= Skeleton ================= */
function BestSellingSkeleton() {
  return (
    <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-12" />
      <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="border bg-white">
            <div className="w-full aspect-square bg-gray-200" />
            <div className="p-6 space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
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
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push(<IoMdStar key={i} />);
      else if (i - rating <= 0.5) stars.push(<IoMdStarHalf key={i} />);
      else stars.push(<IoMdStarOutline key={i} />);
    }
    return stars;
  };

  useEffect(() => {
    fetch("/api/products/best-selling")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <BestSellingSkeleton />;

  return (
    <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <h2 className="text-2xl mb-12 text-center font-semibold">
        Best Selling
      </h2>

      <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
        {products.map((p) => {
          const rating =
            p.avgRating !== undefined
              ? p.avgRating
              : calculateAvg(p.reviews);

          return (
            <motion.div
              key={p._id}
              whileHover={{
                y: -6,
                scale: 1.01,
              }}
              transition={{ type: "spring", stiffness: 200 }}
              className="
                group
                border border-gray-200
                bg-white
                cursor-pointer
                relative
                overflow-hidden
                transition-all duration-300
                hover:shadow-xl
              "
              onClick={() => router.push(`/collections/${p._id}`)}
            >
              {/* IMAGE */}
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={p.thumbnail || "/fallback.png"}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />

                {/* ⭐ Rating */}
                <div className="absolute top-2 right-2 text-[11px] border bg-white px-3 py-1 flex items-center gap-1">
                  {renderStars(rating)}
                  <span className="text-[10px] ml-1">
                    {rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* INFO */}
              <div className="p-6 relative">
                <h3 className="text-sm font-medium mb-2 line-clamp-1">
                  {p.title}
                </h3>

                <p className="text-sm text-gray-500">
                  ৳{p.discountPrice}
                </p>

                {/* subtle bottom hover line like your other cards */}
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}