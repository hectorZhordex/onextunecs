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

const queryClient = new QueryClient();

function Router({ user, onLogout }: { user: User; onLogout: () => void }) {
  const username =
    user.user_metadata?.["display_name"] ||
    user.user_metadata?.["name"] ||
    user.email?.split("@")[0] ||
    "User";

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

  useEffect(() => {
    document.documentElement.classList.add("dark");

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router user={user} onLogout={handleLogout} />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
