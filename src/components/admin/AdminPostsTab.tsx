import { useState } from 'react';
import { useAdminPosts, useDeletePost, useBulkDeletePosts } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export function AdminPostsTab() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const deletePost = useDeletePost();
  const bulkDelete = useBulkDeletePosts();
  const { data, isLoading, isFetching } = useAdminPosts(page, debouncedSearch);
  const posts = data?.posts || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
      setSelected(new Set());
    }, 400));
  };

  if (isLoading) return <TableSkeleton />;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p: any) => p.id)));
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
            onChange={(e) => handleSearchChange(e.target.value)}
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{totalCount} posts total</span>
          {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 w-10">
                  <Checkbox
                    checked={posts.length > 0 && selected.size === posts.length}
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
              {posts.map((post: any) => (
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
        {posts.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No posts found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {page * 25 + 1}–{Math.min((page + 1) * 25, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className="h-8 w-8 rounded-lg text-xs" onClick={() => setPage(p)}>
                  {p + 1}
                </Button>
              );
            })}
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
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
