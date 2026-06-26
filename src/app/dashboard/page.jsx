"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  PackagePlus,
  TicketPercent,
  Heart,
  ArrowRight,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── shared badge ─── */
function StatusBadge({ status }) {
  const map = {
    pending:    { icon: Clock,        cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    processing: { icon: AlertCircle,  cls: "bg-blue-50 text-blue-700 border-blue-200" },
    shipped:    { icon: Truck,        cls: "bg-purple-50 text-purple-700 border-purple-200" },
    delivered:  { icon: CheckCircle,  cls: "bg-green-50 text-green-700 border-green-200" },
    cancelled:  { icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200" },
  };
  const cfg = map[status] || { icon: AlertCircle, cls: "bg-gray-50 text-gray-700 border-gray-200" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${cfg.cls}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}

/* ─── stat card ─── */
function StatCard({ label, value, sub, icon: Icon, color = "bg-gray-900", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <div className={`${color} p-2 rounded-xl`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ═══════════════ ADMIN VIEW ═══════════════ */
function AdminDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const [oRes, pRes] = await Promise.all([
          fetch("/api/orders/manage", { headers: { "x-user-email": user.email } }),
          fetch("/api/products?all=true"),
        ]);
        const [oData, pData] = await Promise.all([oRes.json(), pRes.json()]);
        setOrders(oData.orders || []);
        setProducts(pData.products || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + (o.total || 0), 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    return { revenue, pending, delivered };
  }, [orders]);

  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [orders]
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good day, {user?.displayName?.split(" ")[0] || "Admin"} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`৳${stats.revenue.toLocaleString()}`} sub="Excluding cancelled" icon={TrendingUp} color="bg-green-600" delay={0} />
        <StatCard label="Total Orders" value={orders.length} sub="All time" icon={ShoppingBag} color="bg-blue-600" delay={0.05} />
        <StatCard label="Pending Orders" value={stats.pending} sub="Needs attention" icon={Clock} color="bg-amber-500" delay={0.1} />
        <StatCard label="Products" value={products.length} sub="In catalogue" icon={Package} color="bg-gray-900" delay={0.15} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Product", icon: PackagePlus, href: "/dashboard/add-product", color: "bg-gray-900 text-white" },
          { label: "Manage Products", icon: Package, href: "/dashboard/manage-product", color: "bg-white border border-gray-200" },
          { label: "Manage Orders", icon: ShoppingBag, href: "/dashboard/manage-orders", color: "bg-white border border-gray-200" },
          { label: "Add Coupon", icon: TicketPercent, href: "/dashboard/add-coupon", color: "bg-white border border-gray-200" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href} className={`${a.color} rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition group`}>
              <Icon size={20} />
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/manage-orders" className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No orders yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">#{order.orderId}</p>
                  <p className="text-xs text-gray-400 truncate">{order.customer?.name} · {order.customer?.phone}</p>
                </div>
                <StatusBadge status={order.status} />
                <span className="text-sm font-bold text-gray-900 shrink-0">৳{order.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ USER VIEW ═══════════════ */
function UserDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const wishlistIds = JSON.parse(localStorage.getItem("wishlist") || "[]");

    (async () => {
      try {
        const promises = [
          fetch(`/api/orders?email=${encodeURIComponent(user.email)}`, {
            headers: { "x-user-email": user.email },
          }).then((r) => r.json()),
        ];
        if (wishlistIds.length) {
          promises.push(
            fetch(`/api/products?ids=${wishlistIds.join(",")}`).then((r) => r.json()),
          );
        }
        const [oData, pData] = await Promise.all(promises);
        setOrders(oData.orders || []);
        setWishlistProducts(pData?.products || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const totalSpent = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0),
    [orders],
  );
  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    [orders],
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 text-white">
        <p className="text-sm text-gray-300 mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold">{user?.displayName || user?.email?.split("@")[0]} 👋</h1>
        <p className="text-sm text-gray-400 mt-2">Manage your orders and saved items from here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Orders" value={orders.length} sub="All time" icon={ShoppingBag} delay={0} />
        <StatCard label="Total Spent" value={`৳${totalSpent.toLocaleString()}`} sub="Completed orders" icon={TrendingUp} color="bg-green-600" delay={0.05} />
        <StatCard label="Wishlist" value={wishlistProducts.length} sub="Saved items" icon={Heart} color="bg-rose-500" delay={0.1} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 mb-4">No orders yet</p>
            <Link href="/collections" className="text-sm font-semibold text-black underline underline-offset-2">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">#{order.orderId}</p>
                  <p className="text-xs text-gray-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
                <StatusBadge status={order.status} />
                <span className="text-sm font-bold text-gray-900 shrink-0">৳{order.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wishlist Preview */}
      {wishlistProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Saved Items</h2>
            <Link href="/collections" className="text-xs text-gray-500 hover:text-black flex items-center gap-1">
              Shop now <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wishlistProducts.slice(0, 4).map((p) => (
              <Link key={p._id} href={`/collections/${p._id}`} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="relative aspect-square bg-gray-50">
                  <Image src={p.images?.[0] || p.thumbnail || "/fallback.png"} alt={p.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium line-clamp-1 text-gray-800">{p.title}</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">৳{(p.discountPrice > 0 ? p.discountPrice : p.price).toFixed(0)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, role } = useAuth();

  if (!user) return <DashboardSkeleton />;

  return role === "admin" ? <AdminDashboard user={user} /> : <UserDashboard user={user} />;
}
