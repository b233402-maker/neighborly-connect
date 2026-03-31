import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useFollowStatus(targetUserId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['follow-status', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || !targetUserId || user.id === targetUserId) {
        return { isFollowing: false, isFollowedBy: false, isFriend: false };
      }

      const [followingRes, followedByRes] = await Promise.all([
        supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle(),
        supabase
          .from('follows')
          .select('id')
          .eq('follower_id', targetUserId)
          .eq('following_id', user.id)
          .maybeSingle(),
      ]);

      const isFollowing = !!followingRes.data;
      const isFollowedBy = !!followedByRes.data;

      return {
        isFollowing,
        isFollowedBy,
        isFriend: isFollowing && isFollowedBy,
      };
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useFollowCounts(userId: string | undefined) {
  return useQuery({
    queryKey: ['follow-counts', userId],
    queryFn: async () => {
      if (!userId) return { followers: 0, following: 0 };

      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);

      return {
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
      };
    },
    enabled: !!userId,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { targetUserId, isFollowing }) => {
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success(isFollowing ? 'Unfollowed' : 'Following!');
    },
    onError: () => {
      toast.error('Failed to update follow status');
    },
  });
}

export function useFriendIds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user) return [];
      const { data, error } = await supabase.rpc('get_friend_ids', { _user_id: user.id });
      if (error) throw error;
      return (data || []) as string[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}
