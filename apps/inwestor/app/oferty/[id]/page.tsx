import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';

export default async function OfertaDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/logowanie');
  if (!session.user.abonamentAktywny) redirect('/abonament');

  const oferta = await prisma.oferta.findUnique({ where: { id: params.id } });
  if (!oferta || oferta.status === 'robocza') notFound();

  // Log session view
  await prisma.sesjaOferty.create({
    data: { inwestorId: session.user.id, ofertaId: oferta.id },
  }).catch(() => {});

  const etapLabel: Record<string, string> = {
    bez_komornika: 'Przed komornikiem',
    jest_komornik: 'Postępowanie komornicze',
    licytacja: 'Licytacja komornicza',
    inne: 'Inne',
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/oferty" className="text-sm text-[#4A6741] hover:underline">← Wróć do ofert</Link>
          <Link href="/api/auth/signout" className="text-sm text-[#6B6B6B] hover:text-[#4A6741]">Wyloguj</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {oferta.wyrozniiona && (
          <span className="inline-block bg-[#4A6741] text-white text-xs px-3 py-1 rounded-full mb-4">
            Oferta wyróżniona
          </span>
        )}

        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">{oferta.tytul}</h1>
        <p className="text-[#6B6B6B] mb-8">{oferta.lokalizacja}, {oferta.wojewodztwo}</p>

        {/* Gallery placeholder */}
        <div className="h-64 bg-[#E8F0E4] rounded-xl flex items-center justify-center text-7xl mb-8">
          {oferta.typ === 'mieszkanie' ? '🏢' : oferta.typ === 'dom' ? '🏠' : oferta.typ === 'dzialka' ? '🌿' : '🏪'}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Financial table */}
          <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h2 className="font-semibold text-[#1C1C1C] mb-4">Dane finansowe</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[#F0F0F0]">
                <tr>
                  <td className="py-2 text-[#9B9B9B]">Wartość nieruchomości</td>
                  <td className="py-2 font-medium text-right">{oferta.wartoscNieruchomosci.toLocaleString('pl-PL')} zł</td>
                </tr>
                <tr>
                  <td className="py-2 text-[#9B9B9B]">Kwota zadłużenia</td>
                  <td className="py-2 font-medium text-right text-red-600">{oferta.kwotaZadluzenia.toLocaleString('pl-PL')} zł</td>
                </tr>
                <tr>
                  <td className="py-2 text-[#9B9B9B]">Cena minimalna</td>
                  <td className="py-2 font-medium text-right">{oferta.cenaMinimalna.toLocaleString('pl-PL')} zł</td>
                </tr>
                <tr>
                  <td className="py-2 text-[#9B9B9B]">Potencjalny zysk</td>
                  <td className="py-2 font-bold text-right text-[#4A6741]">{(oferta.potencjalnyZysk ?? 0).toLocaleString('pl-PL')} zł</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legal details */}
          <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h2 className="font-semibold text-[#1C1C1C] mb-4">Stan prawny</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[#9B9B9B]">Etap egzekucji</p>
                <p className="font-medium">{etapLabel[oferta.etapEgzekucji] ?? oferta.etapEgzekucji}</p>
              </div>
              <div>
                <p className="text-[#9B9B9B]">Liczba wierzycieli</p>
                <p className="font-medium">{oferta.liczbaWierzycieli}</p>
              </div>
              <div>
                <p className="text-[#9B9B9B]">Typ zobowiązań</p>
                <p className="font-medium">{oferta.typZobowiazan.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-[#D8D8D8] rounded-xl p-6 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h2 className="font-semibold text-[#1C1C1C] mb-3">Opis</h2>
          <p className="text-[#6B6B6B] leading-relaxed whitespace-pre-line">{oferta.opis}</p>
        </div>

        {/* CTA */}
        <div className="bg-[#4A6741] rounded-xl p-6 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Jestem zainteresowany</h2>
          <p className="text-[#E8F0E4] text-sm mb-4">
            Wyślij zapytanie — skontaktujemy się w ciągu 24 godzin.
          </p>
          <ContactButton ofertaId={oferta.id} ofertaTytul={oferta.tytul} />
        </div>
      </main>
    </div>
  );
}

function ContactButton({ ofertaId, ofertaTytul }: { ofertaId: string; ofertaTytul: string }) {
  return (
    <a
      href={`mailto:${process.env.ADMIN_EMAIL ?? 'admin@limona.com.pl'}?subject=Zainteresowanie ofertą: ${encodeURIComponent(ofertaTytul)}&body=ID oferty: ${ofertaId}%0D%0A%0D%0AChciałbym/chciałabym dowiedzieć się więcej o tej ofercie.`}
      className="inline-block bg-white text-[#4A6741] font-bold px-8 py-3 rounded-[6px] hover:bg-[#E8F0E4] transition-colors"
    >
      Wyślij zapytanie →
    </a>
  );
}
