'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { IconName } from '@/components/Icon';
import ThemeToggle from '@/components/ThemeToggle';

const navItems: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'หน้าแรก', icon: 'home' },
  { href: '/pending-vehicles', label: 'รถค้างส่ง', icon: 'clock' },
  { href: '/print', label: 'พิมพ์เอกสาร', icon: 'printer' },
  { href: '/summary', label: 'สรุป', icon: 'chart' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' || pathname.startsWith('/department') : pathname.startsWith(href));

  return (
    <>
      <nav className="no-print glass-panel max-w-6xl mx-auto mt-3 mb-6 px-4 sm:px-6 py-2 flex items-center justify-between sticky top-3 z-40">
        <Link href="/" className="flex items-center gap-2.5 min-h-11 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-[#F58220] flex items-center justify-center text-white">
            <Icon name="box" size={18} />
          </span>
          <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
            Inventory <span className="text-brand-ink">Handoff</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`min-h-11 px-3 rounded-xl text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
                  isActive(item.href) ? 'bg-[#F58220]/15 text-brand-ink font-semibold' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <nav
        aria-label="เมนูหลัก"
        className="no-print sm:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border grid grid-cols-4 pb-[env(safe-area-inset-bottom)]"
      >
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={`min-h-14 flex flex-col items-center justify-center gap-0.5 text-xs font-medium ${
              isActive(item.href) ? 'text-brand-ink font-semibold' : 'text-gray-400'
            }`}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
