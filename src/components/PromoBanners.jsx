"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BANNERS = [
  {
    label: "New Arrivals",
    title: "Fashion & Style",
    sub: "Fresh from China",
    cta: "Shop Now",
    href: "/category/fashion",
    image: "/slider/woman.png",
    gradient: "from-purple-900/85 via-indigo-800/70 to-transparent",
  },
  {
    label: "Clearance Sale",
    title: "Up to 60% OFF",
    sub: "Home & Kitchen",
    cta: "Grab Deals",
    href: "/category/home-and-kitchen",
    image: "/slider/house.png",
    gradient: "from-orange-900/85 via-red-800/70 to-transparent",
  },
  {
    label: "Premium",
    title: "Mother & Baby",
    sub: "Safe & Trusted",
    cta: "Shop Baby",
    href: "/category/mother-and-baby",
    image: "/slider/m&b.png",
    gradient: "from-teal-900/85 via-green-800/70 to-transparent",
  },
];

export default function PromoBanners() {
  return (
    <section className="py-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BANNERS.map((b) => (
            <Link
              key={b.title}
              href={b.href}
              className="group relative h-36 sm:h-44 md:h-52 rounded-2xl overflow-hidden block"
            >
              <Image
                src={b.image}
                alt={b.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
                sizes="(max-width:640px) 100vw, 33vw"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${b.gradient}`} />
              <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full w-fit">
                  {b.label}
                </span>
                <div>
                  <p className="text-xs text-white/70 font-medium">{b.sub}</p>
                  <h3 className="text-lg sm:text-xl font-black leading-tight">{b.title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white/90 group-hover:text-white transition">
                    {b.cta} <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
