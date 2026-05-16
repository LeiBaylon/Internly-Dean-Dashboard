type LoadingSkeletonProps = {
  lines?: number;
};

export default function LoadingSkeleton({ lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="h-4 w-full animate-pulse rounded-full bg-white/70"
        />
      ))}
    </div>
  );
}
