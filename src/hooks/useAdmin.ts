import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useAdminPosts() {
  return useQuery({
    queryKey: ['admin', 'posts'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!posts?.length) return [];

      const authorIds = [...new Set(posts.map((p) => p.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, email')
        .in('user_id', authorIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });

      return posts.map((p) => ({
        ...p,
        author: profileMap[p.author_id] || null,
      }));
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!reports?.length) return [];

      const userIds = [...new Set([
        ...reports.map((r) => r.reporter_id),
        ...reports.filter((r) => r.reported_user_id).map((r) => r.reported_user_id!),
      ])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });

      return reports.map((r) => ({
        ...r,
        reporter: profileMap[r.reporter_id] || null,
        reported_user: r.reported_user_id ? profileMap[r.reported_user_id] || null : null,
      }));
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [usersRes, postsRes, reportsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      return {
        totalUsers: usersRes.count || 0,
        totalPosts: postsRes.count || 0,
        pendingReports: reportsRes.count || 0,
      };
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      adminNotes,
    }: {
      reportId: string;
      status: string;
      adminNotes?: string;
    }) => {
      const updateData: any = {
        status,
        ...(adminNotes && { admin_notes: adminNotes }),
        ...(status === 'resolved' || status === 'dismissed'
          ? { resolved_at: new Date().toISOString() }
          : {}),
      };

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Report updated');
    },
    onError: () => {
      toast.error('Failed to update report');
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });
}
