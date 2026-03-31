import { useState } from 'react';
import { useAdminReports, useUpdateReportStatus, useBulkResolveReports } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function AdminReportsTab() {
  const { data: reports, isLoading } = useAdminReports();
  const updateReport = useUpdateReportStatus();
  const bulkResolve = useBulkResolveReports();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (isLoading) return <TableSkeleton />;

  const pending = (reports || []).filter((r) => r.status === 'pending');
  const resolved = (reports || []).filter((r) => r.status !== 'pending');

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === pending.length) setSelected(new Set());
    else setSelected(new Set(pending.map((r) => r.id)));
  };

  const handleBulkResolve = () => {
    if (selected.size === 0) return;
    bulkResolve.mutate([...selected], {
      onSuccess: () => setSelected(new Set()),
    });
  };

  return (
    <div className="space-y-6">
      {/* Pending Reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold font-[Lexend] flex items-center gap-2">
            Pending Reports
            {pending.length > 0 && (
              <Badge variant="destructive" className="text-[10px]">{pending.length}</Badge>
            )}
          </h3>
          {selected.size > 0 && (
            <Button
              size="sm"
              className="rounded-xl gap-2"
              onClick={handleBulkResolve}
              disabled={bulkResolve.isPending}
            >
              {bulkResolve.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Resolve {selected.size} selected
            </Button>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 w-10">
                    <Checkbox
                      checked={pending.length > 0 && selected.size === pending.length}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Reporter</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Reported User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Reason</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((report) => (
                  <tr key={report.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${selected.has(report.id) ? 'bg-primary/5' : ''}`}>
                    <td className="p-4">
                      <Checkbox checked={selected.has(report.id)} onCheckedChange={() => toggleSelect(report.id)} />
                    </td>
                    <td className="p-4 text-sm">{report.reporter?.display_name || '—'}</td>
                    <td className="p-4 text-sm">{report.reported_user?.display_name || '—'}</td>
                    <td className="p-4 text-sm text-muted-foreground max-w-[250px] line-clamp-2">{report.reason}</td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pending.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">🎉 No pending reports</div>
          )}
        </div>
      </div>

      {/* Resolved Reports */}
      {resolved.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold font-[Lexend] mb-3 text-muted-foreground">
            Resolved / Dismissed ({resolved.length})
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Reporter</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Reported</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Reason</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {resolved.map((report) => (
                    <tr key={report.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors opacity-60">
                      <td className="p-4 text-sm">{report.reporter?.display_name || '—'}</td>
                      <td className="p-4 text-sm">{report.reported_user?.display_name || '—'}</td>
                      <td className="p-4 text-sm text-muted-foreground max-w-[250px] line-clamp-1">{report.reason}</td>
                      <td className="p-4">
                        <Badge
                          variant={report.status === 'resolved' ? 'default' : 'secondary'}
                          className="text-[10px] capitalize"
                        >
                          {report.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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
