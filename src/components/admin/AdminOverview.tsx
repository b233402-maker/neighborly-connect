import { Users, FileText, AlertTriangle, Crown, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Posts', value: stats?.totalPosts || 0, icon: FileText, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Comments', value: stats?.totalComments || 0, icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Pro Members', value: stats?.proUsers || 0, icon: Crown, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold font-[Lexend]">{card.value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
