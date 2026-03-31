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
    attachment_url?: string | null;
    attachment_type?: string | null;
    attachment_name?: string | null;
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

      // Get other participants
      const { data: otherParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', conversationIds)
        .neq('user_id', user.id);

      // Get profiles for other participants
      const otherUserIds = [...new Set((otherParticipants || []).map((p) => p.user_id))];

      // Fetch profiles and per-conversation latest message + unread count in parallel
      const [profilesRes, ...perConvResults] = await Promise.all([
        supabase
          .from('profiles_public')
          .select('user_id, display_name, avatar_url')
          .in('user_id', otherUserIds),
        // For each conversation, get latest message (1 row) and unread count
        ...conversationIds.flatMap((cid) => [
          supabase
            .from('messages')
            .select('content, created_at, sender_id, attachment_url, attachment_type, attachment_name')
            .eq('conversation_id', cid)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', cid)
            .neq('sender_id', user.id)
            .eq('read', false),
        ]),
      ]);

      const profileMap: Record<string, any> = {};
      (profilesRes.data || []).forEach((p) => { profileMap[p.user_id] = p; });

      // Build conversation items
      const convMap: Record<string, ConversationItem> = {};
      (otherParticipants || []).forEach((p) => {
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

      // Assign latest message and unread count from parallel results
      conversationIds.forEach((cid, i) => {
        const msgResult = perConvResults[i * 2] as any;
        const unreadResult = perConvResults[i * 2 + 1] as any;

        if (convMap[cid]) {
          const latestMsg = msgResult?.data?.[0];
          if (latestMsg) {
            convMap[cid].lastMessage = {
              content: latestMsg.content,
              created_at: latestMsg.created_at,
              sender_id: latestMsg.sender_id,
              attachment_url: latestMsg.attachment_url,
              attachment_type: latestMsg.attachment_type,
              attachment_name: latestMsg.attachment_name,
            };
          }
          convMap[cid].unreadCount = unreadResult?.count || 0;
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
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!messages?.length) return [];

      // Reverse to show oldest first in UI
      messages.reverse();

      // Fetch sender profiles
      const senderIds = [...new Set(messages.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles_public')
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
    staleTime: 5_000,
    // No polling — realtime handles new messages
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      attachmentUrl,
      attachmentType,
      attachmentName,
    }: {
      conversationId: string;
      content: string;
      attachmentUrl?: string;
      attachmentType?: string;
      attachmentName?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        attachment_url: attachmentUrl || null,
        attachment_type: attachmentType || null,
        attachment_name: attachmentName || null,
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

export function useUploadAttachment() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('chat-attachments')
        .upload(path, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(path);

      return {
        url: urlData.publicUrl,
        type: file.type,
        name: file.name,
      };
    },
    onError: () => {
      toast.error('Failed to upload file');
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
