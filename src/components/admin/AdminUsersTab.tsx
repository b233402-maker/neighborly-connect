import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Crown, CheckCircle } from 'lucide-react';

export function AdminUsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const [search, setSearch] = useState('');

  if (isLoading) return <TableSkeleton />;

  const filtered = (users || []).filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalKarma = filtered.reduce((sum, u) => sum + u.karma, 0);

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
                        className="w-9 h-9 rounded-full bg-muted"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium">{user.display_name}</p>
                          {user.verified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                          {user.is_pro && <Crown className="w-3.5 h-3.5 text-accent" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{user.email || '—'}</td>
                  <td className="p-4">
                    <span className="text-sm font-medium">{user.karma}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={user.is_pro ? 'default' : 'secondary'} className="text-[10px]">
                      {user.is_pro ? 'Pro' : 'Free'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-[10px] capitalize">{user.privacy_level}</Badge>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
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
