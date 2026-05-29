import { Link, useLocation } from "wouter";
import { Home, Search, Library, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
];

export function GlassSidebar() {
  const [location] = useLocation();

  return (
    <aside className="glass-sidebar fixed left-0 top-0 bottom-0 w-64 z-40 hidden md:flex flex-col p-6">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center neon-box-pink">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          OneTune
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                data-testid={`link-${item.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer group",
                  isActive
                    ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                    isActive && "text-primary neon-glow-pink"
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
            <span className="text-sm font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User</p>
            <p className="text-xs text-white/50 truncate">Premium</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
