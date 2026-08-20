import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="no-print glass-panel max-w-6xl mx-auto mt-3 mb-6 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-3 z-50 backdrop-blur-xl bg-black/70 border border-white/10 shadow-xl shadow-black/40 rounded-2xl">
      <Link href="/" className="flex items-center gap-2.5 group shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F58220] to-[#ff9d42] flex items-center justify-center text-white font-bold text-base shadow-md shadow-[#F58220]/30 group-hover:scale-105 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-[#F58220] transition-colors hidden sm:inline">
          Inventory <span className="text-[#F58220]">Handoff</span>
        </span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
        <Link
          href="/"
          className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          หน้าแรก
        </Link>
        <Link
          href="/print"
          className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect width="12" height="8" x="6" y="14" />
          </svg>
          <span>ศูนย์พิมพ์เอกสาร</span>
        </Link>
        <Link
          href="/template-builder"
          className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F58220]/15 text-[#F58220] hover:bg-[#F58220]/25 border border-[#F58220]/30 transition-all flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          <span>สร้าง Template PDF</span>
        </Link>
        <Link
          href="/pending-vehicles"
          className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <span>รถค้างส่ง</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F58220] animate-pulse" />
        </Link>
        <Link
          href="/summary"
          className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          สรุปภาพรวม
        </Link>
      </div>
    </nav>
  );
}
