"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Flame,
  Zap,
  Tag,
} from "lucide-react";

// ─── Announcement bar messages ────────────────────────────────────────────────
const ANNOUNCEMENTS = [
  "🔥 MEGA SALE — Up to 70% OFF on selected items",
  "🚚 FREE Delivery inside Dhaka on orders above ৳2500",
  "⚡ FLASH DEALS every day — Check Best Sellers now",
  "🎁 New arrivals from China added daily",
  "📦 Nationwide delivery across Bangladesh",
  "💳 Cash on Delivery available everywhere",
];

// ─── Main slider data ─────────────────────────────────────────────────────────
const SLIDES = [
  {
    badge: "MEGA SALE",
    badgeColor: "bg-red-500",
    title: "Glamour & Beauty",
    sub: "Up to 40% OFF",
    desc: "Premium skincare, makeup & beauty products imported directly from China.",
    cta: "Shop Beauty",
    href: "/category/glamour-and-beauty",
    image: "/slider/beauty.png",
    accent: "from-rose-700/30 to-pink-600/10",
  },
  {
    badge: "NEW ARRIVALS",
    badgeColor: "bg-blue-500",
    title: "Fashion Collection",
    sub: "Fresh Styles",
    desc: "Trending outfits and modern styles for every season — direct from China.",
    cta: "Shop Fashion",
    href: "/category/fashion",
    image: "/slider/fashion.png",
    accent: "from-indigo-700/60 to-purple-900/10",
  },
  {
    badge: "HOT DEAL",
    badgeColor: "bg-orange-500",
    title: "Smart Home & Kitchen",
    sub: "Home Essentials",
    desc: "Upgrade your living space with modern home products at unbeatable prices.",
    cta: "Shop Home",
    href: "/category/home-and-kitchen",
    image: "/slider/home & kitchen.png",
    accent: "from-orange-700/70 to-amber-900/10",
  },
  {
    badge: "BEST SELLER",
    badgeColor: "bg-green-500",
    title: "Mother & Baby",
    sub: "Safe & Caring",
    desc: "Trusted baby products and maternity essentials — quality you can count on.",
    cta: "Shop Baby",
    href: "/category/mother-and-baby",
    image: "/slider/mother & baby.png",
    accent: "from-green-700/70 to-teal-900/10",
  },
  {
    badge: "SALE",
    badgeColor: "bg-yellow-500",
    title: "Auto Parts & More",
    sub: "Auto Accessories",
    desc: "Reliable car accessories and performance parts shipped to your door.",
    cta: "Browse Auto",
    href: "/category/auto-parts",
    image: "/slider/auto parts.png",
    accent: "from-gray-700/70 to-slate-900/10",
  },
];

// ─── Side promo tiles ─────────────────────────────────────────────────────────
const PROMO_TILES = [
  {
    label: "Flash Sale",
    title: "Tools & Hardware",
    discount: "Up to 50% OFF",
    image: "/slider/tools.png",
    href: "/category/tools-and-hardware",
    bg: "from-slate-800/70 to-slate-600/30",
    icon: Zap,
  },
  {
    label: "Special Offer",
    title: "Travel & Accessories",
    discount: "Starting ৳299",
    image: "/slider/travel accessesories.png",
    href: "/category/travel-and-accessories",
    bg: "from-blue-800/70 to-cyan-700/10",
    icon: Tag,
  },
];

// ─── Category quick-links ─────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Glamour & Beauty", image: "/categories/brush.png", href: "/category/glamour-and-beauty" },
  { name: "Fashion", image: "/categories/woman.png", href: "/category/fashion" },
  { name: "Auto Parts", image: "/categories/car.png", href: "/category/auto-parts" },
  { name: "Tools & Hardware", image: "/categories/tool-box.png", href: "/category/tools-and-hardware" },
  { name: "Home & Kitchen", image: "/categories/house.png", href: "/category/home-and-kitchen" },
  { name: "Mother & Baby", image: "/categories/mother.png", href: "/category/mother-and-baby" },
  { name: "Travel", image: "/categories/luggage.png", href: "/category/travel-and-accessories" },
  { name: "Stationery", image: "/categories/stationery-pic.png", href: "/category/stationery" },
  { name: "Intimate & Personal Care", image: "/categories/underwear.png", href: "/category/intimate-and-personal-care" },
];

// ─── Trust badges ─────────────────────────────────────────────────────────────
const TRUST = [
  { icon: Truck, label: "Free Delivery", sub: "Inside Dhaka ৳2500+" },
  { icon: RotateCcw, label: "Easy Returns", sub: "7-day return policy" },
  { icon: ShieldCheck, label: "Secure Payment", sub: "100% safe checkout" },
  { icon: Headphones, label: "24/7 Support", sub: "WhatsApp & call" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENT TICKER
// ─────────────────────────────────────────────────────────────────────────────
function AnnouncementBar() {
  return (
    <div className="bg-gray-900 text-white text-xs py-2 overflow-hidden relative">
      <div className="flex animate-[marquee_10s_linear_infinite] whitespace-nowrap">
        {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((msg, i) => (
          <span key={i} className="mx-8 shrink-0 font-medium tracking-wide">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HERO SLIDER
// ─────────────────────────────────────────────────────────────────────────────
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const router = useRouter();

  const next = useCallback(() => setCurrent((p) => (p + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next, paused]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-xl md:rounded-2xl select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStart.current = e.targetTouches[0].clientX; }}
      onTouchMove={(e) => { touchEnd.current = e.targetTouches[0].clientX; }}
      onTouchEnd={() => {
        const d = touchStart.current - touchEnd.current;
        if (d > 50) next();
        if (d < -50) prev();
      }}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <Image src={s.image} alt={s.title} fill className="object-cover" priority={i === 0} sizes="(max-width:768px) 100vw, 66vw" />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.accent}`} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-end p-5 sm:p-8 md:p-10 text-white">
        <div className="max-w-lg">
          {/* Badge */}
          <span className={`inline-flex items-center gap-1.5 ${slide.badgeColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 uppercase tracking-wider`}>
            <Flame size={10} />
            {slide.badge}
          </span>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-none mb-1 drop-shadow-lg">
            {slide.title}
          </h2>
          <p className="text-sm sm:text-base text-white/80 font-semibold mb-2">{slide.sub}</p>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-5 max-w-sm hidden sm:block">
            {slide.desc}
          </p>

          {/* CTA */}
          <button
            onClick={() => router.push(slide.href)}
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 sm:px-7 sm:py-3 rounded-full text-sm hover:bg-gray-100 active:scale-95 transition shadow-lg"
          >
            {slide.cta} →
          </button>
        </div>
      </div>

      {/* Arrows */}
      {["left", "right"].map((dir) => (
        <button
          key={dir}
          onClick={dir === "left" ? prev : next}
          className={`absolute top-1/2 -translate-y-1/2 z-30 ${dir === "left" ? "left-3" : "right-3"} w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition backdrop-blur-sm`}
        >
          {dir === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 right-5 z-30 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDE PROMO TILES
// ─────────────────────────────────────────────────────────────────────────────
function PromoTile({ tile }) {
  const Icon = tile.icon;
  return (
    <Link href={tile.href} className="relative overflow-hidden rounded-xl md:rounded-2xl flex-1 min-h-0 group block">
      <Image src={tile.image} alt={tile.title} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="33vw" />
      <div className={`absolute inset-0 bg-gradient-to-t ${tile.bg} opacity-85`} />
      <div className="relative z-10 h-full flex flex-col justify-between p-4 text-white">
        <span className="inline-flex items-center gap-1 bg-red-600 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider w-fit">
          <Icon size={9} />{tile.label}
        </span>
        <div>
          <p className="font-black text-base sm:text-lg leading-tight">{tile.title}</p>
          <p className="text-xs text-white/80 font-semibold mt-0.5">{tile.discount}</p>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY GRID
// ─────────────────────────────────────────────────────────────────────────────
function CategoryStrip() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl md:rounded-2xl shadow-sm px-4 py-5 md:px-6 md:py-6">
      {/* Mobile: 5-col + 4-col two-row grid — Desktop: single row */}
      <div className="grid grid-cols-5 gap-y-5 gap-x-2 md:hidden">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-orange-50 group-active:scale-95 transition-all overflow-hidden">
              <Image src={cat.image} alt={cat.name} width={36} height={36} className="object-contain" />
            </div>
            <span className="text-[10px] font-semibold text-gray-600 group-hover:text-orange-600 transition text-center leading-tight w-full">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Desktop: single scrollable/flex row */}
      <div className="hidden md:flex items-center justify-between gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="flex flex-col items-center gap-2.5 group flex-1"
          >
            <div className="w-16 h-16 lg:w-18 lg:h-18 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-orange-50 group-hover:ring-2 group-hover:ring-orange-300 transition-all overflow-hidden">
              <Image src={cat.image} alt={cat.name} width={40} height={40} className="object-contain" />
            </div>
            <span className="text-xs font-semibold text-gray-600 group-hover:text-orange-600 transition text-center leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BAR
// ─────────────────────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl md:rounded-2xl shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
        {TRUST.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">{label}</p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <div className="bg-gray-50">
      {/* Announcement ticker */}
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-3 pb-2 space-y-3">
        {/* Main banner row */}
        <div className="flex gap-3 h-[52vw] sm:h-[42vw] md:h-[380px] lg:h-[420px] xl:h-[460px] max-h-[500px]">
          {/* Slider — takes 2/3 on desktop, full on mobile */}
          <div className="flex-1 md:w-0 md:flex-[2]">
            <HeroSlider />
          </div>

          {/* Promo tiles — hidden on mobile, 1/3 on desktop */}
          <div className="hidden md:flex flex-col gap-3 flex-1">
            {PROMO_TILES.map((tile) => (
              <PromoTile key={tile.title} tile={tile} />
            ))}
          </div>
        </div>

        {/* Category strip */}
        <CategoryStrip />

        {/* Trust bar */}
        <TrustBar />
      </div>
    </div>
  );
}
