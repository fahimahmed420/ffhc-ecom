import { Truck, RotateCcw, ShieldCheck, PackageSearch } from "lucide-react";

const FEATURES = [
  {
    icon: PackageSearch,
    bg: "bg-blue-50",
    iconBg: "bg-blue-500",
    accent: "border-blue-100",
    label: "Sourcing",
    title: "Direct from China",
    desc: "We work directly with trusted Chinese suppliers — no middlemen, better prices for you.",
  },
  {
    icon: ShieldCheck,
    bg: "bg-green-50",
    iconBg: "bg-green-500",
    accent: "border-green-100",
    label: "Payments",
    title: "Secure & Trusted",
    desc: "Cash on delivery available. Pay only when your order arrives at your door.",
  },
  {
    icon: Truck,
    bg: "bg-orange-50",
    iconBg: "bg-orange-500",
    accent: "border-orange-100",
    label: "Delivery",
    title: "Nationwide Delivery",
    desc: "We deliver to all 64 districts. Dhaka in 1–2 days, rest of Bangladesh in 3–5 days.",
  },
  {
    icon: RotateCcw,
    bg: "bg-purple-50",
    iconBg: "bg-purple-500",
    accent: "border-purple-100",
    label: "Returns",
    title: "Easy Returns",
    desc: "Not happy? Our 7-day hassle-free return policy ensures you're always covered.",
  },
];

export default function OurFocus() {
  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-7 md:mb-12 md:text-center">
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">Our Promise</p>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            Why Thousands<br className="sm:hidden" /> Choose Us
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-sm md:mx-auto leading-relaxed">
            Built on trust, quality, and customer satisfaction across Bangladesh.
          </p>
        </div>

        {/* Mobile: vertical list with icon-left layout */}
        <div className="flex flex-col gap-3 md:hidden">
          {FEATURES.map(({ icon: Icon, bg, iconBg, accent, label, title, desc }) => (
            <div
              key={title}
              className={`flex items-start gap-4 ${bg} border ${accent} rounded-2xl p-4`}
            >
              {/* Icon */}
              <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className="text-white" />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: 4-column card grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, iconBg, title, desc }) => (
            <div
              key={title}
              className="bg-gray-50 rounded-3xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
