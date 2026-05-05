import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';

interface SearchParams {
  status?: string;
  poziom?: string;
  zaplacono?: string;
}

export default async function ZgloszeniaPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.poziom) where.poziomRyzyka = searchParams.poziom;
  if (searchParams.zaplacono === 'tak') where.zaplacono = true;
  if (searchParams.zaplacono === 'nie') where.zaplacono = false;

  const zgloszenia = await prisma.zgloszenie.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const ryzykoColor: Record<string, string> = {
    niski: 'bg-green-100 text-green-700',
    sredni: 'bg-orange-100 text-orange-700',
    wysoki: 'bg-red-100 text-red-700',
    krytyczny: 'bg-red-200 text-red-900',
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <AdminSidebar active="zgloszenia" adminImie={session.user.imie} />
      <main className="ml-56 flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-6">Zgłoszenia dłużników ({zgloszenia.length})</h1>

        {/* Filters */}
        <form className="bg-white border border-[#D8D8D8] rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          <select name="status" defaultValue={searchParams.status ?? ''}
            className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm">
            <option value="">Wszystkie statusy</option>
            <option value="nowe">Nowe</option>
            <option value="w_toku">W toku</option>
            <option value="zamkniete">Zamknięte</option>
          </select>
          <select name="poziom" defaultValue={searchParams.poziom ?? ''}
            className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm">
            <option value="">Wszystkie poziomy</option>
            <option value="niski">Niski</option>
            <option value="sredni">Średni</option>
            <option value="wysoki">Wysoki</option>
            <option value="krytyczny">Krytyczny</option>
          </select>
          <select name="zaplacono" defaultValue={searchParams.zaplacono ?? ''}
            className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm">
            <option value="">Wszystkie płatności</option>
            <option value="tak">Opłacone</option>
            <option value="nie">Nieopłacone</option>
          </select>
          <button type="submit" className="bg-[#4A6741] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6B8F5E]">
            Filtruj
          </button>
        </form>

        {/* Table */}
        <div className="bg-white border border-[#D8D8D8] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F6F1] border-b border-[#D8D8D8]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Data</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Etap</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Kwota</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Ryzyko</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Płatność</th>
                <th className="text-right px-4 py-3 font-medium text-[#6B6B6B]">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {zgloszenia.map((z) => (
                <tr key={z.id} className="hover:bg-[#F8F6F1] transition-colors">
                  <td className="px-4 py-3 text-[#9B9B9B] text-xs">{new Date(z.createdAt).toLocaleDateString('pl-PL')}</td>
                  <td className="px-4 py-3 font-medium capitalize">{z.typNieruchomosci}</td>
                  <td className="px-4 py-3 text-[#6B6B6B]">{z.etapSprawy.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-[#6B6B6B]">{z.kwotaZadluzenia.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    {z.poziomRyzyka ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ryzykoColor[z.poziomRyzyka] ?? 'bg-gray-100 text-gray-700'}`}>
                        {z.poziomRyzyka}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${z.status === 'nowe' ? 'bg-blue-100 text-blue-700' : z.status === 'w_toku' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {z.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {z.zaplacono ? <span className="text-green-600">✅</span> : <span className="text-[#9B9B9B]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/zgloszenia/${z.id}`} className="text-[#4A6741] text-xs font-medium hover:underline">
                      Podgląd
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {zgloszenia.length === 0 && (
            <p className="text-center py-8 text-[#9B9B9B]">Brak zgłoszeń.</p>
          )}
        </div>
      </main>
    </div>
  );
}

