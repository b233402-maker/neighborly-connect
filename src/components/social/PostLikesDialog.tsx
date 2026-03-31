import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Loader2 } from "lucide-react";

interface LikeUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  verified: boolean;
}

function usePostLikers(postId: string | null) {
  return useQuery({
    queryKey: ["post-likers", postId],
    queryFn: async (): Promise<LikeUser[]> => {
      if (!postId) return [];
      const { data: likes, error } = await supabase
        .from("likes")
        .select("user_id")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!likes?.length) return [];

      const ids = likes.map((l) => l.user_id);
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, verified")
        .in("user_id", ids);
      if (pErr) throw pErr;
      return (profiles || []) as LikeUser[];
    },
    enabled: !!postId,
  });
}

interface PostLikesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  likesCount: number;
}

export function PostLikesDialog({ open, onOpenChange, postId, likesCount }: PostLikesDialogProps) {
  const navigate = useNavigate();
  const { data: likers, isLoading } = usePostLikers(open ? postId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[60vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive fill-destructive" /> Likes
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : likers?.length ? (
            <div className="space-y-1">
              {likers.map((u) => (
                <div
                  key={u.user_id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => { onOpenChange(false); navigate(`/user/${u.user_id}`); }}
                >
                  <img
                    src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}`}
                    alt={u.display_name}
                    className="h-10 w-10 rounded-xl bg-muted object-cover"
                  />
                  <p className="text-sm font-semibold text-foreground truncate">
                    {u.display_name}
                    {u.verified && <span className="ml-1 text-[10px] text-success">✓</span>}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm">No likes yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
