import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';

export default async function PlatnosciPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  // Get all paid submissions and active subscriptions
  const oplacone = await prisma.zgloszenie.findMany({
    where: { zaplacono: true },
    orderBy: { zaplaconoAt: 'desc' },
    take: 100,
    select: { id: true, email: true, zaplaconoAt: true, poziomRyzyka: true, typNieruchomosci: true, stripePaymentId: true },
  });

  const subInwestorzy = await prisma.inwestor.findMany({
    where: { abonamentAktywny: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, email: true, imie: true, nazwisko: true, planAbonamentu: true, abonamentDo: true, stripeSubscriptionId: true },
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${item.href === '/platnosci' ? 'bg-[#4A6741] text-white' : 'hover:bg-white/10'}`}>
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

      <main className="ml-56 flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-8">Płatności</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#E8F0E4] border border-[#4A6741]/20 rounded-xl p-5">
            <p className="text-sm text-[#6B6B6B]">Jednorazowe płatności (łącznie)</p>
            <p className="text-3xl font-bold text-[#4A6741]">{oplacone.length} × 19,99 zł</p>
            <p className="text-sm text-[#6B6B6B] mt-1">= {(oplacone.length * 19.99).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
          </div>
          <div className="bg-[#E8F0E4] border border-[#4A6741]/20 rounded-xl p-5">
            <p className="text-sm text-[#6B6B6B]">Aktywne abonamenty</p>
            <p className="text-3xl font-bold text-[#4A6741]">{subInwestorzy.length}</p>
          </div>
        </div>

        {/* Jednorazowe */}
        <h2 className="text-lg font-semibold text-[#1C1C1C] mb-4">Płatności jednorazowe (dłużnicy)</h2>
        <div className="bg-white border border-[#D8D8D8] rounded-xl overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F6F1] border-b border-[#D8D8D8]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Data</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Kwota</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Stripe ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {oplacone.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F6F1]">
                  <td className="px-4 py-3 text-[#9B9B9B] text-xs">{p.zaplaconoAt ? new Date(p.zaplaconoAt).toLocaleDateString('pl-PL') : '—'}</td>
                  <td className="px-4 py-3">{p.email ?? '—'}</td>
                  <td className="px-4 py-3 text-[#6B6B6B] capitalize">{p.typNieruchomosci}</td>
                  <td className="px-4 py-3 font-medium text-[#4A6741]">19,99 zł</td>
                  <td className="px-4 py-3 text-[#9B9B9B] text-xs font-mono">{p.stripePaymentId?.slice(0, 20) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {oplacone.length === 0 && <p className="text-center py-8 text-[#9B9B9B]">Brak płatności.</p>}
        </div>

        {/* Abonamenty */}
        <h2 className="text-lg font-semibold text-[#1C1C1C] mb-4">Abonamenty inwestorów</h2>
        <div className="bg-white border border-[#D8D8D8] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F6F1] border-b border-[#D8D8D8]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Inwestor</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Ważny do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {subInwestorzy.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F8F6F1]">
                  <td className="px-4 py-3 font-medium">{inv.imie} {inv.nazwisko}</td>
                  <td className="px-4 py-3 text-[#6B6B6B]">{inv.email}</td>
                  <td className="px-4 py-3"><span className="bg-[#E8F0E4] text-[#4A6741] px-2 py-0.5 rounded-full text-xs">{inv.planAbonamentu}</span></td>
                  <td className="px-4 py-3 text-[#9B9B9B] text-xs">{inv.abonamentDo ? new Date(inv.abonamentDo).toLocaleDateString('pl-PL') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {subInwestorzy.length === 0 && <p className="text-center py-8 text-[#9B9B9B]">Brak aktywnych abonamentów.</p>}
        </div>
      </main>
    </div>
  );
}
