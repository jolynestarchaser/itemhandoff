import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="no-print glass-panel max-w-5xl mx-auto mt-3 mb-6 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-3 z-50 backdrop-blur-xl bg-black/60 border border-white/10 shadow-xl shadow-black/40 rounded-2xl">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F58220] to-[#ff9d42] flex items-center justify-center text-white font-bold text-base shadow-md shadow-[#F58220]/30 group-hover:scale-105 transition-transform">
          ⚡
        </div>
        <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-[#F58220] transition-colors">
          Inventory <span className="text-[#F58220]">Handoff</span>
        </span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/"
          className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          หน้าแรก
        </Link>
        <Link
          href="/pending-vehicles"
          className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#F58220] hover:text-[#ff9d42] hover:bg-[#F58220]/10 border border-[#F58220]/20 transition-all flex items-center gap-1.5"
        >
          <span>เลขรถค้างส่ง</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F58220] animate-pulse" />
        </Link>
        <Link
          href="/summary"
          className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          สรุปเอกสาร
        </Link>
      </div>
    </nav>
  );
}
