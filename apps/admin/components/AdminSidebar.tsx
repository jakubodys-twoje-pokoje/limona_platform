import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard',      label: 'Dashboard',        icon: '📊' },
  { href: '/zgloszenia',     label: 'Zgłoszenia',       icon: '📋' },
  { href: '/inwestorzy',     label: 'Inwestorzy',       icon: '👥' },
  { href: '/oferty',         label: 'Oferty',           icon: '🏠' },
  { href: '/materialy',      label: 'Materiały',        icon: '📚' },
  { href: '/platnosci',      label: 'Płatności',        icon: '💳' },
  { href: '/wyszukiwarka',   label: 'Wyszukiwarka',     icon: '🔍' },
  { href: '/ustawienia',     label: 'Ustawienia',       icon: '⚙️' },
];

interface AdminSidebarProps {
  active: string;
  adminImie: string;
}

export function AdminSidebar({ active, adminImie }: AdminSidebarProps) {
  return (
    <aside className="w-56 min-h-screen bg-[#1C1C1C] text-white fixed top-0 left-0 z-40 flex flex-col">
      <div className="p-5 border-b border-white/10">
        <p className="font-bold text-[#4A6741] text-lg">Limona Admin</p>
        <p className="text-[#9B9B9B] text-xs mt-0.5">{adminImie}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === item.href.replace('/', '')
                ? 'bg-[#4A6741] text-white'
                : 'hover:bg-white/10 text-[#D8D8D8]'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9B9B9B] hover:bg-white/10 transition-colors"
        >
          <span>🚪</span>
          <span>Wyloguj</span>
        </Link>
      </div>
    </aside>
  );
}
