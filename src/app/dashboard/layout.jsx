"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Package,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase.config";

// ✅ import auth context
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // ✅ use global auth
  const { user, role } = useAuth();

  // ✅ Protect dashboard
  useEffect(() => {
    if (user === null) {
      router.push("/auth");
    }
  }, [user, router]);

  // 🔓 Logout
  const handleLogout = async () => {
    await signOut(auth);
    setOpen(false);
    router.push("/auth");
  };

  // ✅ Navigation items with role
  const navItems = [
    { name: "HOME", path: "/", icon: <Home size={14} /> },

    ...(role === "admin"
      ? [
          {
            name: "ADD PRODUCT",
            path: "/dashboard/add-product",
            icon: <Package size={14} />,
          },
          {
            name: "MANAGE PRODUCT",
            path: "/dashboard/manage-product",
            icon: <Package size={14} />,
          },
        ]
      : []),

    {
      name: "ORDERS",
      path: "/dashboard/orders",
      icon: <ClipboardList size={14} />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gray-300 px-6 md:px-12 py-4 flex justify-between items-center relative">
        
        {/* Logo */}
        <Link href="/">
          <h1 className="tracking-[0.2em] cursor-pointer">FFHC</h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-[11px] tracking-widest">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`relative group flex items-center gap-2 ${
                  isActive ? "text-black" : "text-gray-500"
                }`}
              >
                {item.icon}
                {item.name}

                <span
                  className={`absolute left-0 -bottom-1 h-[1px] bg-black transition-all ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}

          {/* Auth Section */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 hover:text-black cursor-pointer"
                >
                  <User size={14} />
                  ACCOUNT
                </button>

                {open && (
                  <div className="absolute right-0 mt-3 w-40 bg-white border border-gray-200 shadow-sm text-[11px] tracking-widest">
                    
                    {/* 🔥 Role label */}
                    <p className="px-4 py-2 text-gray-400 text-[10px]">
                      {role?.toUpperCase()}
                    </p>

                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      <User size={14} />
                      PROFILE
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-left"
                    >
                      <LogOut size={14} />
                      LOGOUT
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => router.push("/auth")}
                className="flex items-center gap-2 hover:text-black"
              >
                <User size={14} />
                LOGIN
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <Menu
            size={18}
            className="cursor-pointer"
            onClick={() => setMobileMenu(true)}
          />
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col">
          
          {/* Top */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="tracking-[0.2em]">FFHC</h1>
            <X
              size={20}
              className="cursor-pointer"
              onClick={() => setMobileMenu(false)}
            />
          </div>

          {/* Links */}
          <div className="flex flex-col gap-6 text-[12px] tracking-widest">
            {navItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenu(false)}
                  className={`${
                    isActive ? "text-black" : "text-gray-500"
                  } flex items-center gap-2`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}

            {user ? (
              <>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <User size={14} />
                  PROFILE
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-left text-gray-500"
                >
                  <LogOut size={14} />
                  LOGOUT
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/auth")}
                className="flex items-center gap-2 text-gray-500"
              >
                <User size={14} />
                LOGIN
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-6 md:p-10 bg-white">{children}</main>
    </div>
  );
}