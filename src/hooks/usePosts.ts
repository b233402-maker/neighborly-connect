import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PostAuthor {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  karma: number;
  verified: boolean;
  is_pro: boolean;
  privacy_level: string;
}

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
  author: PostAuthor | null;
  comments_count: number;
  user_has_liked: boolean;
}

export function usePosts(filter?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['posts', filter],
    queryFn: async () => {
      // Fetch posts
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'urgent') {
        query = query.eq('category', 'urgent');
      } else if (filter === 'offering') {
        query = query.eq('type', 'offer');
      }

      const { data: posts, error } = await query;
      if (error) throw error;
      if (!posts?.length) return [] as PostWithAuthor[];

      // Get unique author IDs
      const authorIds = [...new Set(posts.map((p) => p.author_id))];
      const postIds = posts.map((p) => p.id);

      // Fetch profiles, comments count, and likes in parallel
      const [profilesRes, commentsRes, likesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, karma, verified, is_pro, privacy_level')
          .in('user_id', authorIds),
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
          : Promise.resolve({ data: [] as { post_id: string }[] }),
      ]);

      // Build lookup maps
      const profileMap: Record<string, PostAuthor> = {};
      (profilesRes.data || []).forEach((p) => {
        profileMap[p.user_id] = p;
      });

      const commentCounts: Record<string, number> = {};
      (commentsRes.data || []).forEach((c) => {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      });

      const likedPostIds = new Set(
        ((likesRes as any).data || []).map((l: any) => l.post_id)
      );

      return posts.map((post) => ({
        ...post,
        author: profileMap[post.author_id] || null,
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
      image_url?: string | null;
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
          image_url: post.image_url || null,
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

export interface CommentWithAuthor {
  id: string;
  post_id: string;
  author_id: string;
  text: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  author: { user_id: string; display_name: string; avatar_url: string | null; karma: number; verified: boolean } | null;
  user_has_liked: boolean;
  replies: CommentWithAuthor[];
}

export function useComments(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async (): Promise<CommentWithAuthor[]> => {
      if (!postId) return [];
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!comments?.length) return [];

      const authorIds = [...new Set(comments.map((c) => c.author_id))];
      const commentIds = comments.map((c) => c.id);

      const [profilesRes, likesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, karma, verified')
          .in('user_id', authorIds),
        user
          ? supabase
              .from('likes')
              .select('comment_id')
              .eq('user_id', user.id)
              .in('comment_id', commentIds)
          : Promise.resolve({ data: [] as { comment_id: string }[] }),
      ]);

      const profileMap: Record<string, any> = {};
      (profilesRes.data || []).forEach((p) => { profileMap[p.user_id] = p; });

      const likedCommentIds = new Set(
        ((likesRes as any).data || []).map((l: any) => l.comment_id)
      );

      const enriched = comments.map((c) => ({
        ...c,
        author: profileMap[c.author_id] || null,
        user_has_liked: likedCommentIds.has(c.id),
        replies: [] as CommentWithAuthor[],
      }));

      const map = new Map<string, CommentWithAuthor>();
      const roots: CommentWithAuthor[] = [];
      enriched.forEach((c) => map.set(c.id, c));
      enriched.forEach((c) => {
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies.push(c);
        } else {
          roots.push(c);
        }
      });

      return roots;
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

export function useToggleCommentLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId, postId, hasLiked }: { commentId: string; postId: string; hasLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (hasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, comment_id: commentId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}
