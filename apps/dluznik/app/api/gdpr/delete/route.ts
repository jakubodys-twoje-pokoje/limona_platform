import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@limona/db';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';

const DeleteSchema = z.object({
  email: z.string().email(),
  zgloszenieId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    await rateLimit(`gdpr-delete:${ip}`, 3);
  } catch {
    return NextResponse.json({ error: 'Za dużo żądań.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane.' }, { status: 400 });
  }

  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Podaj prawidłowy adres email.' }, { status: 422 });
  }

  const { email, zgloszenieId } = parsed.data;

  if (zgloszenieId) {
    await prisma.zgloszenie.updateMany({
      where: { id: zgloszenieId, email },
      data: {
        email: null,
        telefon: null,
        adresNieruchomosci: null,
        opisSytuacji: null,
        notatkiAdmina: null,
      },
    });
  } else {
    await prisma.zgloszenie.updateMany({
      where: { email },
      data: {
        email: null,
        telefon: null,
        adresNieruchomosci: null,
        opisSytuacji: null,
      },
    });
  }

  // Usuń konsultacje
  await prisma.konsultacja.deleteMany({ where: { email } });

  return NextResponse.json({ success: true, message: 'Dane osobowe zostały usunięte zgodnie z RODO.' });
}
