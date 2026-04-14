import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@limona/db';
import { rateLimit } from '@/lib/rateLimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const BASE_URL = process.env.NEXTAUTH_URL_DLUZNIK ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    await rateLimit(`stripe-checkout:${ip}`, 3);
  } catch {
    return NextResponse.json({ error: 'Za dużo żądań.' }, { status: 429 });
  }

  let body: { zgloszenieId: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane.' }, { status: 400 });
  }

  const { zgloszenieId, email } = body;

  if (!zgloszenieId || typeof zgloszenieId !== 'string') {
    return NextResponse.json({ error: 'Brak ID zgłoszenia.' }, { status: 400 });
  }

  const zgloszenie = await prisma.zgloszenie.findUnique({
    where: { id: zgloszenieId },
  });

  if (!zgloszenie) {
    return NextResponse.json({ error: 'Zgłoszenie nie istnieje.' }, { status: 404 });
  }

  if (zgloszenie.zaplacono) {
    return NextResponse.json({ url: `${BASE_URL}/materialy/${zgloszenieId}` });
  }

  // Zapisz email jeśli podany
  if (email && !zgloszenie.email) {
    await prisma.zgloszenie.update({
      where: { id: zgloszenieId },
      data: { email },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'blik', 'p24'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_JEDNORAZOWA!,
        quantity: 1,
      },
    ],
    customer_email: email ?? zgloszenie.email ?? undefined,
    metadata: { zgloszenieId },
    success_url: `${BASE_URL}/materialy/${zgloszenieId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/wynik/${zgloszenieId}?cancelled=1`,
    locale: 'pl',
  });

  await prisma.zgloszenie.update({
    where: { id: zgloszenieId },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
