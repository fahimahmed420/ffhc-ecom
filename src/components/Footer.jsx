"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Phone, Copy, Check, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const phoneNumber = "01774433063";

  const copyNumber = async () => {
    await navigator.clipboard.writeText(phoneNumber);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const links = [
    {
      title: "Privacy Policy",

      description: `
At Family Fashion Hub China, we value your privacy and are committed to protecting your personal information.

• We only collect essential customer information required for orders and delivery.
• Your information is never sold or shared with third parties.
• Payment information remains secure and encrypted.
• We use your contact details only for order updates, support, and delivery communication.
• Customers can request account or data removal anytime.

Your trust and safety are our top priorities.
      `,
    },

    {
      title: "Terms of Service",

      description: `
By accessing and using Family Fashion Hub China, you agree to the following terms:

• Products are subject to availability.
• Prices may change without prior notice.
• Customers must provide accurate delivery information.
• Fake orders or misuse of the platform may result in restrictions.
• Delivery timelines may vary depending on location and courier conditions.
• Refunds and exchanges follow our official return policy.

We aim to provide a smooth and transparent shopping experience for everyone.
      `,
    },

    {
      title: "Shipping Info",

      description: `
We provide nationwide delivery across Bangladesh.

• Orders inside Dhaka are usually delivered within 1 working day.
• Outside Dhaka deliveries may take 1-2 working days.
• Customers receive updates regarding shipment progress.
• Products are carefully packaged to ensure safe delivery.
• International sourcing items may require additional processing time.

Current shop location:
Dhaka, Bangladesh.
      `,
    },

    {
      title: "Contact Us",

      description: `
Need assistance? Our support team is always available to help you.

• Product inquiries
• Order tracking
• Delivery support
• Wholesale questions
• Payment assistance

Shop Location:
Dhaka, Bangladesh

Customer Support Number:
01774433063
      `,
    },
  ];

  const payments = ["Visa", "Mastercard", "bKash", "Nagad", "Rocket"];

  return (
    <footer className="bg-black text-white">
      <div className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
        {/* Brand */}
        <h2 className="text-2xl mb-12 text-center font-semibold">
          Family Fashion Hub China
        </h2>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
          {links.map((link, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{
                type: "spring",
                stiffness: 200,
              }}
              onClick={() => setActiveModal(link)}
              role="button"
              className="group border border-gray-700 p-5 bg-white text-black cursor-pointer relative text-center rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-sm tracking-widest font-medium mb-2">
                {link.title.toUpperCase()}
              </h3>

              {/* Hover underline */}
              <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-3/4 -translate-x-1/2"></div>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center mb-12">
          <p className="text-sm tracking-widest mb-4">ACCEPTED PAYMENTS</p>

          <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-300">
            {payments.map((method, idx) => (
              <span
                key={idx}
                className="border border-gray-700 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-300"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-sm text-gray-400 text-center">
          © 2026 Family Fashion Hub China. All rights reserved.
        </p>

        {/* Modal */}
        <AnimatePresence>
          {activeModal && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveModal(null)}
              />

              {/* Modal Box */}
              <motion.div
                className="fixed inset-0 flex items-center justify-center z-50 px-4 py-6"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
              >
                <div
                  className="
      bg-white
      w-full
      max-w-lg
      rounded-2xl
      shadow-2xl
      relative
      overflow-hidden
      max-h-[85vh]
      flex
      flex-col
    "
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-white border-b px-5 md:px-8 py-4 z-10">
                    <h3 className="text-base md:text-lg font-semibold text-black">
                      {activeModal.title}
                    </h3>

                    {/* Close Button */}
                    <button
                      onClick={() => setActiveModal(null)}
                      className="absolute top-4 right-5 text-gray-400 hover:text-black text-lg transition-all duration-300"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div
                    className="
        overflow-y-auto
        px-5
        md:px-8
        py-5
        pb-28
        md:pb-8
      "
                  >
                    {/* Description */}
                    <p className="text-sm md:text-base text-gray-700 leading-8 whitespace-pre-line">
                      {activeModal.description}
                    </p>

                    {/* Contact Buttons */}
                    {activeModal.title === "Contact Us" && (
                      <div className="mt-8 space-y-4">
                        {/* Location */}
                        <div className="flex items-start gap-3 text-gray-700 text-sm">
                          <MapPin size={18} className="mt-1 shrink-0" />
                          <span>Dhaka, Bangladesh</span>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/8801774433063`}
                            target="_blank"
                            className="
                flex items-center justify-center gap-2
                bg-green-500 hover:bg-green-600
                text-white
                px-4 py-3
                rounded-xl
                text-sm
                transition-all duration-300
              "
                          >
                            <MessageCircle size={18} />
                            WhatsApp
                          </a>

                          {/* Call */}
                          <a
                            href={`tel:${phoneNumber}`}
                            className="
                flex items-center justify-center gap-2
                bg-black hover:bg-gray-800
                text-white
                px-4 py-3
                rounded-xl
                text-sm
                transition-all duration-300
              "
                          >
                            <Phone size={18} />
                            Call Now
                          </a>

                          {/* Copy */}
                          <button
                            onClick={copyNumber}
                            className="
                flex items-center justify-center gap-2
                border border-gray-300 hover:border-black
                px-4 py-3
                rounded-xl
                text-sm
                transition-all duration-300
                text-black
              "
                          >
                            {copied ? (
                              <>
                                <Check size={18} />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={18} />
                                Copy Number
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
}
