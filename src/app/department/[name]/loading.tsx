export default function DepartmentLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded" />
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/15 rounded-xl" />
          <div className="h-4 w-40 bg-white/10 rounded" />
        </div>
        <div className="h-10 w-28 bg-emerald-500/20 rounded-xl" />
      </div>

      <div className="h-12 bg-white/5 rounded-2xl border border-white/10" />
      <div className="h-14 bg-white/5 rounded-2xl border border-white/10" />

      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/10" />
        ))}
      </div>
    </div>
  );
}
