"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Glamour & Beauty",
    subtitle:
      "Luxury beauty essentials, skincare and makeup for your daily glow.",
    image: "/slider/g&b.png",
    button: "Shop Beauty",
  },

  {
    id: 2,
    title: "Intimate & Personal Care",
    subtitle:
      "Comfort-focused essentials designed for confidence and care.",
    image: "/slider/intimate.png",
    button: "Explore Care",
  },

  {
    id: 3,
    title: "Auto Parts",
    subtitle:
      "Reliable car accessories and parts built for performance.",
    image: "/slider/auto parts.png",
    button: "Browse Auto",
  },

  {
    id: 4,
    title: "Fashion",
    subtitle:
      "Trending outfits and modern styles for every season.",
    image: "/slider/woman.png",
    button: "Shop Fashion",
  },

  {
    id: 5,
    title: "Tools & Hardware",
    subtitle:
      "Professional tools and hardware for home and workshop projects.",
    image: "/slider/tools.png",
    button: "View Tools",
  },

  {
    id: 6,
    title: "Stationery",
    subtitle:
      "Creative stationery and office essentials for productivity.",
    image: "/slider/stationary.png",
    button: "Shop Stationery",
  },

  {
    id: 7,
    title: "Mother & Baby",
    subtitle:
      "Safe and caring products for moms and little ones.",
    image: "/slider/m&b.png",
    button: "Explore Baby",
  },

  {
    id: 8,
    title: "Travel & Accessories",
    subtitle:
      "Travel smarter with premium luggage and travel accessories.",
    image: "/slider/travel.png",
    button: "Travel Now",
  },

  {
    id: 9,
    title: "Home & Kitchen",
    subtitle:
      "Upgrade your living space with modern home essentials.",
    image: "/slider/house.png",
    button: "Discover Home",
  },
];

export default function ModernSlider() {
  const [current, setCurrent] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // ======================================================
  // AUTOPLAY
  // ======================================================

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [current]);

  // ======================================================
  // NEXT / PREV
  // ======================================================

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // ======================================================
  // TOUCH SUPPORT
  // ======================================================

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) {
      nextSlide();
    }

    if (distance < -50) {
      prevSlide();
    }
  };

  return (
    <section className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl">
      {/* ====================================================== */}
      {/* SLIDER */}
      {/* ====================================================== */}

      <div
        className="flex transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="
              relative
              min-w-full
              h-[28vh]
              sm:h-[38vh]
              lg:h-[36vh]
              xl:h-[42vh]
              overflow-hidden
            "
          >
            {/* BACKGROUND IMAGE */}

            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              quality={85}
              sizes="100vw"
              className="object-cover"
            />

            {/* OVERLAY */}

            <div className="absolute inset-0 bg-black/45" />

            {/* CONTENT */}

            <div className="relative z-10 flex h-full items-center px-5 sm:px-10 lg:px-14">
              <div className="max-w-[220px] sm:max-w-lg text-white">
                {/* BADGE */}

                <div className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium backdrop-blur-md sm:text-xs">
                  Featured Category
                </div>

                {/* TITLE */}

                <h2 className="text-2xl font-bold leading-tight sm:text-4xl lg:text-4xl xl:text-5xl">
                  {slide.title}
                </h2>

                {/* SUBTITLE */}

                <p className="mt-2 text-[11px] text-white/90 sm:mt-4 sm:text-sm lg:text-base">
                  {slide.subtitle}
                </p>

                {/* BUTTON */}

                <button
                  className="
                    mt-4
                    rounded-full
                    bg-white
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-black
                    transition
                    hover:scale-105
                    active:scale-95
                    sm:mt-6
                    sm:px-6
                    sm:py-3
                    sm:text-sm
                  "
                >
                  {slide.button}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ====================================================== */}
      {/* LEFT ARROW */}
      {/* ====================================================== */}

      <button
        onClick={prevSlide}
        className="
          absolute
          left-3
          top-1/2
          z-20
          hidden
          h-9
          w-9
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          bg-white/20
          text-white
          backdrop-blur-md
          transition
          hover:bg-white/30
          md:flex
        "
      >
        <ChevronLeft size={18} />
      </button>

      {/* ====================================================== */}
      {/* RIGHT ARROW */}
      {/* ====================================================== */}

      <button
        onClick={nextSlide}
        className="
          absolute
          right-3
          top-1/2
          z-20
          hidden
          h-9
          w-9
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          bg-white/20
          text-white
          backdrop-blur-md
          transition
          hover:bg-white/30
          md:flex
        "
      >
        <ChevronRight size={18} />
      </button>

      {/* ====================================================== */}
      {/* DOTS */}
      {/* ====================================================== */}

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "w-6 bg-white"
                : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}