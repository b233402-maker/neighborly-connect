import { Home, Map, Plus, Bell, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { label: "Feed", icon: Home, active: true },
  { label: "Map", icon: Map },
  { label: "Post", icon: Plus, isAction: true },
  { label: "Alerts", icon: Bell, badge: 7 },
  { label: "Profile", icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full ${
                tab.isAction ? "" : ""
              }`}
            >
              {tab.isAction ? (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 -mt-4"
                >
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </motion.div>
              ) : (
                <>
                  <tab.icon
                    className={`h-6 w-6 ${
                      tab.active ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      tab.active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <span className="absolute top-1.5 right-[calc(50%-16px)] h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
                      {tab.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
