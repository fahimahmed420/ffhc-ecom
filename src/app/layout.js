// app/layout.js

export const metadata = {
  title: {
    default: "Family Fashion Hub China — Import from China, Sell Across Bangladesh",
    template: "%s | Family Fashion Hub China",
  },
  description:
    "Import the best quality products from China and scale your online & offline business with confidence, speed, and reliability across Bangladesh.",
  keywords: ["import from china", "wholesale bangladesh", "online shop bangladesh", "fashion hub"],
  openGraph: {
    title: "Family Fashion Hub China",
    description:
      "Source top-quality products from China and sell across Bangladesh with fast nationwide delivery.",
    type: "website",
    locale: "en_US",
    siteName: "Family Fashion Hub China",
  },
};

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
