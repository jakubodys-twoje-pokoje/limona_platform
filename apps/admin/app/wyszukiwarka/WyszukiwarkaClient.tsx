'use client';

import { useState } from 'react';

interface SearchResult {
  source: string;
  skipped?: boolean;
  error?: string;
  results: Record<string, unknown>[];
}

interface Wyniki {
  ceidg: SearchResult;
  krs: SearchResult;
  google: SearchResult;
  rejestr_io: SearchResult;
}

interface HistoriaEntry {
  id: string;
  createdAt: string;
  imie: string;
  nazwisko: string;
  nip?: string;
  krs?: string;
  notatki?: string;
}

const str = (v: unknown): string => (v != null ? String(v) : '');

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    ceidg: 'bg-blue-100 text-blue-700',
    krs: 'bg-purple-100 text-purple-700',
    google: 'bg-orange-100 text-orange-700',
    rejestr_io: 'bg-[#E8F0E4] text-[#4A6741]',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[source] ?? 'bg-gray-100 text-gray-600'}`}>
      {source.toUpperCase().replace('_', '.')}
    </span>
  );
}

function ResultCard({ result, source }: { result: Record<string, unknown>; source: string }) {
  if (source === 'ceidg') {
    const status = str(result.status);
    return (
      <div className="border border-[#D8D8D8] rounded-lg p-4 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <SourceBadge source="ceidg" />
          <span className="font-semibold text-[#1C1C1C]">{str(result.imie)} {str(result.nazwisko)}</span>
          {status && (
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${status === 'AKTYWNA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {status}
            </span>
          )}
        </div>
        {str(result.nazwaDzialalnosci) && <p className="text-sm text-[#1C1C1C] font-medium">{str(result.nazwaDzialalnosci)}</p>}
        {str(result.nip) && <p className="text-xs text-[#6B6B6B]">NIP: <span className="font-mono">{str(result.nip)}</span></p>}
        {str(result.adres) && <p className="text-xs text-[#6B6B6B]">📍 {str(result.adres)}</p>}
        {str(result.telefon) && (
          <p className="text-sm text-[#4A6741] font-medium">
            📞 <a href={`tel:${str(result.telefon)}`} className="hover:underline">{str(result.telefon)}</a>
          </p>
        )}
        {str(result.email) && (
          <p className="text-sm text-[#4A6741] font-medium">
            ✉️ <a href={`mailto:${str(result.email)}`} className="hover:underline">{str(result.email)}</a>
          </p>
        )}
      </div>
    );
  }

  if (source === 'krs') {
    const rep = result.reprezentanci as string[] | undefined;
    return (
      <div className="border border-[#D8D8D8] rounded-lg p-4 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <SourceBadge source="krs" />
          <span className="font-semibold text-[#1C1C1C]">{str(result.nazwa)}</span>
        </div>
        {str(result.nip) && <p className="text-xs text-[#6B6B6B]">NIP: <span className="font-mono">{str(result.nip)}</span></p>}
        {str(result.krs) && <p className="text-xs text-[#6B6B6B]">KRS: <span className="font-mono">{str(result.krs)}</span></p>}
        {str(result.adres) && <p className="text-xs text-[#6B6B6B]">📍 {str(result.adres)}</p>}
        {rep && rep.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-[#9B9B9B] mb-1">Reprezentanci:</p>
            {rep.map((r, i) => <p key={i} className="text-xs text-[#6B6B6B]">• {r}</p>)}
          </div>
        )}
      </div>
    );
  }

  const urlStr = str(result.url);
  const titleStr = str(result.title) || str(result.nazwa) || urlStr;
  const snippetStr = str(result.snippet);
  return (
    <div className="border border-[#D8D8D8] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <SourceBadge source={source} />
        {urlStr ? (
          <a href={urlStr} target="_blank" rel="noopener noreferrer"
            className="text-sm font-medium text-[#4A6741] hover:underline truncate">
            {titleStr}
          </a>
        ) : (
          <span className="text-sm font-medium">{titleStr}</span>
        )}
      </div>
      {snippetStr && <p className="text-xs text-[#6B6B6B] line-clamp-2">{snippetStr}</p>}
    </div>
  );
}

function QuickLinks({ imie, nazwisko, nip, krs }: { imie: string; nazwisko: string; nip?: string; krs?: string }) {
  const name = encodeURIComponent(`${imie} ${nazwisko}`);
  const links = [
    { label: 'CEIDG', url: `https://www.biznes.gov.pl/pl/wyszukiwarka-firm?phrase=${name}` },
    { label: 'KRS', url: `https://wyszukiwarka-krs.ms.gov.pl/?criteria.phrase=${name}` },
    { label: 'Google', url: `https://www.google.com/search?q=${name}+kontakt+telefon+email` },
    { label: 'Facebook', url: `https://www.facebook.com/search/people/?q=${name}` },
    { label: 'LinkedIn', url: `https://www.linkedin.com/search/results/people/?keywords=${name}` },
    ...(nip ? [{ label: 'NIP→KRS', url: `https://wyszukiwarka-krs.ms.gov.pl/?criteria.nip=${encodeURIComponent(nip)}` }] : []),
    ...(krs ? [{ label: 'KRS numer', url: `https://wyszukiwarka-krs.ms.gov.pl/?criteria.krs=${encodeURIComponent(krs)}` }] : []),
  ];

  return (
    <div className="bg-white border border-[#D8D8D8] rounded-xl p-4">
      <p className="text-xs text-[#9B9B9B] font-medium mb-3 uppercase tracking-wide">Szybkie linki</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 border border-[#D8D8D8] rounded-lg text-sm text-[#4A6741] hover:border-[#4A6741] hover:bg-[#E8F0E4] transition-colors">
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

function ResultSection({ title, sourceKey, data }: { title: string; sourceKey: string; data: SearchResult }) {
  if (data.skipped) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
        {title} pominięty — brak klucza API w <code className="font-mono text-xs">.env</code>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <SourceBadge source={sourceKey} />
        <span className="text-sm font-medium text-[#1C1C1C]">{title}</span>
        {data.error && <span className="text-xs text-red-500 ml-auto">Błąd: {data.error}</span>}
        <span className="text-xs text-[#9B9B9B] ml-auto">{data.results?.length ?? 0} wyników</span>
      </div>
      {data.results?.length > 0 ? (
        <div className="space-y-3">
          {data.results.map((r, i) => <ResultCard key={i} result={r} source={sourceKey} />)}
        </div>
      ) : (
        <p className="text-sm text-[#9B9B9B] bg-white border border-[#D8D8D8] rounded-xl p-4">
          {data.error ? `Nie udało się pobrać danych.` : `Brak wyników.`}
        </p>
      )}
    </section>
  );
}

export function WyszukiwarkaClient() {
  const [imie, setImie] = useState('');
  const [nazwisko, setNazwisko] = useState('');
  const [nip, setNip] = useState('');
  const [krs, setKrs] = useState('');
  const [loading, setLoading] = useState(false);
  const [wyniki, setWyniki] = useState<Wyniki | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState({ imie: '', nazwisko: '', nip: '', krs: '' });
  const [historia, setHistoria] = useState<HistoriaEntry[]>([]);
  const [showHistoria, setShowHistoria] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!imie.trim() || !nazwisko.trim()) return;

    setLoading(true);
    setError('');
    setWyniki(null);

    try {
      const res = await fetch('/api/wyszukiwarka', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imie: imie.trim(),
          nazwisko: nazwisko.trim(),
          nip: nip.trim() || undefined,
          krs: krs.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Błąd wyszukiwania');
      setWyniki(data.wyniki);
      setSearched({ imie: imie.trim(), nazwisko: nazwisko.trim(), nip: nip.trim(), krs: krs.trim() });
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadHistoria() {
    const res = await fetch('/api/wyszukiwarka?limit=20');
    const data = await res.json();
    setHistoria(data.historia ?? []);
    setShowHistoria(true);
  }

  async function saveNotatka(id: string, note: string) {
    await fetch('/api/wyszukiwarka', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notatki: note }),
    });
  }

  const totalResults = wyniki
    ? Object.values(wyniki).reduce((sum, s) => sum + (s.results?.length ?? 0), 0)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Wyszukiwarka kontaktów</h1>
        <button onClick={loadHistoria}
          className="text-sm text-[#4A6741] border border-[#4A6741]/30 px-3 py-1.5 rounded-lg hover:bg-[#E8F0E4] transition-colors">
          Historia wyszukań
        </button>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white border border-[#D8D8D8] rounded-xl p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Imię *</label>
            <input value={imie} onChange={(e) => setImie(e.target.value)} required placeholder="np. Jan"
              className="w-full border border-[#D8D8D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#4A6741]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Nazwisko *</label>
            <input value={nazwisko} onChange={(e) => setNazwisko(e.target.value)} required placeholder="np. Kowalski"
              className="w-full border border-[#D8D8D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#4A6741]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6B6B] mb-1">NIP <span className="text-[#9B9B9B]">(opcjonalnie)</span></label>
            <input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="np. 1234567890"
              className="w-full border border-[#D8D8D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#4A6741] font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6B6B] mb-1">KRS <span className="text-[#9B9B9B]">(opcjonalnie)</span></label>
            <input value={krs} onChange={(e) => setKrs(e.target.value)} placeholder="np. 0000123456"
              className="w-full border border-[#D8D8D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#4A6741] font-mono" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading}
            className="bg-[#4A6741] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6B8F5E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Wyszukuję…' : '🔍 Szukaj'}
          </button>
          <p className="text-xs text-[#9B9B9B]">Przeszukuje CEIDG, KRS, Google i rejestr.io jednocześnie</p>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">{error}</div>
      )}

      {/* Quick links after search */}
      {searched.imie && (
        <div className="mb-6">
          <QuickLinks imie={searched.imie} nazwisko={searched.nazwisko} nip={searched.nip || undefined} krs={searched.krs || undefined} />
        </div>
      )}

      {/* Results */}
      {wyniki && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-[#1C1C1C]">Wyniki dla: {searched.imie} {searched.nazwisko}</h2>
            <span className="bg-[#E8F0E4] text-[#4A6741] text-xs px-2 py-0.5 rounded-full">{totalResults} wyników</span>
          </div>

          <ResultSection title="CEIDG — działalność gospodarcza" sourceKey="ceidg" data={wyniki.ceidg} />
          <ResultSection title="KRS — spółki i organizacje" sourceKey="krs" data={wyniki.krs} />
          <ResultSection title="Google — wyniki webowe" sourceKey="google" data={wyniki.google} />
          <ResultSection title="rejestr.io — zagregowane dane" sourceKey="rejestr_io" data={wyniki.rejestr_io} />
        </div>
      )}

      {/* Historia */}
      {showHistoria && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1C1C1C]">Historia wyszukań</h2>
            <button onClick={() => setShowHistoria(false)} className="text-xs text-[#9B9B9B] hover:text-[#1C1C1C]">Ukryj</button>
          </div>
          <div className="bg-white border border-[#D8D8D8] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F6F1] border-b border-[#D8D8D8]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Imię i nazwisko</th>
                  <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">NIP / KRS</th>
                  <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Notatki</th>
                  <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {historia.map((h) => (
                  <tr key={h.id} className="hover:bg-[#F8F6F1]">
                    <td className="px-4 py-3 text-[#9B9B9B] text-xs">{new Date(h.createdAt).toLocaleDateString('pl-PL')}</td>
                    <td className="px-4 py-3 font-medium">{h.imie} {h.nazwisko}</td>
                    <td className="px-4 py-3 text-[#9B9B9B] font-mono text-xs">{h.nip ?? h.krs ?? '—'}</td>
                    <td className="px-4 py-3">
                      <input
                        defaultValue={h.notatki ?? ''}
                        onBlur={(e) => saveNotatka(h.id, e.target.value)}
                        placeholder="Dodaj notatkę…"
                        className="w-full text-xs border border-transparent hover:border-[#D8D8D8] focus:border-[#4A6741] rounded px-2 py-1 outline-none bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setImie(h.imie);
                          setNazwisko(h.nazwisko);
                          setNip(h.nip ?? '');
                          setKrs(h.krs ?? '');
                          setShowHistoria(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-[#4A6741] text-xs hover:underline">
                        Szukaj ponownie
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historia.length === 0 && <p className="text-center py-8 text-[#9B9B9B]">Brak historii.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
