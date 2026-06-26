"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Trash2, Save, Package, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?all=true");
      const data = await res.json();
      setProducts(data.products || []);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const handleChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === id
          ? { ...p, [field]: ["price", "discountPrice", "stock"].includes(field) ? Number(value) : value }
          : p,
      ),
    );
  };

  const handleUpdate = async (product) => {
    try {
      setSavingId(product._id);
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(product.price), discountPrice: Number(product.discountPrice || 0), stock: Number(product.stock || 0) }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Update failed"); return; }
      toast.success("Saved");
    } catch { toast.error("Something went wrong"); }
    finally { setSavingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Delete failed"); return; }
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      toast.success("Product deleted");
      setDeleteId(null);
    } catch { toast.error("Something went wrong"); }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products in catalogue</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or category…"
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-gray-400 transition"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Product info */}
                <div className="flex items-center gap-3 md:w-72 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                    <Image
                      src={p.thumbnail || p.images?.[0] || "/fallback.png"}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2">{p.title}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      <Tag size={9} />{p.category || "Uncategorized"}
                    </span>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="flex flex-wrap gap-3 flex-1">
                  {[
                    { label: "Price (৳)", field: "price", value: p.price },
                    { label: "Discount (৳)", field: "discountPrice", value: p.discountPrice || "" },
                    { label: "Stock", field: "stock", value: p.stock },
                  ].map(({ label, field, value }) => (
                    <div key={field} className="w-28">
                      <label className="text-[10px] text-gray-400 font-medium">{label}</label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(p._id, field, e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black/10 focus:border-gray-400 outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Stock badge */}
                <div className="shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    p.stock > 5 ? "bg-green-50 text-green-700 border-green-200" :
                    p.stock > 0 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {p.stock > 5 ? "In Stock" : p.stock > 0 ? "Low Stock" : "Out of Stock"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdate(p)}
                    disabled={savingId === p._id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    <Save size={14} />
                    {savingId === p._id ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setDeleteId(p._id)}
                    className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h2>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
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
