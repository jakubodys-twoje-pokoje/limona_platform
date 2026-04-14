import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@limona/db';
import { FormularzSchema } from '@/lib/validators';
import { obliczPoziomRyzyka } from '@/lib/ryzyko';
import { rateLimit } from '@/lib/rateLimit';
import { sendEmailNoweZgloszenie } from '@/lib/email';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';

  try {
    await rateLimit(`formularz:${ip}`, 10);
  } catch {
    return NextResponse.json({ error: 'Za dużo żądań. Spróbuj ponownie za 15 minut.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane.' }, { status: 400 });
  }

  const parsed = FormularzSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Błąd walidacji.', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const ryzyko = obliczPoziomRyzyka(data);

  const zgloszenie = await prisma.zgloszenie.create({
    data: {
      typNieruchomosci: data.typNieruchomosci,
      etapSprawy: data.etapSprawy,
      kwotaZadluzenia: data.kwotaZadluzenia,
      liczbaWierzycieli: data.liczbaWierzycieli,
      typZobowiazan: data.typZobowiazan,
      adresNieruchomosci: data.adresNieruchomosci,
      opisSytuacji: data.opisSytuacji,
      poziomRyzyka: ryzyko.poziom,
      ryzykoScore: ryzyko.score,
      ryzykoProcent: ryzyko.procent,
    },
  });

  // Wyślij powiadomienie do admina (fire-and-forget, nie blokuj response)
  sendEmailNoweZgloszenie({
    zgloszenieId: zgloszenie.id,
    typ: data.typNieruchomosci,
    etap: data.etapSprawy,
    poziomRyzyka: ryzyko.poziom,
  }).catch((e) => console.error('[email] sendEmailNoweZgloszenie failed:', e));

  return NextResponse.json(
    { id: zgloszenie.id, ryzyko },
    { status: 201 },
  );
}
