import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useHasOfferedHelp(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['help-offered', postId, user?.id],
    queryFn: async () => {
      if (!user || !postId) return false;
      const { data } = await supabase
        .from('help_offers')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!postId,
    staleTime: 60_000,
  });
}

export function useOfferHelp() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, message }: { postId: string; message?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('help_offers')
        .insert({ post_id: postId, user_id: user.id, message: message || '' });
      if (error) throw error;
    },
    onMutate: async ({ postId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['help-offered', postId, user?.id] });
      const prev = queryClient.getQueryData(['help-offered', postId, user?.id]);
      queryClient.setQueryData(['help-offered', postId, user?.id], true);
      return { prev, postId };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(['help-offered', context.postId, user?.id], context.prev);
      }
    },
    onSettled: (_d, _e, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['help-offered', postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function usePostHelpOffers(postId: string) {
  return useQuery({
    queryKey: ['help-offers', postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data: offers, error } = await supabase
        .from('help_offers')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!offers?.length) return [];

      const userIds = [...new Set(offers.map((o) => o.user_id))];
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, display_name, avatar_url, karma, verified')
        .in('user_id', userIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });

      return offers.map((o) => ({
        ...o,
        helper: profileMap[o.user_id] || null,
      }));
    },
    enabled: !!postId,
  });
}

export function useRespondHelpOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, postId, action }: { offerId: string; postId: string; action: 'accepted' | 'rejected' }) => {
      const { error } = await supabase
        .from('help_offers')
        .update({ status: action })
        .eq('id', offerId);
      if (error) throw error;
    },
    onMutate: async ({ offerId, postId, action }) => {
      await queryClient.cancelQueries({ queryKey: ['help-offers', postId] });
      const prev = queryClient.getQueryData(['help-offers', postId]);
      queryClient.setQueryData(['help-offers', postId], (old: any[]) =>
        old?.map((o: any) => o.id === offerId ? { ...o, status: action } : o) || []
      );
      return { prev, postId };
    },
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(['help-offers', context.postId], context.prev);
    },
    onSettled: (_d, _e, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['help-offers', postId] });
      queryClient.invalidateQueries({ queryKey: ['my-help-history'] });
    },
  });
}
