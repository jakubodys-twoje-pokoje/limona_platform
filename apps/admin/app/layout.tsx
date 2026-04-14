import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Limona Admin',
  description: 'Panel administracyjny platformy Limona',
  robots: { index: false, follow: false },
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
