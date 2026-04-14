import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@limona/db';
import { rateLimit } from '@/lib/rateLimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const BASE = process.env.NEXTAUTH_URL_INWESTOR ?? 'http://localhost:3001';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  try { await rateLimit(`subscription:${ip}`, 5); } catch {
    return NextResponse.json({ error: 'Za dużo żądań.' }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nieautoryzowany.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan: 'miesiecznie' | 'rocznie' = body.plan;
  if (!['miesiecznie', 'rocznie'].includes(plan)) {
    return NextResponse.json({ error: 'Nieprawidłowy plan.' }, { status: 400 });
  }

  const inwestor = await prisma.inwestor.findUnique({ where: { id: session.user.id } });
  if (!inwestor) return NextResponse.json({ error: 'Nie znaleziono konta.' }, { status: 404 });

  // Get or create Stripe customer
  let customerId = inwestor.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: inwestor.email,
      name: `${inwestor.imie} ${inwestor.nazwisko}`,
      metadata: { inwestorId: inwestor.id },
    });
    customerId = customer.id;
    await prisma.inwestor.update({
      where: { id: inwestor.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId = plan === 'rocznie'
    ? process.env.STRIPE_PRICE_ROCZNIE!
    : process.env.STRIPE_PRICE_MIESIECZNIE!;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { inwestorId: inwestor.id, plan },
    success_url: `${BASE}/dashboard?subscribed=1`,
    cancel_url: `${BASE}/abonament?cancelled=1`,
    locale: 'pl',
  });

  return NextResponse.json({ url: checkoutSession.url });
}
