"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Trash2, PackagePlus } from "lucide-react";

const CATEGORIES = [
  "Glamour & Beauty", "Intimate & Personal Care", "Auto Parts", "Fashion",
  "Tools & Hardware", "Stationery", "Mother & Baby", "Travel & Accessories", "Home & Kitchen",
];

const FIELD_CLASS =
  "w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-black/5 transition placeholder:text-gray-400";

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</h3>
      {children}
    </div>
  );
}

export default function AddProductPage() {
  const [images, setImages] = useState([""]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState("");

  const addImageField = () => { if (images.length < 5) setImages((p) => [...p, ""]); };
  const removeImageField = (i) => setImages((p) => p.filter((_, idx) => idx !== i));
  const handleImageChange = (i, value) => {
    const updated = [...images];
    updated[i] = value;
    setImages(updated);
    if (i === 0) setPreviewImg(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const formData = {
      title: f.title.value,
      description: f.description.value,
      price: Number(f.price.value),
      discountPrice: Number(f.discountPrice.value || 0),
      stock: Number(f.stock.value),
      brand: f.brand.value,
      weight: f.weight.value,
      warrantyInformation: f.warranty.value,
      shippingInformation: f.shipping.value,
      availabilityStatus: f.availability.value,
      returnPolicy: f.returnPolicy.value,
      category,
      images: images.filter((img) => img.trim()),
      createdAt: new Date(),
    };

    if (!formData.title || !formData.price || !category) {
      toast.error("Title, price, and category are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Product added 🎉");
      f.reset();
      setImages([""]);
      setCategory("");
      setPreviewImg("");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
          <PackagePlus size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="text-sm text-gray-500">Fill in the details to list a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            <Section title="Basic Information">
              <input name="title" type="text" placeholder="Product Name *" className={FIELD_CLASS} required />
              <textarea name="description" placeholder="Product Description *" className={FIELD_CLASS} rows={4} required />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={FIELD_CLASS}
                required
              >
                <option value="">Select Category *</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Section>

            <Section title="Pricing & Stock">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium">Original Price (৳) *</label>
                  <input name="price" type="number" min="0" placeholder="0" className={`${FIELD_CLASS} mt-1`} required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Discount Price (৳)</label>
                  <input name="discountPrice" type="number" min="0" placeholder="0" className={`${FIELD_CLASS} mt-1`} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">Stock Quantity *</label>
                <input name="stock" type="number" min="0" placeholder="0" className={`${FIELD_CLASS} mt-1`} required />
              </div>
            </Section>

            <Section title="Shipping & Policy">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium">Availability</label>
                  <select name="availability" className={`${FIELD_CLASS} mt-1`} defaultValue="In Stock">
                    {["In Stock", "Low Stock", "Out of Stock", "Pre Order"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Shipping</label>
                  <select name="shipping" className={`${FIELD_CLASS} mt-1`} defaultValue="Standard Shipping (3-5 Days)">
                    {["Standard Shipping (3-5 Days)", "Express Shipping (1-2 Days)", "Same Day Delivery", "Free Shipping", "Cash on Delivery Available"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Return Policy</label>
                  <select name="returnPolicy" className={`${FIELD_CLASS} mt-1`} defaultValue="7 Days Return">
                    {["No Return", "3 Days Return", "7 Days Return", "14 Days Return", "30 Days Return", "Replacement Only"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Warranty</label>
                  <input name="warranty" type="text" placeholder="e.g. 1 year" className={`${FIELD_CLASS} mt-1`} />
                </div>
              </div>
            </Section>

            <Section title="More Details">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium">Brand</label>
                  <input name="brand" type="text" placeholder="Brand name" className={`${FIELD_CLASS} mt-1`} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Weight</label>
                  <input name="weight" type="text" placeholder="e.g. 500g" className={`${FIELD_CLASS} mt-1`} />
                </div>
              </div>
            </Section>
          </div>

          {/* Right column — images */}
          <div className="space-y-5">
            <Section title="Product Images">
              {/* Preview */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {previewImg ? (
                  <Image src={previewImg} alt="preview" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <PackagePlus size={28} className="mb-2 opacity-40" />
                    <p className="text-xs">First image preview</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {images.map((img, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      placeholder={`Image URL ${idx + 1}`}
                      className={FIELD_CLASS}
                    />
                    {images.length > 1 && (
                      <button type="button" onClick={() => removeImageField(idx)}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {images.length < 5 && (
                <button type="button" onClick={addImageField}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gray-500 hover:text-gray-700 transition">
                  <Plus size={14} /> Add Image URL
                </button>
              )}
              <p className="text-xs text-gray-400 text-center">Max 5 images. First is the thumbnail.</p>
            </Section>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-black text-white rounded-2xl font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
          ) : (
            <><PackagePlus size={16} /> Add Product</>
          )}
        </button>
      </form>
    </div>
  );
}
