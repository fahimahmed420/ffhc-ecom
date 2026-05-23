"use client";

import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

export default function ManageOrders() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ======================================================
  // FETCH ORDERS
  // ======================================================
  const fetchOrders = async () => {
    try {
      if (!user?.email) return;

      setLoading(true);

      const res = await fetch("/api/orders/manage", {
        headers: {
          "x-user-email": user.email,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load orders");
        return;
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================
  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchOrders();
    }
  }, [authLoading, user]);

  // ======================================================
  // UPDATE STATUS
  // ======================================================
  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch("/api/orders/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.email,
        },
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update");
        return;
      }

      toast.success("Order status updated");

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order,
        ),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // ======================================================
  // DELETE ORDER
  // ======================================================
  const confirmDelete = async () => {
    try {
      if (!deleteTarget) return;

      const res = await fetch(`/api/orders/manage?id=${deleteTarget}`, {
        method: "DELETE",
        headers: {
          "x-user-email": user?.email,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Delete failed");
        return;
      }

      toast.success("Order deleted");

      setOrders((prev) => prev.filter((o) => o._id !== deleteTarget));

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ======================================================
  // FILTER ORDERS
  // ======================================================
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => (filter === "all" ? true : o.status === filter))
      .filter((o) => {
        const q = search.toLowerCase();

        return (
          o.orderId?.toLowerCase()?.includes(q) ||
          o.customer?.phone?.includes(q) ||
          o.customer?.name?.toLowerCase()?.includes(q)
        );
      });
  }, [orders, search, filter]);

  // ======================================================
  // BADGE STYLES
  // ======================================================
  const badge = (status) => {
    const base = "px-2 py-1 text-xs rounded-full font-medium border";

    switch (status) {
      case "pending":
        return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`;

      case "processing":
        return `${base} bg-blue-50 text-blue-700 border-blue-200`;

      case "shipped":
        return `${base} bg-purple-50 text-purple-700 border-purple-200`;

      case "delivered":
        return `${base} bg-green-50 text-green-700 border-green-200`;

      case "cancelled":
        return `${base} bg-red-50 text-red-700 border-red-200`;

      default:
        return `${base} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  // ======================================================
  // LOADING
  // ======================================================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading orders...
      </div>
    );
  }

  // ======================================================
  // NOT LOGGED IN
  // ======================================================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Please login first
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 min-h-screen">
      <Toaster position="top-right" />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Manage Orders
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Total Orders: {filteredOrders.length}
          </p>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SEARCH + FILTER */}
      {/* ====================================================== */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order ID, customer or phone..."
          className="w-full border border-gray-200 bg-white px-4 py-3 rounded-xl outline-none focus:border-gray-400 transition"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 bg-white px-4 py-3 rounded-xl outline-none focus:border-gray-400 transition"
        >
          <option value="all">All Orders</option>

          <option value="pending">Pending</option>

          <option value="processing">Processing</option>

          <option value="shipped">Shipped</option>

          <option value="delivered">Delivered</option>

          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ====================================================== */}
      {/* EMPTY */}
      {/* ====================================================== */}
      {!filteredOrders.length ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              {/* ====================================================== */}
              {/* TOP */}
              {/* ====================================================== */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <p className="font-bold text-lg text-gray-800">
                    #{order.orderId}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {order.customer?.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {order.customer?.phone}
                  </p>
                </div>

                <span className={badge(order.status)}>{order.status}</span>
              </div>

              {/* ====================================================== */}
              {/* ADDRESS */}
              {/* ====================================================== */}
              <div className="mt-4 text-sm text-gray-600 leading-6">
                📍{" "}
                {[
                  order.customer?.address,
                  order.customer?.unionName,
                  order.customer?.upazilaName,
                  order.customer?.districtName,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>

              {/* ====================================================== */}
              {/* ITEMS */}
              {/* ====================================================== */}
              <div className="mt-4 border-t pt-4">
                <p className="font-medium text-gray-700 mb-2">Ordered Items</p>

                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.title}</span>

                      <span className="text-gray-500">× {item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ====================================================== */}
              {/* TOTAL */}
              {/* ====================================================== */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Total Amount</p>

                <p className="text-lg font-bold text-gray-800">
                  ৳{order.total}
                </p>
              </div>

              {/* ====================================================== */}
              {/* ACTIONS */}
              {/* ====================================================== */}
              <div className="flex flex-wrap gap-2 mt-5">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="border border-gray-200 px-3 py-2 rounded-xl text-sm bg-white hover:border-gray-400 transition"
                >
                  <option value="pending">Pending</option>

                  <option value="processing">Processing</option>

                  <option value="shipped">Shipped</option>

                  <option value="delivered">Delivered</option>

                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm hover:bg-black transition"
                >
                  View
                </button>

                <button
                  onClick={() =>
                    window.open(`/api/invoice/${order.orderId}`, "_blank")
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
                >
                  Print
                </button>

                <button
                  onClick={() => setDeleteTarget(order._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================== */}
      {/* VIEW MODAL */}
      {/* ====================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <span className="font-semibold">Order ID:</span> #
                {selectedOrder.orderId}
              </p>

              <p>
                <span className="font-semibold">Customer:</span>{" "}
                {selectedOrder.customer?.name}
              </p>

              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedOrder.customer?.phone}
              </p>

              <p>
                <span className="font-semibold">Status:</span>{" "}
                {selectedOrder.status}
              </p>

              <p>
                <span className="font-semibold">Total:</span> ৳
                {selectedOrder.total}
              </p>

              <div>
                <p className="font-semibold mb-2">Address</p>

                <div className="text-gray-600 leading-6">
                  {[
                    selectedOrder.customer?.address,
                    selectedOrder.customer?.unionName,
                    selectedOrder.customer?.upazilaName,
                    selectedOrder.customer?.districtName,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>

              <div className="pt-2">
                <p className="font-semibold mb-3">Items</p>

                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border rounded-xl p-3"
                    >
                      <span>{item.title}</span>

                      <span>× {item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* DELETE MODAL */}
      {/* ====================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Delete Order?
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
