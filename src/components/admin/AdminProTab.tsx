import { useAdminProUsers, useAdminStats } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Crown, DollarSign, Users, TrendingUp } from 'lucide-react';

const MONTHLY_PRICE = 4.99;
const ANNUAL_MONTHLY = 2.99;

export function AdminProTab() {
  const { data: proUsers, isLoading } = useAdminProUsers();
  const { data: stats } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  const proCount = proUsers?.length || 0;
  const totalUsers = stats?.totalUsers || 1;
  const conversionRate = totalUsers > 0 ? ((proCount / totalUsers) * 100).toFixed(1) : '0.0';

  // Revenue estimation (assume all monthly for simplicity)
  const estimatedMRR = (proCount * MONTHLY_PRICE).toFixed(2);
  const estimatedARR = (proCount * MONTHLY_PRICE * 12).toFixed(2);

  const revenueCards = [
    { label: 'Pro Members', value: proCount, icon: Crown, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Est. MRR', value: `$${estimatedMRR}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Est. ARR', value: `$${estimatedARR}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold font-[Lexend]">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Pro Users List */}
      <div>
        <h3 className="text-sm font-semibold font-[Lexend] mb-3">Pro Members</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Member</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Karma</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Joined</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {(proUsers || []).map((user) => (
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
                            <Crown className="w-3.5 h-3.5 text-accent" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.email || '—'}</td>
                    <td className="p-4 text-sm font-medium">{user.karma}</td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Badge className="text-[10px] bg-accent text-accent-foreground">
                        <Crown className="w-3 h-3 mr-1" /> Active Pro
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {proCount === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No Pro members yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
