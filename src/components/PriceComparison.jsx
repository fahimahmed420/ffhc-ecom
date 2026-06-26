"use client";

import { ShoppingBag, Building2, CheckCircle2, MessageCircleMore, ArrowRight } from "lucide-react";

const MODES = [
  {
    icon: ShoppingBag,
    iconBg: "bg-gray-900",
    bg: "bg-gray-50",
    border: "border-gray-100",
    label: "For Everyone",
    title: "Buy as Customer",
    desc: "Shop our store and get anything delivered to your door across Bangladesh.",
    points: [
      "Instant checkout, no minimum order",
      "Nationwide Cash on Delivery",
      "Easy 7-day returns",
      "5,000+ products online",
    ],
    cta: { label: "Browse Products", href: "/collections", style: "bg-gray-900 text-white hover:bg-gray-700" },
    external: false,
  },
  {
    icon: Building2,
    iconBg: "bg-white/15",
    bg: "bg-gray-900",
    border: "border-gray-800",
    label: "For Businesses",
    title: "Buy in Bulk",
    desc: "Wholesale pricing, exclusive products, and support for resellers and shops.",
    points: [
      "Special bulk & wholesale pricing",
      "Exclusive products not listed online",
      "Dedicated account support",
      "Order large quantities anytime",
    ],
    cta: {
      label: "Contact on WhatsApp",
      href: "https://wa.me/8801774433063?text=Hello%20I%20want%20to%20buy%20in%20bulk",
      style: "bg-green-500 text-white hover:bg-green-400",
    },
    external: true,
    dark: true,
  },
];

export default function PriceComparison() {
  return (
    <section className="py-10 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-7 md:mb-12 md:text-center">
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">How to Shop</p>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            Choose Your<br className="sm:hidden" /> Shopping Mode
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-sm md:mx-auto leading-relaxed">
            Whether you&apos;re buying for yourself or running a business — we have a plan for you.
          </p>
        </div>

        {/* Mobile: vertical stacked rows */}
        <div className="flex flex-col gap-3 md:hidden">
          {MODES.map(({ icon: Icon, iconBg, bg, border, label, title, desc, cta, external, dark }) => (
            <div key={title} className={`${bg} border ${border} rounded-2xl p-4 flex items-start gap-4`}>
              {/* Icon */}
              <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={dark ? "text-white" : "text-white"} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${dark ? "text-gray-400" : "text-gray-400"}`}>{label}</p>
                <h3 className={`text-sm font-bold leading-snug mb-1 ${dark ? "text-white" : "text-gray-900"}`}>{title}</h3>
                <p className={`text-xs leading-relaxed mb-3 ${dark ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>
                <a
                  href={cta.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition ${cta.style}`}
                >
                  {external && <MessageCircleMore size={13} />}
                  {!external && <ArrowRight size={13} />}
                  {cta.label}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: two-column card layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {MODES.map(({ icon: Icon, iconBg, bg, border, label, title, desc, points, cta, external, dark }) => (
            <div key={title} className={`${bg} border-2 ${border} rounded-3xl p-7 flex flex-col`}>
              <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                <Icon size={22} className="text-white" />
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${dark ? "text-gray-400" : "text-gray-400"}`}>{label}</p>
              <h3 className={`text-xl font-black mb-2 ${dark ? "text-white" : "text-gray-900"}`}>{title}</h3>
              <p className={`text-sm mb-5 leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {points.map((pt) => (
                  <li key={pt} className={`flex items-start gap-2 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
                    <CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${dark ? "text-green-400" : "text-green-500"}`} />
                    {pt}
                  </li>
                ))}
              </ul>
              <a
                href={cta.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={`flex items-center justify-center gap-2 w-full py-3 font-semibold text-sm rounded-2xl transition ${cta.style}`}
              >
                {external ? <MessageCircleMore size={16} /> : <ArrowRight size={16} />}
                {cta.label}
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
