"use client";

import { motion } from "framer-motion";
import {
  FaTruck,
  FaHandshake,
  FaBoxOpen,
  FaShieldAlt,
} from "react-icons/fa";

const focusPoints = [
  {
    title: "Direct Sourcing from China",
    description:
      "We work directly with trusted suppliers to ensure better pricing and consistent product quality.",
    icon: <FaBoxOpen size={18} />,
  },
  {
    title: "Secure Payments & Trust",
    description:
      "Every transaction is protected with secure systems. Your trust and satisfaction come first.",
    icon: <FaShieldAlt size={18} />,
  },
  {
    title: "Fast & Reliable Delivery",
    description:
      "We ensure quick processing and dependable delivery so your orders arrive on time.",
    icon: <FaTruck size={18} />,
  },
  {
    title: "Hassle-Free Returns",
    description:
      "If something isn’t right, our simple return process ensures quick support and resolution.",
    icon: <FaHandshake size={18} />,
  },
];

export default function OurFocus() {
  return (
    <section className="px-6 md:px-12 max-w-7xl mx-auto pb-10 md:pb-20">
      {/* HEADER */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-black via-amber-600 to-cyan-400 text-transparent bg-clip-text">
          Why Shop With Us
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Built on trust, quality, and customer satisfaction
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {focusPoints.map((point, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="
              group relative cursor-pointer
              rounded-2xl p-6
              bg-white border border-gray-100
              shadow-sm hover:shadow-xl
              transition-all duration-300
              overflow-hidden
            "
          >
            {/* ICON */}
            <div className="mb-5 text-indigo-500 opacity-80 group-hover:opacity-100 transition">
              {point.icon}
            </div>

            {/* TITLE */}
            <h3 className="text-xs tracking-widest text-gray-400 mb-2 group-hover:text-gray-600 transition">
              {point.title.toUpperCase()}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition">
              {point.description}
            </p>

            {/* hover glow line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-black to-amber-400 group-hover:w-full transition-all duration-300" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}