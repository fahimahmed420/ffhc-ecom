"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Save } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // delete modal state
  const [deleteId, setDeleteId] = useState(null);

  // ================= FETCH =================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?all=true");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= SEARCH =================
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();

    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  // ================= LOCAL UPDATE =================
  const handleChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              [field]:
                field === "price" ||
                field === "discountPrice" ||
                field === "stock"
                  ? Number(value)
                  : value,
            }
          : p
      )
    );
  };

  // ================= UPDATE =================
  const handleUpdate = async (product) => {
    try {
      if (!product._id) {
        toast.error("Invalid product ID");
        return;
      }

      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: Number(product.price),
          discountPrice: Number(product.discountPrice || 0),
          stock: Number(product.stock || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Update failed");
        return;
      }

      toast.success("Product updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // ================= DELETE =================
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }

      setProducts((prev) => prev.filter((p) => p._id !== deleteId));

      toast.success("Product deleted");
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-medium">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-white">

      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Product Manager
        </h1>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-100 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-black outline-none"
          />
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filteredProducts.map((p) => (
          <div
            key={p._id}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition"
          >
            {/* IMAGE */}
            <div className="flex items-center gap-3 w-full md:w-72">
              <img
                src={p.thumbnail || "https://via.placeholder.com/80"}
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover"
              />

              <div>
                <p className="font-semibold text-sm md:text-base line-clamp-2">
                  {p.title}
                </p>
                <p className="text-xs text-gray-500">
                  {p.category || "Uncategorized"}
                </p>
              </div>
            </div>

            {/* PRICE */}
            <div className="w-full md:w-40">
              <label className="text-xs text-gray-500">Price</label>
              <input
                type="number"
                value={p.price}
                onChange={(e) =>
                  handleChange(p._id, "price", e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl p-2 mt-1 focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* DISCOUNT */}
            <div className="w-full md:w-40">
              <label className="text-xs text-gray-500">
                Discount Price
              </label>
              <input
                type="number"
                value={p.discountPrice || ""}
                onChange={(e) =>
                  handleChange(
                    p._id,
                    "discountPrice",
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-xl p-2 mt-1 focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* STOCK */}
            <div className="w-full md:w-32">
              <label className="text-xs text-gray-500">Stock</label>
              <input
                type="number"
                value={p.stock}
                onChange={(e) =>
                  handleChange(p._id, "stock", e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl p-2 mt-1 focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 md:ml-auto w-full md:w-auto">
              <button
                onClick={() => handleUpdate(p)}
                className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition"
              >
                <Save size={16} />
                Save
              </button>

              <button
                onClick={() => setDeleteId(p._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DELETE MODAL ================= */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold mb-2">
              Delete Product?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border cursor-pointer hover:bg-black hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-700 text-white cursor-pointer hover:bg-red-500"
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