import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'admin@limona.com.pl';

export async function sendEmailAktywacjaKonta(params: { email: string; imie: string }) {
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: 'Twoje konto zostało aktywowane — Klub Cesji',
    html: `
      <h2>Twoje konto jest aktywne!</h2>
      <p>Cześć ${params.imie},</p>
      <p>Twoje konto zostało zweryfikowane. Możesz teraz się zalogować.</p>
      <p><a href="${process.env.NEXTAUTH_URL_INWESTOR ?? 'http://localhost:3001'}/logowanie">Zaloguj się →</a></p>
    `,
  });
}
