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
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(display_name, avatar_url, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((p) => ({
        ...p,
        author: Array.isArray(p.author) ? p.author[0] : p.author,
      }));
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(display_name),
          reported_user:profiles!reports_reported_user_id_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((r) => ({
        ...r,
        reporter: Array.isArray(r.reporter) ? r.reporter[0] : r.reporter,
        reported_user: Array.isArray(r.reported_user) ? r.reported_user[0] : r.reported_user,
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
