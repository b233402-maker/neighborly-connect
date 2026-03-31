import { Home, Map, Plus, Bell, User, MessageSquare, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useUnreadCount } from "@/hooks/useNotifications";

const tabs = [
  { label: "Feed", icon: Home, path: "/" },
  { label: "Map", icon: Map, path: "/map" },
  { label: "Post", icon: Plus, path: "/__post__", isAction: true },
  { label: "Messages", icon: MessageSquare, path: "/messages" },
  { label: "Alerts", icon: Bell, path: "/notifications" },
];

export function MobileNav({ onCreatePost }: { onCreatePost?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: unreadCount } = useUnreadCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border px-1 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path;
            const badge = tab.path === '/notifications' ? unreadCount : undefined;
            return (
              <button key={tab.label}
                onClick={() => tab.isAction ? onCreatePost?.() : navigate(tab.path)}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full">
                {tab.isAction ? (
                  <motion.div whileTap={{ scale: 0.9 }} className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 -mt-4">
                    <Plus className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <>
                    <tab.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-[9px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{tab.label}</span>
                    {badge ? (
                      <span className="absolute top-1.5 right-[calc(50%-14px)] h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
                        {badge}
                      </span>
                    ) : null}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
