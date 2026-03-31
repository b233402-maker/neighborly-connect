import { useState } from "react";
import { HandHelping, MessageCircle, Heart, Star, Bell, Check } from "lucide-react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { useNotifications, useMarkNotificationsRead, type NotificationItem } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const iconMap: Record<string, React.ReactNode> = {
  help: <HandHelping className="h-4 w-4 text-success" />,
  comment: <MessageCircle className="h-4 w-4 text-primary" />,
  like: <Heart className="h-4 w-4 text-primary fill-primary" />,
  karma: <Star className="h-4 w-4 text-karma fill-karma" />,
  system: <Bell className="h-4 w-4 text-muted-foreground" />,
};
const bgMap: Record<string, string> = {
  help: "bg-success/10", comment: "bg-primary/10", like: "bg-primary/10", karma: "bg-karma/10", system: "bg-muted",
};

const filterTabs = ["All", "Help", "Comments", "Likes", "Karma"];
const filterMap: Record<string, string[]> = {
  All: ["help", "comment", "like", "karma", "system"],
  Help: ["help"], Comments: ["comment"], Likes: ["like"], Karma: ["karma"],
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const markAllRead = () => markRead.mutate(undefined);
  const markOneRead = (id: string) => markRead.mutate([id]);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;
  const filtered = (notifications || []).filter((n) => filterMap[activeTab]?.includes(n.type));

  return (
    <AppLayout>
      <div className="lg:col-span-1 xl:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-2xl text-foreground">
            Notifications {unreadCount > 0 && <span className="text-sm font-normal text-primary ml-2">({unreadCount} new)</span>}
          </h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full bg-primary/10">
              <Check className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-card rounded-2xl p-1 border border-border mb-4 overflow-x-auto">
          {filterTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                tab === activeTab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        )}

        {!isLoading && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {filtered.map((notif, i) => (
              <motion.button key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`w-full flex items-start gap-3 p-4 transition-colors text-left hover:bg-muted/30 ${!notif.read ? "bg-primary/5" : ""}`}
                onClick={() => !notif.read && markOneRead(notif.id)}>
                <div className="relative shrink-0">
                  <img src={notif.actor?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.id}`} alt="" className="h-11 w-11 rounded-full bg-muted" />
                  <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full ${bgMap[notif.type] || bgMap.system} flex items-center justify-center border-2 border-card`}>
                    {iconMap[notif.type] || iconMap.system}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-semibold">{notif.actor?.display_name || 'Someone'}</span>{" "}
                    <span className="text-muted-foreground">{notif.action}</span>{" "}
                    {notif.target && <span className="font-medium">{notif.target}</span>}
                  </p>
                  <span className="text-xs text-muted-foreground mt-0.5 block">{getTimeAgo(notif.created_at)}</span>
                </div>
                {!notif.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-2 shrink-0" />}
              </motion.button>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center"><p className="text-muted-foreground text-sm">No notifications in this category</p></div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
