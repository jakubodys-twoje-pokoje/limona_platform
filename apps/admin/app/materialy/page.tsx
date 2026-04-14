import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';

export default async function MaterialyAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const materialy = await prisma.material.findMany({
    orderBy: { kolejnosc: 'asc' },
    include: { _count: { select: { dostepy: true } } },
  });

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <aside className="w-56 min-h-screen bg-[#1C1C1C] text-white fixed top-0 left-0 z-40">
        <div className="p-5 border-b border-white/10">
          <p className="font-bold text-[#4A6741] text-lg">Limona Admin</p>
          <p className="text-[#9B9B9B] text-xs mt-0.5">{session.user.imie}</p>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { href: '/dashboard', label: 'Dashboard', icon: '📊' },
            { href: '/zgloszenia', label: 'Zgłoszenia', icon: '📋' },
            { href: '/inwestorzy', label: 'Inwestorzy', icon: '👥' },
            { href: '/oferty', label: 'Oferty', icon: '🏠' },
            { href: '/materialy', label: 'Materiały', icon: '📚' },
            { href: '/platnosci', label: 'Płatności', icon: '💳' },
            { href: '/ustawienia', label: 'Ustawienia', icon: '⚙️' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${item.href === '/materialy' ? 'bg-[#4A6741] text-white' : 'hover:bg-white/10'}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10">
            <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#9B9B9B] hover:bg-white/10 rounded-lg">
              <span>🚪</span><span>Wyloguj</span>
            </Link>
          </div>
        </nav>
      </aside>

      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Materiały edukacyjne ({materialy.length})</h1>
          <Link href="/materialy/nowy"
            className="bg-[#4A6741] text-white px-5 py-2.5 rounded-[6px] text-sm font-semibold hover:bg-[#6B8F5E] transition-colors">
            + Dodaj materiał
          </Link>
        </div>

        <div className="space-y-4">
          {materialy.map((mat) => (
            <div key={mat.id} className="bg-white border border-[#D8D8D8] rounded-xl p-5 flex items-center gap-5">
              <span className="text-3xl">{mat.typ === 'pdf' ? '📄' : mat.typ === 'wideo' ? '🎬' : '📰'}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1C1C1C]">{mat.tytul}</h3>
                <p className="text-sm text-[#9B9B9B]">{mat.kategoria} · kolejność: {mat.kolejnosc}</p>
                <p className="text-xs text-[#9B9B9B] mt-0.5">Odblokowane przez: {mat._count.dostepy} użytkownik(ów)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs ${mat.aktywny ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {mat.aktywny ? 'aktywny' : 'nieaktywny'}
                </span>
                <Link href={`/materialy/${mat.id}/edytuj`} className="text-[#4A6741] text-sm font-medium hover:underline">
                  Edytuj
                </Link>
              </div>
            </div>
          ))}
          {materialy.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#9B9B9B]">Brak materiałów. Dodaj pierwszy.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
