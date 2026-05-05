import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    nowe_dzis,
    nowe_tydzien,
    nowe_miesiac,
    platnosci_dzis,
    platnosci_miesiac,
    aktywni_inwestorzy,
    oczekujace_konsultacje,
    ostatnieZgloszenia,
    ostatniLogi,
  ] = await Promise.all([
    prisma.zgloszenie.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.zgloszenie.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.zgloszenie.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.zgloszenie.count({ where: { zaplacono: true, zaplaconoAt: { gte: startOfDay } } }),
    prisma.zgloszenie.count({ where: { zaplacono: true, zaplaconoAt: { gte: startOfMonth } } }),
    prisma.inwestor.count({ where: { abonamentAktywny: true } }),
    prisma.konsultacja.count({ where: { status: 'oczekuje' } }),
    prisma.zgloszenie.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.logBezpieczenstwa.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const ryzykoColor: Record<string, string> = {
    niski: 'text-green-600',
    sredni: 'text-orange-600',
    wysoki: 'text-red-600',
    krytyczny: 'text-red-900 font-bold',
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <AdminSidebar active="dashboard" adminImie={session.user.imie} />
      <main className="ml-56 flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1C1C1C] mb-8">Dashboard</h1>

          {/* Widgety */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Zgłoszenia dziś', value: nowe_dzis, sub: `${nowe_tydzien} tym tydz.`, color: 'bg-blue-50 border-blue-200' },
              { label: 'Zgłoszenia w mies.', value: nowe_miesiac, sub: 'bieżący miesiąc', color: 'bg-purple-50 border-purple-200' },
              { label: 'Płatności dziś (szt.)', value: platnosci_dzis, sub: `${platnosci_miesiac} w mies.`, color: 'bg-[#E8F0E4] border-[#4A6741]/20' },
              { label: 'Aktywni inwestorzy', value: aktywni_inwestorzy, sub: 'z abonamentem', color: 'bg-[#E8F0E4] border-[#4A6741]/20' },
            ].map((w) => (
              <div key={w.label} className={`border rounded-xl p-5 ${w.color}`}>
                <p className="text-sm text-[#6B6B6B] mb-1">{w.label}</p>
                <p className="text-3xl font-bold text-[#1C1C1C]">{w.value}</p>
                <p className="text-xs text-[#9B9B9B] mt-1">{w.sub}</p>
              </div>
            ))}
          </div>

          {/* Alert konsultacje */}
          {oczekujace_konsultacje > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <p className="text-orange-700 font-medium">
                {oczekujace_konsultacje} oczekująca konsultacja{oczekujace_konsultacje > 1 ? 'e' : ''}
              </p>
              <Link href="/zgloszenia" className="text-sm text-orange-700 font-semibold hover:underline">
                Przejdź →
              </Link>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Ostatnie zgłoszenia */}
            <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#1C1C1C]">Ostatnie zgłoszenia</h2>
                <Link href="/zgloszenia" className="text-sm text-[#4A6741] hover:underline">Wszystkie →</Link>
              </div>
              <div className="space-y-3">
                {ostatnieZgloszenia.map((z) => (
                  <Link key={z.id} href={`/zgloszenia/${z.id}`}
                    className="flex items-center justify-between border border-[#D8D8D8] rounded-lg p-3 hover:border-[#4A6741] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#1C1C1C] capitalize">{z.typNieruchomosci}</p>
                      <p className="text-xs text-[#9B9B9B]">{new Date(z.createdAt).toLocaleDateString('pl-PL')}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${ryzykoColor[z.poziomRyzyka ?? ''] ?? 'text-[#9B9B9B]'}`}>
                        {z.poziomRyzyka ?? '—'}
                      </p>
                      <p className="text-xs text-[#9B9B9B]">{z.zaplacono ? '✅ opłacone' : 'bezpłatne'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Logi bezpieczeństwa */}
            <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#1C1C1C]">Logi bezpieczeństwa</h2>
                <Link href="/ustawienia/logi" className="text-sm text-[#4A6741] hover:underline">Wszystkie →</Link>
              </div>
              <div className="space-y-2">
                {ostatniLogi.map((log) => (
                  <div key={log.id} className="border border-[#D8D8D8] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.typ === 'login_fail' ? 'bg-red-100 text-red-700' : log.typ === 'suspicious' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                        {log.typ}
                      </span>
                      <span className="text-xs text-[#9B9B9B]">{new Date(log.createdAt).toLocaleString('pl-PL')}</span>
                    </div>
                    {log.email && <p className="text-xs text-[#6B6B6B] mt-1">{log.email}</p>}
                    {log.ip && <p className="text-xs text-[#9B9B9B]">IP: {log.ip}</p>}
                  </div>
                ))}
                {ostatniLogi.length === 0 && <p className="text-[#9B9B9B] text-sm">Brak logów.</p>}
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}
