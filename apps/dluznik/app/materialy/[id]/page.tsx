import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';

interface Props {
  params: { id: string };
}

const kategoriaLabel: Record<string, string> = {
  prawo: 'Prawo i egzekucja',
  windykacja: 'Negocjacje i windykacja',
  opcje_wyjscia: 'Opcje wyjścia z zadłużenia',
  inne: 'Dodatkowe materiały',
};

const kategoriaIcon: Record<string, string> = {
  prawo: '⚖️',
  windykacja: '🤝',
  opcje_wyjscia: '🚪',
  inne: '📚',
};

const typIcon: Record<string, string> = {
  pdf: '📄',
  wideo: '🎬',
  artykul: '📰',
};

export default async function MaterialyPage({ params }: Props) {
  const zgloszenie = await prisma.zgloszenie.findUnique({
    where: { id: params.id },
    include: {
      materialy: {
        include: {
          material: true,
        },
        orderBy: {
          material: { kolejnosc: 'asc' },
        },
      },
    },
  });

  if (!zgloszenie) notFound();
  if (!zgloszenie.zaplacono) {
    redirect(`/platnosc/${params.id}`);
  }

  const poziom = zgloszenie.poziomRyzyka ?? 'sredni';

  const kolorMap: Record<string, string> = {
    niski: 'text-green-700 bg-green-50',
    sredni: 'text-orange-700 bg-orange-50',
    wysoki: 'text-red-700 bg-red-50',
    krytyczny: 'text-red-900 bg-red-100',
  };

  const labelMap: Record<string, string> = {
    niski: 'Niskie ryzyko',
    sredni: 'Średnie ryzyko',
    wysoki: 'Wysokie ryzyko',
    krytyczny: 'Ryzyko krytyczne',
  };

  // Group materials by category
  const byKategoria = zgloszenie.materialy.reduce(
    (acc, item) => {
      const kat = item.material.kategoria;
      if (!acc[kat]) acc[kat] = [];
      acc[kat].push(item.material);
      return acc;
    },
    {} as Record<string, (typeof zgloszenie.materialy)[number]['material'][]>,
  );

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="font-bold text-[#4A6741]">kluczdospokoju.pl</span>
          <Link href="/konsultacja" className="text-sm text-[#4A6741] font-medium hover:underline">
            Umów konsultację
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-bold text-[#1C1C1C] mb-2">
            Twoje materiały są gotowe ✅
          </h1>
          <p className="text-[#6B6B6B] mb-4">
            Poniżej znajdziesz pełną analizę swojej sytuacji oraz materiały edukacyjne dobrane pod Twój przypadek.
          </p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${kolorMap[poziom] ?? 'text-gray-700 bg-gray-100'}`}>
            {labelMap[poziom]}
          </span>
        </div>

        {/* Risk summary */}
        <div className="bg-[#E8F0E4] border border-[#4A6741]/20 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-[#4A6741] mb-3">Podsumowanie Twojej sytuacji</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3">
              <p className="text-[#9B9B9B] text-xs mb-0.5">Nieruchomość</p>
              <p className="font-medium text-[#1C1C1C] capitalize">{zgloszenie.typNieruchomosci}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-[#9B9B9B] text-xs mb-0.5">Etap sprawy</p>
              <p className="font-medium text-[#1C1C1C]">
                {zgloszenie.etapSprawy === 'jest_komornik'
                  ? 'Jest komornik'
                  : zgloszenie.etapSprawy === 'bez_komornika'
                  ? 'Bez komornika'
                  : 'Nieokreślony'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-[#9B9B9B] text-xs mb-0.5">Zadłużenie</p>
              <p className="font-medium text-[#1C1C1C]">{zgloszenie.kwotaZadluzenia?.replace(/_/g, ' ')}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-[#9B9B9B] text-xs mb-0.5">Wierzyciele</p>
              <p className="font-medium text-[#1C1C1C]">{zgloszenie.liczbaWierzycieli}</p>
            </div>
          </div>
        </div>

        {/* Materials by category */}
        {Object.keys(kategoriaLabel).map((kat) => {
          const mats = byKategoria[kat];
          if (!mats?.length) return null;
          return (
            <div key={kat} className="mb-8">
              <h2 className="text-xl font-bold text-[#1C1C1C] mb-4 flex items-center gap-2">
                {kategoriaIcon[kat]} {kategoriaLabel[kat]}
              </h2>
              <div className="space-y-4">
                {mats.map((mat) => (
                  <a
                    key={mat.id}
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white border border-[#D8D8D8] rounded-xl p-5 hover:border-[#4A6741] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{typIcon[mat.typ] ?? '📄'}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1C1C1C] mb-1">{mat.tytul}</h3>
                        {mat.opis && <p className="text-[#6B6B6B] text-sm">{mat.opis}</p>}
                        <p className="text-[#4A6741] text-sm font-medium mt-2">
                          {mat.typ === 'pdf' ? 'Pobierz PDF →' : mat.typ === 'wideo' ? 'Obejrzyj →' : 'Czytaj →'}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        {/* Consultation CTA */}
        <div className="bg-[#4A6741] rounded-xl p-8 text-center text-white mt-8">
          <h2 className="text-2xl font-bold mb-3">Chcesz porozmawiać z prawnikiem?</h2>
          <p className="text-[#E8F0E4] mb-6">
            Umów bezpłatną konsultację z naszym specjalistą ds. cesji nieruchomości.
          </p>
          <Link
            href="/konsultacja"
            className="inline-block bg-white text-[#4A6741] font-bold px-8 py-3 rounded-[6px] hover:bg-[#E8F0E4] transition-colors"
          >
            Umów konsultację →
          </Link>
        </div>
      </main>
    </div>
  );
}
