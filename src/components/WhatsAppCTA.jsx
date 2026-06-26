import { MessageCircleMore } from "lucide-react";

export default function WhatsAppCTA() {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-12 md:px-16 md:py-16 text-center">
          {/* Glow blobs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <MessageCircleMore size={13} />
              WHATSAPP SUPPORT
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-3">
              চায়না থেকে পণ্য আনাতে চান?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
              পাইকারি মূল্যে অর্ডার করুন। ওয়েবসাইটে না থাকা হাজারো পণ্যের কালেকশন WhatsApp-এ পাবেন।
              সরাসরি যোগাযোগ করুন — আমরা সাহায্য করতে সবসময় প্রস্তুত।
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/8801774433063?text=Hello%20I%20want%20to%20order%20products"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition active:scale-95"
              >
                <MessageCircleMore size={18} />
                WhatsApp-এ মেসেজ করুন
              </a>
              <a
                href="/collections"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm transition active:scale-95"
              >
                সব পণ্য দেখুন →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
