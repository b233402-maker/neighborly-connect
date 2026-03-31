import { useState, useEffect } from "react";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { LeftSidebar } from "@/components/sidebar/LeftSidebar";
import { LocationOnboarding } from "@/components/onboarding/LocationOnboarding";
import { CreatePostModal } from "@/components/feed/CreatePostModal";


interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showTopBar?: boolean;
  fullWidth?: boolean;
}

export function AppLayout({ children, showSidebar = true, showTopBar = true, fullWidth = false }: AppLayoutProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("neighborly-location-set");
    if (!hasSeenOnboarding) {
      setShowLocation(true);
    }
  }, []);

  const handleLocationComplete = () => {
    localStorage.setItem("neighborly-location-set", "true");
    setShowLocation(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {showTopBar && <TopBar />}
      {fullWidth ? (
        <>{children}</>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-4">
          {showSidebar ? (
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_320px] gap-6">
              <LeftSidebar />
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      )}
      <MobileNav onCreatePost={() => setShowCreate(true)} />
      <CreatePostModal open={showCreate} onClose={() => setShowCreate(false)} onPost={() => {}} />
      <LocationOnboarding open={showLocation} onComplete={handleLocationComplete} />
    </div>
  );
}
