import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Klub Cesji — inwestuj w nieruchomości z potencjałem',
  description: 'Sprawdzone cesje nieruchomości zadłużonych. Realne liczby, zweryfikowane oferty.',
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
