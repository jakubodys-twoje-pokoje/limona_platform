import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@limona/db';
import { KonsultacjaSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rateLimit';
import { sendEmailKonsultacja } from '@/lib/email';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    await rateLimit(`konsultacja:${ip}`, 5);
  } catch {
    return NextResponse.json({ error: 'Za dużo żądań.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane.' }, { status: 400 });
  }

  const parsed = KonsultacjaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Błąd walidacji.', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  await prisma.konsultacja.create({
    data: {
      zgloszenieId: data.zgloszenieId,
      imieNazwisko: data.imieNazwisko,
      email: data.email,
      telefon: data.telefon,
      preferowany: data.preferowany,
      opisProblemu: data.opisProblemu,
    },
  });

  sendEmailKonsultacja({
    email: data.email,
    imieNazwisko: data.imieNazwisko,
    preferowany: data.preferowany,
  }).catch((e) => console.error('[email] konsultacja failed:', e));

  return NextResponse.json({ success: true }, { status: 201 });
}
