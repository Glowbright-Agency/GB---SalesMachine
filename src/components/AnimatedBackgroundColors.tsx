'use client'

import { motion } from "framer-motion";

const colors = [
  "#ceb3fc", // Original purple
  "#b3fcce", // Light green  
  "#fcb3ce", // Light pink
  "#b3cefc", // Light blue
  "#fcce3b", // Light yellow
];

export function AnimatedBackgroundColors({ 
  className = "",
  children 
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      className={`${className}`}
      animate={{
        backgroundColor: colors,
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedBackgroundColors;