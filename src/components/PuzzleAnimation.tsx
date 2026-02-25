"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function PuzzleAnimation() {
  // We'll define the connected (center) positions and disconnected (floating) offsets
  // Based on the provided Figma design layout of the 5 pieces.
  
  // Center puzzle piece (Nextellar logo)
  // Top piece (Stellar logo)
  // Left piece (Tailwind logo)
  // Right piece (Next.js logo)
  // Bottom piece (TS logo)

  // The main cycle:
  // 1. Initial State (Disconnected & Floating)
  // 2. Connecting (Pieces glide into place)
  // 3. Connected (Hold)
  // 4. Disconnecting (Return to initial)

  // Floating animation definition
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    }
  };

  const createPieceAnimation = (offsetX: string, offsetY: string) => ({
    x: [offsetX, offsetX, "0%", "0%", offsetX, offsetX],
    y: [offsetY, `calc(${offsetY} + 5%)`, "0%", "0%", offsetY, `calc(${offsetY} - 5%)`],
    transition: {
      duration: 8,
      times: [0, 0.25, 0.45, 0.65, 0.85, 1], // Timing mapped to states
      repeat: Infinity,
      ease: "easeInOut" as const,
    }
  });

  return (
    <div className="relative w-full aspect-[4/3] max-w-[700px] mx-auto flex items-center justify-center">
      {/* Container to handle overall scaling and perspective */}
      <div className="relative w-[35%] md:w-[40%] flex items-center justify-center">

        {/* Center: Nextellar */}
        <motion.div
          className="relative z-10 w-full"
          animate={{
            y: ["0%", "-5%", "0%", "-5%", "0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/image/Nextellar.svg"
            alt="Nextellar"
            width={300}
            height={300}
            className="w-full h-auto drop-shadow-xl"
            priority
          />
        </motion.div>

        {/* Top: Stellar */}
        <motion.div
           className="absolute z-0"
           style={{ width: "145.8%", left: "-55%", top: "-30%" }}
           animate={createPieceAnimation("-10%", "-15%")}
        >
          <Image
            src="/image/Stellar.svg"
            alt="Stellar"
            width={439}
            height={439}
            className="w-full h-auto drop-shadow-lg"
          />
        </motion.div>

        {/* Right: Next.js */}
        <motion.div
           className="absolute z-0"
           style={{ width: "125.2%", left: "48%", top: "-28%" }}
           animate={createPieceAnimation("15%", "-10%")}
        >
          <Image
            src="/image/Next.js.svg"
            alt="Next.js"
            width={377}
            height={377}
            className="w-full h-auto drop-shadow-lg"
          />
        </motion.div>

        {/* Bottom: TypeScript */}
        <motion.div
           className="absolute z-20"
           style={{ width: "139.2%", left: "30%", top: "20%" }}
           animate={createPieceAnimation("10%", "15%")}
        >
          <Image
            src="/image/TS.svg"
            alt="TypeScript"
            width={419}
            height={419}
            className="w-full h-auto drop-shadow-lg"
          />
        </motion.div>

        {/* Left: Tailwind */}
        <motion.div
           className="absolute z-20"
           style={{ width: "135.2%", left: "-50%", top: "30%" }}
           animate={createPieceAnimation("-15%", "10%")}
        >
          <Image
             src="/image/Tailwind.svg"
             alt="Tailwind CSS"
             width={407}
             height={407}
             className="w-full h-auto drop-shadow-lg"
          />
        </motion.div>

      </div>
    </div>
  );
}
