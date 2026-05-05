import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function AdminOfertyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const oferty = await prisma.oferta.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const statusColor: Record<string, string> = {
    aktywna: 'bg-green-100 text-green-700',
    zarezerwowana: 'bg-yellow-100 text-yellow-700',
    zamknieta: 'bg-gray-100 text-gray-600',
    robocza: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <AdminSidebar active="oferty" adminImie={session.user.imie} />

      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Oferty ({oferty.length})</h1>
          <Link href="/oferty/nowa"
            className="bg-[#4A6741] text-white px-5 py-2.5 rounded-[6px] text-sm font-semibold hover:bg-[#6B8F5E] transition-colors">
            + Dodaj ofertę
          </Link>
        </div>

        <div className="bg-white border border-[#D8D8D8] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F6F1] border-b border-[#D8D8D8]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Tytuł</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Lokalizacja</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Wartość</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Wyróżniona</th>
                <th className="text-right px-4 py-3 font-medium text-[#6B6B6B]">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {oferty.map((o) => (
                <tr key={o.id} className="hover:bg-[#F8F6F1]">
                  <td className="px-4 py-3 font-medium max-w-xs">
                    <span className="line-clamp-1">{o.tytul}</span>
                  </td>
                  <td className="px-4 py-3 capitalize text-[#6B6B6B]">{o.typ}</td>
                  <td className="px-4 py-3 text-[#9B9B9B]">{o.lokalizacja}</td>
                  <td className="px-4 py-3 font-medium">{o.wartoscNieruchomosci.toLocaleString('pl-PL')} zł</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{o.wyrozniiona ? '⭐' : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/oferty/${o.id}/edytuj`} className="text-[#4A6741] text-xs font-medium hover:underline">
                      Edytuj
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {oferty.length === 0 && <p className="text-center py-8 text-[#9B9B9B]">Brak ofert.</p>}
        </div>
      </main>
    </div>
  );
}
