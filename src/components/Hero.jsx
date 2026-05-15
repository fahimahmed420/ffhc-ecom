"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TiltCard from "./TiltCard";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative h-screen overflow-hidden text-white">

      {/* Background Image - Mobile */}
      <Image
        src="/hero-small.png"
        fill
        priority
        sizes="100vw"
        className="object-cover block md:hidden"
        alt="Hero mobile background"
      />

      {/* Background Image - Desktop */}
      <Image
        src="/hero-large.png"
        fill
        priority
        sizes="100vw"
        className="object-cover hidden md:block"
        alt="Hero desktop background"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-transparent" />

      {/* Glow Effect */}
      <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-orange-500/20 blur-[120px] rounded-full" />

      {/* Content Wrapper */}
      <div className="relative z-10 h-full flex items-center justify-between px-6 md:px-16">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl backdrop-blur-xl bg-white/10 p-8 md:p-10 rounded-2xl border border-white/20 shadow-2xl"
        >
          <div className="inline-block mb-4 px-3 py-1 text-xs tracking-widest bg-white/10 border border-white/20 rounded-full">
            GLOBAL SOURCING PLATFORM
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Import Products From China
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
              Sell Across Bangladesh
            </span>
          </h1>

          <p className="text-sm md:text-base text-white/80 mb-6 leading-relaxed">
            Import the best quality products from China and scale your online &
            offline business with confidence, speed, and reliability.
          </p>

          <button
            onClick={() => router.push("/collections")}
            className="bg-white text-black px-6 py-3 text-sm rounded-xl tracking-widest font-semibold hover:bg-orange-400 transition duration-300 shadow-lg"
          >
            GET STARTED
          </button>
        </motion.div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex relative w-[40%] h-[70%] items-center justify-center">

          {/* Card 1 */}
          <TiltCard className="absolute bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl rounded-xl">
            <p className="text-sm mb-2 text-white/70">Top Product</p>

            <div className="relative w-28 h-28">
              <Image
                src="/new arrivals/black-headphones-digital-device.jpg"
                alt="Top product"
                fill
                className="object-cover rounded-xl"
                sizes="112px"
              />
            </div>
          </TiltCard>

          {/* Card 2 */}
          <TiltCard className="absolute bottom-10 right-10 bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl rounded-xl">
            <p className="text-sm mb-2 text-white/70">Fast Delivery</p>

            <div className="relative w-28 h-28">
              <Image
                src="/a.jpg"
                alt="Fast delivery product"
                fill
                className="object-cover rounded-xl"
                sizes="112px"
              />
            </div>
          </TiltCard>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-widest opacity-80">
        SCROLL
      </div>
    </section>
  );
}