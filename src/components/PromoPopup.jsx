"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, MessageCircleMore } from "lucide-react";

export default function PromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("promo-popup-date");
    const today = new Date().toDateString();

    if (lastShown !== today) {
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem("promo-popup-date", today);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
      
      {/* Popup */}
      <div
        className="
          relative w-full max-w-md
          overflow-hidden

          rounded-[28px]

          bg-white/95 backdrop-blur-2xl

          shadow-[0_25px_90px_rgba(0,0,0,0.4)]

          animate-in fade-in zoom-in duration-300
        "
      >
        {/* Glow effects */}
        <div className="absolute -top-20 -left-10 w-44 h-44 bg-orange-400/20 blur-3xl rounded-full"></div>
        <div className="absolute top-0 right-0 w-36 h-36 bg-pink-400/20 blur-3xl rounded-full"></div>

        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="
            absolute top-3 right-3 z-20

            w-9 h-9 rounded-full

            bg-black/10 hover:bg-black/20

            flex items-center justify-center

            transition
          "
        >
          <X size={18} />
        </button>

        {/* Content (scrollable if needed) */}
        <div className="relative z-10 h-full overflow-y-auto px-6 py-6 sm:px-7 sm:py-7">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
            <Sparkles size={14} />
            Special Offer
          </div>

          {/* Title */}
          <h2 className="mt-4 text-[24px] sm:text-[32px] leading-tight font-black text-gray-900">
            🔥 চায়না পণ্য এখন আরও কম দামে!
          </h2>

          {/* Description */}
          <p className="mt-3 text-[14px] sm:text-base text-gray-600 leading-relaxed">
            পাইকারি ও খুচরা অর্ডারে ট্রেন্ডিং কালেকশন, সাশ্রয়ী মূল্য এবং সারা বাংলাদেশে ডেলিভারি।
          </p>

          {/* Features */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {[
              "পাইকারি অর্ডার",
              "ট্রেন্ডিং পণ্য",
              "কম দাম",
              "দ্রুত ডেলিভারি",
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-100/80 border border-white px-3 py-3 text-[13px] font-medium text-gray-700"
              >
                ✨ {item}
              </div>
            ))}
          </div>

          {/* Message */}
          <div className="mt-5 rounded-3xl bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100 p-4">
            <p className="text-[13px] sm:text-sm text-gray-700 leading-relaxed">
              💬 অনেক এক্সক্লুসিভ পণ্য ওয়েবসাইটে দেখানো হয় না। ইনবক্স করলে আরও কম দামের কালেকশন দেখতে পারবেন।
            </p>
          </div>

          {/* CTA */}
          <a
            href="https://wa.me/8801774433063?text=Hello%20I%20want%20to%20see%20more%20products"
            target="_blank"
            rel="noopener noreferrer"
            className="
              mt-5 flex items-center justify-center gap-2
              w-full rounded-2xl
              bg-gradient-to-r from-green-500 to-emerald-600
              py-3.5 text-white font-semibold
              shadow-lg
              hover:scale-[1.02]
              active:scale-[0.98]
              transition
            "
          >
            <MessageCircleMore size={20} />
            🎁 WhatsApp এ মেসেজ করুন
          </a>

        </div>
      </div>
    </div>
  );
}