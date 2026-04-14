import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? 'kontakt@kluczdospokoju.pl';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@limona.com.pl';

export async function sendEmailNoweZgloszenie(params: {
  zgloszenieId: string;
  typ: string;
  etap: string;
  poziomRyzyka: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Nowe zgłoszenie #${params.zgloszenieId} — ${params.typ} / ${params.etap}`,
    html: `
      <h2>Nowe zgłoszenie dłużnika</h2>
      <p><strong>ID:</strong> ${params.zgloszenieId}</p>
      <p><strong>Typ nieruchomości:</strong> ${params.typ}</p>
      <p><strong>Etap sprawy:</strong> ${params.etap}</p>
      <p><strong>Poziom ryzyka:</strong> ${params.poziomRyzyka}</p>
      <p><a href="${process.env.NEXTAUTH_URL_ADMIN}/zgloszenia/${params.zgloszenieId}">Otwórz w panelu admina</a></p>
    `,
  });
}

export async function sendEmailPotwierdzeniePlatnosci(params: {
  email: string;
  zgloszenieId: string;
  poziomRyzyka: string;
}) {
  const materialyUrl = `${process.env.NEXTAUTH_URL_DLUZNIK ?? 'http://localhost:3000'}/materialy/${params.zgloszenieId}`;

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: params.email,
      subject: 'Potwierdzenie dostępu — materiały Limona',
      html: `
        <h2>Dziękujemy za zakup!</h2>
        <p>Twój dostęp do pełnej analizy i materiałów edukacyjnych został aktywowany.</p>
        <p><strong>Poziom ryzyka Twojej sytuacji:</strong> ${params.poziomRyzyka}</p>
        <p><a href="${materialyUrl}" style="background:#4A6741;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px;">Przejdź do materiałów</a></p>
        <p style="color:#9B9B9B;font-size:14px;margin-top:24px;">Zachowaj ten link — pozwala odblokować materiały w dowolnym momencie.</p>
      `,
    }),
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Zakup materiałów #${params.zgloszenieId}`,
      html: `<p>Zgłoszenie <strong>#${params.zgloszenieId}</strong> opłacone (email: ${params.email}).</p>`,
    }),
  ]);
}

export async function sendEmailKonsultacja(params: {
  email: string;
  imieNazwisko: string;
  preferowany: string;
}) {
  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: params.email,
      subject: 'Potwierdzenie zapytania o konsultację — Limona',
      html: `
        <h2>Potwierdzenie zapytania o konsultację</h2>
        <p>Drogi/a ${params.imieNazwisko},</p>
        <p>Otrzymaliśmy Twoje zapytanie o konsultację z prawnikiem.</p>
        <p><strong>Preferowany termin:</strong> ${params.preferowany}</p>
        <p>Skontaktujemy się z Tobą w ciągu 24 godzin roboczych.</p>
        <p style="color:#9B9B9B;font-size:14px;">Zespół Limona / kluczdospokoju.pl</p>
      `,
    }),
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Prośba o konsultację od: ${params.imieNazwisko}`,
      html: `
        <p><strong>Imię i nazwisko:</strong> ${params.imieNazwisko}</p>
        <p><strong>Email:</strong> ${params.email}</p>
        <p><strong>Preferowany termin:</strong> ${params.preferowany}</p>
      `,
    }),
  ]);
}
