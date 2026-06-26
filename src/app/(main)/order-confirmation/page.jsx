"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Home, MessageCircleMore } from "lucide-react";

export default function OrderConfirmationPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "—";
  const total = params.get("total");
  const name = params.get("name") || "Customer";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={44} className="text-green-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Order Placed! 🎉</h1>
          <p className="text-sm text-gray-500">
            Thank you, <span className="font-semibold text-gray-800">{name}</span>.
            Your order has been received.
          </p>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order ID</span>
              <span className="text-sm font-bold text-gray-900 font-mono tracking-wide">{orderId}</span>
            </div>
            {total && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-sm font-black text-gray-900">৳{Number(total).toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Payment</span>
              <span className="text-sm font-semibold text-gray-800">Cash on Delivery</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status</span>
              <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> Pending
              </span>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-5 text-xs text-blue-700 leading-relaxed">
          📦 Our team will contact you on your provided phone number to confirm delivery details.
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <Link
            href="/collections"
            className="flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-700 transition"
          >
            <ShoppingBag size={15} /> Keep Shopping
          </Link>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              <Home size={14} /> Go Home
            </Link>
            <a
              href="https://wa.me/8801774433063?text=Hello%20I%20placed%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-3 bg-green-500 text-white rounded-2xl text-sm font-semibold hover:bg-green-400 transition"
            >
              <MessageCircleMore size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
