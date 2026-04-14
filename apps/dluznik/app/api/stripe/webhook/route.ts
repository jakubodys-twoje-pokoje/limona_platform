import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@limona/db';
import { sendEmailPotwierdzeniePlatnosci } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Brak podpisu.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[stripe-webhook] Invalid signature:', err);
    return NextResponse.json({ error: 'Nieprawidłowy podpis.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const zgloszenieId = session.metadata?.zgloszenieId;

    if (!zgloszenieId) {
      console.error('[stripe-webhook] Brak zgloszenieId w metadata');
      return NextResponse.json({ received: true });
    }

    // Odblokuj materiały dla dłużnika
    const zgloszenie = await prisma.zgloszenie.update({
      where: { id: zgloszenieId },
      data: {
        zaplacono: true,
        zaplaconoAt: new Date(),
        stripePaymentId: session.payment_intent as string,
        stripeSessionId: session.id,
        email: session.customer_email ?? undefined,
      },
    });

    // Przypisz wszystkie aktywne materiały
    const materialy = await prisma.material.findMany({
      where: { aktywny: true },
    });

    for (const mat of materialy) {
      await prisma.zgloszenieUcesMaterialu.upsert({
        where: {
          zgloszenieId_materialId: { zgloszenieId, materialId: mat.id },
        },
        update: {},
        create: { zgloszenieId, materialId: mat.id },
      });
    }

    // Wyślij email potwierdzający
    if (zgloszenie.email) {
      sendEmailPotwierdzeniePlatnosci({
        email: zgloszenie.email,
        zgloszenieId,
        poziomRyzyka: zgloszenie.poziomRyzyka ?? 'nieznany',
      }).catch((e) => console.error('[email] potwierdzenie platnosci failed:', e));
    }
  }

  return NextResponse.json({ received: true });
}
