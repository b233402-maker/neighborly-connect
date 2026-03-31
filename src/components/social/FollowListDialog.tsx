import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FollowUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean;
  is_pro: boolean;
}

function useFollowersList(userId: string | undefined) {
  return useQuery({
    queryKey: ["followers-list", userId],
    queryFn: async (): Promise<FollowUser[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId)
        .eq("status", "accepted");
      if (error) throw error;
      if (!data?.length) return [];

      const ids = data.map((f) => f.follower_id);
      const { data: profiles, error: pErr } = await supabase
        .from("profiles_public")
        .select("user_id, display_name, avatar_url, bio, verified, is_pro")
        .in("user_id", ids);
      if (pErr) throw pErr;
      return (profiles || []) as FollowUser[];
    },
    enabled: !!userId,
  });
}

function useFollowingList(userId: string | undefined) {
  return useQuery({
    queryKey: ["following-list", userId],
    queryFn: async (): Promise<FollowUser[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId)
        .eq("status", "accepted");
      if (error) throw error;
      if (!data?.length) return [];

      const ids = data.map((f) => f.following_id);
      const { data: profiles, error: pErr } = await supabase
        .from("profiles_public")
        .select("user_id, display_name, avatar_url, bio, verified, is_pro")
        .in("user_id", ids);
      if (pErr) throw pErr;
      return (profiles || []) as FollowUser[];
    },
    enabled: !!userId,
  });
}

function useRemoveFollower() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (followerId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers-list"] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts"] });
      queryClient.invalidateQueries({ queryKey: ["follow-status"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Follower removed");
    },
    onError: () => toast.error("Failed to remove follower"),
  });
}

function UserRow({
  u,
  isOwnProfile,
  onRemove,
  removing,
}: {
  u: FollowUser;
  isOwnProfile: boolean;
  onRemove?: (id: string) => void;
  removing?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
      <img
        src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}`}
        alt={u.display_name}
        className="h-10 w-10 rounded-xl bg-muted object-cover cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
        onClick={() => navigate(`/user/${u.user_id}`)}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors truncate"
          onClick={() => navigate(`/user/${u.user_id}`)}
        >
          {u.display_name}
          {u.verified && <span className="ml-1 text-[10px] text-success">✓</span>}
        </p>
        {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
      </div>
      {isOwnProfile && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(u.user_id)}
          disabled={removing}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialTab?: "followers" | "following";
}

export function FollowListDialog({ open, onOpenChange, userId, initialTab = "followers" }: FollowListDialogProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const { data: followers, isLoading: loadingFollowers } = useFollowersList(open ? userId : undefined);
  const { data: following, isLoading: loadingFollowing } = useFollowingList(open ? userId : undefined);
  const removeFollower = useRemoveFollower();
  const isOwnProfile = user?.id === userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Connections</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "followers" | "following")} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full">
            <TabsTrigger value="followers" className="flex-1">
              Followers {followers?.length ? `(${followers.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following {following?.length ? `(${following.length})` : ""}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="flex-1 overflow-y-auto mt-2">
            {loadingFollowers ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : followers?.length ? (
              <div className="space-y-1">
                {followers.map((u) => (
                  <UserRow
                    key={u.user_id}
                    u={u}
                    isOwnProfile={isOwnProfile}
                    onRemove={(id) => removeFollower.mutate(id)}
                    removing={removeFollower.isPending}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No followers yet</p>
            )}
          </TabsContent>
          <TabsContent value="following" className="flex-1 overflow-y-auto mt-2">
            {loadingFollowing ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : following?.length ? (
              <div className="space-y-1">
                {following.map((u) => (
                  <UserRow key={u.user_id} u={u} isOwnProfile={false} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">Not following anyone yet</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
