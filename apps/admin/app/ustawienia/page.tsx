import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function UstawieniaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, imie: true, rola: true, aktywny: true, ostatnieLogowanie: true },
  });

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <AdminSidebar active="ustawienia" adminImie={session.user.imie} />

      <main className="ml-56 flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-8">Ustawienia</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/ustawienia/logi"
            className="bg-white border border-[#D8D8D8] rounded-xl p-6 hover:border-[#4A6741] transition-colors flex items-center gap-4">
            <span className="text-3xl">🔒</span>
            <div>
              <p className="font-semibold text-[#1C1C1C]">Logi bezpieczeństwa</p>
              <p className="text-sm text-[#6B6B6B]">Przejrzyj próby logowania i alarmy</p>
            </div>
          </Link>
        </div>

        {session.user.rola === 'superadmin' && (
          <>
            <h2 className="text-lg font-semibold text-[#1C1C1C] mb-4">Konta administratorów</h2>
            <div className="bg-white border border-[#D8D8D8] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F6F1] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Imię</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Rola</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Ostatnie logowanie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {admins.map((admin) => (
                    <tr key={admin.id} className={`hover:bg-[#F8F6F1] ${admin.id === session.user.id ? 'bg-[#E8F0E4]/50' : ''}`}>
                      <td className="px-4 py-3 font-medium">{admin.imie} {admin.id === session.user.id && <span className="text-xs text-[#4A6741]">(ty)</span>}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{admin.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${admin.rola === 'superadmin' ? 'bg-[#E8F0E4] text-[#4A6741]' : 'bg-gray-100 text-gray-600'}`}>
                          {admin.rola}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${admin.aktywny ? 'text-green-600' : 'text-red-600'}`}>
                          {admin.aktywny ? 'aktywny' : 'dezaktywowany'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#9B9B9B] text-xs">
                        {admin.ostatnieLogowanie ? new Date(admin.ostatnieLogowanie).toLocaleString('pl-PL') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
