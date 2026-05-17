"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

const slugify = (text) =>
  text.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");

export default function Categories() {
  const router = useRouter();

  const categories = [
    {
      name: "Glamour & Beauty",
      image: "/categories/brush.png",
    },
    {
      name: "Intimate & Personal Care",
      image: "/categories/underwear.png",
    },
    {
      name: "Auto Parts",
      image: "/categories/car.png",
    },
    {
      name: "Fashion",
      image: "/categories/woman.png",
    },
    {
      name: "Tools & Hardware",
      image: "/categories/tool-box.png",
    },
    {
      name: "Stationery",
      image: "/categories/stationery-pic.png",
    },
    {
      name: "Mother & Baby",
      image: "/categories/mother.png",
    },
    {
      name: "Travel & Accessories",
      image: "/categories/luggage.png",
    },
    {
      name: "Home & kitchen",
      image: "/categories/house.png",
    },
  ];

  return (
    <section className="px-6 md:px-12 py-10 md:py-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl py-1 font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
          Browse Categories
        </h2>

        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Discover everything you need in one place
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-y-10 gap-x-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.05,
              duration: 0.4,
            }}
            whileHover={{
              y: -5,
              scale: 1.05,
            }}
            onClick={() =>
              router.push(`/category/${slugify(cat.name)}`)
            }
            className="flex flex-col items-center text-center cursor-pointer group"
          >
            {/* Image Circle */}
            <div className="w-25 h-25 md:w-30 md:h-30 rounded-full bg-gradient-to-r from-gray-200 to-gray-400 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 overflow-hidden">
              
              <Image
                src={cat.image}
                alt={cat.name}
                width={50}
                height={50}
                className="object-contain"
              />
            </div>

            {/* Category Name */}
            <h3 className="mt-4 text-sm md:text-base font-medium text-gray-800 leading-snug max-w-[120px]">
              {cat.name}
            </h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
}