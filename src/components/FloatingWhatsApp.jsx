"use client";

import { MessageCircleMore } from "lucide-react";

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/8801774433063?text=Hello%20I%20need%20help"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed z-50

        right-4 top-1/2 -translate-y-1/2
        md:right-6 md:top-auto md:bottom-6 md:translate-y-0

        group
      "
    >
      <div
        className="
          relative flex items-center justify-center

          w-12 h-12
          md:w-auto md:h-auto md:px-4 md:py-3

          rounded-full
          bg-gradient-to-br from-green-500 to-emerald-600

          shadow-[0_6px_20px_rgba(0,0,0,0.18)]

          hover:scale-105
          transition-all duration-300
        "
      >
        {/* Soft Pulse */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></span>

        {/* Icon */}
        <MessageCircleMore
          size={22}
          className="relative z-10 text-white"
        />

        {/* Desktop Text */}
        <div className="hidden md:block ml-2 relative z-10">
          <p className="text-sm font-medium text-white leading-none">
            Chat
          </p>
        </div>
      </div>
    </a>
  );
}