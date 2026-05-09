"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [unions, setUnions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",

    divisionId: "",
    divisionName: "",

    districtId: "",
    districtName: "",

    upazilaId: "",
    upazilaName: "",

    unionId: "",
    unionName: "",

    address: "",
  });

  // ================= Coupon =================
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);

      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(), // ✅ normalize
          items: merged,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDiscount(0);
        toast.error(data.error || "Invalid coupon");
        return;
      }

      setDiscount(Number(data.discount) || 0); // ✅ safe conversion
      toast.success("Coupon applied 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // ================= LOAD CART =================
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart")) || [];

      // FIX INVALID ITEMS
      const normalized = stored.filter((item) => {
        if (typeof item === "string") return true;

        return item?.id;
      });

      setCart(normalized);
    } catch (err) {
      console.error(err);
      setCart([]);
    }
  }, []);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    if (!cart.length) {
      setProductLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setProductLoading(true);

        // REMOVE INVALID IDS
        const ids = cart
          .map((item) => (typeof item === "string" ? item : item.id))
          .filter(Boolean);

        const res = await fetch(`/api/products?ids=${ids.join(",")}`);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch products");
        }

        setProducts(data.products || []);
      } catch (err) {
        console.error(err);

        toast.error("Some cart products could not be loaded");
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
  }, [cart]);

  // ================= DIVISIONS =================
  useEffect(() => {
    fetch("https://bdapi.vercel.app/api/v.1/division")
      .then((res) => res.json())
      .then((data) => setDivisions(data.data || []));
  }, []);

  // ================= DISTRICTS =================
  useEffect(() => {
    if (!form.divisionId) return;

    fetch(`https://bdapi.vercel.app/api/v.1/district/${form.divisionId}`)
      .then((res) => res.json())
      .then((data) => setDistricts(data.data || []));
  }, [form.divisionId]);

  // ================= UPAZILAS =================
  useEffect(() => {
    if (!form.districtId) return;

    fetch(`https://bdapi.vercel.app/api/v.1/upazilla/${form.districtId}`)
      .then((res) => res.json())
      .then((data) => setUpazilas(data.data || []));
  }, [form.districtId]);

  // ================= UNIONS =================
  useEffect(() => {
    if (!form.upazilaId) return;

    fetch(`https://bdapi.vercel.app/api/v.1/union/${form.upazilaId}`)
      .then((res) => res.json())
      .then((data) => setUnions(data.data || []));
  }, [form.upazilaId]);

  // ================= CART HELPERS =================
  const getQty = (id) => {
    const item = cart.find((c) =>
      typeof c === "string" ? c === id : c.id === id,
    );

    return typeof item === "string" ? 1 : item?.qty || 1;
  };

  // ================= MERGED PRODUCTS =================
  const merged = useMemo(() => {
    return products.map((p) => {
      const qty = getQty(p._id);

      const discountedPrice = p.discountPrice > 0 ? p.discountPrice : p.price;

      return {
        ...p,
        qty,
        discountedPrice,
      };
    });
  }, [products, cart]);

  // ================= TOTALS =================
  const subtotal = merged.reduce(
    (acc, item) => acc + item.discountedPrice * item.qty,
    0,
  );

  // SHIPPING
  const isDhaka = form.districtName?.toLowerCase().includes("dhaka");

  const shipping = form.districtId ? (isDhaka ? 60 : 120) : 0;

  const total = Math.max(0, subtotal + shipping - discount);

  // ================= PLACE ORDER =================
  const handleOrder = async () => {
    try {
      setLoading(true);

      const order = {
        items: merged,
        customer: form,
        subtotal,
        shipping,
        discount,
        total,
        couponCode,
        paymentMethod: "COD",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data?.message || "Order failed");

        return;
      }

      toast.success("Order placed successfully 🎉");

      localStorage.removeItem("cart");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error(err);

      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ================= VALIDATION =================
  const isValid =
    form.name &&
    form.email &&
    form.phone &&
    form.divisionId &&
    form.districtId &&
    form.upazilaId &&
    form.address;

  // ================= LOADING =================
  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading checkout...
      </div>
    );
  }

  // ================= UI =================
  return (
    <>
      <Toaster position="top-right" />

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid lg:grid-cols-2 gap-10">
        {/* LEFT */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-3xl font-bold mb-8">Delivery Information</h2>

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full border border-gray-300 bg-white text-black rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-black"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full border border-gray-300 bg-white text-black rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* PHONE */}
          <div className="mb-5">
            <input
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              className="w-full border border-gray-300 bg-white text-black rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* ADDRESS SELECTS */}
          <div className="space-y-5">
            {/* DIVISION */}
            <select
              value={form.divisionId}
              className="w-full border border-gray-300 bg-white text-black rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => {
                const selected = divisions.find((d) => d.id === e.target.value);

                setForm({
                  ...form,
                  divisionId: selected?.id || "",
                  divisionName: selected?.name || "",

                  districtId: "",
                  districtName: "",

                  upazilaId: "",
                  upazilaName: "",

                  unionId: "",
                  unionName: "",
                });

                setDistricts([]);
                setUpazilas([]);
                setUnions([]);
              }}
            >
              <option value="">Select Division</option>

              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* DISTRICT */}
            <select
              value={form.districtId}
              disabled={!districts.length}
              className="w-full border border-gray-300 bg-white text-black rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
              onChange={(e) => {
                const selected = districts.find((d) => d.id === e.target.value);

                setForm({
                  ...form,
                  districtId: selected?.id || "",
                  districtName: selected?.name || "",

                  upazilaId: "",
                  upazilaName: "",

                  unionId: "",
                  unionName: "",
                });

                setUpazilas([]);
                setUnions([]);
              }}
            >
              <option value="">Select District</option>

              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* UPAZILA */}
            <select
              value={form.upazilaId}
              disabled={!upazilas.length}
              className="w-full border border-gray-300 bg-white text-black rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
              onChange={(e) => {
                const selected = upazilas.find((u) => u.id === e.target.value);

                setForm({
                  ...form,
                  upazilaId: selected?.id || "",
                  upazilaName: selected?.name || "",

                  unionId: "",
                  unionName: "",
                });

                setUnions([]);
              }}
            >
              <option value="">Select Upazila</option>

              {upazilas.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* UNION */}
            <select
              value={form.unionId}
              disabled={!unions.length}
              className="w-full border border-gray-300 bg-white text-black rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
              onChange={(e) => {
                const selected = unions.find((u) => u.id === e.target.value);

                setForm({
                  ...form,
                  unionId: selected?.id || "",
                  unionName: selected?.name || "",
                });
              }}
            >
              <option value="">Select Union</option>

              {unions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* ADDRESS */}
            <textarea
              rows={5}
              placeholder="House / Road / Area / Full Address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
              className="w-full border border-gray-300 bg-white text-black rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* COD INFO */}
          <div className="mt-6 p-5 rounded-2xl border border-yellow-200 bg-yellow-50 text-sm text-yellow-900">
            💳 Online payment is currently unavailable. Only{" "}
            <span className="font-bold">Cash on Delivery</span> is supported.
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          {/* PRODUCTS */}
          <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2">
            {merged.map((item) => (
              <div key={item._id} className="flex gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-white">
                  <Image
                    src={item.images?.[0] || item.thumbnail || "/fallback.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2">{item.title}</h3>

                  <p className="text-sm text-gray-500 mt-1">Qty: {item.qty}</p>

                  <p className="font-bold mt-2">
                    ৳{(item.discountedPrice * item.qty).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* COUPON */}
          <div className="mt-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />

              <button
                onClick={applyCoupon}
                disabled={couponLoading}
                className="bg-black text-white px-5 rounded-xl font-semibold disabled:opacity-50"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
          </div>

          {/* TOTALS */}
          <div className="mt-8 space-y-4 border-t pt-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>

              <span>৳{subtotal.toFixed(0)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>৳{shipping}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-৳{discount.toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between text-2xl font-black border-t pt-4">
              <span>Total</span>

              <span>৳{total.toFixed(0)}</span>
            </div>
          </div>

          {/* BUTTON */}
          <button
            disabled={!isValid || loading}
            onClick={handleOrder}
            className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Placing Order..." : "Place Order (COD)"}
          </button>
        </div>
      </section>
    </>
  );
}
