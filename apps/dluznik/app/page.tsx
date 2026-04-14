import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      {/* ─── NAV ─────────────────────────────────────────────────────── */}
      <nav className="bg-white sticky top-0 z-50 border-b border-[#D8D8D8]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-[#4A6741] text-xl">kluczdospokoju.pl</span>
          <Link
            href="/formularz"
            className="bg-[#4A6741] text-white px-5 py-2.5 rounded-[6px] text-sm font-semibold hover:bg-[#6B8F5E] transition-colors"
          >
            Sprawdź swoją sytuację
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-[#1C1C1C] leading-tight mb-6">
            Zadłużona nieruchomość?<br />
            Sprawdź, co możesz zrobić.
          </h1>
          <p className="text-xl text-[#6B6B6B] mb-10 leading-relaxed">
            Wypełnij krótki formularz — bezpłatnie — i dowiedz się, jaki jest poziom ryzyka Twojej sytuacji i jakie masz opcje wyjścia z zadłużenia.
          </p>
          <Link
            href="/formularz"
            className="inline-block bg-[#4A6741] text-white text-lg font-semibold px-10 py-4 rounded-[6px] hover:bg-[#6B8F5E] transition-colors shadow-lg"
          >
            Sprawdź swoją sytuację w 1 minutę
          </Link>
          <p className="mt-4 text-sm text-[#9B9B9B]">
            Bezpłatne, anonimowe, bez zobowiązań.
          </p>
        </div>
      </section>

      {/* ─── EMPATIA ──────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#E8F0E4]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-[#1C1C1C] mb-4">
                Jeśli tu trafiłeś, pewnie znasz to uczucie...
              </h2>
              <p className="text-[#6B6B6B] text-lg leading-relaxed mb-4">
                Wezwania komornicze, telefony od windykacji, strach przed utratą dachu nad głową. To przytłaczające — ale nie jest bez wyjścia.
              </p>
              <p className="text-[#6B6B6B] text-lg leading-relaxed mb-4">
                Setki osób w podobnej sytuacji znalazły rozwiązanie, które pozwoliło im spłacić część długów, zachować godność i zacząć od nowa.
              </p>
              <p className="text-[#4A6741] font-semibold text-lg">
                Cesja nieruchomości może być Twoim kluczem do spokoju.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-64 h-64 rounded-2xl bg-[#4A6741] flex items-center justify-center text-white text-6xl">
                🏠
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── JAK TO DZIAŁA ────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1C1C1C] text-center mb-12">Jak to działa?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Analiza',
                desc: 'Wypełniasz anonimowy formularz (8 pytań, 1 minuta). Opisujesz swoją sytuację.',
                icon: '📋',
              },
              {
                step: '02',
                title: 'Wynik',
                desc: 'Otrzymujesz bezpłatny wynik z poziomem ryzyka i ogólnymi wskazówkami.',
                icon: '📊',
              },
              {
                step: '03',
                title: 'Rozwiązanie',
                desc: 'Odblokowujesz pełną analizę z konkretnymi krokami i materiałami prawnymi.',
                icon: '✅',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#F8F6F1] border border-[#D8D8D8] rounded-xl p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-sm font-bold text-[#4A6741] mb-1">Krok {item.step}</div>
                <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">{item.title}</h3>
                <p className="text-[#6B6B6B] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#4A6741]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Zacznij działać teraz — to nic nie kosztuje
          </h2>
          <p className="text-[#E8F0E4] mb-8 text-lg">
            Bezpłatna analiza zajmuje mniej niż minutę. Bez rejestracji, bez podawania danych osobowych.
          </p>
          <Link
            href="/formularz"
            className="inline-block bg-white text-[#4A6741] text-lg font-bold px-10 py-4 rounded-[6px] hover:bg-[#E8F0E4] transition-colors shadow-lg"
          >
            Sprawdź swoją sytuację →
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-[#1C1C1C] text-[#9B9B9B] py-8 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} kluczdospokoju.pl — platforma Limona</p>
        <p className="mt-1">
          <Link href="/konsultacja" className="hover:text-white transition-colors">Konsultacja</Link>
          {' · '}
          <Link href="/api/gdpr/delete" className="hover:text-white transition-colors">RODO / Usuń dane</Link>
        </p>
      </footer>
    </main>
  );
}
