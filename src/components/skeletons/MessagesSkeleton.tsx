import { Skeleton } from "@/components/ui/skeleton";

export function MessagesSkeleton() {
  return (
    <div className="lg:col-span-1 xl:col-span-2">
      <Skeleton className="h-8 w-32 mb-4" />
      <div className="hidden lg:grid lg:grid-cols-[320px_1fr] gap-4">
        {/* Conversation list */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-3">
            <Skeleton className="h-10 rounded-xl" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
        {/* Chat area */}
        <div className="bg-card rounded-2xl border border-border flex flex-col h-[500px]">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            <div className="flex justify-start"><Skeleton className="h-12 w-48 rounded-2xl" /></div>
            <div className="flex justify-end"><Skeleton className="h-12 w-56 rounded-2xl" /></div>
            <div className="flex justify-start"><Skeleton className="h-12 w-40 rounded-2xl" /></div>
            <div className="flex justify-end"><Skeleton className="h-12 w-44 rounded-2xl" /></div>
          </div>
          <div className="p-4 border-t border-border">
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>
      </div>
      {/* Mobile: just conversation list */}
      <div className="lg:hidden bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-3"><Skeleton className="h-10 rounded-xl" /></div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="h-11 w-11 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
