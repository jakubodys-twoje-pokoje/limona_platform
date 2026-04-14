import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'kontakt@klubcesji.pl';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@limona.com.pl';

export async function sendEmailNowyInwestor(params: { email: string; imie: string; nazwisko: string }) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Nowy inwestor do weryfikacji: ${params.email}`,
    html: `
      <h2>Nowy inwestor — wymaga weryfikacji</h2>
      <p><strong>Imię i nazwisko:</strong> ${params.imie} ${params.nazwisko}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p><a href="${process.env.NEXTAUTH_URL_ADMIN}/inwestorzy">Przejdź do panelu admina</a></p>
    `,
  });
}

export async function sendEmailAktywacjaKonta(params: { email: string; imie: string }) {
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: 'Twoje konto zostało aktywowane — Klub Cesji',
    html: `
      <h2>Twoje konto jest aktywne!</h2>
      <p>Cześć ${params.imie},</p>
      <p>Twoje konto w Klub Cesji zostało zweryfikowane i aktywowane przez naszego administratora.</p>
      <p>Możesz teraz się zalogować i wybrać plan abonamentowy.</p>
      <p><a href="${process.env.NEXTAUTH_URL_INWESTOR ?? 'http://localhost:3001'}/logowanie" style="background:#4A6741;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Zaloguj się</a></p>
    `,
  });
}

export async function sendEmailNowaOferta(params: {
  emails: string[];
  tytul: string;
  lokalizacja: string;
  ofertaId: string;
}) {
  const BASE = process.env.NEXTAUTH_URL_INWESTOR ?? 'http://localhost:3001';
  for (const email of params.emails) {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Nowa oferta: ${params.tytul} — ${params.lokalizacja}`,
      html: `
        <h2>Nowa oferta w Klub Cesji</h2>
        <p><strong>${params.tytul}</strong></p>
        <p>${params.lokalizacja}</p>
        <a href="${BASE}/oferty/${params.ofertaId}">Zobacz szczegóły →</a>
      `,
    }).catch(() => {}); // nie przerywaj wysyłki pozostałych
  }
}

export async function sendEmailWygasaAbonament(params: { email: string; imie: string; abonamentDo: Date }) {
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: 'Twój abonament wygasa za 7 dni — Klub Cesji',
    html: `
      <h2>Przypomnienie o wygaśnięciu abonamentu</h2>
      <p>Cześć ${params.imie},</p>
      <p>Twój abonament w Klub Cesji wygaśnie <strong>${params.abonamentDo.toLocaleDateString('pl-PL')}</strong>.</p>
      <p><a href="${process.env.NEXTAUTH_URL_INWESTOR ?? 'http://localhost:3001'}/abonament">Odnów abonament</a></p>
    `,
  });
}
