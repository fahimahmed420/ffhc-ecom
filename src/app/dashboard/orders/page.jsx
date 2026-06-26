"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Download,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  pending:    { icon: Clock,       color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", label: "Pending" },
  processing: { icon: AlertCircle, color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",     label: "Processing" },
  shipped:    { icon: Truck,       color: "text-purple-600", bg: "bg-purple-50 border-purple-200", label: "Shipped" },
  delivered:  { icon: CheckCircle, color: "text-green-600",  bg: "bg-green-50 border-green-200",   label: "Delivered" },
  cancelled:  { icon: XCircle,     color: "text-red-600",    bg: "bg-red-50 border-red-200",       label: "Cancelled" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (authLoading || !user?.email) {
      if (!authLoading) setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`, {
          headers: { "x-user-email": user.email },
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.message || "Failed to load orders"); return; }
        setOrders(data.orders || []);
      } catch { toast.error("Something went wrong"); }
      finally { setLoading(false); }
    })();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded-xl" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-2xl" />)}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Please log in to view orders.</p>
        <Link href="/auth" className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
          Go to Login
        </Link>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-20">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">You haven't placed any orders.</p>
        <Link href="/collections" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
          Browse Collections <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed
        </p>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {orders.map((order, i) => {
          const expanded = expandedId === order._id;
          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                  <p className="font-bold text-gray-900 font-mono">#{order.orderId}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={order.status} />
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-gray-900">৳{order.total}</p>
                  </div>
                </div>
              </div>

              {/* Item thumbnails preview */}
              <div className="px-6 pb-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {order.items?.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-gray-100 relative shrink-0">
                      <Image src={item.thumbnail || "/fallback.png"} alt={item.title} fill className="object-cover" />
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 ml-2">
                  {order.items?.length} {order.items?.length === 1 ? "item" : "items"}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expanded ? null : order._id)}
                    className="text-xs text-gray-500 hover:text-black underline underline-offset-2 transition"
                  >
                    {expanded ? "Hide details" : "Show details"}
                  </button>
                  <button
                    onClick={() => window.open(`/api/invoice/${order.orderId}`, "_blank")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
                  >
                    <Download size={11} /> Invoice
                  </button>
                </div>
              </div>

              {/* Expanded items */}
              {expanded && (
                <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                        <Image src={item.thumbnail || "/fallback.png"} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-400">Qty: {item.qty} × ৳{item.price}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 shrink-0">৳{item.total || item.price * item.qty}</p>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-gray-100 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span><span>৳{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span><span>৳{order.shipping}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span><span>-৳{order.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                      <span>Total</span><span>৳{order.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
