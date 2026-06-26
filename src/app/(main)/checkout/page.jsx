"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();

  const { user } = useAuth();

  const { cart, removeItems, loading: cartLoading } = useCart();

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

  const searchParams = useSearchParams();

  const selectedIds = useMemo(() => {
    const items = searchParams.get("items");

    return items ? items.split(",") : [];
  }, [searchParams]);

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

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user]);

  /* ======================================================
     FETCH PRODUCTS
  ====================================================== */

  useEffect(() => {
    if (!user?.uid) {
      setProducts([]);
      setProductLoading(false);
      return;
    }

    if (selectedIds.length === 0) {
      setProducts([]);
      setProductLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setProductLoading(true);

        const res = await fetch(`/api/products?ids=${selectedIds.join(",")}`);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch products");
        }

        setProducts(data.products || []);
      } catch (err) {
        console.error(err);

        toast.error("Failed to load checkout products");
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
  }, [selectedIds, user]);

  /* ======================================================
     BD LOCATION API
  ====================================================== */

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch("https://bdapi.vercel.app/api/v.1/division");

        if (!res.ok) throw new Error("BD API error");

        const data = await res.json();

        setDivisions(data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load divisions. Please refresh and try again.");
      }
    };

    fetchDivisions();
  }, []);

  /* ======================================================
     DISTRICTS
  ====================================================== */

  useEffect(() => {
    if (!form.divisionId) return;

    const fetchDistricts = async () => {
      try {
        const res = await fetch(
          `https://bdapi.vercel.app/api/v.1/district/${form.divisionId}`,
        );

        const data = await res.json();

        setDistricts(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDistricts();
  }, [form.divisionId]);

  /* ======================================================
     UPAZILAS
  ====================================================== */

  useEffect(() => {
    if (!form.districtId) return;

    const fetchUpazilas = async () => {
      try {
        const res = await fetch(
          `https://bdapi.vercel.app/api/v.1/upazilla/${form.districtId}`,
        );

        const data = await res.json();

        setUpazilas(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUpazilas();
  }, [form.districtId]);

  /* ======================================================
     UNIONS
  ====================================================== */

  useEffect(() => {
    if (!form.upazilaId) return;

    const fetchUnions = async () => {
      try {
        const res = await fetch(
          `https://bdapi.vercel.app/api/v.1/union/${form.upazilaId}`,
        );

        const data = await res.json();

        setUnions(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnions();
  }, [form.upazilaId]);

  /* ======================================================
     CART HELPERS
  ====================================================== */

  const getQty = (id) => {
    const item = cart.find((c) =>
      typeof c === "string" ? c === id : c.id === id,
    );

    return typeof item === "string" ? 1 : item?.qty || 1;
  };

  /* ======================================================
     MERGED PRODUCTS
  ====================================================== */

  const merged = useMemo(() => {
    return products.map((p) => {
      const cartItem = cart.find((c) =>
        typeof c === "string" ? c === String(p._id) : c.id === String(p._id),
      );

      const qty = typeof cartItem === "string" ? 1 : cartItem?.qty || 1;

      return {
        ...p,
        qty,
        discountedPrice: p.discountPrice > 0 ? p.discountPrice : p.price,
      };
    });
  }, [products, cart]);

  /* ======================================================
     TOTALS
  ====================================================== */

  const subtotal = merged.reduce(
    (acc, item) => acc + item.discountedPrice * item.qty,
    0,
  );

  const isDhaka = form.districtName?.toLowerCase().includes("dhaka");

  const shipping = form.districtId ? (isDhaka ? 60 : 120) : 0;

  const total = Math.max(0, subtotal + shipping - discount);

  /* ======================================================
     APPLY COUPON
  ====================================================== */

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter coupon code");
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
          code: couponCode.trim().toUpperCase(),
          items: merged,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDiscount(0);

        toast.error(data.error || "Invalid coupon");

        return;
      }

      setDiscount(Number(data.discount) || 0);

      toast.success("Coupon applied 🎉");
    } catch (err) {
      console.error(err);

      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  /* ======================================================
     PLACE ORDER
  ====================================================== */

  const handleOrder = async () => {
    if (!merged.length) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      const order = {
        items: merged,

        customer: form,

        subtotal,

        shipping,

        discount,

        total,

        couponCode: couponCode.trim().toUpperCase(),

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

      toast.success("Order placed! Check your email for the invoice 🎉");

      await removeItems(selectedIds);

      router.push(
        `/order-confirmation?orderId=${data.orderId}&total=${total}&name=${encodeURIComponent(form.name)}`,
      );
    } catch (err) {
      console.error(err);

      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     VALIDATION
  ====================================================== */

  const isBDPhone = /^(?:\+?88)?01[3-9]\d{8}$/.test(form.phone.trim());

  const isValid =
    form.name.trim() &&
    form.email.trim() &&
    isBDPhone &&
    form.divisionId &&
    form.districtId &&
    form.upazilaId &&
    form.address.trim();

  /* ======================================================
     LOADING
  ====================================================== */

  if (cartLoading || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 px-4 text-center">
        Loading checkout...
      </div>
    );
  }

  /* ======================================================
     EMPTY CART
  ====================================================== */

  if (merged.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 px-4 text-center">
        Your cart is empty
      </div>
    );
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <>
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8  py-20 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10">
        {/* LEFT */}
        <div className="bg-white border border-gray-200 rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm order-2 lg:order-1">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
            Delivery Information
          </h2>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
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
              className="w-full border border-gray-300 bg-white text-black rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              readOnly
              className="w-full border border-gray-300 bg-gray-100 text-black rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>

          {/* PHONE */}
          <div className="mb-4 sm:mb-5">
            <input
              type="tel"
              placeholder="Phone Number (e.g. 01XXXXXXXXX)"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              className={`w-full border bg-white text-black rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none focus:ring-2 focus:ring-black text-sm sm:text-base ${
                form.phone && !isBDPhone
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300"
              }`}
            />
            {form.phone && !isBDPhone && (
              <p className="text-xs text-red-500 mt-1 pl-1">
                Enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX)
              </p>
            )}
          </div>

          {/* ADDRESS */}
          <div className="space-y-4 sm:space-y-5">
            {/* DIVISION */}
            <select
              value={form.divisionId}
              className="w-full border border-gray-300 bg-white text-black rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
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
              className="w-full border border-gray-300 bg-white text-black rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 text-sm sm:text-base"
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
              className="w-full border border-gray-300 bg-white text-black rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 text-sm sm:text-base"
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
              className="w-full border border-gray-300 bg-white text-black rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 text-sm sm:text-base"
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
              rows={4}
              placeholder="House / Road / Area / Full Address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
              className="w-full border border-gray-300 bg-white text-black rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none focus:ring-2 focus:ring-black resize-none text-sm sm:text-base"
            />
          </div>

          {/* COD INFO */}
          <div className="mt-5 sm:mt-6 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-yellow-200 bg-yellow-50 text-sm text-yellow-900 leading-relaxed">
            💳 Online payment is currently unavailable. Only{" "}
            <span className="font-bold">Cash on Delivery</span> is supported.
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border border-gray-200 rounded-2xl lg:rounded-3xl p-4 sm:p-6 shadow-sm h-fit lg:sticky lg:top-24 order-1 lg:order-2">
          <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
            Order Summary
          </h2>

          {/* PRODUCTS */}
          <div className="space-y-4 sm:space-y-5 max-h-[350px] sm:max-h-[450px] overflow-y-auto pr-1 sm:pr-2">
            {merged.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 sm:gap-4 border-b border-gray-100 pb-4 last:border-none"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                  <Image
                    src={item.images?.[0] || item.thumbnail || "/fallback.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold line-clamp-2 text-sm sm:text-base leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Qty: {item.qty}
                  </p>

                  <p className="font-bold mt-2 text-sm sm:text-base">
                    ৳{(item.discountedPrice * item.qty).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* COUPON */}
          <div className="mt-5 sm:mt-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
              />

              <button
                onClick={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="bg-black text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
          </div>

          {/* TOTALS */}
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 border-t pt-5 sm:pt-6">
            <div className="flex justify-between text-gray-600 text-sm sm:text-base">
              <span>Subtotal</span>

              <span>৳{subtotal.toFixed(0)}</span>
            </div>

            <div className="flex justify-between text-gray-600 text-sm sm:text-base">
              <span>Shipping</span>

              <span>
                {form.districtId ? `৳${shipping}` : "Select address"}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600 text-sm sm:text-base">
                <span>Discount</span>

                <span>
                  -৳
                  {discount.toFixed(0)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-xl sm:text-2xl font-black border-t pt-4">
              <span>Total</span>

              <span>৳{total.toFixed(0)}</span>
            </div>
          </div>

          {/* BUTTON */}
          <button
            disabled={!isValid || loading}
            onClick={handleOrder}
            className="w-full mt-6 sm:mt-8 bg-black text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? "Placing Order..." : "Place Order (COD)"}
          </button>
        </div>
      </section>
    </>
  );
}