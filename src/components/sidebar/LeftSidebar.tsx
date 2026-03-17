import { Home, Map, MessageSquare, Bell, User, Star, Shield, Settings, Crown } from "lucide-react";
import { currentUser } from "@/data/mockData";

const navItems = [
  { label: "Feed", icon: Home, active: true },
  { label: "Explore Map", icon: Map },
  { label: "Messages", icon: MessageSquare, badge: 3 },
  { label: "Notifications", icon: Bell, badge: 7 },
  { label: "My Profile", icon: User },
  { label: "Settings", icon: Settings },
];

export function LeftSidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-4 h-fit">
      {/* Profile Card */}
      <div className="feed-card flex flex-col items-center text-center">
        <div className="relative mb-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-16 w-16 rounded-full bg-muted"
          />
          {currentUser.isPro && (
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-accent flex items-center justify-center">
              <Crown className="h-3 w-3 text-accent-foreground" />
            </span>
          )}
        </div>
        <h3 className="font-display font-semibold text-foreground">{currentUser.name}</h3>
        <p className="text-xs text-muted-foreground mb-3">{currentUser.bio}</p>

        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 text-center">
            <div className="karma-badge justify-center">
              <Star className="h-3.5 w-3.5 fill-karma" />
              {currentUser.karma}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">Karma</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-success">
              <Shield className="h-3.5 w-3.5" />
              Verified
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">Status</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="feed-card p-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Pro Upsell */}
      <div className="feed-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-5 w-5 text-accent" />
          <span className="font-display font-semibold text-sm text-foreground">Go Pro Neighbor</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Unlock live locations, priority posts, and unlimited requests.
        </p>
        <button className="w-full py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
