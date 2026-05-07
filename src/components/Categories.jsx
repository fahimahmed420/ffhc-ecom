"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-");

export default function Categories() {
  const router = useRouter();

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
    "Glamour & Beauty": "/categories/Glamour-Beauty.png",
    "Intimate & Personal Care": "/categories/intimate.png",
    "Auto Parts": "/categories/auto-parts.png",
    Fashion: "/categories/Fashion.jpg",
    "Tools & Hardware": "/categories/Tools & Hardware.jpg",
    Stationery: "/categories/Stationery.jpg",
    "Mother & Baby": "/categories/Mother & Baby.jpg",
    "Travel & Accessories": "/categories/Travel & Accessories.jpg",
    "Home & kitchen": "/categories/Home & kitchen.jpg",
  };

  return (
    <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <h2 className="text-2xl mb-12 text-center font-semibold">
        Browse Categories
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            onClick={() =>
              router.push(`/category/${slugify(cat)}`)
            }
            className="bg-white rounded-xl overflow-hidden shadow cursor-pointer"
          >
            {/* IMAGE */}
            <div className="relative h-[220px]">
              <Image
                src={images[cat]}
                alt={cat}
                fill
                className="object-cover"
              />
            </div>

            {/* TEXT */}
            <div className="p-4">
              <h3 className="text-sm font-medium">{cat}</h3>

              <p className="text-xs text-gray-500 mt-1">
                Explore products in {cat}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}