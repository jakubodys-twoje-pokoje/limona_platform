import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@limona/db';
import { RejestracejaSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rateLimit';
import { sendEmailNowyInwestor } from '@/lib/email';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    await rateLimit(`rejestracja:${ip}`, 5);
  } catch {
    return NextResponse.json({ error: 'Za dużo żądań.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane.' }, { status: 400 });
  }

  const parsed = RejestracejaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Błąd walidacji.', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const existing = await prisma.inwestor.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: 'Konto z tym adresem email już istnieje.' }, { status: 409 });
  }

  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12');
  const passwordHash = await bcrypt.hash(data.password, rounds);

  const inwestor = await prisma.inwestor.create({
    data: {
      email: data.email,
      passwordHash,
      imie: data.imie,
      nazwisko: data.nazwisko,
      telefon: data.telefon || undefined,
      firma: data.firma || undefined,
      nip: data.nip || undefined,
      zweryfikowany: false, // Admin must verify
      aktywny: true,
    },
  });

  sendEmailNowyInwestor({
    email: inwestor.email,
    imie: inwestor.imie,
    nazwisko: inwestor.nazwisko,
  }).catch((e) => console.error('[email] nowyInwestor failed:', e));

  return NextResponse.json(
    { message: 'Konto zostało założone. Oczekuj na weryfikację przez administratora.' },
    { status: 201 },
  );
}
