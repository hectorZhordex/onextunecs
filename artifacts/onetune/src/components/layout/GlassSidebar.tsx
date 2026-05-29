import { Link, useLocation } from "wouter";
import { Home, Search, Library, ListMusic, User, Smartphone, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@assets/dotcom_one_(4)_1780057221014.png";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
  { href: "/profile", label: "Profile", icon: User },
];

function GetAppModal({ onClose }: { onClose: () => void }) {
  const appUrl = window.location.origin;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(22,22,22,0.8)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-[2rem] p-8 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff006b, #ff390d)" }}>
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Get OneTune App</h2>
            <p className="text-xs text-white/40">Install on your Android device</p>
          </div>
        </div>

        <ol className="space-y-4 mb-6">
          {[
            { step: "1", title: "Deploy your app", desc: "Click Deploy in Replit to get your public URL (e.g. onetune.yourname.replit.app)" },
            { step: "2", title: "Go to PWABuilder", desc: "Visit pwabuilder.com — it's free, no ads, made by Microsoft" },
            { step: "3", title: "Enter your URL", desc: "Paste your deployed Replit URL and click Start" },
            { step: "4", title: "Download APK", desc: "Choose Android → download the APK package and install it on your phone" },
          ].map((item) => (
            <li key={item.step} className="flex gap-3">
              <span
                className="flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #ff006b, #ff390d)" }}
              >
                {item.step}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="glass-card rounded-xl p-3 mb-5 flex items-center gap-2">
          <p className="text-xs text-white/40 flex-1 truncate font-mono">{appUrl}</p>
          <button
            onClick={() => navigator.clipboard.writeText(appUrl)}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex-none"
          >
            Copy URL
          </button>
        </div>

        <a
          href="https://www.pwabuilder.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm mb-3 transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #ff006b, #ff390d)" }}
        >
          <Download className="w-4 h-4" />
          Open PWABuilder
        </a>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

interface GlassSidebarProps {
  onNavigate?: () => void;
}

export function GlassSidebar({ onNavigate }: GlassSidebarProps = {}) {
  const [location] = useLocation();
  const [showGetApp, setShowGetApp] = useState(false);
  const username = localStorage.getItem("onetune_user") ?? "User";
  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <aside className="glass-sidebar h-full w-64 md:fixed md:left-0 md:top-0 md:bottom-0 z-40 flex flex-col p-6">
        {/* Logo — hidden on mobile (top bar handles it), visible on desktop */}
        <div className="hidden md:flex items-center gap-3 mb-10 px-1">
          <img src={logoImg} alt="OneTune" className="w-9 h-9 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight text-white">OneTune</h1>
        </div>

        {/* Logo shown in mobile drawer */}
        <div className="md:hidden flex items-center gap-3 mb-8 px-1 pt-2">
          <img src={logoImg} alt="OneTune" className="w-9 h-9 object-contain" />
          <h1 className="text-xl font-bold tracking-tight text-white">OneTune</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`link-${item.label.toLowerCase()}`}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer group",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-none transition-transform duration-200 group-hover:scale-110",
                      isActive && "text-primary"
                    )}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Get App widget */}
        <button
          onClick={() => setShowGetApp(true)}
          className="mb-4 w-full rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
          style={{
            background: "linear-gradient(135deg, rgba(255,0,107,0.15), rgba(255,57,13,0.1))",
            border: "1px solid rgba(255,0,107,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-none"
              style={{ background: "linear-gradient(135deg, #ff006b, #ff390d)" }}
            >
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Get the App</p>
              <p className="text-xs text-white/40">Install on Android</p>
            </div>
            <Download className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        {/* User */}
        <Link href="/profile">
          <div
            onClick={onNavigate}
            className="pt-5 border-t border-white/10 flex items-center gap-3 px-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{username}</p>
              <p className="text-xs text-white/40">OneTune Member</p>
            </div>
          </div>
        </Link>
      </aside>

      <AnimatePresence>
        {showGetApp && <GetAppModal onClose={() => setShowGetApp(false)} />}
      </AnimatePresence>
    </>
  );
}
