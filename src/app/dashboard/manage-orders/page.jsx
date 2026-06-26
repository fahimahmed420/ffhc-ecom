"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  Search, Printer, Trash2, Eye, X,
  Clock, CheckCircle, Truck, XCircle, AlertCircle,
  MapPin, Phone, User, Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_CFG = {
  pending:    { cls: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  processing: { cls: "bg-blue-50 text-blue-700 border-blue-200",       icon: AlertCircle },
  shipped:    { cls: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck },
  delivered:  { cls: "bg-green-50 text-green-700 border-green-200",    icon: CheckCircle },
  cancelled:  { cls: "bg-red-50 text-red-700 border-red-200",          icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${cfg.cls}`}>
      <Icon size={10} />{status}
    </span>
  );
}

export default function ManageOrders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await fetch("/api/orders/manage", { headers: { "x-user-email": user.email } });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to load"); return; }
      setOrders(data.orders || []);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authLoading && user?.email) fetchOrders();
  }, [authLoading, user]);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch("/api/orders/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-email": user?.email },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to update"); return; }
      toast.success("Status updated");
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      if (selectedOrder?._id === orderId) setSelectedOrder((prev) => ({ ...prev, status }));
    } catch { toast.error("Update failed"); }
    finally { setUpdatingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/orders/manage?id=${deleteTarget}`, {
        method: "DELETE", headers: { "x-user-email": user?.email },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Delete failed"); return; }
      toast.success("Order deleted");
      setOrders((prev) => prev.filter((o) => o._id !== deleteTarget));
      setDeleteTarget(null);
    } catch { toast.error("Delete failed"); }
  };

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase();
    return orders
      .filter((o) => filter === "all" || o.status === filter)
      .filter((o) =>
        o.orderId?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.phone?.includes(q)
      );
  }, [orders, search, filter]);

  const counts = useMemo(() => {
    const c = { all: orders.length };
    STATUS_OPTIONS.forEach((s) => { c[s] = orders.filter((o) => o.status === s).length; });
    return c;
  }, [orders]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} orders total</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ key: "all", label: "All" }, ...STATUS_OPTIONS.map((s) => ({ key: s, label: s }))].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition border ${
              filter === key
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {label} <span className="ml-1 opacity-60">({counts[key] || 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer name or phone…"
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-black/5 transition"
        />
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <p className="font-bold text-gray-900">#{order.orderId}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><User size={11} />{order.customer?.name}</span>
                    <span className="flex items-center gap-1"><Phone size={11} />{order.customer?.phone}</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {[order.customer?.upazilaName, order.customer?.districtName].filter(Boolean).join(", ")}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {order.items?.length} items · ৳{order.total} ·{" "}
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border border-gray-200 bg-white text-sm px-3 py-2 rounded-xl outline-none hover:border-gray-400 transition disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-xl text-sm hover:bg-black transition"
                  >
                    <Eye size={14} /> View
                  </button>

                  <button
                    onClick={() => window.open(`/api/invoice/${order.orderId}`, "_blank")}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
                  >
                    <Printer size={14} />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(order._id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm hover:bg-red-600 hover:text-white transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Order #{selectedOrder.orderId}</h2>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-gray-100 transition">
                    <X size={18} />
                  </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-5">
                  {/* Customer */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><p className="text-xs text-gray-400">Name</p><p className="font-medium">{selectedOrder.customer?.name}</p></div>
                      <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium">{selectedOrder.customer?.phone}</p></div>
                      <div><p className="text-xs text-gray-400">Email</p><p className="font-medium">{selectedOrder.customer?.email}</p></div>
                      <div><p className="text-xs text-gray-400">District</p><p className="font-medium">{selectedOrder.customer?.districtName}</p></div>
                    </div>
                    <div className="text-sm mt-2">
                      <p className="text-xs text-gray-400">Full Address</p>
                      <p className="font-medium">
                        {[selectedOrder.customer?.address, selectedOrder.customer?.unionName, selectedOrder.customer?.upazilaName, selectedOrder.customer?.districtName].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image src={item.thumbnail || "/fallback.png"} alt={item.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">Qty: {item.qty} × ৳{item.price}</p>
                          </div>
                          <p className="font-bold text-sm shrink-0">৳{item.total || item.price * item.qty}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                    {[
                      ["Subtotal", `৳${selectedOrder.subtotal}`],
                      ["Shipping", `৳${selectedOrder.shipping}`],
                      ...(selectedOrder.discount > 0 ? [["Discount", `-৳${selectedOrder.discount}`]] : []),
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-gray-500"><span>{k}</span><span>{v}</span></div>
                    ))}
                    <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2">
                      <span>Total</span><span>৳{selectedOrder.total}</span>
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedOrder._id, s)}
                          disabled={selectedOrder.status === s || updatingId === selectedOrder._id}
                          className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition border ${
                            selectedOrder.status === s
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 disabled:opacity-40"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                  <button onClick={() => window.open(`/api/invoice/${selectedOrder.orderId}`, "_blank")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                    <Printer size={15} /> Print Invoice
                  </button>
                  <button onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setDeleteTarget(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Order?</h2>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteTarget(null)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button onClick={confirmDelete}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
