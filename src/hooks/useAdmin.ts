import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMemo } from 'react';

const ADMIN_PAGE_SIZE = 25;

// ─── Basic Data Hooks ───────────────────────────────────────

export function useAdminUsers(page = 0, search = '') {
  return useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: async () => {
      const from = page * ADMIN_PAGE_SIZE;
      const to = from + ADMIN_PAGE_SIZE - 1;

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (search) {
        query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        users: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ADMIN_PAGE_SIZE),
      };
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminPosts(page = 0, search = '') {
  return useQuery({
    queryKey: ['admin', 'posts', page, search],
    queryFn: async () => {
      const from = page * ADMIN_PAGE_SIZE;
      const to = from + ADMIN_PAGE_SIZE - 1;

      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: posts, error, count } = await query;
      if (error) throw error;
      if (!posts?.length) return { posts: [], totalCount: count || 0, totalPages: Math.ceil((count || 0) / ADMIN_PAGE_SIZE) };

      const authorIds = [...new Set(posts.map((p) => p.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, email')
        .in('user_id', authorIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });

      return {
        posts: posts.map((p) => ({ ...p, author: profileMap[p.author_id] || null })),
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ADMIN_PAGE_SIZE),
      };
    },
    placeholderData: (prev) => prev,
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
      const [usersRes, postsRes, reportsRes, proRes, commentsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_pro', true),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersRes.count || 0,
        totalPosts: postsRes.count || 0,
        pendingReports: reportsRes.count || 0,
        proUsers: proRes.count || 0,
        totalComments: commentsRes.count || 0,
      };
    },
  });
}

// ─── Analytics Hooks ────────────────────────────────────────

export function useAdminAnalytics() {
  // For analytics, fetch limited recent data instead of everything
  const { data: users } = useQuery({
    queryKey: ['admin', 'analytics-users'],
    queryFn: async () => {
      const days30ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at, is_pro')
        .gte('created_at', days30ago)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const { data: allUsers } = useQuery({
    queryKey: ['admin', 'analytics-all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at, is_pro')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const { data: posts } = useQuery({
    queryKey: ['admin', 'analytics-posts'],
    queryFn: async () => {
      const days30ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('posts')
        .select('created_at, category, type')
        .gte('created_at', days30ago)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  return useMemo(() => {
    if (!users || !posts || !allUsers) return null;

    const now = new Date();

    // Build daily data for last 30 days
    const dailyData: { date: string; signups: number; posts: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      dailyData.push({ date: dateStr, signups: 0, posts: 0 });
    }

    const dateMap: Record<string, { signups: number; posts: number }> = {};
    dailyData.forEach((d) => { dateMap[d.date] = d; });

    users.forEach((u) => {
      const d = u.created_at.slice(0, 10);
      if (dateMap[d]) dateMap[d].signups++;
    });

    posts.forEach((p) => {
      const d = p.created_at.slice(0, 10);
      if (dateMap[d]) dateMap[d].posts++;
    });

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    posts.forEach((p) => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Post type breakdown
    const typeMap: Record<string, number> = {};
    posts.forEach((p) => {
      typeMap[p.type] = (typeMap[p.type] || 0) + 1;
    });
    const typeData = Object.entries(typeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // User growth (cumulative) using all users
    const growthData: { date: string; users: number }[] = [];
    let cumulative = 0;
    const growthMap: Record<string, number> = {};
    allUsers.forEach((u) => {
      cumulative++;
      const d = u.created_at.slice(0, 10);
      growthMap[d] = cumulative;
    });
    let lastVal = 0;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      if (growthMap[dateStr] !== undefined) lastVal = growthMap[dateStr];
      growthData.push({ date: dateStr, users: lastVal });
    }

    // Pro vs Free
    const proCount = allUsers.filter((u) => u.is_pro).length;
    const freeCount = allUsers.length - proCount;
    const userTypeData = [
      { name: 'Pro', value: proCount },
      { name: 'Free', value: freeCount },
    ];

    // Recent 7 days vs previous 7 days for trends
    const days7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const days14ago = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentSignups = users.filter((u) => new Date(u.created_at) >= days7ago).length;
    const prevSignups = users.filter((u) => {
      const d = new Date(u.created_at);
      return d >= days14ago && d < days7ago;
    }).length;

    const recentPosts = posts.filter((p) => new Date(p.created_at) >= days7ago).length;
    const prevPosts = posts.filter((p) => {
      const d = new Date(p.created_at);
      return d >= days14ago && d < days7ago;
    }).length;

    return {
      dailyData,
      categoryData,
      typeData,
      growthData,
      userTypeData,
      proCount,
      freeCount,
      trends: {
        signups: { current: recentSignups, previous: prevSignups },
        posts: { current: recentPosts, previous: prevPosts },
      },
    };
  }, [users, posts, allUsers]);
}

// ─── Pro Users Hook ─────────────────────────────────────────

export function useAdminProUsers() {
  return useQuery({
    queryKey: ['admin', 'pro-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_pro', true)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ─── Mutations ──────────────────────────────────────────────

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, status, adminNotes }: { reportId: string; status: string; adminNotes?: string }) => {
      const updateData: any = {
        status,
        ...(adminNotes && { admin_notes: adminNotes }),
        ...(status === 'resolved' || status === 'dismissed' ? { resolved_at: new Date().toISOString() } : {}),
      };
      const { error } = await supabase.from('reports').update(updateData).eq('id', reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Report updated');
    },
    onError: () => toast.error('Failed to update report'),
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
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });
}

export function useBulkDeletePosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postIds: string[]) => {
      const { error } = await supabase.from('posts').delete().in('id', postIds);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(`${ids.length} posts deleted`);
    },
    onError: () => toast.error('Failed to delete posts'),
  });
}

export function useBulkResolveReports() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportIds: string[]) => {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .in('id', reportIds);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success(`${ids.length} reports resolved`);
    },
    onError: () => toast.error('Failed to resolve reports'),
  });
}
