import { useState } from "react";
import { Star, Shield, Crown, MapPin, Calendar, Edit3, Users, HandHelping, MessageCircle, Award, UserCheck, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useFollowCounts } from "@/hooks/useFollows";
import { FollowListDialog } from "@/components/social/FollowListDialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BadgeDef {
  key: string;
  label: string;
  emoji: string;
  desc: string;
  check: (stats: BadgeStats) => boolean;
}

interface BadgeStats {
  karma: number;
  postCount: number;
  helpCount: number;
  acceptedHelpCount: number;
  joinedDays: number;
  commentCount: number;
}

const badgeDefs: BadgeDef[] = [
  { key: "early_adopter", label: "Early Adopter", emoji: "🌟", desc: "Joined in the first 30 days", check: (s) => s.joinedDays <= 30 },
  { key: "first_post", label: "First Post", emoji: "📝", desc: "Created your first post", check: (s) => s.postCount >= 1 },
  { key: "helper", label: "Helping Hand", emoji: "🤝", desc: "Offered help 5+ times", check: (s) => s.helpCount >= 5 },
  { key: "super_helper", label: "Super Helper", emoji: "🦸", desc: "Offered help 25+ times", check: (s) => s.helpCount >= 25 },
  { key: "trusted", label: "Trusted Neighbor", emoji: "🛡️", desc: "Reached 50+ karma", check: (s) => s.karma >= 50 },
  { key: "community_star", label: "Community Star", emoji: "⭐", desc: "Reached 200+ karma", check: (s) => s.karma >= 200 },
  { key: "active_poster", label: "Active Poster", emoji: "🎙️", desc: "Created 10+ posts", check: (s) => s.postCount >= 10 },
  { key: "reliable", label: "Reliable Helper", emoji: "✅", desc: "5+ help offers accepted", check: (s) => s.acceptedHelpCount >= 5 },
];

const tabs = ["Activity", "Badges", "About"];

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

function useBadgeStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['badge-stats', userId],
    queryFn: async (): Promise<BadgeStats> => {
      if (!userId) return { karma: 0, postCount: 0, helpCount: 0, acceptedHelpCount: 0, joinedDays: 999, commentCount: 0 };

      const [profileRes, postsRes, helpRes, commentsRes] = await Promise.all([
        supabase.from('profiles').select('karma, created_at').eq('user_id', userId).single(),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId),
        supabase.from('help_offers').select('id, status').eq('user_id', userId),
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('author_id', userId),
      ]);

      const joinedDate = profileRes.data?.created_at ? new Date(profileRes.data.created_at) : new Date();
      const joinedDays = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
      const helpOffers = helpRes.data || [];

      return {
        karma: profileRes.data?.karma || 0,
        postCount: postsRes.count || 0,
        helpCount: helpOffers.length,
        acceptedHelpCount: helpOffers.filter((h) => h.status === 'accepted').length,
        joinedDays,
        commentCount: commentsRes.count || 0,
      };
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const updateProfile = useUpdateProfile();
  const { data: followCounts } = useFollowCounts(user?.id);
  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListTab, setFollowListTab] = useState<"followers" | "following">("followers");
  const { data: badgeStats, isLoading: badgeLoading } = useBadgeStats(user?.id);

  const { data: allPosts } = usePosts();
  const userPosts = (allPosts || []).filter((p) => p.author_id === user?.id);

  const startEdit = () => {
    setEditName(profile?.display_name || '');
    setEditBio(profile?.bio || '');
    setEditing(true);
  };

  const saveEdit = () => {
    updateProfile.mutate({ display_name: editName, bio: editBio }, {
      onSuccess: () => setEditing(false),
    });
  };

  const earnedBadges = badgeStats ? badgeDefs.filter((b) => b.check(badgeStats)) : [];
  const lockedBadges = badgeStats ? badgeDefs.filter((b) => !b.check(badgeStats)) : badgeDefs;

  const stats = [
    { label: "Posts", value: userPosts.length, icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
    { label: "Followers", value: followCounts?.followers || 0, icon: Users, color: "text-accent", bg: "bg-accent/10", clickable: true },
    { label: "Following", value: followCounts?.following || 0, icon: UserCheck, color: "text-success", bg: "bg-success/10", clickable: true },
    { label: "Karma", value: profile?.karma || 0, icon: Star, color: "text-karma", bg: "bg-karma/10" },
  ];

  return (
    <AppLayout>
      <div className="lg:col-span-1 xl:col-span-2 space-y-4 pb-20 lg:pb-0">
        {/* Profile Header Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTYzRUIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>

          <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-14 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative shrink-0">
                <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt={profile?.display_name || 'User'}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-muted border-4 border-card shadow-lg object-cover" />
                {profile?.is_pro && (
                  <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-accent flex items-center justify-center border-2 border-card shadow-sm">
                    <Crown className="h-4 w-4 text-accent-foreground" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                {editing ? (
                  <div className="space-y-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Display name" className="h-9 text-sm rounded-xl" />
                    <Input value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Bio" className="h-9 text-sm rounded-xl" />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={updateProfile.isPending} className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
                        {updateProfile.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-xl border border-border text-xs font-medium">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">{profile?.display_name || 'User'}</h1>
                      {profile?.verified && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Shield className="h-3 w-3" /> Verified
                        </div>
                      )}
                      {profile?.is_pro && <span className="pro-badge"><Crown className="h-3 w-3" /> PRO</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{profile?.bio || 'No bio yet'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile?.privacy_level === 'exact' ? 'Location shared' : 'Location blurred'}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </>
                )}
              </div>

              {!editing && (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="karma-badge text-sm">
                    <Star className="h-4 w-4 fill-karma" /> {profile?.karma || 0}
                  </div>
                  <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-2xl border border-border p-4 text-center hover:shadow-md transition-shadow ${stat.clickable ? "cursor-pointer" : ""}`}
              onClick={() => {
                if (stat.label === "Followers") { setFollowListTab("followers"); setFollowListOpen(true); }
                if (stat.label === "Following") { setFollowListTab("following"); setFollowListOpen(true); }
              }}
            >
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="font-display font-bold text-2xl text-foreground block">{stat.value}</span>
              <span className="text-[11px] text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex border-b border-border">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                  i === activeTab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab}
                {i === activeTab && <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Activity Tab */}
            {activeTab === 0 && (
              <div className="space-y-3">
                {userPosts.length > 0 ? userPosts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`h-10 w-10 rounded-xl ${post.category === "urgent" ? "bg-accent/10" : post.type === "offer" ? "bg-success/10" : "bg-primary/10"} flex items-center justify-center shrink-0`}>
                      {post.type === "offer" ? <HandHelping className="h-5 w-5 text-success" /> : <MessageCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{post.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{getTimeAgo(post.created_at)}</span>
                        <span className="text-[10px] text-muted-foreground">{post.likes_count} likes</span>
                        <span className="text-[10px] text-muted-foreground">{post.comments_count} comments</span>
                      </div>
                    </div>
                    {post.status === "fulfilled" && <span className="help-tag bg-success/10 text-success text-[10px]">✓ Done</span>}
                  </div>
                )) : <p className="text-center text-muted-foreground py-8">No posts yet. Share something with your neighbors!</p>}
              </div>
            )}

            {/* Badges Tab - Dynamic */}
            {activeTab === 1 && (
              <div className="space-y-4">
                {badgeLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {earnedBadges.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5" /> Earned ({earnedBadges.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {earnedBadges.map((badge, i) => (
                            <motion.div key={badge.key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                              className="flex flex-col items-center p-4 rounded-2xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-all text-center">
                              <span className="text-3xl mb-2">{badge.emoji}</span>
                              <span className="text-sm font-semibold text-foreground">{badge.label}</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {lockedBadges.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5" /> Locked ({lockedBadges.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {lockedBadges.map((badge, i) => (
                            <motion.div key={badge.key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                              className="flex flex-col items-center p-4 rounded-2xl border border-border bg-muted/30 text-center opacity-60">
                              <span className="text-3xl mb-2 grayscale">{badge.emoji}</span>
                              <span className="text-sm font-semibold text-foreground">{badge.label}</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {earnedBadges.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-4">
                        Start helping neighbors to earn badges! 🏆
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 2 && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {profile?.bio || 'No bio yet. Click "Edit" to add one!'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Email</h4>
                  <p className="text-sm text-foreground">{profile?.email || user?.email || 'Not set'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trust & Safety</h4>
                  <div className="flex flex-wrap gap-3">
                    {profile?.verified && <span className="flex items-center gap-1.5 text-sm text-foreground"><Shield className="h-4 w-4 text-primary" /> Identity Verified</span>}
                    <span className="flex items-center gap-1.5 text-sm text-foreground"><Star className="h-4 w-4 text-karma fill-karma" /> {profile?.karma || 0} Karma</span>
                    <span className="flex items-center gap-1.5 text-sm text-foreground"><Award className="h-4 w-4 text-accent" /> {earnedBadges.length} Badges</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {user && (
          <FollowListDialog
            open={followListOpen}
            onOpenChange={setFollowListOpen}
            userId={user.id}
            initialTab={followListTab}
          />
        )}
      </div>
    </AppLayout>
  );
}
