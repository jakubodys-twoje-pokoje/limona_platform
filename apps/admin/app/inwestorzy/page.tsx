import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';

export default async function InwestorzyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const inwestorzy = await prisma.inwestor.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, imie: true, nazwisko: true, email: true, firma: true,
      abonamentAktywny: true, planAbonamentu: true, abonamentDo: true,
      aktywny: true, zweryfikowany: true, createdAt: true, ostatnieLogowanie: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <AdminSidebarSimple active="inwestorzy" adminImie={session.user.imie} />
      <main className="ml-56 flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-6">Inwestorzy ({inwestorzy.length})</h1>

        <div className="bg-white border border-[#D8D8D8] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F6F1] border-b border-[#D8D8D8]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Imię i nazwisko</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Firma</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Abonament</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Rejestracja</th>
                <th className="text-right px-4 py-3 font-medium text-[#6B6B6B]">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {inwestorzy.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F8F6F1]">
                  <td className="px-4 py-3 font-medium">{inv.imie} {inv.nazwisko}</td>
                  <td className="px-4 py-3 text-[#6B6B6B]">{inv.email}</td>
                  <td className="px-4 py-3 text-[#9B9B9B]">{inv.firma ?? '—'}</td>
                  <td className="px-4 py-3">
                    {inv.abonamentAktywny ? (
                      <span className="bg-[#E8F0E4] text-[#4A6741] px-2 py-0.5 rounded-full text-xs font-medium">
                        {inv.planAbonamentu ?? 'aktywny'}
                      </span>
                    ) : <span className="text-[#9B9B9B] text-xs">brak</span>}
                  </td>
                  <td className="px-4 py-3">
                    {!inv.zweryfikowany ? (
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">oczekuje</span>
                    ) : inv.aktywny ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">aktywny</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">dezaktywowany</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#9B9B9B] text-xs">{new Date(inv.createdAt).toLocaleDateString('pl-PL')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/inwestorzy/${inv.id}`} className="text-[#4A6741] text-xs font-medium hover:underline">
                      Zarządzaj
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inwestorzy.length === 0 && <p className="text-center py-8 text-[#9B9B9B]">Brak inwestorów.</p>}
        </div>
      </main>
    </div>
  );
}

function AdminSidebarSimple({ active, adminImie }: { active: string; adminImie: string }) {
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', key: 'dashboard' },
    { href: '/zgloszenia', label: 'Zgłoszenia', icon: '📋', key: 'zgloszenia' },
    { href: '/inwestorzy', label: 'Inwestorzy', icon: '👥', key: 'inwestorzy' },
    { href: '/oferty', label: 'Oferty', icon: '🏠', key: 'oferty' },
    { href: '/materialy', label: 'Materiały', icon: '📚', key: 'materialy' },
    { href: '/platnosci', label: 'Płatności', icon: '💳', key: 'platnosci' },
    { href: '/ustawienia', label: 'Ustawienia', icon: '⚙️', key: 'ustawienia' },
  ];

  return (
    <aside className="w-56 min-h-screen bg-[#1C1C1C] text-white fixed top-0 left-0 z-40">
      <div className="p-5 border-b border-white/10">
        <p className="font-bold text-[#4A6741] text-lg">Limona Admin</p>
        <p className="text-[#9B9B9B] text-xs mt-0.5">{adminImie}</p>
      </div>
      <nav className="p-4 space-y-1">
        {links.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active === item.key ? 'bg-[#4A6741] text-white' : 'hover:bg-white/10'}`}>
            <span>{item.icon}</span><span>{item.label}</span>
          </Link>
        ))}
        <div className="pt-4 border-t border-white/10">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9B9B9B] hover:bg-white/10">
            <span>🚪</span><span>Wyloguj</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
