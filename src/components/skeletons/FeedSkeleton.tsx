import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-24 lg:pb-4">
      {/* Create post prompt skeleton */}
      <div className="feed-card flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="flex-1 h-10 rounded-full" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-11 rounded-full" />

      {/* Post cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="feed-card space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          {i === 1 && <Skeleton className="h-48 w-full rounded-xl" />}
          <div className="flex items-center gap-4 pt-1">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
