import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  onlineUsers: Set<string>;
  typingUsers: Map<string, number>; // conversationId -> timestamp
}

let globalChannel: RealtimeChannel | null = null;
let globalOnlineUsers = new Set<string>();
let listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function useOnlinePresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || globalChannel) return;

    const channel = supabase.channel('online-presence', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const newSet = new Set<string>();
        Object.keys(state).forEach((key) => newSet.add(key));
        globalOnlineUsers = newSet;
        notifyListeners();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    globalChannel = channel;

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      globalChannel = null;
      globalOnlineUsers = new Set();
    };
  }, [user]);
}

export function useIsUserOnline(userId: string | undefined): boolean {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const update = () => setOnline(globalOnlineUsers.has(userId));
    update();
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, [userId]);

  return online;
}

export function useOnlineUsers(): Set<string> {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const update = () => forceUpdate((n) => n + 1);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  return globalOnlineUsers;
}

// Typing indicator via broadcast
export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user.id) {
          setTypingUserId(payload.user_id);
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setTypingUserId(null), 3000);
        }
      })
      .subscribe();

    return () => {
      clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
      setTypingUserId(null);
    };
  }, [conversationId, user]);

  const sendTyping = useCallback(() => {
    if (channelRef.current && user) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id },
      });
    }
  }, [user]);

  return { typingUserId, sendTyping };
}
