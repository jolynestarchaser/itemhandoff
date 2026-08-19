export default function PendingVehiclesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded" />
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-72 bg-white/15 rounded-xl" />
          <div className="h-4 w-80 bg-white/10 rounded" />
        </div>
        <div className="h-10 w-32 bg-[#F58220]/20 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/10" />
        ))}
      </div>

      <div className="h-14 bg-white/5 rounded-2xl border border-white/10" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10" />
        ))}
      </div>
    </div>
  );
}
