import Image from "next/image";
import Link from "next/link";
import { PackageSearch, ShieldCheck, Truck, Headphones, ArrowRight } from "lucide-react";

const OFFERS = [
  { title: "Wide Variety", desc: "Electronics, fashion, home essentials, and more — all in one place." },
  { title: "Affordable Prices", desc: "We cut out middlemen to give you the best value for money." },
  { title: "Reliable Shipping", desc: "Fast, secure delivery with tracking to your doorstep." },
];

const WHY = [
  { icon: PackageSearch, color: "bg-blue-500", title: "Direct Sourcing", desc: "Products come straight from trusted Chinese manufacturers." },
  { icon: ShieldCheck, color: "bg-green-500", title: "Quality Assurance", desc: "Every product is reviewed and verified before listing." },
  { icon: Truck, color: "bg-orange-500", title: "Fast Delivery", desc: "Nationwide delivery — Dhaka in 1-2 days, rest in 3-5 days." },
  { icon: Headphones, color: "bg-purple-500", title: "24/7 Support", desc: "Dedicated WhatsApp support whenever you need help." },
];

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <div className="bg-gray-900 text-white px-4 sm:px-6 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-4">
            Bringing China&apos;s Best to<br className="hidden sm:block" /> Bangladesh
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            Your trusted destination for affordable, high-quality products sourced directly from China — delivered to your door across Bangladesh.
          </p>
        </div>
      </div>

      {/* ── Our Story ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-2">Our Story</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">We Started with a Simple Idea</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              Make global products accessible to everyone in Bangladesh by removing unnecessary middlemen and reducing costs.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              From everyday essentials to unique finds, we bring a wide range of products directly from trusted Chinese suppliers — so you always get the best price.
            </p>
          </div>
          <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden border border-gray-100">
            <Image src="/Ffh china logo.png" alt="Family Fashion Hub China" fill className="object-contain bg-gray-50 p-4" />
          </div>
        </div>
      </div>

      {/* ── What We Offer ── */}
      <div className="bg-gray-50 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 md:text-center">
            <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">What We Offer</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Everything You Need</h2>
          </div>

          {/* Mobile: list rows */}
          <div className="flex flex-col gap-3 md:hidden">
            {OFFERS.map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Desktop: 3-col grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-5">
            {OFFERS.map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-md transition">
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="bg-gray-900 rounded-3xl px-6 py-10 md:px-16 md:py-14 text-center text-white">
          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-widest mb-3">Our Mission</p>
          <h2 className="text-xl sm:text-2xl font-black mb-4">Simplify Global Shopping for Bangladesh</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            To connect customers across Bangladesh with quality products from China while ensuring affordability, transparency, and trust at every step.
          </p>
        </div>
      </div>

      {/* ── Why Choose Us ── */}
      <div className="bg-gray-50 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 md:text-center">
            <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">Why Us</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Why Thousands Trust Us</h2>
          </div>

          {/* Mobile rows */}
          <div className="flex flex-col gap-3 md:hidden">
            {WHY.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-4">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-5">
            {WHY.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">Start Shopping Today</h2>
        <p className="text-sm text-gray-500 mb-7 max-w-sm mx-auto">
          Explore thousands of products at unbeatable prices — delivered across Bangladesh.
        </p>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-700 transition"
        >
          Browse Products <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  );
}
