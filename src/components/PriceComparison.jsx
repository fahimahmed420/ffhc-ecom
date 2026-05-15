"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStore, FaTruck } from "react-icons/fa";

export default function PriceComparison() {
  const [activeModal, setActiveModal] = useState(null);

  const WHATSAPP_NUMBER = "8801XXXXXXXXX"; // replace

  const options = [
    {
      title: "Buy as Customer",
      subtitle: "Retail Shopping",
      icon: <FaStore size={18} />,
      description:
        "Perfect for personal use. Browse thousands of products and order instantly with fast delivery.",
      highlight: "Instant checkout • No minimum order",
      action: "Browse Now",
      type: "retail",
    },
    {
      title: "Buy in Bulk",
      subtitle: "Wholesale Access",
      icon: <FaTruck size={18} />,
      description:
        "Best for resellers, shops, and businesses. Get special pricing and bulk deals directly from us.",
      highlight: "Save more on bulk orders • Business pricing",
      action: "Contact on WhatsApp",
      type: "wholesale",
    },
  ];

  const handleAction = (type) => {
    if (type === "retail") {
      window.location.href = "/collections";
    }

    if (type === "wholesale") {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}`,
        "_blank"
      );
    }
  };

  return (
    <section className="px-6 md:px-12 py-10 md:py-20 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Choose Your Shopping Mode
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Shop as a customer or buy as a business
        </p>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-6">
        {options.map((opt, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
            onClick={() => setActiveModal(opt)}
            className="
              group cursor-pointer relative
              rounded-2xl p-8
              bg-white border border-gray-100
              shadow-sm hover:shadow-2xl
              transition-all duration-300
              overflow-hidden
            "
          >
            {/* ICON + TITLE */}
            <div className="flex items-center gap-3 mb-5 text-gray-600">
              <div className="text-indigo-500">{opt.icon}</div>
              <div>
                <h3 className="text-xs tracking-widest text-gray-400">
                  {opt.subtitle}
                </h3>
                <p className="text-sm font-medium">{opt.title}</p>
              </div>
            </div>

            {/* HIGHLIGHT */}
            <p className="text-xs text-indigo-500 mb-3 font-medium">
              {opt.highlight}
            </p>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-500 leading-relaxed">
              {opt.description}
            </p>

            {/* hover glow line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-pink-500 group-hover:w-full transition-all duration-300" />
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {activeModal && (
          <>
            {/* overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
            />

            {/* modal */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 px-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl relative">
                
                <h3 className="text-sm tracking-widest text-gray-500 mb-2">
                  {activeModal.subtitle}
                </h3>

                <h2 className="text-xl font-semibold mb-4">
                  {activeModal.title}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {activeModal.description}
                </p>

                <button
                  onClick={() => handleAction(activeModal.type)}
                  className="w-full py-3 text-sm tracking-widest bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
                  {activeModal.action}
                </button>

                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-5 text-gray-400 hover:text-black"
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