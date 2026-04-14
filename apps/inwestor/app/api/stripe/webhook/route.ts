import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@limona/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Brak podpisu.' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy podpis.' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;
      const inwestorId = session.metadata?.inwestorId;
      const plan = session.metadata?.plan;
      if (!inwestorId) break;

      // Get subscription end date
      let subEnd: Date | null = null;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        subEnd = new Date(sub.current_period_end * 1000);
      }

      await prisma.inwestor.update({
        where: { id: inwestorId },
        data: {
          abonamentAktywny: true,
          abonamentDo: subEnd,
          planAbonamentu: plan,
          stripeSubscriptionId: session.subscription as string,
        },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const inwestor = await prisma.inwestor.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!inwestor) break;
      const aktywny = sub.status === 'active' || sub.status === 'trialing';
      await prisma.inwestor.update({
        where: { id: inwestor.id },
        data: {
          abonamentAktywny: aktywny,
          abonamentDo: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.inwestor.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { abonamentAktywny: false, stripeSubscriptionId: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
