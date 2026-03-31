import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminUsers, useAdminPosts, useAdminReports, useAdminStats, useUpdateReportStatus, useDeletePost } from '@/hooks/useAdmin';
import { Users, FileText, AlertTriangle, BarChart3, Trash2, Eye, CheckCircle, XCircle, ArrowLeft, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { label: 'Overview', icon: BarChart3 },
  { label: 'Users', icon: Users },
  { label: 'Posts', icon: FileText },
  { label: 'Reports', icon: AlertTriangle },
];

export default function AdminPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce((value: string) => setSearch(value), 300),
    []
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold font-[Lexend]">Admin Dashboard</h1>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Admin</Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-card rounded-xl p-1 border border-border mb-6">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 flex-1 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors ${
                i === activeTab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search for Users/Posts */}
        {(activeTab === 1 || activeTab === 2) && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === 1 ? 'users' : 'posts'}...`}
                className="pl-10 rounded-xl"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 0 && <OverviewTab />}
        {activeTab === 1 && <UsersTab search={search} />}
        {activeTab === 2 && <PostsTab search={search} />}
        {activeTab === 3 && <ReportsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return <StatsSkeletons />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Posts', value: stats?.totalPosts || 0, icon: FileText, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <p className="text-3xl font-bold font-[Lexend]">{card.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function UsersTab({ search }: { search: string }) {
  const { data: users, isLoading } = useAdminUsers();

  if (isLoading) return <TableSkeleton />;

  const filtered = (users || []).filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">User</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Email</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Karma</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                      alt=""
                      className="w-8 h-8 rounded-full bg-muted"
                    />
                    <div>
                      <p className="text-sm font-medium">{user.display_name}</p>
                      {user.verified && <Badge variant="secondary" className="text-[10px] h-4">Verified</Badge>}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{user.email || '—'}</td>
                <td className="p-4 text-sm font-medium">{user.karma}</td>
                <td className="p-4">
                  <Badge variant={user.is_pro ? 'default' : 'secondary'} className="text-xs">
                    {user.is_pro ? 'Pro' : 'Free'}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">No users found</div>
      )}
    </div>
  );
}

function PostsTab({ search }: { search: string }) {
  const { data: posts, isLoading } = useAdminPosts();
  const deletePost = useDeletePost();

  if (isLoading) return <TableSkeleton />;

  const filtered = (posts || []).filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Post</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Author</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Category</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Likes</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <p className="text-sm font-medium line-clamp-1 max-w-[200px]">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {post.author?.display_name || 'Unknown'}
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="text-xs capitalize">{post.category}</Badge>
                </td>
                <td className="p-4 text-sm">{post.likes_count}</td>
                <td className="p-4">
                  <Badge variant={post.status === 'open' ? 'default' : 'secondary'} className="text-xs capitalize">
                    {post.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => deletePost.mutate(post.id)}
                    disabled={deletePost.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">No posts found</div>
      )}
    </div>
  );
}

function ReportsTab() {
  const { data: reports, isLoading } = useAdminReports();
  const updateReport = useUpdateReportStatus();

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Reporter</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Reported</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Reason</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(reports || []).map((report) => (
              <tr key={report.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-4 text-sm">{report.reporter?.display_name || '—'}</td>
                <td className="p-4 text-sm">{report.reported_user?.display_name || '—'}</td>
                <td className="p-4 text-sm text-muted-foreground max-w-[200px] line-clamp-2">{report.reason}</td>
                <td className="p-4">
                  <Badge
                    variant={report.status === 'pending' ? 'destructive' : report.status === 'resolved' ? 'default' : 'secondary'}
                    className="text-xs capitalize"
                  >
                    {report.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    {report.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success hover:bg-success/10"
                          onClick={() => updateReport.mutate({ reportId: report.id, status: 'resolved' })}
                          title="Resolve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-muted"
                          onClick={() => updateReport.mutate({ reportId: report.id, status: 'dismissed' })}
                          title="Dismiss"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(!reports || reports.length === 0) && (
        <div className="p-8 text-center text-muted-foreground">No reports</div>
      )}
    </div>
  );
}

function StatsSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-14 rounded-xl" />
      ))}
    </div>
  );
}
