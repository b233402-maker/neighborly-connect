import { useState, useRef, useEffect } from "react";
import { Search, MapPin, ChevronDown, Eye, Users, Globe, Crosshair } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useProfile";
import { motion, AnimatePresence } from "framer-motion";

const visibilityOptions = [
  { id: "nearby", label: "Nearby Only", desc: "~2km radius", icon: Crosshair, color: "text-success" },
  { id: "friends", label: "Friends Only", desc: "Only people you connect with", icon: Users, color: "text-primary" },
  { id: "blurred", label: "Blurred", desc: "500m approximate area", icon: Eye, color: "text-accent" },
  { id: "public", label: "Public", desc: "Anyone can see your area", icon: Globe, color: "text-karma" },
];

export function TopBar() {
  const { profile } = useAuth();
  const updateProfile = useUpdateProfile();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentVisibility = profile?.privacy_level || "blurred";
  const currentOption = visibilityOptions.find(o => o.id === currentVisibility) || visibilityOptions[2];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (id: string) => {
    updateProfile.mutate({ privacy_level: id });
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground hidden sm:block">Neighborly</span>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search your neighborhood..."
              className="w-full h-9 pl-9 pr-4 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
        </div>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-xl hover:bg-muted">
            <currentOption.icon className={`h-3.5 w-3.5 ${currentOption.color}`} />
            <span className="hidden sm:inline">{currentOption.label}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-2 w-64 bg-card rounded-2xl border border-border shadow-xl p-2 z-50">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">Who can discover you</p>
                {visibilityOptions.map(opt => (
                  <button key={opt.id} onClick={() => handleSelect(opt.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      currentVisibility === opt.id ? "bg-primary/10" : "hover:bg-muted"
                    }`}>
                    <div className={`h-8 w-8 rounded-lg ${currentVisibility === opt.id ? "bg-primary/20" : "bg-muted"} flex items-center justify-center`}>
                      <opt.icon className={`h-4 w-4 ${opt.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${currentVisibility === opt.id ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                    </div>
                    {currentVisibility === opt.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
