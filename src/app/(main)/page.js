import Hero from "@/components/Hero";
import BestSelling from "@/components/BestSelling";
import PromoBanners from "@/components/PromoBanners";
import PriceComparison from "@/components/PriceComparison";
import StatsBar from "@/components/StatsBar";
import OurFocus from "@/components/OurFocus";
import WhatsAppCTA from "@/components/WhatsAppCTA";

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* 1. Hero — announcement bar + slider + promo tiles + category strip + trust bar */}
      <Hero />

      {/* 2. Best Selling products */}
      <BestSelling />

      {/* 3. Three promo banner tiles */}
      <PromoBanners />

      {/* 4. Retail vs Wholesale mode */}
      <PriceComparison />

      {/* 5. Stats counter strip */}
      <StatsBar />

      {/* 6. Why choose us */}
      <OurFocus />

      {/* 7. WhatsApp / wholesale CTA */}
      <WhatsAppCTA />
    </div>
  );
}
