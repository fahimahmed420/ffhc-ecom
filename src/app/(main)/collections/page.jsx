"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";

import { motion } from "framer-motion";

import { toast, Toaster } from "react-hot-toast";

import { useSearchParams } from "next/navigation";

export default function Collections() {
  // ======================================================
  // SEARCH PARAMS
  // ======================================================

  const searchParams = useSearchParams();

  const search =
    searchParams.get("search") || "";

  // ======================================================
  // STATES
  // ======================================================

  const [products, setProducts] =
    useState([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const [wishlist, setWishlist] =
    useState([]);

  const [cart, setCart] = useState([]);

  const [sortOrder, setSortOrder] =
    useState("default");

  const [categories, setCategories] =
    useState([]);

  const [page, setPage] = useState(0);

  const [hasMore, setHasMore] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [initialLoading, setInitialLoading] =
    useState(true);

  // ======================================================
  // REFS
  // ======================================================

  const loaderRef = useRef(null);

  const fetchingRef = useRef(false);

  // ======================================================
  // LOAD STORAGE
  // ======================================================

  useEffect(() => {
    const w = localStorage.getItem(
      "wishlist"
    );

    const c =
      localStorage.getItem("cart");

    if (w) setWishlist(JSON.parse(w));

    if (c) setCart(JSON.parse(c));
  }, []);

  // ======================================================
  // FETCH CATEGORIES
  // ======================================================

  useEffect(() => {
    const fetchCategories =
      async () => {
        try {
          const res = await fetch(
            "/api/categories",
            {
              cache: "force-cache",
            }
          );

          const data = await res.json();

          setCategories([
            ...(data.categories || []),
          ]);
        } catch (err) {
          console.error(err);
        }
      };

    fetchCategories();
  }, []);

  // ======================================================
  // HELPERS
  // ======================================================

  const updateWishlist = (list) => {
    setWishlist(list);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(list)
    );
  };

  const updateCart = (list) => {
    setCart(list);

    localStorage.setItem(
      "cart",
      JSON.stringify(list)
    );
  };

  // ======================================================
  // WISHLIST
  // ======================================================

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      updateWishlist(
        wishlist.filter((i) => i !== id)
      );

      toast("Removed from wishlist ❌");

      return;
    }

    updateWishlist([...wishlist, id]);

    toast.success(
      "Added to wishlist ❤️"
    );
  };

  // ======================================================
  // CART
  // ======================================================

  const addToCart = (product) => {
    if (cart.includes(product._id)) {
      toast("Already in cart ⚠️");

      return;
    }

    const updated = [
      ...cart,
      product._id,
    ];

    updateCart(updated);

    toast.success("Added to cart 🛒");
  };

  // ======================================================
  // SORT LABEL
  // ======================================================

  const sortQuery = useMemo(() => {
    if (sortOrder === "asc")
      return "asc";

    if (sortOrder === "desc")
      return "desc";

    return "";
  }, [sortOrder]);

  // ======================================================
  // FETCH PRODUCTS
  // ======================================================

  const fetchProducts = useCallback(
    async (reset = false) => {
      if (fetchingRef.current)
        return;

      if (!hasMore && !reset)
        return;

      fetchingRef.current = true;

      setLoading(true);

      try {
        const currentPage = reset
          ? 0
          : page;

        const query = new URLSearchParams(
          {
            page: currentPage,
            limit: "12",
            category:
              selectedCategory,
            sort: sortQuery,
            search,
          }
        );

        const res = await fetch(
          `/api/products?${query.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        const newProducts =
          data.products || [];

        setProducts((prev) => {
          if (reset)
            return newProducts;

          const ids = new Set(
            prev.map((p) => p._id)
          );

          const filtered =
            newProducts.filter(
              (p) => !ids.has(p._id)
            );

          return [
            ...prev,
            ...filtered,
          ];
        });

        setHasMore(data.hasMore);
      } catch (err) {
        console.error(
          "Product fetch error:",
          err
        );
      } finally {
        setLoading(false);

        setInitialLoading(false);

        fetchingRef.current = false;
      }
    },
    [
      page,
      selectedCategory,
      sortQuery,
      search,
      hasMore,
    ]
  );

  // ======================================================
  // RESET WHEN FILTER CHANGES
  // ======================================================

  useEffect(() => {
    setProducts([]);

    setPage(0);

    setHasMore(true);

    setInitialLoading(true);

    fetchProducts(true);
  }, [
    selectedCategory,
    sortOrder,
    search,
  ]);

  // ======================================================
  // PAGINATION
  // ======================================================

  useEffect(() => {
    if (page === 0) return;

    fetchProducts();
  }, [page]);

  // ======================================================
  // INFINITE SCROLL
  // ======================================================

  useEffect(() => {
    if (!loaderRef.current)
      return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMore &&
            !fetchingRef.current
          ) {
            setPage(
              (prev) => prev + 1
            );
          }
        },
        {
          threshold: 0.2,
        }
      );

    observer.observe(loaderRef.current);

    return () =>
      observer.disconnect();
  }, [hasMore]);

  // ======================================================
  // UI
  // ======================================================

  return (
    <section
      className="
        px-4 md:px-12 py-10
        max-w-7xl mx-auto
      "
    >
      <Toaster position="top-right" />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div
        className="
          mb-8
          flex flex-col md:flex-row
          md:items-center
          md:justify-between
          gap-4
        "
      >
        <div>
          <h1
            className="
              text-3xl md:text-4xl
              font-semibold
            "
          >
            {search
              ? `Search: "${search}"`
              : "Latest Products"}
          </h1>

          <p className="text-black/50 mt-2">
            {products.length} products
            found
          </p>
        </div>

        {/* SORT */}

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value
            )
          }
          className="
            px-4 py-2 rounded-xl
            border border-black/10
            bg-white
            outline-none
          "
        >
          <option value="default">
            Newest
          </option>

          <option value="asc">
            Price: Low → High
          </option>

          <option value="desc">
            Price: High → Low
          </option>
        </select>
      </div>

      {/* ====================================================== */}
      {/* CATEGORIES */}
      {/* ====================================================== */}

      {!search && (
        <div
          className="
            mb-8
            flex flex-wrap gap-2
          "
        >
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() =>
                setSelectedCategory(
                  cat.name
                )
              }
              className={`
                px-4 py-2 rounded-full
                text-sm flex items-center gap-2
                transition
                ${
                  selectedCategory ===
                  cat.name
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              {cat.name}

              {cat.count > 0 && (
                <span
                  className="
                    text-xs
                    bg-black/10
                    px-2 py-0.5
                    rounded-full
                  "
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ====================================================== */}
      {/* LOADING SKELETON */}
      {/* ====================================================== */}

      {initialLoading ? (
        <div
          className="
            grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            gap-6
          "
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="
                animate-pulse
                rounded-2xl
                overflow-hidden
                border
                border-gray-200
              "
            >
              <div
                className="
                  h-[220px]
                  bg-black/5
                "
              />

              <div className="p-4 space-y-3">
                <div
                  className="
                    h-4 bg-black/5 rounded
                  "
                />

                <div
                  className="
                    h-4 w-1/2
                    bg-black/5 rounded
                  "
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ====================================================== */}
          {/* EMPTY */}
          {/* ====================================================== */}

          {products.length === 0 ? (
            <div
              className="
                py-24 text-center
              "
            >
              <h2
                className="
                  text-2xl font-semibold
                "
              >
                No products found
              </h2>

              <p
                className="
                  mt-2 text-black/50
                "
              >
                Try another search
              </p>
            </div>
          ) : (
            <>
              {/* ====================================================== */}
              {/* PRODUCTS */}
              {/* ====================================================== */}

              <div
                className="
                  grid
                  grid-cols-2
                  md:grid-cols-3
                  lg:grid-cols-4
                  gap-6
                "
              >
                {products.map(
                  (product) => (
                    <motion.div
                      key={product._id}
                      whileHover={{
                        y: -4,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <Link
                        href={`/collections/${product._id}`}
                      >
                        <div
                          className="
                            bg-white
                            rounded-2xl
                            overflow-hidden
                            border border-black/5
                            hover:shadow-xl
                            transition-all duration-300
                          "
                        >
                          {/* IMAGE */}

                          <div
                            className="
                              relative
                              h-[240px]
                              overflow-hidden
                            "
                          >
                            <Image
                              src={
                                product
                                  .images?.[0] ||
                                product.thumbnail
                              }
                              alt={
                                product.title
                              }
                              fill
                              sizes="(max-width:768px) 50vw, 25vw"
                              className="
                                object-cover
                                hover:scale-105
                                transition-transform duration-500
                              "
                              priority={
                                false
                              }
                            />

                            {/* WISHLIST */}

                            <button
                              onClick={(
                                e
                              ) => {
                                e.preventDefault();

                                toggleWishlist(
                                  product._id
                                );
                              }}
                              className="
                                absolute top-3 right-3
                                bg-white/90
                                backdrop-blur-md
                                p-2.5
                                rounded-full
                                shadow-md
                                hover:scale-110
                                transition
                              "
                            >
                              {wishlist.includes(
                                product._id
                              ) ? (
                                <AiFillHeart className="text-red-500 text-lg" />
                              ) : (
                                <AiOutlineHeart className="text-lg" />
                              )}
                            </button>
                          </div>

                          {/* CONTENT */}

                          <div className="p-4">
                            <h3
                              className="
                                text-sm md:text-base
                                font-medium
                                line-clamp-1
                              "
                            >
                              {
                                product.title
                              }
                            </h3>

                            <p
                              className="
                                text-xs
                                text-black/40
                                mt-1
                              "
                            >
                              {
                                product.category
                              }
                            </p>

                            {/* PRICE */}

                            <div
                              className="
                                mt-4
                                flex items-center
                                justify-between
                                gap-2
                              "
                            >
                              <div>
                                <div
                                  className="
                                    flex items-center
                                    gap-2 flex-wrap
                                  "
                                >
                                  <p
                                    className="
                                      font-semibold
                                      text-base
                                    "
                                  >
                                    ৳
                                    {(
                                      product.discountPrice >
                                      0
                                        ? product.discountPrice
                                        : product.price
                                    ).toFixed(
                                      2
                                    )}
                                  </p>

                                  {product.discountPrice >
                                    0 && (
                                    <span
                                      className="
                                        text-sm
                                        text-gray-400
                                        line-through
                                      "
                                    >
                                      ৳
                                      {product.price.toFixed(
                                        2
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* CART */}

                              <button
                                onClick={(
                                  e
                                ) => {
                                  e.preventDefault();

                                  addToCart(
                                    product
                                  );
                                }}
                                className="
                                  p-2.5 rounded-full
                                  hover:bg-black
                                  hover:text-white
                                  transition
                                "
                              >
                                <AiOutlineShoppingCart className="text-lg" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                )}
              </div>

              {/* ====================================================== */}
              {/* LOAD MORE TRIGGER */}
              {/* ====================================================== */}

              <div
                ref={loaderRef}
                className="h-20"
              />

              {/* ====================================================== */}
              {/* LOADING MORE */}
              {/* ====================================================== */}

              {loading &&
                !initialLoading && (
                  <div
                    className="
                      text-center
                      py-6
                      text-black/50
                    "
                  >
                    Loading more
                    products...
                  </div>
                )}

              {/* ====================================================== */}
              {/* END */}
              {/* ====================================================== */}

              {!hasMore &&
                products.length >
                  0 && (
                  <div
                    className="
                      text-center
                      py-10
                      text-black/40
                    "
                  >
                    No more products
                  </div>
                )}
            </>
          )}
        </>
      )}
    </section>
  );
}