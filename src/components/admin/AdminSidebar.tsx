import { BarChart3, Users, FileText, AlertTriangle, Crown, TrendingUp, Shield, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export type AdminTab = 'overview' | 'analytics' | 'users' | 'posts' | 'reports' | 'pro';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingReports?: number;
  proUsers?: number;
}

const navItems: { id: AdminTab; label: string; icon: React.ElementType; section?: string }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3, section: 'Dashboard' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users, section: 'Management' },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'reports', label: 'Reports', icon: AlertTriangle },
  { id: 'pro', label: 'Pro Members', icon: Crown, section: 'Revenue' },
];

export function AdminSidebar({ activeTab, onTabChange, collapsed, onToggleCollapse, pendingReports, proUsers }: AdminSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 bg-card border-r border-border flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo / Header */}
      <div className="h-16 flex items-center px-4 border-b border-border gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold font-[Lexend] truncate">Admin Panel</h1>
            <p className="text-[10px] text-muted-foreground">Neighborly</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.id}>
            {item.section && !collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-4 pb-1">
                {item.section}
              </p>
            )}
            {item.section && collapsed && <div className="h-4" />}
            <button
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.id === 'reports' && pendingReports && pendingReports > 0 ? (
                    <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1.5">
                      {pendingReports}
                    </Badge>
                  ) : null}
                  {item.id === 'pro' && proUsers && proUsers > 0 ? (
                    <Badge className="ml-auto text-[10px] h-5 px-1.5 bg-accent text-accent-foreground">
                      {proUsers}
                    </Badge>
                  ) : null}
                </>
              )}
            </button>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Back to App</span>}
        </button>
      </div>
    </aside>
  );
}
