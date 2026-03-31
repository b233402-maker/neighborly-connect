import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Shield, Crown, MapPin, Calendar, MessageCircle, Heart, HandHelping, Send, UserPlus, UserCheck, Users, ArrowLeft } from "lucide-react";
import { FollowListDialog } from "@/components/social/FollowListDialog";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateConversation } from "@/hooks/useMessages";
import { useIsUserOnline } from "@/hooks/usePresence";
import { useFollowStatus, useFollowCounts, useToggleFollow } from "@/hooks/useFollows";
import { toast } from "sonner";

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_public")
        .select("user_id, display_name, avatar_url, bio, karma, verified, is_pro, privacy_level, created_at")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

function useStartConversation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  const startChat = async (otherUserId: string) => {
    if (!user) return;

    createConversation.mutate(otherUserId, {
      onSuccess: (convId) => {
        navigate(`/messages?chat=${convId}`);
      },
      onError: () => {
        toast.error("Failed to start conversation");
      },
    });
  };

  return { startChat, isPending: createConversation.isPending };
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile(userId || "");
  const { data: posts } = useUserPosts(userId || "");
  const { startChat, isPending: chatPending } = useStartConversation();
  const isOnline = useIsUserOnline(userId);
  const { data: followStatus } = useFollowStatus(userId);
  const { data: followCounts } = useFollowCounts(userId);
  const toggleFollow = useToggleFollow();

  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListTab, setFollowListTab] = useState<"followers" | "following">("followers");
  const isOwnProfile = user?.id === userId;

  if (isOwnProfile) {
    navigate("/profile", { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <ProfileSkeleton />
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="lg:col-span-1 xl:col-span-2 text-center py-20">
          <h2 className="font-display font-bold text-xl text-foreground">User not found</h2>
          <p className="text-sm text-muted-foreground mt-2">This profile doesn't exist.</p>
        </div>
      </AppLayout>
    );
  }

  const stats = [
    { label: "Posts", value: posts?.length || 0, icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
    { label: "Followers", value: followCounts?.followers || 0, icon: Users, color: "text-accent", bg: "bg-accent/10" },
    { label: "Following", value: followCounts?.following || 0, icon: UserCheck, color: "text-success", bg: "bg-success/10" },
    { label: "Karma", value: profile.karma, icon: Star, color: "text-karma", bg: "bg-karma/10" },
  ];

  return (
    <AppLayout>
      <div className="lg:col-span-1 xl:col-span-2 space-y-4 pb-20 lg:pb-0">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTYzRUIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>

          <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-14 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative shrink-0">
                <img
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user_id}`}
                  alt={profile.display_name}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-muted border-4 border-card shadow-lg object-cover"
                />
                {isOnline && (
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-success ring-2 ring-card" />
                )}
                {profile.is_pro && (
                  <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-accent flex items-center justify-center border-2 border-card shadow-sm">
                    <Crown className="h-4 w-4 text-accent-foreground" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">{profile.display_name}</h1>
                  {profile.verified && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Shield className="h-3 w-3" /> Verified
                    </div>
                  )}
                  {profile.is_pro && <span className="pro-badge"><Crown className="h-3 w-3" /> PRO</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{profile.bio || "No bio yet"}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Neighbor</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <div className="karma-badge text-sm">
                  <Star className="h-4 w-4 fill-karma" /> {profile.karma}
                </div>
                <button
                  onClick={() => toggleFollow.mutate({ targetUserId: profile.user_id, isFollowing: followStatus?.isFollowing || false })}
                  disabled={toggleFollow.isPending}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                    followStatus?.isFriend
                      ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                      : followStatus?.isFollowing
                      ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                      : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                  }`}
                >
                  {followStatus?.isFriend ? (
                    <><UserCheck className="h-4 w-4" /> Friends</>
                  ) : followStatus?.isFollowing ? (
                    <><UserCheck className="h-4 w-4" /> Following</>
                  ) : followStatus?.isFollowedBy ? (
                    <><UserPlus className="h-4 w-4" /> Follow Back</>
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Follow</>
                  )}
                </button>
                <button
                  onClick={() => startChat(profile.user_id)}
                  disabled={chatPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> {chatPending ? "Opening..." : "Message"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-2xl border border-border p-4 text-center hover:shadow-md transition-shadow ${
                (stat.label === "Followers" || stat.label === "Following") ? "cursor-pointer" : ""
              }`}
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

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-3">
            {(posts || []).length > 0 ? (
              (posts || []).map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className={`h-10 w-10 rounded-xl ${post.category === "urgent" ? "bg-destructive/10" : post.type === "offer" ? "bg-success/10" : "bg-primary/10"} flex items-center justify-center shrink-0`}>
                    {post.type === "offer" ? <HandHelping className="h-5 w-5 text-success" /> : <MessageCircle className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{post.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">{getTimeAgo(post.created_at)}</span>
                      <span className="text-[10px] text-muted-foreground">{post.likes_count || 0} likes</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No posts yet.</p>
            )}
          </div>
        </div>
        {userId && (
          <FollowListDialog
            open={followListOpen}
            onOpenChange={setFollowListOpen}
            userId={userId}
            initialTab={followListTab}
          />
        )}
      </div>
    </AppLayout>
  );
}
