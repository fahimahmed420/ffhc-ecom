// app/layout.js

import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import PromoPopup from "@/components/PromoPopup";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans bg-gray-100">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
       <Toaster position="top-center" />
        <FloatingWhatsApp />
        <PromoPopup />
      </body>
    </html>
  );
}
