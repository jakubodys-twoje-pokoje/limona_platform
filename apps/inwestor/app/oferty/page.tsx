import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';

const WOJEWODZTWA = [
  'dolnośląskie','kujawsko-pomorskie','lubelskie','lubuskie','łódzkie',
  'małopolskie','mazowieckie','opolskie','podkarpackie','podlaskie',
  'pomorskie','śląskie','świętokrzyskie','warmińsko-mazurskie','wielkopolskie','zachodniopomorskie',
];

interface SearchParams {
  typ?: string;
  wojewodztwo?: string;
  etap?: string;
  sort?: string;
}

export default async function OfertyPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/logowanie');
  if (!session.user.abonamentAktywny) redirect('/abonament');

  const where: Record<string, unknown> = { status: 'aktywna' };
  if (searchParams.typ) where.typ = searchParams.typ;
  if (searchParams.wojewodztwo) where.wojewodztwo = searchParams.wojewodztwo;
  if (searchParams.etap) where.etapEgzekucji = searchParams.etap;

  const sortMap: Record<string, object> = {
    newest: { createdAt: 'desc' },
    kwota_asc: { kwotaZadluzenia: 'asc' },
    zysk_desc: { potencjalnyZysk: 'desc' },
  };
  const orderBy = sortMap[searchParams.sort ?? 'newest'] ?? { createdAt: 'desc' };

  const oferty = await prisma.oferta.findMany({ where, orderBy, take: 50 });

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-[#4A6741]">klubcesji.pl</Link>
          <Link href="/api/auth/signout" className="text-sm text-[#6B6B6B] hover:text-[#4A6741]">Wyloguj</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-8">Oferty cesji ({oferty.length})</h1>

        {/* Filters */}
        <form className="bg-white border border-[#D8D8D8] rounded-xl p-4 mb-8 flex flex-wrap gap-3">
          <select name="typ" defaultValue={searchParams.typ ?? ''}
            className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4A6741]">
            <option value="">Wszystkie typy</option>
            <option value="mieszkanie">Mieszkanie</option>
            <option value="dom">Dom</option>
            <option value="dzialka">Działka</option>
            <option value="lokal">Lokal</option>
          </select>
          <select name="wojewodztwo" defaultValue={searchParams.wojewodztwo ?? ''}
            className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4A6741]">
            <option value="">Wszystkie województwa</option>
            {WOJEWODZTWA.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <select name="etap" defaultValue={searchParams.etap ?? ''}
            className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4A6741]">
            <option value="">Wszystkie etapy</option>
            <option value="bez_komornika">Bez komornika</option>
            <option value="jest_komornik">Komornik</option>
            <option value="licytacja">Licytacja</option>
          </select>
          <select name="sort" defaultValue={searchParams.sort ?? 'newest'}
            className="border border-[#D8D8D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4A6741]">
            <option value="newest">Najnowsze</option>
            <option value="kwota_asc">Kwota rosnąco</option>
            <option value="zysk_desc">Zysk malejąco</option>
          </select>
          <button type="submit" className="bg-[#4A6741] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6B8F5E] transition-colors">
            Filtruj
          </button>
        </form>

        {/* Oferty grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oferty.map((o) => (
            <Link key={o.id} href={`/oferty/${o.id}`}
              className="bg-white border border-[#D8D8D8] rounded-xl p-5 hover:border-[#4A6741] hover:shadow-md transition-all block">
              {o.wyrozniiona && (
                <span className="inline-block bg-[#4A6741] text-white text-xs px-2 py-0.5 rounded-full mb-2">
                  Wyróżniona
                </span>
              )}
              <div className="h-28 bg-[#E8F0E4] rounded-lg flex items-center justify-center text-4xl mb-3">
                {o.typ === 'mieszkanie' ? '🏢' : o.typ === 'dom' ? '🏠' : o.typ === 'dzialka' ? '🌿' : '🏪'}
              </div>
              <h3 className="font-semibold text-[#1C1C1C] mb-1 line-clamp-2 text-sm">{o.tytul}</h3>
              <p className="text-[#9B9B9B] text-xs mb-3">{o.lokalizacja}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9B9B9B]">Wartość:</span>
                  <span>{o.wartoscNieruchomosci.toLocaleString('pl-PL')} zł</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9B9B9B]">Zadłużenie:</span>
                  <span>{o.kwotaZadluzenia.toLocaleString('pl-PL')} zł</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9B9B9B]">Pot. zysk:</span>
                  <span className="font-bold text-[#4A6741]">{(o.potencjalnyZysk ?? 0).toLocaleString('pl-PL')} zł</span>
                </div>
              </div>
              <div className={`mt-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${o.etapEgzekucji === 'jest_komornik' ? 'bg-red-100 text-red-700' : o.etapEgzekucji === 'bez_komornika' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {o.etapEgzekucji === 'jest_komornik' ? 'Komornik' : o.etapEgzekucji === 'bez_komornika' ? 'Przed komornikiem' : o.etapEgzekucji}
              </div>
            </Link>
          ))}
        </div>

        {oferty.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#9B9B9B]">Brak ofert spełniających kryteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
