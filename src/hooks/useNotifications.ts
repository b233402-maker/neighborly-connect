import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationItem {
  id: string;
  type: string;
  action: string;
  target: string | null;
  read: boolean;
  created_at: string;
  post_id: string | null;
  actor: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<NotificationItem[]> => {
      if (!user) return [];
      const { data: notifs, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!notifs?.length) return [];

      // Fetch actor profiles
      const actorIds = [...new Set(notifs.filter((n) => n.actor_id).map((n) => n.actor_id!))];
      const { data: profiles } = actorIds.length
        ? await supabase
            .from('profiles_public')
            .select('user_id, display_name, avatar_url')
            .in('user_id', actorIds)
        : { data: [] };

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });

      return notifs.map((n) => ({
        ...n,
        actor: n.actor_id ? profileMap[n.actor_id] || null : null,
      }));
    },
    enabled: !!user,
    staleTime: 15_000,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      if (!user) return;
      let query = supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);

      if (notificationIds) {
        query = query.in('id', notificationIds);
      } else {
        query = query.eq('read', false);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useUnreadCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30_000,
  });
}
