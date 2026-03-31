import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ConversationItem {
  id: string;
  otherUser: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  };
  lastMessage: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unreadCount: number;
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<ConversationItem[]> => {
      if (!user) return [];

      // Get user's conversations
      const { data: participations, error: pError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (pError) throw pError;
      if (!participations?.length) return [];

      const conversationIds = participations.map((p) => p.conversation_id);

      // Get other participants and messages in parallel
      const [otherParticipantsRes, messagesRes] = await Promise.all([
        supabase
          .from('conversation_participants')
          .select('conversation_id, user_id')
          .in('conversation_id', conversationIds)
          .neq('user_id', user.id),
        supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false }),
      ]);

      // Get profiles for other participants
      const otherUserIds = [...new Set((otherParticipantsRes.data || []).map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherUserIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });

      // Build conversation map
      const convMap: Record<string, ConversationItem> = {};
      (otherParticipantsRes.data || []).forEach((p) => {
        const profile = profileMap[p.user_id];
        convMap[p.conversation_id] = {
          id: p.conversation_id,
          otherUser: {
            user_id: p.user_id,
            display_name: profile?.display_name || 'Unknown',
            avatar_url: profile?.avatar_url || null,
          },
          lastMessage: null,
          unreadCount: 0,
        };
      });

      (messagesRes.data || []).forEach((m) => {
        if (convMap[m.conversation_id] && !convMap[m.conversation_id].lastMessage) {
          convMap[m.conversation_id].lastMessage = {
            content: m.content,
            created_at: m.created_at,
            sender_id: m.sender_id,
          };
        }
        if (m.sender_id !== user.id && !m.read && convMap[m.conversation_id]) {
          convMap[m.conversation_id].unreadCount += 1;
        }
      });

      return Object.values(convMap).sort((a, b) => {
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
  const { user } = useAuth();

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!messages?.length) return [];

      // Fetch sender profiles
      const senderIds = [...new Set(messages.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', senderIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });

      return messages.map((m) => ({
        ...m,
        sender: profileMap[m.sender_id] || null,
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

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('create_conversation_with_participant', { other_user_id: otherUserId });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
