import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@limona/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const BASE = process.env.NEXTAUTH_URL_INWESTOR ?? 'http://localhost:3001';

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nieautoryzowany.' }, { status: 401 });

  const inwestor = await prisma.inwestor.findUnique({ where: { id: session.user.id } });
  if (!inwestor?.stripeCustomerId) {
    return NextResponse.json({ error: 'Brak konta Stripe.' }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: inwestor.stripeCustomerId,
    return_url: `${BASE}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
