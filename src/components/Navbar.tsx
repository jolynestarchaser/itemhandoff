import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="no-print glass-panel mx-4 mt-4 mb-6 px-6 py-4 flex items-center justify-between sticky top-4 z-50">
      <div className="flex gap-2">
        <Link href="handoff" className="btn-ghost">
          Scanner
        </Link>
      </div>
    </nav>
  );
}
