"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddCouponPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    expiryDate: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase(),
          isActive: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create coupon");
        return;
      }

      toast.success("Coupon created 🎉");

      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minPurchase: "",
        maxDiscount: "",
        expiryDate: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white border border-gray-200 shadow-lg rounded-2xl p-6 md:p-8">
        
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Create Coupon
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Code */}
          <input
            type="text"
            placeholder="Coupon Code (e.g. EID50)"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition"
          />

          {/* Type */}
          <select
            value={form.discountType}
            onChange={(e) =>
              setForm({ ...form, discountType: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (৳)</option>
          </select>

          {/* Discount */}
          <input
            type="number"
            placeholder="Discount Value"
            value={form.discountValue}
            onChange={(e) =>
              setForm({ ...form, discountValue: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition"
          />

          {/* Min Purchase */}
          <input
            type="number"
            placeholder="Minimum Purchase"
            value={form.minPurchase}
            onChange={(e) =>
              setForm({ ...form, minPurchase: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition"
          />

          {/* Max Discount */}
          <input
            type="number"
            placeholder="Max Discount (optional)"
            value={form.maxDiscount}
            onChange={(e) =>
              setForm({ ...form, maxDiscount: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition"
          />

          {/* Expiry */}
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) =>
              setForm({ ...form, expiryDate: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition"
          />

          {/* Button */}
          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </div>
    </div>
  );
}