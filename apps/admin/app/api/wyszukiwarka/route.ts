import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@limona/db';
import { z } from 'zod';

const QuerySchema = z.object({
  imie: z.string().min(1),
  nazwisko: z.string().min(1),
  nip: z.string().optional(),
  krs: z.string().optional(),
});

interface CeidgEntry {
  imie?: string;
  nazwisko?: string;
  nip?: string;
  adresDzialalnosci?: {
    ulica?: string;
    miasto?: string;
    kodPocztowy?: string;
  };
  kontakt?: {
    telefon?: string;
    email?: string;
  };
  statusDzialalnosci?: string;
  nazwaDzialalnosci?: string;
}

interface KrsEntry {
  nazwa?: string;
  nip?: string;
  krs?: string;
  adres?: string;
  representants?: Array<{ imieNazwisko?: string; rola?: string }>;
}

interface BingWebPage {
  name?: string;
  url?: string;
  snippet?: string;
}

async function searchCeidg(imie: string, nazwisko: string, nip?: string) {
  try {
    const params = new URLSearchParams({ imie, nazwisko, limit: '10' });
    if (nip) params.set('nip', nip);

    const res = await fetch(
      `https://api.biznes.gov.pl/api/ceidg/v2/przedsiebiorcy?${params}`,
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return { source: 'ceidg', error: `HTTP ${res.status}`, results: [] };

    const data = await res.json();
    const entries: CeidgEntry[] = data.firma ?? data.results ?? [];

    return {
      source: 'ceidg',
      results: entries.map((e: CeidgEntry) => ({
        imie: e.imie,
        nazwisko: e.nazwisko,
        nip: e.nip,
        adres: e.adresDzialalnosci
          ? [e.adresDzialalnosci.ulica, e.adresDzialalnosci.miasto, e.adresDzialalnosci.kodPocztowy].filter(Boolean).join(', ')
          : undefined,
        telefon: e.kontakt?.telefon,
        email: e.kontakt?.email,
        status: e.statusDzialalnosci,
        nazwaDzialalnosci: e.nazwaDzialalnosci,
      })),
    };
  } catch (err) {
    return { source: 'ceidg', error: String(err), results: [] };
  }
}

async function searchKrs(phrase: string, krs?: string) {
  try {
    const params = new URLSearchParams({
      'criteria.phrase': phrase,
      'criteria.searchType': 'fullText',
    });
    if (krs) params.set('criteria.krs', krs);

    const res = await fetch(
      `https://wyszukiwarka-krs.ms.gov.pl/api/search?${params}`,
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return { source: 'krs', error: `HTTP ${res.status}`, results: [] };

    const data = await res.json();
    const entries: KrsEntry[] = data.odpis ?? data.items ?? [];

    return {
      source: 'krs',
      results: entries.map((e: KrsEntry) => ({
        nazwa: e.nazwa,
        nip: e.nip,
        krs: e.krs,
        adres: e.adres,
        reprezentanci: e.representants?.map((r: { imieNazwisko?: string; rola?: string }) => `${r.imieNazwisko ?? ''} (${r.rola ?? ''})`),
      })),
    };
  } catch (err) {
    return { source: 'krs', error: String(err), results: [] };
  }
}

async function searchBing(query: string) {
  const key = process.env.BING_SEARCH_API_KEY;
  if (!key) return { source: 'bing', skipped: true, results: [] };

  try {
    const res = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10&mkt=pl-PL`,
      { headers: { 'Ocp-Apim-Subscription-Key': key }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return { source: 'bing', error: `HTTP ${res.status}`, results: [] };

    const data = await res.json();
    return {
      source: 'bing',
      results: (data.webPages?.value ?? []).map((p: BingWebPage) => ({
        title: p.name,
        url: p.url,
        snippet: p.snippet,
      })),
    };
  } catch (err) {
    return { source: 'bing', error: String(err), results: [] };
  }
}

async function searchRejestrio(nip?: string, krs?: string, phrase?: string) {
  const key = process.env.REJESTR_IO_API_KEY;
  if (!key) return { source: 'rejestr_io', skipped: true, results: [] };

  try {
    const params = new URLSearchParams();
    if (nip) params.set('nip', nip);
    else if (krs) params.set('krs', krs);
    else if (phrase) params.set('name', phrase);

    const res = await fetch(
      `https://rejestr.io/api/v2/krs?${params}`,
      { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return { source: 'rejestr_io', error: `HTTP ${res.status}`, results: [] };

    const data = await res.json();
    return { source: 'rejestr_io', results: data.items ?? data.results ?? data };
  } catch (err) {
    return { source: 'rejestr_io', error: String(err), results: [] };
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = QuerySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 });

  const { imie, nazwisko, nip, krs } = parsed.data;
  const fullName = `${imie} ${nazwisko}`;

  const [ceidg, krsResult, bing, rejestrio] = await Promise.allSettled([
    searchCeidg(imie, nazwisko, nip),
    searchKrs(nip ?? krs ?? fullName, krs),
    searchBing(`${fullName} kontakt telefon email`),
    searchRejestrio(nip, krs, fullName),
  ]);

  const wyniki = {
    ceidg: ceidg.status === 'fulfilled' ? ceidg.value : { source: 'ceidg', error: 'promise rejected', results: [] },
    krs: krsResult.status === 'fulfilled' ? krsResult.value : { source: 'krs', error: 'promise rejected', results: [] },
    bing: bing.status === 'fulfilled' ? bing.value : { source: 'bing', error: 'promise rejected', results: [] },
    rejestr_io: rejestrio.status === 'fulfilled' ? rejestrio.value : { source: 'rejestr_io', error: 'promise rejected', results: [] },
  };

  // Save search to history
  await prisma.wyszukiwanieKontaktu.create({
    data: {
      imie,
      nazwisko,
      nip: nip ?? null,
      krs: krs ?? null,
      wyniki,
      adminId: session.user.id,
    },
  });

  return NextResponse.json({ wyniki, zapytanie: { imie, nazwisko, nip, krs } });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);

  const historia = await prisma.wyszukiwanieKontaktu.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, createdAt: true, imie: true, nazwisko: true, nip: true, krs: true, notatki: true },
  });

  return NextResponse.json({ historia });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, notatki } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'Brak id' }, { status: 400 });

  const updated = await prisma.wyszukiwanieKontaktu.update({
    where: { id },
    data: { notatki },
  });

  return NextResponse.json(updated);
}
