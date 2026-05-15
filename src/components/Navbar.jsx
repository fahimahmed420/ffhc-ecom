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
  // STATE
  // ======================================================

  const [showSearch, setShowSearch] = useState(false);

  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [activeIndex, setActiveIndex] = useState(-1);

  const [recentSearches, setRecentSearches] = useState([]);

  const [scrolled, setScrolled] = useState(false);

  const [hideNavbar, setHideNavbar] = useState(false);

  // ======================================================
  // REFS
  // ======================================================

  const navRef = useRef(null);

  const itemRefs = useRef({});

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
  // ACTIVE INDICATOR
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
    [x, width],
  );

  useEffect(() => {
    moveIndicator(pathname);
  }, [pathname, moveIndicator]);

  // ======================================================
  // SCROLL EFFECT
  // ======================================================

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // background blur
      setScrolled(currentScrollY > 20);

      // hide on scroll down
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHideNavbar(true);
      }

      // show on scroll up
      else {
        setHideNavbar(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ======================================================
  // RECENT SEARCHES
  // ======================================================

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentSearches")) || [];

    setRecentSearches(stored);
  }, []);

  // ======================================================
  // CLOSE SEARCH
  // ======================================================

  const closeSearch = useCallback(() => {
    setShowSearch(false);

    setResults([]);

    setQuery("");

    setActiveIndex(-1);
  }, []);

  // ======================================================
  // SEARCH SUBMIT
  // ======================================================

  const handleSearch = useCallback(
    (searchValue = query) => {
      if (!searchValue.trim()) return;

      const updated = [
        searchValue,
        ...recentSearches.filter((item) => item !== searchValue),
      ].slice(0, 6);

      localStorage.setItem("recentSearches", JSON.stringify(updated));

      setRecentSearches(updated);

      router.push(`/collections?search=${encodeURIComponent(searchValue)}`);

      closeSearch();
    },
    [query, recentSearches, router, closeSearch],
  );

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
          setResults(data.products || []);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 250);

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
  }, [pathname, closeSearch]);

  // ======================================================
  // OUTSIDE CLICK
  // ======================================================

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [closeSearch]);

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
  }, [closeSearch]);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = async () => {
    await logoutUser();

    setDropdownOpen(false);

    router.push("/");
  };

  return (
    <div className="">
      <motion.header
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: hideNavbar ? -100 : 0,
          opacity: hideNavbar ? 0.95 : 1,
        }}
        transition={{
          duration: 0.4,
        }}
        className={`
          fixed top-0 left-0 right-0 z-[9999]
          flex items-center justify-between
          px-4 md:px-10 lg:px-14
          h-16
          border-b border-black/5
          transition-all duration-300
          ${
            scrolled
              ? "bg-white/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
              : "bg-white/55 backdrop-blur-xl"
          }
        `}
      >
        {/* ====================================================== */}
        {/* LOGO */}
        {/* ====================================================== */}

        <Link
          href="/"
          className="
            text-sm
            font-semibold
            tracking-[0.35em]
            text-black
            select-none
          "
        >
          FFHC
        </Link>

        {/* ====================================================== */}
        {/* NAVIGATION */}
        {/* ====================================================== */}

        <nav
          ref={navRef}
          className="
            hidden md:flex
            relative
            items-center
            gap-8
            text-[11px]
            font-medium
            tracking-[0.25em]
          "
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              ref={(el) => (itemRefs.current[item.path] = el)}
              onMouseEnter={() => moveIndicator(item.path)}
              onMouseLeave={() => moveIndicator(pathname)}
              className={`
                relative
                py-2
                transition-colors duration-300
                ${
                  pathname === item.path
                    ? "text-black"
                    : "text-black/50 hover:text-black"
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
              rounded-full
              bg-black
            "
            style={{
              x,
              width,
            }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 35,
            }}
          />
        </nav>

        {/* ====================================================== */}
        {/* RIGHT SIDE */}
        {/* ====================================================== */}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* ====================================================== */}
          {/* SEARCH */}
          {/* ====================================================== */}

          <div ref={searchRef} className="relative flex items-center">
            {/* BUTTON */}

            <button
              onClick={() => {
                if (showSearch) {
                  closeSearch();
                } else {
                  setShowSearch(true);

                  requestAnimationFrame(() => {
                    inputRef.current?.focus();
                  });
                }
              }}
              className="
                relative z-20
                flex items-center justify-center
                w-10 h-10
                rounded-full
                hover:bg-black/5
                active:scale-95
                transition
              "
            >
              <AnimatePresence mode="wait">
                {showSearch ? (
                  <motion.div
                    key="close"
                    initial={{
                      opacity: 0,
                      rotate: -90,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: 1,
                      rotate: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      rotate: 90,
                      scale: 0.7,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                  >
                    <X size={18} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    initial={{
                      opacity: 0,
                      rotate: 90,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: 1,
                      rotate: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      rotate: -90,
                      scale: 0.7,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                  >
                    <Search size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* SEARCH BOX */}

            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{
                    width: 0,
                    opacity: 0,
                  }}
                  animate={{
                    width:
                      typeof window !== "undefined" && window.innerWidth < 640
                        ? 220
                        : 340,
                    opacity: 1,
                  }}
                  exit={{
                    width: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.22,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  {/* INPUT */}

                  <input
                    ref={inputRef}
                    type="text"
                    autoFocus
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
                      h-11
                      rounded-2xl
                      border border-black/10
                      bg-white/90
                      backdrop-blur-xl
                      px-4
                      text-sm
                      outline-none
                      shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                      placeholder:text-black/35
                    "
                  />

                  {/* RECENT SEARCHES */}

                  {!query && recentSearches.length > 0 && (
                    <div
                      className="
                          absolute top-14 left-0
                          w-full
                          rounded-3xl
                          border border-black/10
                          bg-white/95
                          backdrop-blur-2xl
                          p-4
                          shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                          z-50
                        "
                    >
                      <p
                        className="
                            mb-3
                            text-[11px]
                            uppercase
                            tracking-widest
                            text-black/35
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
                                  flex items-center gap-1.5
                                  rounded-full
                                  bg-black/[0.04]
                                  px-3 py-2
                                  text-[11px]
                                  transition
                                  hover:bg-black
                                  hover:text-white
                                "
                          >
                            <Clock3 size={12} />

                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LOADING */}

                  {loading && (
                    <div
                      className="
                        absolute top-14 left-0
                        w-full
                        rounded-3xl
                        border border-black/10
                        bg-white/95
                        p-4
                        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                        z-50
                      "
                    >
                      <div className="space-y-4">
                        {[...Array(4)].map((_, index) => (
                          <div
                            key={index}
                            className="
                                flex items-center gap-3
                                animate-pulse
                              "
                          >
                            <div
                              className="
                                  h-12 w-12
                                  rounded-xl
                                  bg-black/10
                                "
                            />

                            <div className="flex-1 space-y-2">
                              <div
                                className="
                                    h-3
                                    w-2/3
                                    rounded-full
                                    bg-black/10
                                  "
                              />

                              <div
                                className="
                                    h-2
                                    w-1/3
                                    rounded-full
                                    bg-black/10
                                  "
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RESULTS */}

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
                        transition={{
                          duration: 0.2,
                        }}
                        className="
                            absolute top-14 left-0
                            w-full
                            overflow-hidden
                            rounded-3xl
                            border border-black/10
                            bg-white/95
                            backdrop-blur-2xl
                            shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                            z-50
                          "
                      >
                        {results.map((product, index) => (
                          <Link
                            key={product._id}
                            href={`/collections/${product._id}`}
                            onClick={() => closeSearch()}
                            className={`
                                  flex items-center gap-3
                                  p-3
                                  transition-all duration-200
                                  ${
                                    activeIndex === index
                                      ? "bg-black text-white"
                                      : "hover:bg-black/[0.03]"
                                  }
                                `}
                          >
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              width={52}
                              height={52}
                              className="
                                    h-12 w-12
                                    rounded-xl
                                    object-cover
                                    shrink-0
                                  "
                              unoptimized
                            />

                            <div className="min-w-0 flex-1">
                              <h4
                                className="
                                      truncate
                                      text-sm
                                      font-medium
                                    "
                              >
                                {product.title}
                              </h4>

                              <p
                                className={`
                                      text-xs
                                      ${
                                        activeIndex === index
                                          ? "text-white/60"
                                          : "text-black/45"
                                      }
                                    `}
                              >
                                {product.category}
                              </p>
                            </div>

                            <span
                              className="
                                    shrink-0
                                    text-sm
                                    font-semibold
                                  "
                            >
                              ${product.price}
                            </span>
                          </Link>
                        ))}

                        {/* VIEW ALL */}

                        <button
                          onClick={() => handleSearch()}
                          className="
                              w-full
                              border-t border-black/10
                              py-3
                              text-sm
                              font-medium
                              transition
                              hover:bg-black
                              hover:text-white
                            "
                        >
                          View All Results
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* EMPTY */}

                  {query.trim() && !loading && results.length === 0 && (
                    <div
                      className="
                          absolute top-14 left-0
                          w-full
                          rounded-3xl
                          border border-black/10
                          bg-white/95
                          p-5
                          text-center
                          text-sm
                          text-black/45
                          shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                          z-50
                        "
                    >
                      No products found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ====================================================== */}
          {/* CART */}
          {/* ====================================================== */}

          <button
            onClick={() => router.push("/cart")}
            className="
              relative
              hidden md:flex
              items-center justify-center
              w-10 h-10
              rounded-full
              hover:bg-black/5
              transition
            "
          >
            <ShoppingBag size={18} />

            {cart.length > 0 && (
              <span
                className="
                  absolute top-1 right-1
                  flex items-center justify-center
                  min-w-[18px]
                  h-[18px]
                  rounded-full
                  bg-black
                  px-1
                  text-[10px]
                  font-medium
                  text-white
                "
              >
                {cart.length}
              </span>
            )}
          </button>

          {/* ====================================================== */}
          {/* USER */}
          {/* ====================================================== */}

          <div ref={dropdownRef} className="relative hidden md:block">
            {!user ? (
              <button
                onClick={() => router.push("/auth")}
                className="
                  rounded-full
                  border border-black/10
                  px-4 py-2
                  text-[11px]
                  font-medium
                  tracking-wider
                  transition
                  hover:bg-black
                  hover:text-white
                "
              >
                LOGIN
              </button>
            ) : (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="
                    flex items-center justify-center
                    w-10 h-10
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
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                        scale: 0.96,
                      }}
                      transition={{
                        duration: 0.18,
                      }}
                      className="
                        absolute right-0 top-12
                        w-56
                        overflow-hidden
                        rounded-3xl
                        border border-black/10
                        bg-white/90
                        backdrop-blur-2xl
                        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                      "
                    >
                      <div className="p-2">
                        <button
                          onClick={() => {
                            router.push("/dashboard");

                            setDropdownOpen(false);
                          }}
                          className="
                            flex w-full items-center gap-3
                            rounded-2xl
                            px-4 py-3
                            text-sm
                            transition
                            hover:bg-black/[0.05]
                          "
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </button>

                        <button
                          onClick={handleLogout}
                          className="
                            flex w-full items-center gap-3
                            rounded-2xl
                            px-4 py-3
                            text-sm
                            text-red-500
                            transition
                            hover:bg-red-50
                          "
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </motion.header>
    </div>
  );
}
