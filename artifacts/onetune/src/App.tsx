import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Library from "@/pages/Library";
import Playlists from "@/pages/Playlists";
import PlaylistDetail from "@/pages/PlaylistDetail";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { usePlayerStore } from "@/store/player";
import { AnimatePresence, motion } from "framer-motion";

const queryClient = new QueryClient();

const GUEST_TIMEOUT_MS = 60_000;

function AppRouter({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const username = user
    ? (user.user_metadata?.["display_name"] ||
       user.user_metadata?.["name"] ||
       user.email?.split("@")[0] ||
       "User")
    : "Guest";

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/library" component={Library} />
        <Route path="/playlists" component={Playlists} />
        <Route path="/playlist/:id" component={PlaylistDetail} />
        <Route path="/profile">
          {() => <Profile username={username} onLogout={onLogout} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");

    let guestTimer: ReturnType<typeof setTimeout> | null = null;

    const startGuestTimer = () => {
      if (guestTimer) clearTimeout(guestTimer);
      guestTimer = setTimeout(() => {
        usePlayerStore.getState().pauseTrack();
        setShowLogin(true);
      }, GUEST_TIMEOUT_MS);
    };

    if (!supabase) {
      // Supabase not configured — run as guest immediately
      setLoading(false);
      startGuestTimer();
      return () => { if (guestTimer) clearTimeout(guestTimer); };
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);
      if (!sessionUser) startGuestTimer();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        if (guestTimer) clearTimeout(guestTimer);
        setShowLogin(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      if (guestTimer) clearTimeout(guestTimer);
    };
  }, []);

  async function handleLogout() {
    await supabase?.auth.signOut();
    setUser(null);
    setTimeout(() => {
      usePlayerStore.getState().pauseTrack();
      setShowLogin(true);
    }, GUEST_TIMEOUT_MS);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter user={user} onLogout={handleLogout} />
        </WouterRouter>
        <Toaster />

        <AnimatePresence>
          {showLogin && !user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[100] flex items-center justify-center"
              style={{ backdropFilter: "blur(12px)", background: "rgba(22,22,22,0.75)" }}
            >
              <Login />
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
