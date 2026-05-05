import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function LogiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const logi = await prisma.logBezpieczenstwa.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const typColor: Record<string, string> = {
    login_fail: 'bg-red-100 text-red-700',
    suspicious: 'bg-orange-100 text-orange-700',
    rate_limit: 'bg-yellow-100 text-yellow-700',
    payment: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <AdminSidebar active="ustawienia" adminImie={session.user.imie} />

      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/ustawienia" className="text-sm text-[#4A6741] hover:underline">← Ustawienia</Link>
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Logi bezpieczeństwa ({logi.length})</h1>
        </div>

        <div className="bg-white border border-[#D8D8D8] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F6F1] border-b border-[#D8D8D8]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Czas</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">IP</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Szczegóły</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {logi.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8F6F1]">
                  <td className="px-4 py-2 text-[#9B9B9B] text-xs">{new Date(log.createdAt).toLocaleString('pl-PL')}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typColor[log.typ] ?? 'bg-gray-100 text-gray-700'}`}>
                      {log.typ}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[#6B6B6B]">{log.email ?? '—'}</td>
                  <td className="px-4 py-2 text-[#9B9B9B] font-mono text-xs">{log.ip ?? '—'}</td>
                  <td className="px-4 py-2 text-[#9B9B9B] text-xs">{log.szczegoly ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logi.length === 0 && <p className="text-center py-8 text-[#9B9B9B]">Brak logów.</p>}
        </div>
      </main>
    </div>
  );
}
