"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

import Link from "next/link";
import Image from "next/image";

import {
  ShoppingBag,
  Search,
  User,
  X,
  LogOut,
  LayoutDashboard,
  Clock3,
} from "lucide-react";

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

  // ======================================================
  // STATES
  // ======================================================
  const [showSearch, setShowSearch] = useState(false);

  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);

  const [scrolled, setScrolled] = useState(false);

  const [activeIndex, setActiveIndex] = useState(-1);

  const [recentSearches, setRecentSearches] = useState([]);

  // ======================================================
  // REFS
  // ======================================================
  const navRef = useRef(null);

  const itemRefs = useRef({});

  const lastScrollY = useRef(0);

  const dropdownRef = useRef(null);

  const searchRef = useRef(null);

  const inputRef = useRef(null);

  // ======================================================
  // MOTION
  // ======================================================
  const x = useMotionValue(0);

  const width = useMotionValue(0);

  // ======================================================
  // NAV ITEMS
  // ======================================================
  const navItems = useMemo(
    () => [
      {
        name: "HOME",
        path: "/",
      },
      {
        name: "COLLECTIONS",
        path: "/collections",
      },
      {
        name: "ABOUT",
        path: "/about",
      },
    ],
    [],
  );

  // ======================================================
  // MOVE INDICATOR
  // ======================================================
  const moveIndicator = useCallback(
    (path) => {
      const el = itemRefs.current[path];

      const nav = navRef.current;

      if (!el || !nav) return;

      const rect = el.getBoundingClientRect();

      const parentRect = nav.getBoundingClientRect();

      x.set(rect.left - parentRect.left);

      width.set(rect.width);
    },
    [width, x],
  );

  useEffect(() => {
    moveIndicator(pathname);
  }, [pathname, moveIndicator]);

  const handleHover = (path) => moveIndicator(path);

  const handleLeave = () => moveIndicator(pathname);

  // ======================================================
  // RECENT SEARCHES
  // ======================================================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentSearches") || "[]");

    setRecentSearches(stored);
  }, []);

  // ======================================================
  // SEARCH
  // ======================================================
  const closeSearch = () => {
    setShowSearch(false);

    setResults([]);

    setQuery("");

    setActiveIndex(-1);
  };

  const handleSearch = (searchValue = query) => {
    if (!searchValue.trim()) return;

    const updated = [
      searchValue,
      ...recentSearches.filter((item) => item !== searchValue),
    ].slice(0, 6);

    localStorage.setItem("recentSearches", JSON.stringify(updated));

    setRecentSearches(updated);

    // ✅ GO TO PRODUCTS PAGE WITH SEARCH PARAM
    router.push(`/collections?search=${encodeURIComponent(searchValue)}`);

    closeSearch();
  };

  // ======================================================
  // LIVE SEARCH
  // ======================================================
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query)}&minimal=true`,
          {
            signal: controller.signal,
          },
        );

        const data = await res.json();

        if (data.success) {
          setResults(data.products);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);

    return () => {
      controller.abort();

      clearTimeout(debounce);
    };
  }, [query]);

  // ======================================================
  // CLOSE ON ROUTE CHANGE
  // ======================================================
  useEffect(() => {
    closeSearch();
  }, [pathname]);

  // ======================================================
  // OUTSIDE CLICK
  // ======================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      // USER DROPDOWN
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }

      // SEARCH
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ======================================================
  // ESC CLOSE
  // ======================================================
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // ======================================================
  // SCROLL
  // ======================================================
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

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================
  const handleLogout = async () => {
    await logoutUser();

    setDropdownOpen(false);

    router.push("/");
  };

  return (
    <div className="mb-10">
      <motion.header
        initial={{ y: 0 }}
        animate={{
          y: showNavbar ? 0 : -120,
        }}
        transition={{
          duration: 0.35,
        }}
        className={`
          fixed top-0 left-0 w-full z-50
          px-4 md:px-12 py-4
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
        {/* ====================================================== */}
        {/* LOGO */}
        {/* ====================================================== */}

        <Link
          href="/"
          className="
            text-sm font-medium
            tracking-[0.3em]
            select-none
          "
        >
          FFHC
        </Link>

        {/* ====================================================== */}
        {/* NAV */}
        {/* ====================================================== */}

        <nav
          ref={navRef}
          className="
            hidden md:flex
            relative
            items-center
            gap-10
            text-[12px]
            tracking-widest
          "
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              ref={(el) => (itemRefs.current[item.path] = el)}
              onMouseEnter={() => handleHover(item.path)}
              onMouseLeave={handleLeave}
              className={`
                px-2 py-1 transition
                ${
                  pathname === item.path
                    ? "text-black"
                    : "text-black/60 hover:text-black"
                }
              `}
            >
              {item.name}
            </Link>
          ))}

          <motion.div
            className="
              absolute bottom-0
              h-[2px]
              bg-black rounded-full
            "
            style={{
              x,
              width,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 40,
            }}
          />
        </nav>

        {/* ====================================================== */}
        {/* RIGHT */}
        {/* ====================================================== */}

        <div className="flex items-center gap-4 relative">
          {/* ====================================================== */}
          {/* SEARCH */}
          {/* ====================================================== */}

          <div className="relative flex items-center" ref={searchRef}>
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{
                    width: 0,
                    opacity: 0,
                  }}
                  animate={{
                    width: 320,
                    opacity: 1,
                  }}
                  exit={{
                    width: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="
          flex items-center gap-2
          overflow-hidden
        "
                >
                  {/* CLOSE BUTTON */}

                  <button
                    onClick={closeSearch}
                    className="
            flex-shrink-0
            w-9 h-9
            rounded-full
            flex items-center justify-center
            hover:bg-black/5
            transition
          "
                  >
                    <X size={18} className="hover:rotate-90 transition" />
                  </button>

                  {/* INPUT + DROPDOWN */}

                  <div className="relative w-[270px]">
                    <input
                      ref={inputRef}
                      autoFocus
                      type="text"
                      placeholder="Search products..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);

                        setActiveIndex(-1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          setActiveIndex((prev) =>
                            prev < results.length - 1 ? prev + 1 : prev,
                          );
                        }

                        if (e.key === "ArrowUp") {
                          setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
                        }

                        if (e.key === "Enter") {
                          if (activeIndex >= 0) {
                            router.push(
                              `/collections/${results[activeIndex]._id}`,
                            );

                            closeSearch();

                            return;
                          }

                          handleSearch();
                        }
                      }}
                      className="
              w-full
              border border-black/10
              bg-white/90
              backdrop-blur-xl
              px-4 py-2.5
              rounded-xl
              text-sm
              outline-none
              shadow-xl
            "
                    />

                    {/* ====================================================== */}
                    {/* RECENT SEARCHES */}
                    {/* ====================================================== */}

                    {!query && recentSearches.length > 0 && (
                      <div
                        className="
                  absolute top-14 left-0 w-full
                  bg-white/95
                  backdrop-blur-xl
                  border border-black/10
                  rounded-2xl
                  shadow-2xl
                  p-4
                  z-50
                "
                      >
                        <p
                          className="
                    text-xs
                    text-black/40
                    mb-3
                  "
                        >
                          Recent Searches
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((item) => (
                            <button
                              key={item}
                              onClick={() => handleSearch(item)}
                              className="
                        flex items-center gap-1
                        px-3 py-1.5
                        rounded-full
                        bg-black/5
                        hover:bg-black
                        hover:text-white
                        text-xs
                        transition
                      "
                            >
                              <Clock3 size={12} />

                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ====================================================== */}
                    {/* LOADING */}
                    {/* ====================================================== */}

                    {loading && (
                      <div
                        className="
                absolute top-14 left-0 w-full
                bg-white rounded-2xl
                border border-black/10
                p-3 space-y-3
                shadow-2xl
                z-50
              "
                      >
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="
                    flex items-center gap-3
                    animate-pulse
                  "
                          >
                            <div
                              className="
                      w-14 h-14 rounded-lg
                      bg-black/10
                    "
                            />

                            <div className="flex-1 space-y-2">
                              <div
                                className="
                        h-3 rounded
                        bg-black/10
                        w-2/3
                      "
                              />

                              <div
                                className="
                        h-2 rounded
                        bg-black/10
                        w-1/3
                      "
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ====================================================== */}
                    {/* RESULTS */}
                    {/* ====================================================== */}

                    <AnimatePresence>
                      {!loading && results.length > 0 && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: 10,
                          }}
                          className="
                    absolute top-14 left-0 w-full
                    bg-white/95
                    backdrop-blur-xl
                    border border-black/10
                    rounded-2xl
                    shadow-2xl
                    overflow-hidden
                    z-50
                  "
                        >
                          {results.map((product, index) => (
                            <Link
                              key={product._id}
                              href={`/collections/${product._id}`}
                              className={`
                          flex items-center gap-3
                          p-3 transition
                          ${
                            activeIndex === index
                              ? "bg-black text-white"
                              : "hover:bg-black/5"
                          }
                        `}
                              onClick={() => closeSearch()}
                            >
                              <Image
                                src={product.thumbnail}
                                alt={product.title}
                                width={56}
                                height={56}
                                className="
                            rounded-lg
                            object-cover
                          "
                                unoptimized
                              />

                              <div className="flex-1 min-w-0">
                                <h4
                                  className="
                              text-sm
                              font-medium
                              truncate
                            "
                                >
                                  {product.title}
                                </h4>

                                <p
                                  className={`
                              text-xs
                              ${
                                activeIndex === index
                                  ? "text-white/70"
                                  : "text-black/50"
                              }
                            `}
                                >
                                  {product.category}
                                </p>
                              </div>

                              <p className="text-sm font-semibold">
                                ${product.price}
                              </p>
                            </Link>
                          ))}

                          <button
                            onClick={() => handleSearch()}
                            className="
                      w-full text-center
                      py-3 text-sm
                      border-t border-black/10
                      hover:bg-black
                      hover:text-white
                      transition
                    "
                          >
                            View All Results
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ====================================================== */}
                    {/* EMPTY */}
                    {/* ====================================================== */}

                    {query.trim() && !loading && results.length === 0 && (
                      <div
                        className="
                  absolute top-14 left-0 w-full
                  bg-white
                  border border-black/10
                  rounded-2xl
                  shadow-2xl
                  p-6
                  text-center
                  text-sm
                  text-black/50
                  z-50
                "
                      >
                        No products found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SEARCH ICON */}

            {!showSearch && (
              <button
                onClick={() => setShowSearch(true)}
                className="
        w-9 h-9
        rounded-full
        flex items-center justify-center
        hover:bg-black/5
        transition
      "
              >
                <Search size={18} className="hover:scale-110 transition" />
              </button>
            )}
          </div>

          {/* ====================================================== */}
          {/* CART */}
          {/* ====================================================== */}

          <div
            className="
              relative cursor-pointer
              hidden md:flex
            "
            onClick={() => router.push("/cart")}
          >
            <ShoppingBag size={18} />

            {cart.length > 0 && (
              <span
                className="
                  absolute -top-2 -right-2
                  bg-black text-white
                  text-[10px]
                  w-4 h-4
                  flex items-center justify-center
                  rounded-full
                "
              >
                {cart.length}
              </span>
            )}
          </div>

          {/* ====================================================== */}
          {/* USER */}
          {/* ====================================================== */}

          <div
            className="
              relative hidden md:flex
            "
            ref={dropdownRef}
          >
            {!user ? (
              <button
                onClick={() => router.push("/auth")}
                className="
                  text-xs border
                  px-3 py-1
                  hover:bg-black
                  hover:text-white
                  transition
                "
              >
                LOGIN
              </button>
            ) : (
              <div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="
                    w-8 h-8
                    flex items-center justify-center
                    rounded-full
                    hover:bg-black/5
                    transition
                  "
                >
                  <User size={18} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -10,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="
                        absolute top-10 right-0 mt-3
                        w-52
                        bg-white/90
                        backdrop-blur-xl
                        border border-black/10
                        shadow-2xl
                        rounded-2xl
                        overflow-hidden
                      "
                    >
                      <div className="p-2">
                        <button
                          onClick={() => {
                            router.push("/dashboard");

                            setDropdownOpen(false);
                          }}
                          className="
                            w-full
                            flex items-center gap-2
                            px-3 py-2
                            text-sm
                            hover:bg-black/10
                            rounded-xl
                            transition
                          "
                        >
                          <LayoutDashboard size={14} />
                          Dashboard
                        </button>

                        <button
                          onClick={handleLogout}
                          className="
                            w-full
                            flex items-center gap-2
                            px-3 py-2
                            text-sm
                            hover:bg-red-50
                            rounded-xl
                            text-red-500
                            transition
                          "
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
