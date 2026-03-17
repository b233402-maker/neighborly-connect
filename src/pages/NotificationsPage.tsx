import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HandHelping, MessageCircle, Heart, Star, Bell, Check } from "lucide-react";
import { motion } from "framer-motion";
import { mockNotifications, type Notification } from "@/data/mockData";

const iconMap: Record<Notification["type"], React.ReactNode> = {
  help: <HandHelping className="h-4 w-4 text-success" />,
  comment: <MessageCircle className="h-4 w-4 text-primary" />,
  like: <Heart className="h-4 w-4 text-primary fill-primary" />,
  karma: <Star className="h-4 w-4 text-karma fill-karma" />,
  system: <Bell className="h-4 w-4 text-muted-foreground" />,
};

const bgMap: Record<Notification["type"], string> = {
  help: "bg-success/10",
  comment: "bg-primary/10",
  like: "bg-primary/10",
  karma: "bg-karma/10",
  system: "bg-muted",
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate("/")} className="p-1 rounded-full hover:bg-muted lg:hidden"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-xl text-foreground flex-1">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary font-medium">
              <Check className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-border">
        {notifications.map((notif, i) => (
          <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className={`flex items-start gap-3 p-4 transition-colors ${!notif.read ? "bg-primary/5" : ""}`}
            onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n))}>
            <div className="relative">
              <img src={notif.user.avatar} alt="" className="h-10 w-10 rounded-full bg-muted" />
              <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full ${bgMap[notif.type]} flex items-center justify-center`}>
                {iconMap[notif.type]}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{notif.user.name}</span>{" "}
                <span className="text-muted-foreground">{notif.action}</span>{" "}
                <span className="font-medium">{notif.target}</span>
              </p>
              <span className="text-xs text-muted-foreground">{notif.time}</span>
            </div>
            {!notif.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-2 shrink-0" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
