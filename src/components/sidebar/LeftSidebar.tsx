import { Home, Map, MessageSquare, Bell, User, Star, Shield, Settings, Crown, HandHelping, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { currentUser } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Feed", icon: Home, path: "/" },
  { label: "Explore Map", icon: Map, path: "/map" },
  { label: "Messages", icon: MessageSquare, path: "/messages", badge: 3 },
  { label: "Notifications", icon: Bell, path: "/notifications", badge: 7 },
  { label: "My Profile", icon: User, path: "/profile" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col gap-3 sticky top-[4.5rem] h-fit">
      {/* Profile Card */}
      <button onClick={() => navigate("/profile")}
        className="feed-card flex flex-col items-center text-center hover:shadow-md transition-shadow">
        <div className="relative mb-3">
          <img src={currentUser.avatar} alt={currentUser.name} className="h-14 w-14 rounded-xl bg-muted" />
          {currentUser.isPro && (
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-lg bg-accent flex items-center justify-center">
              <Crown className="h-2.5 w-2.5 text-accent-foreground" />
            </span>
          )}
        </div>
        <h3 className="font-display font-semibold text-sm text-foreground">{currentUser.name}</h3>
        <p className="text-[11px] text-muted-foreground mb-3 line-clamp-1">{currentUser.bio}</p>
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 text-center">
            <div className="karma-badge justify-center text-xs"><Star className="h-3 w-3 fill-karma" />{currentUser.karma}</div>
            <span className="text-[9px] text-muted-foreground mt-1 block">Karma</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-success"><Shield className="h-3 w-3" />Verified</div>
            <span className="text-[9px] text-muted-foreground mt-1 block">Status</span>
          </div>
        </div>
      </button>

      {/* Navigation */}
      <nav className="feed-card p-1.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              <item.icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="feed-card p-1.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-success hover:bg-success/10 transition-colors">
          <HandHelping className="h-[18px] w-[18px]" />
          <span>My Help History</span>
        </button>
      </div>

      {/* Pro Upsell */}
      <div className="feed-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Crown className="h-4 w-4 text-accent" />
          <span className="font-display font-semibold text-xs text-foreground">Pro Neighbor</span>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2.5">Unlock live locations, priority posts & more.</p>
        <button className="w-full py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-colors">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
