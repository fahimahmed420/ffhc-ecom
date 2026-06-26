"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, ShoppingCart, Star, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

function Skeleton() {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-44 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-7 w-20 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const rating =
    product.avgRating !== undefined
      ? product.avgRating
      : product.reviews?.length
      ? product.reviews.reduce((a, r) => a + (r.rating || 0), 0) / product.reviews.length
      : 0;

  const discount =
    product.price && product.discountPrice && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product._id, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={() => router.push(`/collections/${product._id}`)}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.thumbnail || "/fallback.png"}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
        />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}

        {/* Rating badge */}
        {rating > 0 && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/95 text-gray-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
            <Star size={9} className="fill-yellow-400 text-yellow-400" />
            {rating.toFixed(1)}
          </span>
        )}

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full py-2.5 bg-black/90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-black transition"
          >
            {adding ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={13} />
            )}
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5 truncate">{product.category}</p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1.5">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">৳{product.discountPrice || product.price}</span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">৳{product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BestSelling() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/best-selling")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (!products.length) return null;

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Best Sellers</h2>
              <p className="text-xs text-gray-400 hidden sm:block">Top picks loved by customers</p>
            </div>
          </div>
          <Link
            href="/collections"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-600 hover:text-black transition border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-full"
          >
            View All <ChevronRight size={13} />
          </Link>
        </div>

        {/* Grid — horizontal scroll on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-gray-700 transition"
          >
            See All Products <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
