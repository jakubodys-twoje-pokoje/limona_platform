import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@limona/db';
import bcrypt from 'bcryptjs';
import { LoginSchema } from './validators';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      imie: string;
      nazwisko: string;
      rola: string;
      abonamentAktywny: boolean;
    };
  }
  interface User {
    id: string;
    email: string;
    imie: string;
    nazwisko: string;
    rola: string;
    abonamentAktywny: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Hasło', type: 'password' },
      },
      async authorize(credentials, req) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip =
          (req?.headers?.['x-forwarded-for'] as string) ?? 'unknown';

        const inwestor = await prisma.inwestor.findUnique({ where: { email } });

        if (!inwestor || !inwestor.aktywny) {
          await logFail(email, ip);
          return null;
        }

        // Check temporary lock
        if (inwestor.lockedUntil && inwestor.lockedUntil > new Date()) {
          return null;
        }

        const valid = await bcrypt.compare(password, inwestor.passwordHash);
        if (!valid) {
          await logFail(email, ip);
          await checkBruteForce(email);
          return null;
        }

        if (!inwestor.zweryfikowany) {
          // Account not yet verified by admin — return null with indicator
          return null;
        }

        await prisma.inwestor.update({
          where: { id: inwestor.id },
          data: { ostatnieLogowanie: new Date() },
        });

        return {
          id: inwestor.id,
          email: inwestor.email,
          imie: inwestor.imie,
          nazwisko: inwestor.nazwisko,
          rola: inwestor.rola,
          abonamentAktywny: inwestor.abonamentAktywny,
        };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.imie = user.imie;
        token.nazwisko = user.nazwisko;
        token.rola = user.rola;
        token.abonamentAktywny = user.abonamentAktywny;
      }
      // Refresh abonament status on each JWT refresh
      if (token.id) {
        const fresh = await prisma.inwestor.findUnique({
          where: { id: token.id as string },
          select: { abonamentAktywny: true, abonamentDo: true },
        });
        token.abonamentAktywny = fresh?.abonamentAktywny ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.imie = token.imie as string;
        session.user.nazwisko = token.nazwisko as string;
        session.user.rola = token.rola as string;
        session.user.abonamentAktywny = token.abonamentAktywny as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/logowanie',
    error: '/logowanie',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function logFail(email: string, ip: string) {
  await prisma.logBezpieczenstwa.create({
    data: { typ: 'login_fail', email, ip },
  });
}

async function checkBruteForce(email: string) {
  const WINDOW = 15 * 60 * 1000;
  const recent = await prisma.logBezpieczenstwa.count({
    where: {
      typ: 'login_fail',
      email,
      createdAt: { gte: new Date(Date.now() - WINDOW) },
    },
  });

  if (recent >= 5) {
    await prisma.inwestor.updateMany({
      where: { email },
      data: { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) },
    });
    // Alert admin (fire-and-forget)
    prisma.logBezpieczenstwa
      .create({
        data: {
          typ: 'suspicious',
          email,
          szczegoly: `Konto zablokowane po ${recent} nieudanych próbach logowania`,
        },
      })
      .catch(() => {});
  }
}
