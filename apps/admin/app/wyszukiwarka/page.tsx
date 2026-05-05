import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';
import { WyszukiwarkaClient } from './WyszukiwarkaClient';

export default async function WyszukiwarkaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <AdminSidebar active="wyszukiwarka" adminImie={session.user.imie} />
      <main className="ml-56 flex-1 p-8">
        <WyszukiwarkaClient />
      </main>
    </div>
  );
}
