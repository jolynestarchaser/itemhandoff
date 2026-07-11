import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="no-print glass-panel mx-4 mt-4 mb-6 px-6 py-4 flex items-center justify-between sticky top-4 z-50">
      <Link href="/" className="font-bold text-white text-lg hover:text-[#F58220] transition-colors">
        Inventory
      </Link>
      <div className="flex gap-2">
        <Link href="/" className="btn-ghost">
          หน้าแรก
        </Link>
        <Link href="/summary" className="btn-ghost">
          สรุป
        </Link>
      </div>
    </nav>
  );
}
