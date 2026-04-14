'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function PlatnoscPage() {
  const params = useParams<{ id: string }>();
  const zgloszenieId = params.id;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePay() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zgloszenieId, email: email || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Błąd serwera.');
      if (json.url) {
        window.location.href = json.url;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Wystąpił błąd. Spróbuj ponownie.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-xl mx-auto">
          <span className="font-bold text-[#4A6741]">kluczdospokoju.pl</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">Pełna analiza i materiały</h1>
        <p className="text-[#6B6B6B] mb-8">Jednorazowy dostęp — bezterminowy</p>

        <div className="bg-white border border-[#D8D8D8] rounded-xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h2 className="text-xl font-semibold text-[#1C1C1C] mb-6">Co otrzymasz?</h2>
          <ul className="space-y-3 mb-8">
            {[
              'Pełna analiza Twojej sytuacji z poziomem ryzyka',
              'Konkretne opcje wyjścia z zadłużenia',
              'Materiały PDF z przepisami i wzorami pism',
              'Wideo z poradami prawnymi',
              'Dostęp bez limitu czasu — wracaj kiedy chcesz',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-[#4A6741] mt-0.5 font-bold">✓</span>
                <span className="text-[#6B6B6B]">{item}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#D8D8D8] pt-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1">
                Adres email (opcjonalnie — do potwierdzenia)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.pl"
                className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 text-[#1C1C1C] placeholder-[#9B9B9B] focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-[#4A6741] text-white py-4 rounded-[6px] font-bold text-lg hover:bg-[#6B8F5E] transition-colors disabled:opacity-60"
            >
              {loading ? 'Przekierowuję...' : 'Zapłać 19,99 zł i odblokuj →'}
            </button>

            <p className="text-center text-xs text-[#9B9B9B] mt-3">
              Bezpieczna płatność przez Stripe · Karta, BLIK, Przelewy24
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href={`/wynik/${zgloszenieId}`}
            className="text-[#6B6B6B] text-sm hover:text-[#4A6741] transition-colors"
          >
            ← Wróć do bezpłatnego wyniku
          </a>
        </div>
      </main>
    </div>
  );
}
