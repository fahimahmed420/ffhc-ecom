"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStore, FaTruck } from "react-icons/fa";

export default function PriceComparison({
  retailPrice = 50,
  wholesalePrice = 35,
}) {
  const [activeModal, setActiveModal] = useState(null);

  const savings = Math.round(
    ((retailPrice - wholesalePrice) / retailPrice) * 100
  );

  const options = [
    {
      title: "Retail Price",
      price: retailPrice,
      icon: <FaStore size={18} />,
      description:
        "Order anytime from anywhere with no minimum quantity required.",
      action: "Order Now",
    },
    {
      title: "Wholesale Price",
      price: wholesalePrice,
      icon: <FaTruck size={18} />,
      description:
        "For bulk orders, contact us directly via email or WhatsApp to get the best deals.",
      action: "Contact Us",
    },
  ];

  return (
    <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
      
      {/* Heading */}
      <h2 className="text-2xl mb-12 text-center font-semibold">
        Compare Prices
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {options.map((opt, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 200 }}
            onClick={() => setActiveModal(opt)}
            className="group border border-gray-200 p-8 bg-white cursor-pointer relative"
          >
            {/* Top Row */}
            <div className="flex items-center gap-3 mb-6 text-gray-600">
              <div className="opacity-80">{opt.icon}</div>
              <h3 className="text-sm tracking-widest">
                {opt.title.toUpperCase()}
              </h3>
            </div>

            {/* Price */}
            <p className="text-3xl font-medium mb-2">
              <span className="text-4xl">৳</span>{opt.price}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-500">
              {opt.description}
            </p>

            {/* Savings */}
            {opt.title === "Wholesale Price" && (
              <div className="absolute top-2 right-2 text-[11px] tracking-widest border px-3 py-1">
                SAVE {savings}%
              </div>
            )}

            {/* Hover underline */}
            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
            />

            {/* Modal Box */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 px-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-white max-w-md w-full p-8 border border-gray-200 relative">
                
                {/* Title */}
                <h3 className="text-sm tracking-widest mb-4">
                  {activeModal.title.toUpperCase()}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {activeModal.title === "Retail Price"
                    ? "You can easily place an order anytime from anywhere. No minimum quantity required — perfect for individual purchases."
                    : "Wholesale orders are handled personally to ensure best pricing. Contact us via email or WhatsApp for bulk deals and custom offers."}
                </p>

                {/* Action Button */}
                <button className="border px-6 py-2 text-sm tracking-widest hover:bg-black hover:text-white transition">
                  {activeModal.action}
                </button>

                {/* Close */}
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-3 right-4 text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}