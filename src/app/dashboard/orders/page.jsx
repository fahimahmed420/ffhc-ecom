"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import toast, { Toaster } from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH ORDERS
  // =====================================================
  useEffect(() => {
    if (authLoading) return;

    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/orders?email=${encodeURIComponent(user.email)}`,
          {
            headers: {
              "x-user-email": user.email,
            },
          },
        );

        // ============================================
        // SAFELY READ RESPONSE
        // ============================================
        const text = await res.text();

        let data = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch (jsonError) {
          console.error("Invalid JSON:", text);

          toast.error("Server returned invalid response");

          return;
        }

        // ============================================
        // HANDLE ERROR
        // ============================================
        if (!res.ok) {
          toast.error(data.message || "Failed to load orders");

          return;
        }

        // ============================================
        // SUCCESS
        // ============================================
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);

        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading]);

  // =====================================================
  // STATUS BADGE
  // =====================================================
  const statusBadge = (status) => {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize";

    switch (status) {
      case "pending":
        return `${base} bg-yellow-100 text-yellow-700`;

      case "processing":
        return `${base} bg-blue-100 text-blue-700`;

      case "shipped":
        return `${base} bg-purple-100 text-purple-700`;

      case "delivered":
        return `${base} bg-green-100 text-green-700`;

      case "cancelled":
        return `${base} bg-red-100 text-red-700`;

      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  // =====================================================
  // PAYMENT BADGE
  // =====================================================
  const paymentBadge = (status) => {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize";

    switch (status) {
      case "paid":
        return `${base} bg-green-100 text-green-700`;

      case "pending":
        return `${base} bg-yellow-100 text-yellow-700`;

      case "failed":
        return `${base} bg-red-100 text-red-700`;

      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (authLoading || loading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </section>
    );
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================
  if (!user) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-3xl font-bold mb-3">Please login first</h2>

        <p className="text-gray-500 mb-6">You need an account to view orders</p>

        <Link
          href="/login"
          className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition"
        >
          Go to Login
        </Link>
      </section>
    );
  }

  // =====================================================
  // EMPTY
  // =====================================================
  if (!orders.length) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-3">No orders found</h2>

          <p className="text-gray-500 mb-6">
            You haven’t placed any orders yet.
          </p>

          <Link
            href="/collections"
            className="inline-flex px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 min-h-screen">
      <Toaster position="top-right" />

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
          My Orders
        </h1>

        <p className="text-gray-500 mt-3 text-sm md:text-base">
          {orders.length} {orders.length > 1 ? "orders found" : "order found"}
        </p>
      </div>

      {/* ===================================================== */}
      {/* ORDERS */}
      {/* ===================================================== */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-200 rounded-3xl p-5 md:p-7 bg-white shadow-sm hover:shadow-md transition"
          >
            {/* ===================================================== */}
            {/* HEADER */}
            {/* ===================================================== */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-gray-100 pb-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>

                <h3 className="font-bold text-lg md:text-xl text-gray-900 break-all">
                  #{order.orderId}
                </h3>
              </div>

              <div className="flex flex-wrap gap-5 md:gap-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Status</p>

                  <span className={statusBadge(order.status)}>
                    {order.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment</p>

                  <span className={paymentBadge(order.paymentStatus)}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Total</p>

                  <h3 className="font-bold text-lg text-gray-900">
                    ৳{order.total}
                  </h3>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* ITEMS */}
            {/* ===================================================== */}
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border border-gray-100 rounded-2xl p-3 md:p-4"
                >
                  {/* IMAGE */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                    <Image
                      src={item.thumbnail || "/placeholder.png"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">
                      {item.title}
                    </h4>

                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>Qty: {item.qty}</span>

                      {item.price && <span>Price: ৳{item.price}</span>}
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500">Total</p>

                    <div className="font-bold text-gray-900">
                      ৳{item.total || item.price * item.qty}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ===================================================== */}
            {/* FOOTER */}
            {/* ===================================================== */}
            <div className="border-t border-gray-100 mt-6 pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
              <div className="text-gray-500">
                Ordered on{" "}
                <span className="font-medium text-gray-700">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                  Cash on Delivery
                  {/* {order.paymentMethod || "Cash on Delivery"} */}
                </span>

                <button
                  onClick={() =>
                    window.open(`/api/invoice/${order.orderId}`, "_blank")
                  }
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900 transition"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
