import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePlayerStore } from "@/store/player";

export function AmbientBackground() {
  const { currentTrack } = usePlayerStore();
  const [colors, setColors] = useState(["#ff006b", "#ff390d", "#222222"]);

  useEffect(() => {
    // If we had dominant colors from artwork, we'd set them here.
    // For now, we cycle some neon colors if playing, or default if not.
    if (currentTrack) {
      setColors(["#ff006b", "#8b00ff", "#ff390d"]);
    } else {
      setColors(["#ff006b", "#ff390d", "#111111"]);
    }
  }, [currentTrack]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-background">
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 mix-blend-screen"
        style={{ backgroundColor: colors[0] }}
      />
      
      <motion.div
        animate={{
          x: [0, -100, 100, 0],
          y: [0, 100, -50, 0],
          scale: [1, 1.5, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-30 mix-blend-screen"
        style={{ backgroundColor: colors[1] }}
      />
      
      <motion.div
        animate={{
          x: [0, 50, -100, 0],
          y: [0, 50, 100, 0],
          scale: [1, 0.8, 1.3, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-20 mix-blend-screen"
        style={{ backgroundColor: colors[2] }}
      />
    </div>
  );
}
