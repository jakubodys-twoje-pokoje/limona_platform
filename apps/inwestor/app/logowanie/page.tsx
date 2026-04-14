'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LogowaniaPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setError('Nieprawidłowy email lub hasło. Upewnij się, że konto jest aktywne.');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-[#4A6741]">klubcesji.pl</Link>
          <Link href="/rejestracja" className="text-sm text-[#6B6B6B] hover:text-[#4A6741]">
            Nie mam konta
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">Zaloguj się</h1>
          <p className="text-[#6B6B6B] mb-8">Panel inwestora Klub Cesji</p>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#D8D8D8] rounded-xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                required placeholder="twoj@email.pl"
                className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Hasło</label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                required placeholder="••••••••"
                className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#4A6741] text-white py-4 rounded-[6px] font-bold hover:bg-[#6B8F5E] transition-colors disabled:opacity-60"
            >
              {loading ? 'Loguję...' : 'Zaloguj się →'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9B9B9B] mt-4">
            Nie masz konta?{' '}
            <Link href="/rejestracja" className="text-[#4A6741] font-medium hover:underline">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
