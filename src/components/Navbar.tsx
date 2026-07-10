import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="no-print glass-panel mx-4 mt-4 mb-6 px-6 py-4 flex items-center justify-between sticky top-4 z-50">
      <Link href="/" className="text-xl font-bold text-white tracking-tight">
        Inventory<span className="text-primary">Handoff</span>
      </Link>
      <div className="flex gap-4">
        <Link href="/" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
          Scanner
        </Link>
        <Link href="/summary" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
          Summary
        </Link>
      </div>
    </nav>
  );
}
