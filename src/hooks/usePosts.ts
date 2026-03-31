import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PostWithAuthor {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  tags: string[] | null;
  image_url: string | null;
  status: string;
  likes_count: number;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
  author: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    karma: number;
    verified: boolean;
    is_pro: boolean;
    privacy_level: string;
  } | null;
  comments_count: number;
  user_has_liked: boolean;
}

export function usePosts(filter?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['posts', filter],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(user_id, display_name, avatar_url, karma, verified, is_pro, privacy_level)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'urgent') {
        query = query.eq('category', 'urgent');
      } else if (filter === 'offering') {
        query = query.eq('type', 'offer');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get comments count and like status in parallel
      const postIds = (data || []).map((p) => p.id);

      const [commentsRes, likesRes] = await Promise.all([
        supabase
          .from('comments')
          .select('post_id')
          .in('post_id', postIds),
        user
          ? supabase
              .from('likes')
              .select('post_id')
              .eq('user_id', user.id)
              .in('post_id', postIds)
          : Promise.resolve({ data: [] }),
      ]);

      const commentCounts: Record<string, number> = {};
      (commentsRes.data || []).forEach((c) => {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      });

      const likedPostIds = new Set(
        ((likesRes as any).data || []).map((l: any) => l.post_id)
      );

      return (data || []).map((post) => ({
        ...post,
        author: Array.isArray(post.author) ? post.author[0] || null : post.author,
        comments_count: commentCounts[post.id] || 0,
        user_has_liked: likedPostIds.has(post.id),
      })) as PostWithAuthor[];
    },
    staleTime: 30_000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (post: {
      title: string;
      description: string;
      category: string;
      type: string;
      tags: string[];
      lat?: number;
      lng?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          title: post.title,
          description: post.description,
          category: post.category,
          type: post.type,
          tags: post.tags,
          lat: post.lat || 40.7128,
          lng: post.lng || -74.006,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create post');
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (hasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(user_id, display_name, avatar_url, karma, verified)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map((c) => ({
        ...c,
        author: Array.isArray(c.author) ? c.author[0] || null : c.author,
      }));
    },
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      postId,
      text,
      parentId,
    }: {
      postId: string;
      text: string;
      parentId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: user.id,
        text,
        parent_id: parentId || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
