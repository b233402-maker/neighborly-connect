import { useEffect, useContext, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';

export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!user) return;

    // Debounced invalidation to batch rapid changes
    const debouncedInvalidate = (key: string, queryKeys: string[][], delay = 500) => {
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
      }
      debounceTimers.current[key] = setTimeout(() => {
        queryKeys.forEach((qk) => queryClient.invalidateQueries({ queryKey: qk }));
        delete debounceTimers.current[key];
      }, delay);
    };

    const channel = supabase
      .channel('global-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        debouncedInvalidate('posts', [['posts']]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
        const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
        const keys: string[][] = [['posts']];
        if (postId) keys.push(['comments', postId]);
        debouncedInvalidate('comments', keys);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
        // Only invalidate posts — comment likes handled by specific comment query
        debouncedInvalidate('likes', [['posts']]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const convId = (payload.new as any)?.conversation_id;
        const keys: string[][] = [['conversations']];
        if (convId) keys.push(['messages', convId]);
        debouncedInvalidate('messages', keys, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => {
        debouncedInvalidate('follows', [['follow-status'], ['follow-counts'], ['friends']]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        debouncedInvalidate('notifications', [['notifications'], ['unread-count']], 300);
      })
      .subscribe();

    return () => {
      // Clear all pending debounce timers
      Object.values(debounceTimers.current).forEach(clearTimeout);
      debounceTimers.current = {};
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
