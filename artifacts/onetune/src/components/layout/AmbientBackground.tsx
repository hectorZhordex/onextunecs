import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePlayerStore } from "@/store/player";

export function AmbientBackground() {
  const { currentTrack } = usePlayerStore();
  const [colors, setColors] = useState(["#ff006b", "#ff390d", "#8b00ff"]);

  useEffect(() => {
    if (currentTrack) {
      setColors(["#ff006b", "#8b00ff", "#ff390d"]);
    } else {
      setColors(["#ff006b", "#ff390d", "#8b00ff"]);
    }
  }, [currentTrack]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-background">
      {/* Pink blob — top left */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-5%] left-[-5%] w-[55vw] h-[55vw] rounded-full blur-[100px] opacity-60"
        style={{ backgroundColor: colors[0] }}
      />

      {/* Orange blob — bottom right */}
      <motion.div
        animate={{
          x: [0, -80, 80, 0],
          y: [0, 80, -50, 0],
          scale: [1, 1.4, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[-5%] right-[-5%] w-[60vw] h-[60vw] rounded-full blur-[110px] opacity-50"
        style={{ backgroundColor: colors[1] }}
      />

      {/* Purple blob — center */}
      <motion.div
        animate={{
          x: [0, 60, -80, 0],
          y: [0, 60, 80, 0],
          scale: [1, 0.85, 1.3, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-[35%] left-[25%] w-[45vw] h-[45vw] rounded-full blur-[90px] opacity-40"
        style={{ backgroundColor: colors[2] }}
      />
    </div>
  );
}
