'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
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
      setError('Nieprawidłowe dane logowania.');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Limona Admin</h1>
          <p className="text-[#9B9B9B] text-sm mt-1">Panel administracyjny</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-8 shadow-2xl space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              required autoFocus
              className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Hasło</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              required
              className="w-full border border-[#D8D8D8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#4A6741] text-white py-3 rounded-[6px] font-bold hover:bg-[#6B8F5E] transition-colors disabled:opacity-60"
          >
            {loading ? 'Loguję...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}
