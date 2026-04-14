'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RejestracjaPage() {
  const [form, setForm] = useState({
    imie: '', nazwisko: '', email: '', telefon: '',
    firma: '', nip: '', password: '', passwordConfirm: '', rodo: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: [] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/rejestracja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rodo: form.rodo }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.details?.fieldErrors) setErrors(json.details.fieldErrors);
        else setErrors({ _: [json.error ?? 'Błąd serwera.'] });
        return;
      }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center px-6">
        <div className="bg-white border border-[#D8D8D8] rounded-xl p-10 text-center max-w-md shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-3">Konto założone!</h2>
          <p className="text-[#6B6B6B]">
            Twoje konto oczekuje na weryfikację przez administratora. Otrzymasz email po aktywacji.
          </p>
          <Link href="/" className="inline-block mt-6 text-[#4A6741] font-medium hover:underline">
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    );
  }

  function field(name: string) {
    const errs = errors[name];
    return errs?.length ? errs[0] : undefined;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-[#4A6741]">klubcesji.pl</Link>
          <Link href="/logowanie" className="text-sm text-[#6B6B6B] hover:text-[#4A6741]">Mam już konto</Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">Rejestracja</h1>
        <p className="text-[#6B6B6B] mb-8">Załóż konto inwestora. Weryfikacja przez admina zajmuje do 24h.</p>

        {errors._ && <p className="text-red-500 text-sm mb-4">{errors._[0]}</p>}

        <form onSubmit={handleSubmit} className="bg-white border border-[#D8D8D8] rounded-xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Imię *" name="imie" value={form.imie} onChange={handleChange} error={field('imie')} />
            <Field label="Nazwisko *" name="nazwisko" value={form.nazwisko} onChange={handleChange} error={field('nazwisko')} />
          </div>
          <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} error={field('email')} />
          <Field label="Telefon" name="telefon" type="tel" value={form.telefon} onChange={handleChange} error={field('telefon')} placeholder="+48 123 456 789" />
          <Field label="Firma (opcjonalnie)" name="firma" value={form.firma} onChange={handleChange} />
          <Field label="NIP (opcjonalnie)" name="nip" value={form.nip} onChange={handleChange} />
          <Field label="Hasło *" name="password" type="password" value={form.password} onChange={handleChange} error={field('password')} placeholder="Min. 8 znaków, wielka litera, cyfra" />
          <Field label="Powtórz hasło *" name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} error={field('passwordConfirm')} />

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="rodo" checked={form.rodo} onChange={handleChange} className="mt-1 accent-[#4A6741] w-4 h-4" />
            <span className="text-sm text-[#6B6B6B]">
              Wyrażam zgodę na przetwarzanie moich danych osobowych przez Limona Sp. z o.o. w celu świadczenia usług platformy Klub Cesji (RODO). *
            </span>
          </label>
          {field('rodo') && <p className="text-red-500 text-xs">{field('rodo')}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A6741] text-white py-4 rounded-[6px] font-bold hover:bg-[#6B8F5E] transition-colors disabled:opacity-60"
          >
            {loading ? 'Rejestruję...' : 'Zarejestruj się →'}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder }: {
  label: string; name: string; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1C1C1C] mb-1">{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741] text-[#1C1C1C] placeholder-[#9B9B9B] ${error ? 'border-red-400' : 'border-[#D8D8D8]'}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
