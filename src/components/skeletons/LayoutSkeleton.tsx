import { Skeleton } from "@/components/ui/skeleton";
import { FeedSkeleton } from "./FeedSkeleton";

/** Full page skeleton mimicking AppLayout with TopBar + Sidebar + Feed content */
export function LayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* TopBar skeleton */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-9 w-64 rounded-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content area */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_320px] gap-6">
          {/* Left sidebar skeleton */}
          <div className="hidden lg:block space-y-4">
            {/* Profile card */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
            {/* Nav links */}
            <div className="bg-card rounded-2xl border border-border p-2 space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Feed skeleton */}
          <FeedSkeleton />

          {/* Right sidebar (mini map) skeleton */}
          <div className="hidden xl:block space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <Skeleton className="h-4 w-28" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
