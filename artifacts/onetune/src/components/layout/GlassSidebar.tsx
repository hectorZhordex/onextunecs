import { Link, useLocation } from "wouter";
import { Home, Search, Library, ListMusic, User } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@assets/dotcom_one_(4)_1780057221014.png";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
  { href: "/profile", label: "Profile", icon: User },
];

export function GlassSidebar() {
  const [location] = useLocation();
  const username = localStorage.getItem("onetune_user") ?? "User";
  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="glass-sidebar fixed left-0 top-0 bottom-0 w-64 z-40 hidden md:flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-1">
        <img
          src={logoImg}
          alt="OneTune"
          className="w-9 h-9 object-contain"
        />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          OneTune
        </h1>
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

      {/* User */}
      <Link href="/profile">
        <div className="mt-auto pt-5 border-t border-white/10 flex items-center gap-3 px-1 cursor-pointer hover:opacity-80 transition-opacity">
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
  );
}
