import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsSkeleton() {
  return (
    <div className="lg:col-span-1 xl:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      {/* Filter tabs */}
      <Skeleton className="h-11 rounded-2xl mb-4" />
      {/* Notification items */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 p-4">
            <div className="relative shrink-0">
              <Skeleton className="h-11 w-11 rounded-full" />
              <Skeleton className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full" />
            </div>
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
