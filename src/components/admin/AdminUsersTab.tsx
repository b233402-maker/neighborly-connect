import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Crown, CheckCircle, Ban, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export function AdminUsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [banningId, setBanningId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'unban' : 'ban';
    if (!currentlyBanned && !confirm(`Are you sure you want to ban this user? They won't be able to login.`)) return;

    setBanningId(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-ban-user', {
        body: { user_id: userId, action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(currentlyBanned ? 'User unbanned successfully' : 'User banned successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ban status');
    } finally {
      setBanningId(null);
    }
  };

  if (isLoading) return <TableSkeleton />;

  const filtered = (users || []).filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalKarma = filtered.reduce((sum, u) => sum + u.karma, 0);
  const bannedCount = filtered.filter((u) => (u as any).is_banned).length;

  return (
    <div className="space-y-4">
      {/* Search + stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{filtered.length} users</span>
          <span>•</span>
          <span>{totalKarma} total karma</span>
          {bannedCount > 0 && (
            <>
              <span>•</span>
              <span className="text-destructive">{bannedCount} banned</span>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">User</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Email</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Karma</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Privacy</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Joined</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isBanned = (user as any).is_banned === true;
                const isSelf = user.user_id === currentUser?.id;

                return (
                  <tr
                    key={user.id}
                    className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${isBanned ? 'opacity-60 bg-destructive/5' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                            alt=""
                            className={`w-9 h-9 rounded-full bg-muted ${isBanned ? 'grayscale' : ''}`}
                          />
                          {isBanned && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                              <Ban className="w-2.5 h-2.5 text-destructive-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium">{user.display_name}</p>
                            {user.verified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                            {user.is_pro && <Crown className="w-3.5 h-3.5 text-accent" />}
                          </div>
                          {isBanned && <p className="text-[10px] text-destructive font-medium">Banned</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.email || '—'}</td>
                    <td className="p-4">
                      <span className="text-sm font-medium">{user.karma}</span>
                    </td>
                    <td className="p-4">
                      {isBanned ? (
                        <Badge variant="destructive" className="text-[10px]">Banned</Badge>
                      ) : (
                        <Badge variant={user.is_pro ? 'default' : 'secondary'} className="text-[10px]">
                          {user.is_pro ? 'Pro' : 'Free'}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px] capitalize">{user.privacy_level}</Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {isSelf ? (
                        <span className="text-[10px] text-muted-foreground">You</span>
                      ) : (
                        <Button
                          variant={isBanned ? 'outline' : 'ghost'}
                          size="sm"
                          className={`h-8 text-xs rounded-lg gap-1.5 ${
                            isBanned
                              ? 'border-success text-success hover:bg-success/10'
                              : 'text-destructive hover:bg-destructive/10'
                          }`}
                          onClick={() => handleBanToggle(user.user_id, isBanned)}
                          disabled={banningId === user.user_id}
                        >
                          {banningId === user.user_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isBanned ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          {isBanned ? 'Unban' : 'Ban'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No users found</div>
        )}
      </div>
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
