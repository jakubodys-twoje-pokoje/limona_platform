import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { ryzykoOpisMap } from '@/lib/ryzyko';

interface Props {
  params: { id: string };
  searchParams: { cancelled?: string };
}

const kolorMap: Record<string, string> = {
  niski: 'bg-green-50 border-green-200 text-green-800',
  sredni: 'bg-orange-50 border-orange-200 text-orange-800',
  wysoki: 'bg-red-50 border-red-200 text-red-800',
  krytyczny: 'bg-red-100 border-red-300 text-red-900',
};

const barColor: Record<string, string> = {
  niski: 'bg-green-500',
  sredni: 'bg-orange-500',
  wysoki: 'bg-red-500',
  krytyczny: 'bg-red-800',
};

const labelMap: Record<string, string> = {
  niski: 'Niskie ryzyko',
  sredni: 'Średnie ryzyko',
  wysoki: 'Wysokie ryzyko',
  krytyczny: 'Ryzyko krytyczne',
};

export default async function WynikPage({ params, searchParams }: Props) {
  const zgloszenie = await prisma.zgloszenie.findUnique({
    where: { id: params.id },
  });

  if (!zgloszenie) notFound();

  const poziom = zgloszenie.poziomRyzyka ?? 'sredni';
  const procent = zgloszenie.ryzykoProcent ?? 50;
  const opis = ryzykoOpisMap[poziom] ?? '';
  const cancelled = searchParams.cancelled === '1';

  // Jeśli już zaplacono → przekieruj do materiałów (w server component nie możemy redirect, zwróć link)
  const zaplacono = zgloszenie.zaplacono;

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <span className="font-bold text-[#4A6741]">kluczdospokoju.pl</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {cancelled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-6 text-[#856404] text-sm">
            Płatność anulowana — możesz spróbować ponownie kiedy będziesz gotowy.
          </div>
        )}

        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">Wynik Twojej analizy</h1>
        <p className="text-[#6B6B6B] mb-8">
          Na podstawie Twoich odpowiedzi przygotowaliśmy wstępną ocenę sytuacji.
        </p>

        {/* Risk bar */}
        <div className={`rounded-xl p-6 border mb-8 ${kolorMap[poziom] ?? 'bg-gray-50 border-gray-200 text-gray-800'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Poziom ryzyka Twojej sytuacji</span>
            <span className="font-bold text-lg">{labelMap[poziom]}</span>
          </div>
          <div className="h-4 bg-white/50 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full ${barColor[poziom] ?? 'bg-gray-500'} rounded-full`}
              style={{ width: `${procent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs opacity-60">
            <span>Niskie</span>
            <span>Krytyczne</span>
          </div>
        </div>

        <p className="text-[#1C1C1C] font-medium text-lg mb-6">{opis}</p>

        {zaplacono ? (
          <Link
            href={`/materialy/${params.id}`}
            className="block w-full text-center bg-[#4A6741] text-white py-4 rounded-[6px] font-semibold hover:bg-[#6B8F5E] transition-colors mb-4"
          >
            Przejdź do swoich materiałów →
          </Link>
        ) : (
          <>
            {/* Free preview — blurred options */}
            <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 mb-6 relative overflow-hidden">
              <h3 className="font-semibold text-[#1C1C1C] mb-4">Ogólne opcje wyjścia z zadłużenia:</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-[#4A6741] mt-0.5">✓</span>
                  <span className="text-[#6B6B6B]">Cesja wierzytelności — przeniesienie zadłużenia na inwestora</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4A6741] mt-0.5">✓</span>
                  <div className="flex-1">
                    <span className="blur-sm select-none text-[#6B6B6B]">
                      Szczegółowa analiza opcji negocjacyjnych z Twoim wierzycielem...
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4A6741] mt-0.5">✓</span>
                  <div className="flex-1">
                    <span className="blur-sm select-none text-[#6B6B6B]">
                      Procedura ochrony nieruchomości przed licytacją komorniczą...
                    </span>
                  </div>
                </li>
              </ul>

              {/* Overlay CTA */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent flex flex-col items-center justify-end pb-6">
                <p className="text-[#1C1C1C] font-semibold mb-1">Odblokuj pełną analizę</p>
                <p className="text-[#6B6B6B] text-sm mb-4">
                  Konkretne kroki, materiały prawne i plan działania dopasowany do Twojej sytuacji.
                </p>
                <Link
                  href={`/platnosc/${params.id}`}
                  className="bg-[#4A6741] text-white px-8 py-3 rounded-[6px] font-semibold hover:bg-[#6B8F5E] transition-colors shadow-lg"
                >
                  Odblokuj za 19,99 zł →
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-[#9B9B9B] mb-8">
              Jednorazowa płatność · Dostęp bez limitu czasu
            </p>
          </>
        )}

        {/* Konsultacja CTA */}
        <div className="border border-[#D8D8D8] rounded-xl p-5 text-center bg-white">
          <p className="text-[#6B6B6B] text-sm mb-3">Wolisz najpierw porozmawiać z prawnikiem?</p>
          <Link
            href="/konsultacja"
            className="text-[#4A6741] font-semibold text-sm hover:underline"
          >
            Umów bezpłatną konsultację →
          </Link>
        </div>
      </main>
    </div>
  );
}
