import { useAdminAnalytics } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = [
  'hsl(217 91% 53%)',   // primary blue
  'hsl(160 84% 39%)',   // success green
  'hsl(38 92% 50%)',    // accent amber
  'hsl(0 84% 60%)',     // destructive red
  'hsl(270 60% 55%)',   // purple
  'hsl(190 80% 45%)',   // teal
];

export function AdminAnalytics() {
  const analytics = useAdminAnalytics();

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[320px] rounded-2xl" />
        ))}
      </div>
    );
  }

  const { dailyData, categoryData, typeData, growthData, userTypeData, trends } = analytics;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const signupsTrend = trends.signups.previous > 0
    ? ((trends.signups.current - trends.signups.previous) / trends.signups.previous * 100).toFixed(0)
    : trends.signups.current > 0 ? '+100' : '0';

  const postsTrend = trends.posts.previous > 0
    ? ((trends.posts.current - trends.posts.previous) / trends.posts.previous * 100).toFixed(0)
    : trends.posts.current > 0 ? '+100' : '0';

  return (
    <div className="space-y-6">
      {/* Trend summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <p className="text-xs text-muted-foreground mb-1">Signups (7d)</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold font-[Lexend]">{trends.signups.current}</span>
            <span className={`text-xs font-medium ${Number(signupsTrend) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {Number(signupsTrend) >= 0 ? '+' : ''}{signupsTrend}%
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <p className="text-xs text-muted-foreground mb-1">Posts (7d)</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold font-[Lexend]">{trends.posts.current}</span>
            <span className={`text-xs font-medium ${Number(postsTrend) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {Number(postsTrend) >= 0 ? '+' : ''}{postsTrend}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold font-[Lexend] mb-4">Daily Activity (30 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
                contentStyle={{ borderRadius: 12, border: '1px solid hsl(214 32% 91%)', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="signups" stroke="hsl(217 91% 53%)" strokeWidth={2} dot={false} name="Signups" />
              <Line type="monotone" dataKey="posts" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={false} name="Posts" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold font-[Lexend] mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
                contentStyle={{ borderRadius: 12, border: '1px solid hsl(214 32% 91%)', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="users" stroke="hsl(217 91% 53%)" fill="hsl(217 91% 53% / 0.15)" strokeWidth={2} name="Total Users" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Posts by Category */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold font-[Lexend] mb-4">Posts by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(214 32% 91%)', fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(217 91% 53%)" radius={[0, 6, 6, 0]} name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold font-[Lexend] mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {userTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(214 32% 91%)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
