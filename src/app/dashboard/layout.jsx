"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Package,
  PackagePlus,
  ClipboardList,
  TicketPercent,
  User,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  X,
  Menu,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase.config";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_NAV = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Add Product", path: "/dashboard/add-product", icon: PackagePlus },
  { label: "Products", path: "/dashboard/manage-product", icon: Package },
  { label: "Orders", path: "/dashboard/manage-orders", icon: ClipboardList },
  { label: "Coupons", path: "/dashboard/add-coupon", icon: TicketPercent },
  { label: "Profile", path: "/dashboard/profile", icon: User },
];

const USER_NAV = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Orders", path: "/dashboard/orders", icon: ShoppingBag },
  { label: "Profile", path: "/dashboard/profile", icon: User },
];

function NavItem({ item, pathname, onClick }) {
  const active = pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        active
          ? "bg-black text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon size={17} className="shrink-0" />
      <span className="flex-1">{item.label}</span>
      {active && <ChevronRight size={14} className="opacity-60" />}
    </Link>
  );
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user === null) router.push("/auth");
  }, [user, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  const navItems = role === "admin" ? ADMIN_NAV : USER_NAV;

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="text-sm font-bold tracking-[0.25em] text-black">
          FFHC
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${
            role === "admin"
              ? "bg-amber-100 text-amber-700"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              role === "admin" ? "bg-amber-500" : "bg-blue-500"
            }`}
          />
          {role === "admin" ? "Admin" : "Customer"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} pathname={pathname} onClick={onClose} />
        ))}

        <div className="pt-2 mt-2 border-t border-gray-100">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            <Home size={17} />
            Back to Site
          </Link>
        </div>
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user.displayName || user.email || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user.displayName || "Account"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-gray-100 fixed top-0 left-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-screen w-72 bg-white z-50 flex flex-col md:hidden shadow-2xl"
            >
              <SidebarContent onClose={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold tracking-widest">FFHC</span>
          <Link href="/dashboard/profile" className="p-2 rounded-lg hover:bg-gray-100">
            <User size={20} />
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
