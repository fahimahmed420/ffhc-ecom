"use client";

import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ================= FETCH =================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/orders/manage");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= STATUS UPDATE =================
  const updateStatus = async (orderId, status) => {
    try {
      await fetch("/api/orders/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      toast.success("Status updated");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // ================= DELETE =================
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await fetch(`/api/orders/manage?id=${deleteTarget}`, {
        method: "DELETE",
      });

      toast.success("Order deleted");
      setDeleteTarget(null);
      fetchOrders();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ================= FILTER =================
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => (filter === "all" ? true : o.status === filter))
      .filter((o) => {
        const q = search.toLowerCase();

        return (
          o.orderId?.toLowerCase().includes(q) ||
          o.customer?.phone?.includes(q)
        );
      });
  }, [orders, search, filter]);

  // ================= BADGES =================
  const badge = (status) => {
    const base =
      "px-2 py-1 text-xs rounded-full font-medium border";

    switch (status) {
      case "pending":
        return base + " bg-yellow-50 text-yellow-700 border-yellow-200";
      case "processing":
        return base + " bg-blue-50 text-blue-700 border-blue-200";
      case "shipped":
        return base + " bg-purple-50 text-purple-700 border-purple-200";
      case "delivered":
        return base + " bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return base + " bg-red-50 text-red-700 border-red-200";
      default:
        return base + " bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Orders
      </h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order ID or phone..."
          className="w-full border border-gray-200 bg-white px-4 py-2 rounded-lg outline-none focus:border-gray-400 transition"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 bg-white px-4 py-2 rounded-lg focus:border-gray-400 transition"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ORDERS */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition hover:shadow-md"
          >
            {/* TOP */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">
                  #{order.orderId}
                </p>
                <p className="text-sm text-gray-500">
                  {order.customer?.name} • {order.customer?.phone}
                </p>
              </div>

              <span className={badge(order.status)}>
                {order.status}
              </span>
            </div>

            {/* ADDRESS */}
            <div className="text-sm text-gray-600 mt-2">
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

            {/* ITEMS */}
            <div className="mt-3 text-sm text-gray-500">
              {order.items?.map((i, idx) => (
                <div key={idx}>
                  • {i.title} × {i.qty}
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-2 mt-4">
              <select
                value={order.status}
                onChange={(e) =>
                  updateStatus(order._id, e.target.value)
                }
                className="border px-3 py-2 rounded-lg text-sm bg-white hover:border-gray-400 transition"
              >
                <option>pending</option>
                <option>processing</option>
                <option>shipped</option>
                <option>delivered</option>
                <option>cancelled</option>
              </select>

              <button
                onClick={() => setSelectedOrder(order)}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition"
              >
                View
              </button>

              <button
                onClick={() =>
                  window.open(
                    `/api/invoice/${order.orderId}`,
                    "_blank"
                  )
                }
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Print
              </button>

              <button
                onClick={() => setDeleteTarget(order._id)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              Order Details
            </h2>

            <p><b>ID:</b> {selectedOrder.orderId}</p>
            <p><b>Name:</b> {selectedOrder.customer?.name}</p>
            <p><b>Total:</b> ৳{selectedOrder.total}</p>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">
              Delete Order?
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              This action cannot be undone.
            </p>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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