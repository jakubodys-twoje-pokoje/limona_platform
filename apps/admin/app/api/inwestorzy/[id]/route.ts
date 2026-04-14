import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@limona/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { sendEmailAktywacjaKonta } from '@/lib/email';

const UpdateSchema = z.object({
  aktywny: z.boolean().optional(),
  zweryfikowany: z.boolean().optional(),
  rola: z.enum(['inwestor', 'vip']).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nieautoryzowany.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Błąd walidacji.' }, { status: 422 });

  const prev = await prisma.inwestor.findUnique({ where: { id: params.id } });
  if (!prev) return NextResponse.json({ error: 'Nie znaleziono.' }, { status: 404 });

  const updated = await prisma.inwestor.update({
    where: { id: params.id },
    data: parsed.data,
  });

  // Send activation email when admin verifies account
  if (parsed.data.zweryfikowany === true && !prev.zweryfikowany) {
    sendEmailAktywacjaKonta({ email: updated.email, imie: updated.imie }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
