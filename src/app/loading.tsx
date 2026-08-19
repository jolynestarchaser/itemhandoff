export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-white/10 rounded-full" />
          <div className="h-8 w-64 bg-white/15 rounded-xl" />
          <div className="h-4 w-80 bg-white/10 rounded-md" />
        </div>
        <div className="h-12 w-48 bg-white/10 rounded-2xl" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-7 w-28 bg-white/20 rounded" />
            <div className="h-1.5 w-full bg-white/10 rounded-full" />
          </div>
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-14 bg-white/5 border border-white/10 rounded-2xl" />

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
            <div className="h-5 w-36 bg-white/15 rounded" />
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="pt-3 border-t border-white/5 flex justify-between">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-4 w-20 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
