import { useState } from 'react';
import { useAdminPosts, useDeletePost, useBulkDeletePosts } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminPostsTab() {
  const { data: posts, isLoading } = useAdminPosts();
  const deletePost = useDeletePost();
  const bulkDelete = useBulkDeletePosts();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (isLoading) return <TableSkeleton />;

  const filtered = (posts || []).filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} posts? This cannot be undone.`)) return;
    bulkDelete.mutate([...selected], {
      onSuccess: () => setSelected(new Set()),
    });
  };

  return (
    <div className="space-y-4">
      {/* Search + bulk actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selected.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="rounded-xl gap-2"
            onClick={handleBulkDelete}
            disabled={bulkDelete.isPending}
          >
            {bulkDelete.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete {selected.size} selected
          </Button>
        )}
        <span className="text-xs text-muted-foreground">{filtered.length} posts</span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Post</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Author</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Category</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Likes</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                    selected.has(post.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selected.has(post.id)}
                      onCheckedChange={() => toggleSelect(post.id)}
                    />
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium line-clamp-1 max-w-[200px]">{post.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {post.author?.display_name || 'Unknown'}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-[10px] capitalize">{post.category}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="text-[10px] capitalize">{post.type}</Badge>
                  </td>
                  <td className="p-4 text-sm">{post.likes_count}</td>
                  <td className="p-4">
                    <Badge
                      variant={post.status === 'open' ? 'default' : 'secondary'}
                      className="text-[10px] capitalize"
                    >
                      {post.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm('Delete this post?')) deletePost.mutate(post.id);
                      }}
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
          <div className="p-8 text-center text-muted-foreground text-sm">No posts found</div>
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
