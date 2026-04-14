import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Klucz do Spokoju — wyjście z zadłużonej nieruchomości',
  description:
    'Masz zadłużoną nieruchomość? Sprawdź swoją sytuację w minutę i dowiedz się, jakie masz opcje.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-[#F8F6F1] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
