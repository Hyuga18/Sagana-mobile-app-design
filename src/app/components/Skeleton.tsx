export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-black/[0.06] ${className}`}
      aria-hidden
    />
  );
}

// Matches the layout of ListingCard so lists don't jump when data loads.
export function ListingCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden flex">
      <Skeleton className="w-[104px] h-[104px] shrink-0 rounded-none" />
      <div className="flex-1 p-3 space-y-2.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex justify-between pt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}
