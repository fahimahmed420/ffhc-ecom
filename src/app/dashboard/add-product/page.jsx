"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const [images, setImages] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");

  // =========================
  // CATEGORIES
  // =========================
  const categories = [
    "Glamour & Beauty",
    "Intimate & Personal Care",
    "Auto Parts",
    "Fashion",
    "Tools & Hardware",
    "Stationery",
    "Mother & Baby",
    "Travel & Accessories",
    "Home & Kitchen",
  ];

  // =========================
  // IMAGE HANDLING
  // =========================
  const addImageField = () => {
    if (images.length < 5) {
      setImages((prev) => [...prev, ""]);
    }
  };

  const handleImageChange = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      title: e.target.title.value,
      description: e.target.description.value,

      price: Number(e.target.price.value),
      discountPrice: Number(e.target.discountPrice.value || 0),
      stock: Number(e.target.stock.value), // ✅ STOCK ADDED

      brand: e.target.brand.value,
      weight: e.target.weight.value,

      warrantyInformation: e.target.warranty.value,
      shippingInformation: e.target.shipping.value,
      availabilityStatus: e.target.availability.value,
      returnPolicy: e.target.returnPolicy.value,

      category,

      images: images.filter((img) => img.trim() !== ""),
      createdAt: new Date(),
    };

    try {
      setLoading(true);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      toast.success("Product added successfully 🎉");

      // RESET
      e.target.reset();
      setImages([""]);
      setCategory("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 md:p-6 max-w-3xl mx-auto">

      {/* HEADER */}
      <h2 className="text-xs tracking-widest uppercase mb-6 text-gray-500">
        Add New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* TITLE */}
        <input
          name="title"
          type="text"
          placeholder="Product Name"
          className="w-full border border-gray-300 px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-black outline-none"
          required
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Product Description"
          className="w-full border border-gray-300 px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-black outline-none"
          rows={4}
          required
        />

        {/* CATEGORY */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-black outline-none"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* PRICE + DISCOUNT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <input
            name="price"
            type="number"
            placeholder="Price"
            className="border border-gray-300 px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-black outline-none"
            required
          />

          <input
            name="discountPrice"
            type="number"
            placeholder="Discount Price"
            className="border border-gray-300 px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-black outline-none"
          />

        </div>

        {/* STOCK */}
        <input
          name="stock"
          type="number"
          placeholder="Stock Quantity"
          className="w-full border border-gray-300 px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-black outline-none"
          required
        />

        {/* BRAND + WEIGHT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <input
            name="brand"
            type="text"
            placeholder="Brand"
            className="border border-gray-300 px-4 py-3 text-sm rounded-xl"
          />

          <input
            name="weight"
            type="text"
            placeholder="Weight"
            className="border border-gray-300 px-4 py-3 text-sm rounded-xl"
          />

        </div>

        {/* DROPDOWNS */}

        {/* AVAILABILITY */}
        <select
          name="availability"
          className="w-full border border-gray-300 px-4 py-3 text-sm rounded-xl"
          defaultValue="In Stock"
        >
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Pre Order">Pre Order</option>
        </select>

        {/* SHIPPING */}
        <select
          name="shipping"
          className="w-full border border-gray-300 px-4 py-3 text-sm rounded-xl"
          defaultValue="Standard Shipping"
        >
          <option value="Standard Shipping (3-5 Days)">Standard (3–5 Days)</option>
          <option value="Express Shipping (1-2 Days)">Express (1–2 Days)</option>
          <option value="Same Day Delivery">Same Day Delivery</option>
          <option value="Free Shipping">Free Shipping</option>
          <option value="Cash on Delivery Available">Cash on Delivery</option>
        </select>

        {/* RETURN POLICY */}
        <select
          name="returnPolicy"
          className="w-full border border-gray-300 px-4 py-3 text-sm rounded-xl"
          defaultValue="7 Days Return"
        >
          <option value="No Return">No Return</option>
          <option value="3 Days Return">3 Days Return</option>
          <option value="7 Days Return">7 Days Return</option>
          <option value="14 Days Return">14 Days Return</option>
          <option value="30 Days Return">30 Days Return</option>
          <option value="Replacement Only">Replacement Only</option>
        </select>

        {/* IMAGES */}
        <div className="space-y-2">
          <p className="text-xs tracking-widest uppercase text-gray-500">
            Product Images (max 5)
          </p>

          {images.map((img, index) => (
            <input
              key={index}
              type="text"
              value={img}
              onChange={(e) =>
                handleImageChange(index, e.target.value)
              }
              placeholder={`Image URL ${index + 1}`}
              className="w-full border border-gray-300 px-4 py-3 text-sm rounded-xl"
            />
          ))}

          {images.length < 5 && (
            <button
              type="button"
              onClick={addImageField}
              className="text-xs border px-4 py-2 rounded-xl hover:bg-black hover:text-white transition"
            >
              + Add Image
            </button>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white px-6 py-3 text-sm tracking-widest uppercase rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Saving..." : "Save Product"}
        </button>

      </form>
    </div>
  );
}