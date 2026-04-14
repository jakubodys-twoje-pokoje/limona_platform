import Link from 'next/link';
import { prisma } from '@limona/db';

export const revalidate = 60;

export default async function HomePage() {
  const featuredOferty = await prisma.oferta.findMany({
    where: { status: 'aktywna' },
    orderBy: [{ wyrozniiona: 'desc' }, { createdAt: 'desc' }],
    take: 3,
  });

  return (
    <main>
      {/* NAV */}
      <nav className="bg-white sticky top-0 z-50 border-b border-[#D8D8D8]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-[#4A6741] text-xl">klubcesji.pl</span>
          <div className="flex items-center gap-3">
            <Link href="/logowanie" className="text-sm text-[#6B6B6B] hover:text-[#4A6741] font-medium">
              Zaloguj się
            </Link>
            <Link
              href="/rejestracja"
              className="bg-[#4A6741] text-white px-5 py-2.5 rounded-[6px] text-sm font-semibold hover:bg-[#6B8F5E] transition-colors"
            >
              Zarejestruj się
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-[#1C1C1C] leading-tight mb-6">
            Inwestuj w nieruchomości<br />z potencjałem.
          </h1>
          <p className="text-xl text-[#6B6B6B] mb-10 leading-relaxed">
            Sprawdzone cesje zadłużonych nieruchomości. Realne liczby, zweryfikowane oferty, transparentne transakcje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rejestracja"
              className="bg-[#4A6741] text-white text-lg font-semibold px-10 py-4 rounded-[6px] hover:bg-[#6B8F5E] transition-colors"
            >
              Dołącz do Klubu →
            </Link>
            <Link
              href="/logowanie"
              className="border-2 border-[#4A6741] text-[#4A6741] text-lg font-semibold px-10 py-4 rounded-[6px] hover:bg-[#E8F0E4] transition-colors"
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      </section>

      {/* JAK TO DZIAŁA */}
      <section className="py-16 px-6 bg-[#E8F0E4]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1C1C1C] text-center mb-12">Jak to działa?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Zarejestruj się', desc: 'Załóż konto i przejdź weryfikację administratora.', icon: '📝' },
              { step: '02', title: 'Wybierz abonament', desc: 'Miesięczny lub roczny dostęp do pełnej bazy ofert.', icon: '💳' },
              { step: '03', title: 'Przeglądaj oferty', desc: 'Filtruj, analizuj i kontaktuj się w sprawie wybranych nieruchomości.', icon: '🏠' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-sm font-bold text-[#4A6741] mb-1">Krok {item.step}</div>
                <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">{item.title}</h3>
                <p className="text-[#6B6B6B] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRZYKŁADOWE OFERTY */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1C1C1C] text-center mb-12">Przykładowe oferty</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredOferty.map((oferta) => (
              <div key={oferta.id} className="bg-[#F8F6F1] border border-[#D8D8D8] rounded-xl p-5 relative overflow-hidden">
                {oferta.wyrozniiona && (
                  <span className="absolute top-3 right-3 bg-[#4A6741] text-white text-xs px-2 py-0.5 rounded-full">
                    Wyróżniona
                  </span>
                )}
                <div className="h-36 bg-[#E8F0E4] rounded-lg flex items-center justify-center text-5xl mb-4">
                  {oferta.typ === 'mieszkanie' ? '🏢' : oferta.typ === 'dom' ? '🏠' : oferta.typ === 'dzialka' ? '🌿' : '🏪'}
                </div>
                <h3 className="font-semibold text-[#1C1C1C] mb-1 line-clamp-2">{oferta.tytul}</h3>
                <p className="text-[#6B6B6B] text-sm mb-3">{oferta.lokalizacja}</p>
                <div className="space-y-1 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#9B9B9B]">Wartość:</span>
                    <span className="font-medium">{oferta.wartoscNieruchomosci.toLocaleString('pl-PL')} zł</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9B9B9B]">Zadłużenie:</span>
                    <span className="font-medium">{oferta.kwotaZadluzenia.toLocaleString('pl-PL')} zł</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9B9B9B]">Pot. zysk:</span>
                    <span className="font-bold text-[#4A6741]">
                      {(oferta.potencjalnyZysk ?? 0).toLocaleString('pl-PL')} zł
                    </span>
                  </div>
                </div>
                <div className="blur-sm pointer-events-none">
                  <Link
                    href="/rejestracja"
                    className="block w-full text-center bg-[#4A6741] text-white py-2.5 rounded-[6px] text-sm font-semibold"
                  >
                    Zobacz szczegóły
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#9B9B9B] mt-6">
            Szczegóły ofert dostępne po zalogowaniu i aktywacji abonamentu.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#4A6741]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Gotowy do inwestowania?</h2>
          <p className="text-[#E8F0E4] mb-8 text-lg">
            Dołącz do inwestorów, którzy już korzystają z Klub Cesji.
          </p>
          <Link
            href="/rejestracja"
            className="inline-block bg-white text-[#4A6741] font-bold px-10 py-4 rounded-[6px] hover:bg-[#E8F0E4] transition-colors"
          >
            Zarejestruj się →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1C1C1C] text-[#9B9B9B] py-8 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} klubcesji.pl — platforma Limona</p>
      </footer>
    </main>
  );
}
