import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminStats } from '@/hooks/useAdmin';
import { Shield, Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { AdminSidebar, type AdminTab } from '@/components/admin/AdminSidebar';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminPostsTab } from '@/components/admin/AdminPostsTab';
import { AdminReportsTab } from '@/components/admin/AdminReportsTab';
import { AdminProTab } from '@/components/admin/AdminProTab';

// ─── Password Gate ────────────────────────────────────────

function AdminPasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { password },
      });
      if (error) { toast.error('Admin login failed'); setLoading(false); return; }
      if (data?.error) { toast.error(data.error); setLoading(false); return; }
      toast.success(data?.message || 'Admin access granted!');
      onSuccess();
    } catch {
      toast.error('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-[Lexend]">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter admin password to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 rounded-xl"
                autoFocus
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading || !password.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              {loading ? 'Verifying...' : 'Login as Admin'}
            </Button>
          </form>
          <Button variant="ghost" className="w-full mt-3 text-muted-foreground" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tab Titles ───────────────────────────────────────────

const TAB_TITLES: Record<AdminTab, string> = {
  overview: 'Overview',
  analytics: 'Analytics',
  users: 'Users',
  posts: 'Posts',
  reports: 'Reports',
  pro: 'Pro Members & Revenue',
};

// ─── Main Admin Page ──────────────────────────────────────

export default function AdminPage() {
  const { isAdmin, isLoading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [adminGranted, setAdminGranted] = useState(false);
  const { data: stats } = useAdminStats();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin && !adminGranted) {
    return (
      <AdminPasswordGate
        onSuccess={() => {
          setAdminGranted(true);
          refreshProfile();
          setTimeout(() => window.location.reload(), 500);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        pendingReports={stats?.pendingReports}
        proUsers={stats?.proUsers}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="px-6 h-16 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-[Lexend]">{TAB_TITLES[activeTab]}</h2>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {activeTab === 'overview' && (
            <>
              <AdminOverview />
              <AdminAnalytics />
            </>
          )}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'posts' && <AdminPostsTab />}
          {activeTab === 'reports' && <AdminReportsTab />}
          {activeTab === 'pro' && <AdminProTab />}
        </div>
      </main>
    </div>
  );
}
