import { useState } from "react";
import { Star, Shield, Crown, MapPin, Calendar, Edit3, Camera, Users, HandHelping, Heart, MessageCircle, Award, TrendingUp, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useFollowCounts } from "@/hooks/useFollows";
import { FollowListDialog } from "@/components/social/FollowListDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const badges = [
  { label: "Early Adopter", emoji: "🌟", desc: "Joined in the first month" },
  { label: "Super Helper", emoji: "🦸", desc: "Helped 25+ neighbors" },
  { label: "Trusted Voice", emoji: "🎙️", desc: "50+ comments with likes" },
  { label: "Tool Lender", emoji: "🔧", desc: "Shared tools 10+ times" },
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

  // Fetch user's own posts
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

  const stats = [
    { label: "Posts", value: userPosts.length, icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
    { label: "Karma", value: profile?.karma || 0, icon: Star, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Likes", value: userPosts.reduce((s, p) => s + p.likes_count, 0), icon: Heart, color: "text-primary", bg: "bg-primary/10" },
    { label: "Comments", value: userPosts.reduce((s, p) => s + p.comments_count, 0), icon: MessageCircle, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <AppLayout>
      <div className="lg:col-span-1 xl:col-span-2 space-y-4 pb-20 lg:pb-0">
        {/* Profile Header Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Cover */}
          <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTYzRUIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-14 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt={profile?.display_name || 'User'}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-muted border-4 border-card shadow-lg object-cover" />
                {profile?.is_pro && (
                  <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-accent flex items-center justify-center border-2 border-card shadow-sm">
                    <Crown className="h-4 w-4 text-accent-foreground" />
                  </span>
                )}
              </div>

              {/* Name & Info */}
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

              {/* Action buttons */}
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
              className="bg-card rounded-2xl border border-border p-4 text-center hover:shadow-md transition-shadow">
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

            {/* Badges Tab */}
            {activeTab === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, i) => (
                  <motion.div key={badge.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                    className="flex flex-col items-center p-4 rounded-2xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all text-center">
                    <span className="text-3xl mb-2">{badge.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{badge.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</span>
                  </motion.div>
                ))}
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
