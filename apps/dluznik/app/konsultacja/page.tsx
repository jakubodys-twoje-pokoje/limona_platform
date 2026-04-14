'use client';

import { useState } from 'react';

export default function KonsultacjaPage() {
  const [form, setForm] = useState({
    imieNazwisko: '',
    email: '',
    telefon: '',
    preferowany: '',
    opisProblemu: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/konsultacja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Błąd serwera.');
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center px-6">
        <div className="bg-white border border-[#D8D8D8] rounded-xl p-10 text-center max-w-md shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-3">Zapytanie wysłane!</h2>
          <p className="text-[#6B6B6B]">
            Skontaktujemy się z Tobą w ciągu 24 godzin roboczych. Sprawdź swój email.
          </p>
          <a href="/" className="inline-block mt-6 text-[#4A6741] font-medium hover:underline">
            Wróć do strony głównej
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-xl mx-auto">
          <span className="font-bold text-[#4A6741]">kluczdospokoju.pl</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">Bezpłatna konsultacja</h1>
        <p className="text-[#6B6B6B] mb-8">
          Wypełnij formularz, a nasz specjalista skontaktuje się z Tobą w ciągu 24 godzin.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#D8D8D8] rounded-xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">
              Imię i nazwisko *
            </label>
            <input
              name="imieNazwisko"
              value={form.imieNazwisko}
              onChange={handleChange}
              required
              className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
              placeholder="Jan Kowalski"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">
              Adres email *
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
              placeholder="jan@przykład.pl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">
              Numer telefonu *
            </label>
            <input
              name="telefon"
              type="tel"
              value={form.telefon}
              onChange={handleChange}
              required
              className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
              placeholder="+48 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">
              Preferowany termin konsultacji *
            </label>
            <input
              name="preferowany"
              value={form.preferowany}
              onChange={handleChange}
              required
              className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
              placeholder="np. Wtorek 15-17, Czwartek rano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">
              Krótki opis sytuacji (opcjonalnie)
            </label>
            <textarea
              name="opisProblemu"
              value={form.opisProblemu}
              onChange={handleChange}
              rows={4}
              className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741] resize-none"
              placeholder="Opisz swoją sytuację w kilku zdaniach..."
              maxLength={1000}
            />
          </div>

          <p className="text-xs text-[#9B9B9B]">
            Wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji konsultacji (RODO).
            Dane nie będą udostępniane osobom trzecim.
          </p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A6741] text-white py-4 rounded-[6px] font-bold hover:bg-[#6B8F5E] transition-colors disabled:opacity-60"
          >
            {loading ? 'Wysyłam...' : 'Umów konsultację →'}
          </button>
        </form>
      </main>
    </div>
  );
}
