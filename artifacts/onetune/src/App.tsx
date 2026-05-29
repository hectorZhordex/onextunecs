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

const queryClient = new QueryClient();

function Router({ username, onLogout }: { username: string; onLogout: () => void }) {
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
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem("onetune_user");
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  function handleLogin(name: string) {
    localStorage.setItem("onetune_user", name);
    setUsername(name);
  }

  function handleLogout() {
    localStorage.removeItem("onetune_user");
    setUsername(null);
  }

  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router username={username} onLogout={handleLogout} />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
