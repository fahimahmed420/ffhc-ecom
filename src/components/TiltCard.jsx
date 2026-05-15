"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function TiltCard({ children, className }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth movement (important)
  const smoothX = useSpring(x, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 20 });

  // Rotation
  const rotateX = useTransform(smoothY, [-100, 100], [15, -15]);
  const rotateY = useTransform(smoothX, [-100, 100], [-15, 15]);

  // Light reflection
  const glareX = useTransform(smoothX, [-100, 100], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [-100, 100], ["0%", "100%"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const posX = e.clientX - rect.left - rect.width / 2;
    const posY = e.clientY - rect.top - rect.height / 2;

    x.set(posX);
    y.set(posY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      className={`relative rounded-2xl ${className}`}
    >
      {/* Card Content */}
      <div className="relative z-10">{children}</div>

      {/* Gloss / Light Effect */}
      <motion.div
        style={{
          background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.25), transparent 60%)`,
        }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
      />
    </motion.div>
  );
}