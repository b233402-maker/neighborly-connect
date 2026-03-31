import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="lg:col-span-1 xl:col-span-2 space-y-4 pb-20 lg:pb-0">
      {/* Header card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Cover */}
        <Skeleton className="h-32 sm:h-40 rounded-none" />
        {/* Avatar + info */}
        <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-14 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-card" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-4 space-y-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
