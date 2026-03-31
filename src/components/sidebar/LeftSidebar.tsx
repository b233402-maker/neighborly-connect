import { useState } from "react";
import { Home, Map, MessageSquare, Bell, User, Star, Settings, Crown, HandHelping, LogOut, ShieldCheck, Users, X, Loader2, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useFollowCounts } from "@/hooks/useFollows";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { label: "Feed", icon: Home, path: "/" },
  { label: "Explore Map", icon: Map, path: "/map" },
  { label: "Messages", icon: MessageSquare, path: "/messages" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
  { label: "My Profile", icon: User, path: "/profile" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

function useMyHelpHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-help-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('help_offers')
        .select('*, posts:post_id(title, status, author_id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

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

export function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, profile, isAdmin, user } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const { data: followCounts } = useFollowCounts(user?.id);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showHelpHistory, setShowHelpHistory] = useState(false);
  const { data: helpHistory, isLoading: helpLoading } = useMyHelpHistory(showHelpHistory ? user?.id : undefined);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col gap-3 sticky top-[4.5rem] h-fit">
        {/* Profile Card */}
        <button onClick={() => navigate("/profile")}
          className="feed-card flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="relative mb-3">
            <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`} alt={profile?.display_name || 'User'} className="h-14 w-14 rounded-xl bg-muted" />
            {profile?.is_pro && (
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-lg bg-accent flex items-center justify-center">
                <Crown className="h-2.5 w-2.5 text-accent-foreground" />
              </span>
            )}
          </div>
          <h3 className="font-display font-semibold text-sm text-foreground">{profile?.display_name || 'User'}</h3>
          <p className="text-[11px] text-muted-foreground mb-3 line-clamp-1">{profile?.bio || 'Welcome to Neighborly!'}</p>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 text-center">
              <div className="karma-badge justify-center text-xs"><Star className="h-3 w-3 fill-karma" />{profile?.karma || 0}</div>
              <span className="text-[9px] text-muted-foreground mt-1 block">Karma</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-semibold text-primary">
                <Users className="h-3 w-3" /> {followCounts?.followers || 0}
              </div>
              <span className="text-[9px] text-muted-foreground mt-1 block">Followers</span>
            </div>
          </div>
        </button>

        {/* Navigation */}
        <nav className="feed-card p-1.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const badge = item.path === '/notifications' ? unreadCount : undefined;
            return (
              <button key={item.label} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
                {badge ? (
                  <span className="ml-auto h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
          {isAdmin && (
            <button onClick={() => navigate('/admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/admin' ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              <ShieldCheck className="h-[18px] w-[18px]" /><span>Admin</span>
            </button>
          )}
        </nav>

        {/* Quick Actions */}
        <div className="feed-card p-1.5 space-y-0.5">
          <button onClick={() => setShowHelpHistory(!showHelpHistory)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              showHelpHistory ? "text-success bg-success/10" : "text-success hover:bg-success/10"
            }`}>
            <HandHelping className="h-[18px] w-[18px]" /><span>My Help History</span>
          </button>

          {/* Help History Panel */}
          <AnimatePresence>
            {showHelpHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-2 py-2 space-y-2 max-h-60 overflow-y-auto">
                  {helpLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : !helpHistory?.length ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      No help offers yet. Start helping neighbors!
                    </p>
                  ) : (
                    helpHistory.map((offer: any) => (
                      <div key={offer.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          offer.status === 'accepted' ? 'bg-success/10' : 'bg-primary/10'
                        }`}>
                          {offer.status === 'accepted' ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <HandHelping className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground line-clamp-1">
                            {(offer.posts as any)?.title || 'Untitled post'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-medium ${
                              offer.status === 'accepted' ? 'text-success' : offer.status === 'pending' ? 'text-muted-foreground' : 'text-destructive'
                            }`}>
                              {offer.status === 'accepted' ? '✓ Accepted' : offer.status === 'pending' ? '⏳ Pending' : '✗ Declined'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{getTimeAgo(offer.created_at)}</span>
                          </div>
                          {offer.status === 'accepted' && (
                            <span className="text-[10px] text-success font-medium">+15 karma earned</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-[18px] w-[18px]" /><span>Sign Out</span>
          </button>
        </div>

        {/* Pro Upsell */}
        {!profile?.is_pro && (
          <div className="feed-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-center gap-2 mb-1.5">
              <Crown className="h-4 w-4 text-accent" />
              <span className="font-display font-semibold text-xs text-foreground">Pro Neighbor</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2.5">Unlock live locations, priority posts & more.</p>
            <button onClick={() => setShowUpgrade(true)}
              className="w-full py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-colors">
              Upgrade Now
            </button>
          </div>
        )}
      </aside>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
