"use client";

import { useState } from "react";
import { Home, Grid3x3, ShoppingBag, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ProfileSheet from "@/components/ProfileSheet";

const TABS = [
  { label: "Home",  icon: Home,        path: "/" },
  { label: "Shop",  icon: Grid3x3,     path: "/collections" },
  { label: "Cart",  icon: ShoppingBag, path: "/cart" },
  { label: "Me",    icon: User,        path: "__profile__" },
];

export default function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { cart } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);

  const cartCount = cart.reduce(
    (acc, item) => acc + (typeof item === "string" ? 1 : item.qty || 1),
    0
  );

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    if (path === "/cart") return pathname === "/cart" || pathname === "/checkout";
    if (path === "__profile__") return pathname.startsWith("/dashboard");
    return pathname.startsWith(path);
  };

  const handleTab = (path) => {
    if (path === "__profile__") {
      if (user) setSheetOpen(true);
      else router.push("/auth");
      return;
    }
    router.push(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 h-16 px-1">
          {TABS.map(({ label, icon: Icon, path }) => {
            const active = isActive(path);
            const isCart = path === "/cart";

            return (
              <button
                key={path}
                onClick={() => handleTab(path)}
                className="flex flex-col items-center justify-center gap-1 relative"
              >
                {/* Icon container */}
                <div className={`relative flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-200 ${active ? "bg-gray-900" : ""}`}>
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`transition-colors ${active ? "text-white" : "text-gray-400"}`}
                  />

                  {/* Cart badge */}
                  {isCart && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 leading-none">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] font-semibold leading-none transition-colors ${active ? "text-gray-900" : "text-gray-400"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* iPhone home indicator spacing */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </nav>

      <ProfileSheet open={sheetOpen} setOpen={setSheetOpen} />
    </>
  );
}
