"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, StarHalf, Truck, RotateCcw, Heart, ShoppingCart,
  Minus, Plus, X, ChevronRight, ChevronLeft, Share2,
  MessageCircle, ZoomIn, ArrowLeft, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const WHATSAPP_NUMBER = "8801774433063";

function StarRating({ rating, size = 13 }) {
  return (
    <span className="flex items-center gap-0.5 text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < Math.floor(rating)) return <Star key={i} size={size} className="fill-current" />;
        if (i + 0.5 <= rating) return <StarHalf key={i} size={size} className="fill-current" />;
        return <Star key={i} size={size} className="text-gray-200 fill-current" />;
      })}
    </span>
  );
}

function RatingBreakdown({ reviews }) {
  const total = reviews.length;
  if (total === 0) return null;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  return (
    <div className="space-y-1.5 mb-6">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
          <Star size={10} className="text-yellow-400 fill-yellow-400 shrink-0" />
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: total ? `${(count / total) * 100}%` : "0%" }} />
          </div>
          <span className="text-xs text-gray-400 w-4">{count}</span>
        </div>
      ))}
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-bold text-sm text-gray-900">{title}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function ProductClient({ initialData }) {
  const product = initialData?.product || {};
  const related = initialData?.related || [];

  const router = useRouter();
  const { cart, addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();

  const images = product.images?.length ? product.images : [product.thumbnail || "/fallback.png"];

  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(images[0]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState(product.reviews || []);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeImg, setActiveImg] = useState(0);

  const galleryRef = useRef(null);

  const productId = String(product._id);
  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const inStock = product.availabilityStatus === "In Stock" || product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discount = product.discountPrice > 0 && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const isWishlisted = wishlist.some((item) => String(item._id) === productId);
  const isAlreadyInCart = useMemo(
    () => cart.some((item) => (typeof item === "string" ? item : item.id) === productId),
    [cart, productId]
  );
  const avgRating = reviews.length
    ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length : 0;

  const specs = [
    { label: "Category", value: product.category },
    { label: "Brand", value: product.brand },
    { label: "SKU", value: product.sku },
    { label: "Weight", value: product.weight },
    { label: "Material", value: product.material },
    { label: "Dimensions", value: product.dimensions },
  ].filter((s) => s.value);

  useEffect(() => {
    setWishlist(JSON.parse(localStorage.getItem("wishlist") || "[]"));
  }, []);

  /* gallery scroll → active dot */
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveImg(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* lightbox keyboard */
  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, images.length]);

  const scrollToImg = (i) => {
    galleryRef.current?.scrollTo({ left: i * galleryRef.current.offsetWidth, behavior: "smooth" });
    setActiveImg(i);
  };

  const toggleWishlist = () => {
    const updated = isWishlisted
      ? wishlist.filter((item) => String(item._id) !== productId)
      : [...wishlist, product];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  const handleAddToCart = async () => {
    if (!inStock) { toast.error("Out of stock"); return; }
    try { setAdding(true); await addToCart(productId, quantity); }
    catch { toast.error("Failed to add to cart"); }
    finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    if (!inStock) { toast.error("Out of stock"); return; }
    try {
      setBuyingNow(true);
      if (!isAlreadyInCart) await addToCart(productId, quantity);
      router.push("/cart");
    } catch { toast.error("Failed"); }
    finally { setBuyingNow(false); }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch { toast.error("Could not copy link"); }
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'm interested in: ${product.title}\n${typeof window !== "undefined" ? window.location.href : ""}`
  )}`;

  const handleReviewSubmit = async () => {
    const name = newReview.name.trim();
    const comment = newReview.comment.trim();
    if (!name || !comment) { toast.error("All fields are required"); return; }
    try {
      const res = await fetch(`/api/products/${productId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating: Number(newReview.rating), comment, email: "" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.error || "Failed"); return; }
      setReviews(data.reviews || []);
      setShowReviewModal(false);
      setNewReview({ name: "", rating: 5, comment: "" });
      toast.success("Review submitted ⭐");
    } catch { toast.error("Something went wrong"); }
  };

  if (!product?._id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-5xl">😕</p>
        <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-sm text-gray-500">This product may have been removed or the link is invalid.</p>
        <Link href="/collections" className="mt-2 px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition">
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">

      {/* ════════════════════════════════════════
          MOBILE LAYOUT
      ════════════════════════════════════════ */}
      <div className="md:hidden">

        {/* ── Image section: thumbnails left, main right ── */}
        <div className="px-3 pt-3">
          {/* Back + actions row */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={toggleWishlist}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${isWishlisted ? "bg-red-50" : "bg-gray-100"}`}
              >
                <Heart size={15} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} />
              </button>
              <button
                onClick={handleShare}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>

          {/* Thumbnails left + main image right */}
          <div className="flex gap-2">
            {/* Thumbnail column */}
            {images.length > 1 && (
              <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide" style={{ maxHeight: "62vw" }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition ${img === mainImage ? "border-gray-900" : "border-gray-100"}`}
                    style={{ width: 52, height: 52 }}
                  >
                    <Image src={img} alt={`${product.title}-${i}`} fill className="object-cover" sizes="52px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div
              className="relative flex-1 bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in"
              style={{ aspectRatio: "1/1" }}
              onClick={() => { setLightboxIndex(images.indexOf(mainImage) >= 0 ? images.indexOf(mainImage) : 0); setLightboxOpen(true); }}
            >
              <Image src={mainImage} alt={product.title} fill priority className="object-cover" sizes="80vw" />
              {discount > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
              <div className="absolute bottom-2 right-2 w-7 h-7 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ZoomIn size={13} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content card ── */}
        <div className="relative -mt-5 bg-white rounded-t-3xl pb-40 z-10">
          <div className="px-4 pt-5">

            {/* Category pill */}
            {product.category && (
              <span className="inline-block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-xl font-black text-gray-900 leading-snug mb-2">
              {product.title}
            </h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={avgRating} />
                <span className="text-xs text-gray-500 font-medium">
                  {avgRating.toFixed(1)} <span className="text-gray-300">·</span> {reviews.length} reviews
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <span className="text-3xl font-black text-gray-900">৳{Number(finalPrice).toFixed(0)}</span>
              {discount > 0 && (
                <span className="text-base text-gray-400 line-through font-medium">৳{Number(product.price).toFixed(0)}</span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-xs font-semibold text-green-600 mb-3">
                You save ৳{(Number(product.price) - Number(product.discountPrice)).toFixed(0)}
              </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${inStock ? "bg-green-500" : "bg-red-400"}`} />
              <span className={`text-xs font-semibold ${inStock ? "text-green-700" : "text-red-500"}`}>
                {inStock ? `In Stock · ${product.stock} left` : "Out of Stock"}
              </span>
              {isLowStock && (
                <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Low Stock
                </span>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-2 py-1 border border-gray-100">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-black text-gray-900 text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-2 mb-5 active:scale-[0.98] transition"
            >
              <MessageCircle size={16} />
              Order via WhatsApp
            </a>

            {/* Divider */}
            <div className="h-px bg-gray-100 mb-1" />

            {/* Description accordion */}
            <Accordion title="Description" defaultOpen>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </Accordion>

            {/* Specs accordion */}
            {specs.length > 0 && (
              <Accordion title="Specifications">
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {specs.map(({ label, value }, i) => (
                    <div key={label} className={`flex text-xs ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <span className="w-28 shrink-0 px-3 py-2.5 font-semibold text-gray-500">{label}</span>
                      <span className="px-3 py-2.5 text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </Accordion>
            )}

            {/* Shipping & Returns */}
            <Accordion title="Shipping & Returns">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Truck, label: "Shipping", value: product.shippingInformation || "Standard Shipping" },
                  { icon: RotateCcw, label: "Returns", value: product.returnPolicy || "7-day return policy" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs text-gray-700 mt-0.5 leading-snug">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>

            {/* Reviews accordion */}
            <Accordion title={`Reviews (${reviews.length})`}>
              <div className="flex items-center justify-between mb-4 gap-3">
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
                    <div>
                      <StarRating rating={avgRating} size={14} />
                      <p className="text-[11px] text-gray-400 mt-0.5">{reviews.length} reviews</p>
                    </div>
                  </div>
                )}
                {user ? (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="shrink-0 px-4 py-2 bg-gray-900 text-white rounded-full font-semibold text-xs"
                  >
                    Write Review
                  </button>
                ) : (
                  <Link href="/auth" className="shrink-0 px-4 py-2 border border-gray-300 rounded-full font-semibold text-xs">
                    Login to Review
                  </Link>
                )}
              </div>

              {reviews.length > 0 && <RatingBreakdown reviews={reviews} />}

              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No reviews yet — be the first!</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-black text-gray-600">
                            {r.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-bold text-sm text-gray-900">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={r.rating} size={11} />
                          {(r.date || r.createdAt) && (
                            <span className="text-[11px] text-gray-400">
                              {new Date(r.date || r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </Accordion>

            {/* Related products */}
            {related.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-base text-gray-900">You May Also Like</h2>
                  {product.category && (
                    <Link href={`/collections?category=${encodeURIComponent(product.category)}`}
                      className="text-xs font-semibold text-gray-400 flex items-center gap-0.5">
                      See all <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                  {related.map((p) => {
                    const fp = p.discountPrice > 0 ? p.discountPrice : p.price;
                    const dp = p.discountPrice > 0 && p.price > p.discountPrice
                      ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
                    return (
                      <Link key={p._id} href={`/collections/${p._id}`} className="shrink-0 w-36 block">
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                          <div className="relative aspect-square bg-gray-50">
                            <Image src={p.images?.[0] || p.thumbnail || "/fallback.png"} alt={p.title} fill className="object-cover" sizes="144px" />
                            {dp > 0 && <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-{dp}%</span>}
                          </div>
                          <div className="p-2.5">
                            <p className="text-[11px] font-medium text-gray-800 line-clamp-2 mb-1 leading-snug">{p.title}</p>
                            <span className="text-xs font-black text-gray-900">৳{Number(fp).toFixed(0)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile sticky bottom CTA ── */}
        <div className="fixed bottom-16 inset-x-0 z-40 px-4 pb-2">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl px-3 py-3 flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAlreadyInCart || adding || cartLoading}
              className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.97] ${
                !inStock ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isAlreadyInCart ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {adding ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : isAlreadyInCart ? <><ShoppingCart size={14} /> In Cart</>
                : <><ShoppingCart size={14} /> Add to Cart</>}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock || buyingNow}
              className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.97] disabled:opacity-40"
            >
              {buyingNow
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : "Buy Now"}
            </button>
          </div>
        </div>
      </div>


      {/* ════════════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════════════ */}
      <div className="hidden md:block bg-white">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <ChevronRight size={11} />
            <Link href="/collections" className="hover:text-gray-700 transition">Collections</Link>
            <ChevronRight size={11} />
            <span className="text-gray-700 font-medium line-clamp-1">{product.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Desktop images — thumbnails left, main right */}
            <div className="flex gap-3">
              {/* Thumbnail column */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide max-h-[520px]">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(img)}
                      className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition ${img === mainImage ? "border-gray-900" : "border-gray-100 hover:border-gray-300"}`}
                    >
                      <Image src={img} alt={`${product.title}-${i}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div
                className="relative flex-1 aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 cursor-zoom-in group"
                onClick={() => { setLightboxIndex(images.indexOf(mainImage) >= 0 ? images.indexOf(mainImage) : 0); setLightboxOpen(true); }}
              >
                <Image src={mainImage} alt={product.title} fill priority className="object-cover" sizes="50vw" />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>
                )}
                <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <ZoomIn size={14} className="text-white" />
                </div>
              </div>
            </div>

            {/* Desktop info */}
            <div className="sticky top-24 h-fit">
              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">{product.title}</h1>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={avgRating} />
                  <span className="text-xs text-gray-500">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                <span className="text-3xl font-black text-gray-900">৳{Number(finalPrice).toFixed(0)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-base text-gray-400 line-through">৳{Number(product.price).toFixed(0)}</span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      Save ৳{(Number(product.price) - Number(product.discountPrice)).toFixed(0)}
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4 mt-3">{product.description}</p>

              <div className="flex items-center gap-2 mb-5">
                <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`text-xs font-semibold ${inStock ? "text-green-700" : "text-red-600"}`}>
                  {inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
                </span>
                {isLowStock && (
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Low Stock</span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"><Minus size={14} /></button>
                    <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"><Plus size={14} /></button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock || isAlreadyInCart || adding || cartLoading}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                      !inStock ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : isAlreadyInCart ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-gray-700"
                    }`}
                  >
                    {adding ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : isAlreadyInCart ? "✓ In Cart" : <><ShoppingCart size={15} /> Add to Cart</>}
                  </button>
                  <button onClick={toggleWishlist} className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition shrink-0 ${isWishlisted ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-400"}`}>
                    <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"} />
                  </button>
                  <button onClick={handleShare} className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition shrink-0">
                    <Share2 size={15} />
                  </button>
                </div>

                <button onClick={handleBuyNow} disabled={!inStock || buyingNow}
                  className="w-full py-3 rounded-xl border-2 border-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  {buyingNow ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : "Buy Now"}
                </button>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition flex items-center justify-center gap-2">
                  <MessageCircle size={15} />
                  Order via WhatsApp
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { icon: Truck, label: "Shipping", value: product.shippingInformation || "Standard Shipping" },
                  { icon: RotateCcw, label: "Returns", value: product.returnPolicy || "7-day return policy" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Icon size={15} className="text-gray-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs text-gray-700 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {specs.length > 0 && (
                <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
                  {specs.map(({ label, value }, i) => (
                    <div key={label} className={`flex text-xs ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <span className="w-28 shrink-0 px-3 py-2.5 font-semibold text-gray-500">{label}</span>
                      <span className="px-3 py-2.5 text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop reviews */}
          <div className="mt-20 border-t border-gray-100 pt-12">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Customer Reviews</h2>
                <p className="text-sm text-gray-400 mt-0.5">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
              {user ? (
                <button onClick={() => setShowReviewModal(true)} className="px-5 py-2.5 bg-gray-900 text-white rounded-full font-semibold text-sm hover:bg-gray-700 transition">
                  Write a Review
                </button>
              ) : (
                <Link href="/auth" className="px-5 py-2.5 border border-gray-300 rounded-full font-semibold text-sm hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                  Login to Review
                </Link>
              )}
            </div>
            {reviews.length > 0 && <RatingBreakdown reviews={reviews} />}
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No reviews yet — be the first to share your experience!</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {reviews.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">{r.name}</span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} />
                        {(r.date || r.createdAt) && (
                          <span className="text-xs text-gray-400">
                            {new Date(r.date || r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop related */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900">You May Also Like</h2>
                {product.category && (
                  <Link href={`/collections?category=${encodeURIComponent(product.category)}`}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition flex items-center gap-1">
                    See all in {product.category} <ChevronRight size={12} />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {related.map((p) => {
                  const fp = p.discountPrice > 0 ? p.discountPrice : p.price;
                  const dp = p.discountPrice > 0 && p.price > p.discountPrice
                    ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
                  return (
                    <Link key={p._id} href={`/collections/${p._id}`} className="group block">
                      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                          <Image src={p.images?.[0] || p.thumbnail || "/fallback.png"} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-400" sizes="25vw" />
                          {dp > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{dp}%</span>}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1.5">{p.title}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-900">৳{Number(fp).toFixed(0)}</span>
                            {dp > 0 && <span className="text-[11px] text-gray-400 line-through">৳{Number(p.price).toFixed(0)}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* ════════════════════════════════════════
          LIGHTBOX (shared)
      ════════════════════════════════════════ */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition z-10" onClick={() => setLightboxOpen(false)}>
            <X size={18} />
          </button>
          {images.length > 1 && (
            <button className="absolute left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i > 0 ? i - 1 : images.length - 1)); }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="relative w-full max-w-2xl aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image src={images[lightboxIndex]} alt={product.title} fill className="object-contain" sizes="100vw" priority />
          </div>
          {images.length > 1 && (
            <button className="absolute right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i < images.length - 1 ? i + 1 : 0)); }}>
              <ChevronRight size={20} />
            </button>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`rounded-full transition-all ${i === lightboxIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          REVIEW MODAL (shared)
      ════════════════════════════════════════ */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <X size={15} />
              </button>
            </div>
            <input placeholder="Your name"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 mb-3"
              value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} />
            <div className="flex gap-2 mb-3 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setNewReview({ ...newReview, rating: s })}
                  className={`text-3xl transition ${s <= newReview.rating ? "text-yellow-400" : "text-gray-200"}`}>★</button>
              ))}
            </div>
            <textarea placeholder="Share your experience..." rows={3}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 mb-4 resize-none"
              value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} />
            <div className="flex gap-3">
              <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleReviewSubmit} className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
