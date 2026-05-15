"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const slugify = (text) =>
  text.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");

export default function Categories() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    "Glamour & Beauty",
    "Intimate & Personal Care",
    "Auto Parts",
    "Fashion",
    "Tools & Hardware",
    "Stationery",
    "Mother & Baby",
    "Travel & Accessories",
    "Home & kitchen",
  ];

  const images = {
    "Glamour & Beauty": "/categories/Glamour & Beauty.png",
    "Intimate & Personal Care": "/categories/Intimate & Personal Care.png",
    "Auto Parts": "/categories/Auto Parts.png",
    Fashion: "/categories/Fashion.png",
    "Tools & Hardware": "/categories/Tools & Hardware.png",
    Stationery: "/categories/Stationery.png",
    "Mother & Baby": "/categories/Mother & Baby.png",
    "Travel & Accessories": "/categories/Travel & Accessories.png",
    "Home & kitchen": "/categories/Home & kitchen.png",
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="px-6 md:px-12 py-10 md:py-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
          Browse Categories
        </h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Discover everything you need in one place
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-[260px] rounded-2xl bg-gray-100 animate-pulse"
              >
                <div className="h-[180px] bg-gray-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-2/3 bg-gray-200 rounded" />
                  <div className="h-2 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          : categories.map((cat, i) => (
              <motion.div
                key={cat}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                whileHover={{
                  scale: 1.04,
                  rotate: 0.3,
                }}
                onClick={() => router.push(`/category/${slugify(cat)}`)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-md bg-white"
              >
                {/* IMAGE */}
                <div className="relative h-[220px] overflow-hidden">
                  <Image
                    src={images[cat]}
                    alt={cat}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* overlay glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* TEXT */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-black transition">
                    {cat}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Explore premium {cat.toLowerCase()} products
                  </p>
                </div>

                {/* hover glow border */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-purple-400 transition" />
              </motion.div>
            ))}
      </div>
    </section>
  );
}
