import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@limona/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      imie: string;
      rola: string;
    };
  }
  interface User {
    id: string;
    email: string;
    imie: string;
    rola: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'admin-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Hasło', type: 'password' },
      },
      async authorize(credentials, req) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip = (req?.headers?.['x-forwarded-for'] as string) ?? 'unknown';

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin || !admin.aktywny) {
          await prisma.logBezpieczenstwa.create({ data: { typ: 'login_fail', email, ip } });
          return null;
        }

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) {
          await prisma.logBezpieczenstwa.create({ data: { typ: 'login_fail', email, ip } });
          return null;
        }

        await prisma.admin.update({
          where: { id: admin.id },
          data: { ostatnieLogowanie: new Date() },
        });

        return { id: admin.id, email: admin.email, imie: admin.imie, rola: admin.rola };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8h sessions for admin
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.imie = user.imie;
        token.rola = user.rola;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.imie = token.imie as string;
        session.user.rola = token.rola as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
