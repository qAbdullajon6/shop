interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-store-border/60 ${className}`}
    />
  );
}

/* Mirrors ProductCard's real proportions (square image canvas, then the
   brand / name / meta / price / button stack) so nothing shifts on load. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-store-border">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
        <Skeleton className="mt-1 h-4 w-20" />
        <Skeleton className="mt-1.5 h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

/* Grid must stay in lockstep with ProductsSection's product grid. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return <Skeleton className="h-64 w-full rounded-sm" />;
}
