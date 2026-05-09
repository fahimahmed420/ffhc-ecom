"use client";

import { useState } from "react";
import { Home, Grid, User, ShoppingBag } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfileSheet from "@/components/ProfileSheet";
import { motion } from "framer-motion";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const items = [
    { icon: Home, path: "/" },
    { icon: Grid, path: "/collections" },
    { icon: ShoppingBag, path: "/cart" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* FLOATING DOCK */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">

        <div className="relative flex items-center gap-6 px-6 py-3 bg-white/70 backdrop-blur-xl border border-gray-200 shadow-lg rounded-full">

          {/* 🔥 Animated Active Pill */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-1/2 -translate-y-1/2 h-10 w-10 bg-black rounded-full"
            style={{
              left:
                isActive("/") ? "23px" :
                isActive("/collections") ? "88px" :
                isActive("/cart") ? "151px" :
                "215px",
            }}
          />

          {/* NAV ITEMS */}
          {items.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={i}
                onClick={() => router.push(item.path)}
                className="relative z-10 flex items-center justify-center w-10 h-10"
              >
                <Icon
                  size={20}
                  className={`transition ${
                    active ? "text-white scale-110" : "text-gray-500"
                  }`}
                />
              </button>
            );
          })}

          {/* 👤 PROFILE / LOGIN */}
          <button
            onClick={() => {
              if (user) setOpen(true);
              else router.push("/auth");
            }}
            className="relative z-10 flex items-center justify-center w-10 h-10"
          >
            <User
              size={20}
              className={`transition ${
                pathname.includes("dashboard")
                  ? "text-white scale-110"
                  : "text-gray-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* PROFILE SHEET */}
      <ProfileSheet open={open} setOpen={setOpen} />
    </>
  );
}