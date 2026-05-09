"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { MdLocalShipping } from "react-icons/md";
import { GiReturnArrow } from "react-icons/gi";
import { IoMdStar, IoMdStarHalf, IoMdStarOutline } from "react-icons/io";

export default function ProductClient({ initialData }) {
  /* ================= STATE ================= */

  const [product] = useState(initialData.product);

  const [related] = useState(initialData.related);

  const [quantity, setQuantity] = useState(1);

  const isLowStock = product.stock > 0 && product.stock <= 5;

  const [mainImage, setMainImage] = useState(
    initialData.product.images?.[0] ||
      initialData.product.thumbnail ||
      "/fallback.png",
  );

  const [wishlist, setWishlist] = useState([]);

  const [toast, setToast] = useState(null);

  const [reviews, setReviews] = useState(initialData.product.reviews || []);

  const [showReviewModal, setShowReviewModal] = useState(false);

  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  const isLoggedIn = true;

  /* ================= INIT ================= */

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    setWishlist(storedWishlist);
  }, []);

  /* ================= HELPERS ================= */

  const showToast = (msg) => {
    setToast(msg);

    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const renderStars = (rating = 0) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<IoMdStar key={i} />);
      } else if (i - rating <= 0.5) {
        stars.push(<IoMdStarHalf key={i} />);
      } else {
        stars.push(<IoMdStarOutline key={i} />);
      }
    }

    return stars;
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : 0;

  /* ================= CART ================= */

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const id = String(product._id);

    const qty = Number(quantity);

    const existing = cart.find((item) => item.id === id);

    let updated;

    if (existing) {
      updated = cart.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: item.qty + qty,
            }
          : item,
      );
    } else {
      updated = [...cart, { id, qty }];
    }

    localStorage.setItem("cart", JSON.stringify(updated));

    showToast("Added to cart 🛒");
  };

  /* ================= WISHLIST ================= */

  const toggleWishlist = () => {
    let updated;

    const isWishlisted = wishlist.find((item) => item._id === product._id);

    if (isWishlisted) {
      updated = wishlist.filter((item) => item._id !== product._id);

      showToast("Removed from wishlist");
    } else {
      updated = [...wishlist, product];

      showToast("Added to wishlist ❤️");
    }

    setWishlist([...updated]);

    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  /* ================= REVIEW ================= */

  const handleReviewSubmit = async () => {
    const name = newReview.name.trim();

    const comment = newReview.comment.trim();

    const rating = Number(newReview.rating);

    if (!name || !comment || !rating) {
      showToast("All fields are required ⭐");
      return;
    }

    try {
      const reviewPayload = {
        name,
        rating,
        comment,
        email: "",
      };

      const res = await fetch(`/api/products/${product._id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to submit review");

        return;
      }

      setReviews(data.reviews || []);

      setShowReviewModal(false);

      setNewReview({
        name: "",
        rating: 5,
        comment: "",
      });

      showToast("Review submitted ⭐");
    } catch (err) {
      console.error(err);

      showToast("Something went wrong");
    }
  };

  /* ================= DERIVED ================= */

  if (!product) {
    return <p className="text-center mt-20 text-gray-500">Product not found</p>;
  }

  const finalPrice =
    product.discountPrice > 0 ? product.discountPrice : product.price;

  const inStock =
    product.availabilityStatus === "In Stock" || product.stock > 0;

  const isWishlisted = wishlist.find((item) => item._id === product._id);

  /* ================= UI ================= */

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      {/* TOAST */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-6 py-3 rounded-full shadow-2xl">
          {toast}
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/">Home</Link> &gt;{" "}
        <Link href="/collections">Collections</Link> &gt;{" "}
        <span className="text-black">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* IMAGES */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative h-[450px] w-full mb-4 rounded-lg overflow-hidden border border-gray-100">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover"
              loading="eager"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {product.images?.map((img, i) => (
              <div
                key={i}
                onClick={() => setMainImage(img)}
                className={`cursor-pointer h-24 relative rounded-lg overflow-hidden border transition ${
                  img === mainImage
                    ? "border-black shadow-sm"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover bg-white"
                  sizes="100px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="md:sticky md:top-24 h-fit">
          {/* DISCOUNT */}
          {product.discountPrice > 0 && (
            <p className="text-red-600 mb-2 font-bold uppercase text-xs tracking-widest">
              🔥 Special Discount Available
            </p>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            {product.title}
          </h1>

          {/* RATING */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-yellow-500 flex text-lg">
              {renderStars(avgRating)}
            </span>

            <span className="text-sm text-gray-500 font-medium">
              {avgRating.toFixed(1)} ({reviews.length} reviews)
            </span>
          </div>

          {/* PRICE */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="text-3xl font-bold text-black">
              ৳{finalPrice.toFixed(2)}
            </span>

            {product.discountPrice > 0 && (
              <span className="line-through text-gray-400 text-lg">
                ৳{product.price.toFixed(2)}
              </span>
            )}

            {product.discountPrice > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                SAVE <span className="text-sm">৳</span>{(product.price - product.discountPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          <p className="text-gray-600 leading-relaxed mb-8 text-lg">
            {product.description}
          </p>

          {/* STOCK */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <span
              className={`w-3 h-3 rounded-full ${
                inStock ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {inStock ? "In Stock" : "Out of Stock"}
            </p>

            {inStock && (
              <span className="text-sm text-gray-500">
                ({product.stock || 0} available)
              </span>
            )}

            {/* 🔥 LOW STOCK BADGE */}
            {isLowStock && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-semibold">
                ⚠️ Low Stock
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              {/* QUANTITY */}
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-5 py-3 hover:bg-gray-50 transition"
                >
                  −
                </button>

                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-5 py-3 hover:bg-gray-50 transition"
                >
                  +
                </button>
              </div>

              {/* ADD TO CART */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock || product.stock <= 0}
                className={`flex-1 py-4 rounded-lg font-bold transition
                  ${
                    !inStock || product.stock <= 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 text-white"
                  }`}
              >
                ADD TO CART
              </button>
            </div>

            {/* WISHLIST */}
            <button
              onClick={toggleWishlist}
              className="w-full py-4 border border-gray-300 rounded-lg font-semibold hover:bg-black hover:text-white transition flex justify-center items-center gap-2"
            >
              {isWishlisted ? "❤️ SAVED TO WISHLIST" : "♡ SAVE TO WISHLIST"}
            </button>
          </div>

          {/* SHIPPING */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-100 p-5 bg-gray-50/50 rounded-xl flex flex-col items-center text-center">
              <MdLocalShipping className="text-3xl mb-2 text-gray-700" />

              <p className="font-bold text-xs uppercase mb-1">Shipping</p>

              <p className="text-xs text-gray-500">
                {product.shippingInformation || "Free standard shipping"}
              </p>
            </div>

            {/* RETURNS */}
            <div className="border border-gray-100 p-5 bg-gray-50/50 rounded-xl flex flex-col items-center text-center">
              <GiReturnArrow className="text-3xl mb-2 text-gray-700" />

              <p className="font-bold text-xs uppercase mb-1">Returns</p>

              <p className="text-xs text-gray-500">
                {product.returnPolicy || "30-day return policy"}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Reviews Section */}
      <div className="mt-32 border-t border-gray-100 pt-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Verified Reviews</h2>
            <p className="text-gray-500">
              What our customers are saying about this product
            </p>
          </div>
          <button
            onClick={() => isLoggedIn && setShowReviewModal(true)}
            className="px-8 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition shadow-lg"
          >
            Write a Review
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {reviews.length > 0 ? (
            reviews.map((r, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-lg">{r.name}</span>
                  <div className="text-yellow-500">{renderStars(r.rating)}</div>
                </div>
                <p className="text-gray-600 italic">"{r.comment}"</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">
              No reviews yet. Be the first to write one!
            </p>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20">
        <h2 className="text-2xl font-semibold mb-6">You May Also Like</h2>
        {related.length === 0 ? (
          <p className="text-gray-400">No related products found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => {
              const discounted = p.discountPercentage
                ? (p.price * (100 - p.discountPercentage)) / 100
                : p.price;

              return (
                <Link key={p._id} href={`/collections/${p._id}`}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white transition hover:shadow-md cursor-pointer"
                  >
                    <div className="relative h-48 w-full bg-white border-b border-gray-100 overflow-hidden">
                      <Image
                        src={p.thumbnail || "/fallback.png"}
                        alt={p.title}
                        fill
                        className="object-cover" // or object-contain if you prefer
                        sizes="200px"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-sm font-medium line-clamp-2 mb-2">
                        {p.title}
                      </p>
                      <div className="flex gap-2 text-sm items-center">
                        {p.discountPercentage && (
                          <span className="line-through text-gray-400">
                            ${p.price}
                          </span>
                        )}
                        <span className="font-semibold">
                          ${discounted.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-6">Share Your Thoughts</h3>
            <input
              placeholder="Full Name"
              className="w-full p-4 bg-gray-50 rounded-xl border-none mb-4 focus:ring-2 focus:ring-black outline-none"
              value={newReview.name}
              onChange={(e) =>
                setNewReview({ ...newReview, name: e.target.value })
              }
            />
            <div className="flex gap-2 mb-6 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setNewReview({ ...newReview, rating: s })}
                  className={`text-3xl ${s <= newReview.rating ? "text-yellow-500" : "text-gray-200"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder="What did you think of the product?"
              rows={4}
              className="w-full p-4 bg-gray-50 rounded-xl border-none mb-6 focus:ring-2 focus:ring-black outline-none"
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 font-bold text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="flex-1 py-3 bg-black text-white rounded-xl font-bold"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
