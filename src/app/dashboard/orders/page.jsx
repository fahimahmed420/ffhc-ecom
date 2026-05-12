"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH ORDERS
  // =====================================================
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `/api/orders?email=${user.email}`,
        );

        const data = await res.json();

        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // =====================================================
  // LOADING
  // =====================================================
  if (authLoading || loading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading your orders...
        </p>
      </section>
    );
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================
  if (!user) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-semibold mb-3">
          Please login first
        </h2>

        <Link
          href="/login"
          className="px-6 py-3 bg-black text-white rounded-xl"
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
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-semibold mb-3">
          No orders found
        </h2>

        <Link
          href="/collections"
          className="px-6 py-3 bg-black text-white rounded-xl"
        >
          Continue Shopping
        </Link>
      </section>
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          My Orders
        </h1>

        <p className="text-gray-500 mt-2">
          {orders.length} orders found
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm"
          >
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5 mb-5">
              <div>
                <p className="text-sm text-gray-500">
                  Order ID
                </p>

                <h3 className="font-bold text-lg">
                  {order.orderId}
                </h3>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <span className="inline-block mt-1 px-4 py-1 rounded-full text-sm bg-gray-100">
                  {order.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Payment
                </p>

                <span className="inline-block mt-1 px-4 py-1 rounded-full text-sm bg-gray-100">
                  {order.paymentStatus}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total
                </p>

                <h3 className="font-bold text-lg">
                  ৳{order.total}
                </h3>
              </div>
            </div>

            {/* ITEMS */}
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium">
                      {item.title}
                    </h4>

                    <p className="text-sm text-gray-500">
                      Qty: {item.qty}
                    </p>
                  </div>

                  <div className="font-semibold">
                    ৳{item.total}
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="border-t mt-5 pt-5 flex justify-between text-sm text-gray-500">
              <span>
                Ordered on{" "}
                {new Date(
                  order.createdAt,
                ).toLocaleDateString()}
              </span>

              <span>
                {order.paymentMethod}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}