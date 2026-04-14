import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/logowanie');

  const inwestor = await prisma.inwestor.findUnique({
    where: { id: session.user.id },
    include: {
      oferty: {
        include: { oferta: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!inwestor) redirect('/logowanie');

  const noweOferty = await prisma.oferta.findMany({
    where: { status: 'aktywna' },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const abonamentDo = inwestor.abonamentDo
    ? new Date(inwestor.abonamentDo).toLocaleDateString('pl-PL')
    : null;

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-[#4A6741]">klubcesji.pl</Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[#6B6B6B]">{inwestor.imie} {inwestor.nazwisko}</span>
            <Link href="/api/auth/signout" className="text-[#6B6B6B] hover:text-[#4A6741]">Wyloguj</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-6">Dashboard</h1>

        {/* Abonament status */}
        <div className={`rounded-xl p-5 mb-8 flex items-center justify-between ${inwestor.abonamentAktywny ? 'bg-[#E8F0E4] border border-[#4A6741]/20' : 'bg-orange-50 border border-orange-200'}`}>
          <div>
            <p className="font-semibold text-[#1C1C1C]">
              {inwestor.abonamentAktywny ? `Abonament aktywny (${inwestor.planAbonamentu})` : 'Brak aktywnego abonamentu'}
            </p>
            {abonamentDo && (
              <p className="text-sm text-[#6B6B6B]">Ważny do: {abonamentDo}</p>
            )}
            {!inwestor.abonamentAktywny && (
              <p className="text-sm text-orange-600">Aktywuj abonament, aby przeglądać oferty.</p>
            )}
          </div>
          {!inwestor.abonamentAktywny && (
            <Link
              href="/abonament"
              className="bg-[#4A6741] text-white px-5 py-2.5 rounded-[6px] text-sm font-semibold hover:bg-[#6B8F5E] transition-colors"
            >
              Kup abonament
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Nowe oferty */}
          <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1C]">Najnowsze oferty</h2>
              <Link href="/oferty" className="text-sm text-[#4A6741] hover:underline">Wszystkie →</Link>
            </div>
            <div className="space-y-3">
              {noweOferty.map((o) => (
                <Link
                  key={o.id}
                  href={`/oferty/${o.id}`}
                  className="block border border-[#D8D8D8] rounded-lg p-3 hover:border-[#4A6741] transition-colors"
                >
                  <p className="font-medium text-sm text-[#1C1C1C] line-clamp-1">{o.tytul}</p>
                  <p className="text-xs text-[#9B9B9B]">{o.lokalizacja}</p>
                </Link>
              ))}
              {noweOferty.length === 0 && (
                <p className="text-[#9B9B9B] text-sm">Brak ofert.</p>
              )}
            </div>
          </div>

          {/* Ulubione */}
          <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h2 className="font-semibold text-[#1C1C1C] mb-4">Ulubione oferty</h2>
            <div className="space-y-3">
              {inwestor.oferty.map((fav) => (
                <Link
                  key={fav.id}
                  href={`/oferty/${fav.ofertaId}`}
                  className="block border border-[#D8D8D8] rounded-lg p-3 hover:border-[#4A6741] transition-colors"
                >
                  <p className="font-medium text-sm text-[#1C1C1C] line-clamp-1">{fav.oferta.tytul}</p>
                  <p className="text-xs text-[#9B9B9B]">{fav.oferta.lokalizacja}</p>
                </Link>
              ))}
              {inwestor.oferty.length === 0 && (
                <p className="text-[#9B9B9B] text-sm">Nie masz jeszcze ulubionych ofert.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
