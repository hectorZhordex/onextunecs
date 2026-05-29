import { ReactNode, useState } from "react";
import { GlassSidebar } from "./GlassSidebar";
import { FloatingPlayer } from "../player/FloatingPlayer";
import { AmbientBackground } from "./AmbientBackground";
import { Menu, X } from "lucide-react";
import logoImg from "@assets/dotcom_one_(4)_1780057221014.png";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex text-foreground overflow-hidden">
      <AmbientBackground />

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(22,22,22,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <img src={logoImg} alt="OneTune" className="w-7 h-7 object-contain" />
        <span className="text-base font-bold text-white tracking-tight">OneTune</span>
      </header>

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block">
        <GlassSidebar />
      </div>

      {/* Mobile sidebar — slide-in drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-[70] w-72"
            >
              {/* Close button inside drawer */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <GlassSidebar onNavigate={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 relative z-10 p-4 md:p-10 pb-40 ml-0 md:ml-64 overflow-y-auto min-h-screen pt-16 md:pt-10">
        <div className="max-w-7xl mx-auto h-full w-full">
          {children}
        </div>
      </main>

      <FloatingPlayer />
    </div>
  );
}
