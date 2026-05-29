import { ReactNode } from "react";
import { GlassSidebar } from "./GlassSidebar";
import { FloatingPlayer } from "../player/FloatingPlayer";
import { AmbientBackground } from "./AmbientBackground";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex text-foreground overflow-hidden">
      <AmbientBackground />
      <GlassSidebar />
      
      <main className="flex-1 relative z-10 p-6 md:p-10 pb-40 ml-0 md:ml-64 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto h-full w-full">
          {children}
        </div>
      </main>
      
      <FloatingPlayer />
    </div>
  );
}
