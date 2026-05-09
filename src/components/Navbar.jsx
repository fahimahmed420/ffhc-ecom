"use client";

import { useState, useRef, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  User,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { logoutUser } from "@/lib/firebase/auth";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { cart } = useCart();
  const { user } = useAuth();

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const navRef = useRef(null);
  const itemRefs = useRef({});
  const lastScrollY = useRef(0);

  const x = useMotionValue(0);
  const width = useMotionValue(0);

  const navItems = [
    { name: "HOME", path: "/" },
    { name: "COLLECTIONS", path: "/collections" },
    { name: "ABOUT", path: "/about" },
  ];

  // INDICATOR
  const moveIndicator = (path) => {
    const el = itemRefs.current[path];
    const nav = navRef.current;

    if (!el || !nav) return;

    const rect = el.getBoundingClientRect();
    const parentRect = nav.getBoundingClientRect();

    x.set(rect.left - parentRect.left);
    width.set(rect.width);
  };

  useEffect(() => {
    moveIndicator(pathname);
  }, [pathname]);

  const handleHover = (path) => moveIndicator(path);
  const handleLeave = () => moveIndicator(pathname);

  // SEARCH
  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/collections?search=${query}`);
  };

  // LOGOUT
  const handleLogout = async () => {
    await logoutUser();
    setDropdownOpen(false);
    router.push("/");
  };

  // SCROLL
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const diff = current - lastScrollY.current;

      setScrolled(current > 10);

      if (Math.abs(diff) < 8) return;

      if (current < 80) {
        setShowNavbar(true);
      } else if (diff > 0) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // OUTSIDE CLICK
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-10">
      <motion.header
      initial={{ y: 0 }}
      animate={{ y: showNavbar ? 0 : -120 }}
      transition={{ duration: 0.35 }}
      className={`
        fixed top-0 left-0 w-full z-50
        px-6 md:px-12 py-4
        flex items-center justify-between
        border-b border-black/10
        transition-all duration-300
        ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl shadow-sm"
            : "bg-white/60 backdrop-blur-md"
        }
      `}
    >
      {/* LOGO (STATIC) */}
      <Link href="/" className="text-sm font-medium tracking-[0.3em]">
        FFHC
      </Link>

      {/* NAV */}
      <nav
        ref={navRef}
        className="hidden md:flex relative items-center gap-10 text-[12px] tracking-widest"
      >
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            ref={(el) => (itemRefs.current[item.path] = el)}
            onMouseEnter={() => handleHover(item.path)}
            onMouseLeave={handleLeave}
            className={`px-2 py-1 transition ${
              pathname === item.path
                ? "text-black"
                : "text-black/60 hover:text-black"
            }`}
          >
            {item.name}
          </Link>
        ))}

        <motion.div
          className="absolute bottom-0 h-[2px] bg-black rounded-full"
          style={{ x, width }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      </nav>

      {/* RIGHT */}
      <div className="flex items-center gap-4 relative">

        {/* SEARCH */}
        <AnimatePresence>
          {showSearch && (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border px-3 py-1 text-sm bg-white outline-none"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          )}
        </AnimatePresence>

        {showSearch ? (
          <X size={16} onClick={() => setShowSearch(false)} />
        ) : (
          <Search
            size={16}
            className="cursor-pointer hover:scale-110 transition"
            onClick={() => setShowSearch(true)}
          />
        )}

        {/* CART (HIDDEN ON SMALL DEVICES) */}
        <div
          className="relative cursor-pointer hidden md:flex"
          onClick={() => router.push("/cart")}
        >
          <ShoppingBag size={18} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </div>

        {/* USER (HIDDEN ON SMALL DEVICES) */}
        <div className="relative hidden md:flex" ref={dropdownRef}>
          {!user ? (
            <button
              onClick={() => router.push("/auth")}
              className="text-xs border px-3 py-1 hover:bg-black hover:text-white transition"
            >
              LOGIN
            </button>
          ) : (
            <div>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-black/5 transition"
              >
                <User size={18} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="
                      absolute top-10 right-0 mt-3 w-52
                      bg-white/80 backdrop-blur-xl
                      border border-black/10
                      shadow-xl rounded-xl
                      overflow-hidden
                    "
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          router.push("/dashboard");
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/10 hover:font-bold rounded-lg"
                      >
                        <LayoutDashboard size={14} />
                        Dashboard
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 hover:font-bold rounded-lg text-red-500"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.header>
    </div>
  );
}