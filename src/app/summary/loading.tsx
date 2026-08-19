export default function SummaryLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-44 bg-[#F58220]/20 rounded-full" />
            <div className="h-8 w-72 bg-white/15 rounded-xl" />
            <div className="h-4 w-96 bg-white/10 rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-44 bg-[#F58220]/30 rounded-xl" />
            <div className="h-10 w-36 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Date Filter Skeleton */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-8 w-28 bg-[#F58220]/30 rounded-xl" />
        <div className="h-8 w-24 bg-white/5 rounded-xl" />
        <div className="h-8 w-24 bg-white/5 rounded-xl" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-14 bg-white/5 border border-white/10 rounded-2xl" />

      {/* List Items Skeleton */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-white/10" />
                <div className="space-y-1.5">
                  <div className="h-5 w-48 bg-white/15 rounded" />
                  <div className="h-3 w-32 bg-white/10 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-32 bg-[#F58220]/20 rounded-xl" />
                <div className="h-9 w-20 bg-white/10 rounded-xl" />
              </div>
            </div>
            <div className="h-12 bg-black/40 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
