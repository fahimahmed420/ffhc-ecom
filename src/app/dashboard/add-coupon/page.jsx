"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { TicketPercent, Sparkles } from "lucide-react";

const FIELD_CLASS =
  "w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-black/5 transition placeholder:text-gray-400";

const EMPTY = {
  code: "", discountType: "percentage", discountValue: "", minPurchase: "", maxDiscount: "", expiryDate: "",
};

export default function AddCouponPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) { toast.error("Code and discount value are required"); return; }

    try {
      setLoading(true);
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, code: form.code.trim().toUpperCase(), isActive: true }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to create coupon"); return; }
      toast.success("Coupon created 🎉");
      setForm(EMPTY);
    } catch { toast.error("Server error"); }
    finally { setLoading(false); }
  };

  /* live preview */
  const previewLabel = form.code
    ? `${form.code.toUpperCase()} — ${
        form.discountType === "percentage"
          ? `${form.discountValue || "?"}% off`
          : `৳${form.discountValue || "?"} off`
      }${form.minPurchase ? ` on ৳${form.minPurchase}+` : ""}`
    : null;

  return (
    <div className="max-w-xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
          <TicketPercent size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
          <p className="text-sm text-gray-500">Issue a discount code for customers</p>
        </div>
      </div>

      {/* Preview card */}
      {previewLabel && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl p-5 flex items-center gap-3">
          <Sparkles size={20} className="shrink-0 text-yellow-400" />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Preview</p>
            <p className="font-bold">{previewLabel}</p>
            {form.expiryDate && (
              <p className="text-xs text-gray-400 mt-0.5">Expires {new Date(form.expiryDate).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="text-xs text-gray-400 font-medium">Coupon Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="e.g. EID50"
              className={`${FIELD_CLASS} mt-1 uppercase font-mono font-bold tracking-widest`}
            />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium">Discount Type</label>
              <select value={form.discountType} onChange={(e) => set("discountType", e.target.value)} className={`${FIELD_CLASS} mt-1`}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">
                Discount Value {form.discountType === "percentage" ? "(%)" : "(৳)"} *
              </label>
              <input type="number" min="0" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "percentage" ? "e.g. 10" : "e.g. 100"}
                className={`${FIELD_CLASS} mt-1`} />
            </div>
          </div>

          {/* Min / Max */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium">Min. Purchase (৳)</label>
              <input type="number" min="0" value={form.minPurchase} onChange={(e) => set("minPurchase", e.target.value)}
                placeholder="0" className={`${FIELD_CLASS} mt-1`} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">Max Discount (৳)</label>
              <input type="number" min="0" value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)}
                placeholder="Optional" className={`${FIELD_CLASS} mt-1`} />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="text-xs text-gray-400 font-medium">Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)}
              className={`${FIELD_CLASS} mt-1`} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
            ) : (
              <><TicketPercent size={15} /> Create Coupon</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
