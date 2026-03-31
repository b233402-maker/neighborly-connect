import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's conversations
      const { data: participations, error: pError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (pError) throw pError;
      if (!participations?.length) return [];

      const conversationIds = participations.map((p) => p.conversation_id);

      // Get other participants' profiles and latest messages
      const [participantsRes, messagesRes] = await Promise.all([
        supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            user_id,
            profile:profiles!conversation_participants_user_id_fkey(display_name, avatar_url)
          `)
          .in('conversation_id', conversationIds)
          .neq('user_id', user.id),
        supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false }),
      ]);

      // Group by conversation
      const convMap: Record<string, any> = {};
      (participantsRes.data || []).forEach((p) => {
        const profile = Array.isArray(p.profile) ? p.profile[0] : p.profile;
        convMap[p.conversation_id] = {
          id: p.conversation_id,
          otherUser: {
            user_id: p.user_id,
            display_name: profile?.display_name || 'Unknown',
            avatar_url: profile?.avatar_url,
          },
          lastMessage: null,
          unreadCount: 0,
        };
      });

      (messagesRes.data || []).forEach((m) => {
        if (convMap[m.conversation_id] && !convMap[m.conversation_id].lastMessage) {
          convMap[m.conversation_id].lastMessage = m;
        }
        if (m.sender_id !== user.id && !m.read && convMap[m.conversation_id]) {
          convMap[m.conversation_id].unreadCount += 1;
        }
      });

      return Object.values(convMap).sort((a: any, b: any) => {
        const aTime = a.lastMessage?.created_at || '';
        const bTime = b.lastMessage?.created_at || '';
        return bTime.localeCompare(aTime);
      });
    },
    enabled: !!user,
    staleTime: 10_000,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(display_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map((m) => ({
        ...m,
        sender: Array.isArray(m.sender) ? m.sender[0] : m.sender,
      }));
    },
    enabled: !!conversationId,
    refetchInterval: 5_000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });
}
