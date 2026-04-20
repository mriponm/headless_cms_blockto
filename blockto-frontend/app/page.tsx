"use client";
import { motion } from "framer-motion";
import BreakingBanner from "@/components/features/BreakingBanner";
import QuickNav from "@/components/features/QuickNav";
import PulseRow from "@/components/features/PulseRow";
import HeroSection from "@/components/features/homepage/HeroSection";
import NewsGrid from "@/components/features/homepage/NewsGrid";
import CompactGrid from "@/components/features/homepage/CompactGrid";
import Sidebar from "@/components/features/homepage/Sidebar";
import MobileNewsCards from "@/components/features/homepage/MobileNewsCards";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" as const, delay },
});

export default function HomePage() {
  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pb-10 pt-4">
      {/* Mobile only */}
      <motion.div {...fadeUp(0.05)}><BreakingBanner /></motion.div>
      <motion.div {...fadeUp(0.1)}><QuickNav /></motion.div>

      {/* Pulse metrics row */}
      <motion.div {...fadeUp(0.15)}><PulseRow /></motion.div>

      {/* Main grid: content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7">
        <div>
          <div className="hidden md:block">
            <motion.div {...fadeUp(0.2)}><HeroSection /></motion.div>
            <motion.div {...fadeUp(0.28)}><NewsGrid /></motion.div>
            <motion.div {...fadeUp(0.34)}><CompactGrid /></motion.div>
          </div>
          <div className="md:hidden">
            <motion.div {...fadeUp(0.18)}><HeroSection /></motion.div>
            <motion.div {...fadeUp(0.26)}><MobileNewsCards /></motion.div>
          </div>
        </div>
        <motion.div {...fadeUp(0.25)} className="hidden lg:block">
          <Sidebar />
        </motion.div>
      </div>
    </div>
  );
}
