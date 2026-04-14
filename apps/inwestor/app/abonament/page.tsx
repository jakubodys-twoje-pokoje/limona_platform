'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AbonamentPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleSubscribe(plan: 'miesiecznie' | 'rocznie') {
    setLoading(plan);
    setError('');
    try {
      const res = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Błąd serwera.');
      if (json.url) window.location.href = json.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Błąd. Spróbuj ponownie.');
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading('portal');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } finally {
      setLoading(null);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <p className="text-[#6B6B6B]">
          <Link href="/logowanie" className="text-[#4A6741] underline">Zaloguj się</Link>, aby zarządzać abonamentem.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <nav className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-[#4A6741]">klubcesji.pl</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">Abonament</h1>
        <p className="text-[#6B6B6B] mb-10">Wybierz plan i uzyskaj dostęp do wszystkich ofert cesji.</p>

        {session.user.abonamentAktywny ? (
          <div className="bg-[#E8F0E4] border border-[#4A6741]/20 rounded-xl p-6 mb-6">
            <p className="font-semibold text-[#4A6741] text-lg mb-1">Twój abonament jest aktywny</p>
            <p className="text-[#6B6B6B] text-sm mb-4">Plan: {session.user.rola}</p>
            <button
              onClick={handlePortal}
              disabled={loading === 'portal'}
              className="border-2 border-[#4A6741] text-[#4A6741] px-6 py-2.5 rounded-[6px] font-semibold hover:bg-[#E8F0E4] transition-colors disabled:opacity-60"
            >
              {loading === 'portal' ? 'Przekierowuję...' : 'Zarządzaj abonamentem →'}
            </button>
          </div>
        ) : null}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Miesięczny */}
          <div className="bg-white border border-[#D8D8D8] rounded-xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-bold text-[#1C1C1C] mb-1">Miesięczny</h2>
            <p className="text-4xl font-bold text-[#4A6741] mb-1">99 zł</p>
            <p className="text-[#9B9B9B] text-sm mb-6">/ miesiąc, odnawialny automatycznie</p>
            <ul className="space-y-2 text-sm text-[#6B6B6B] mb-8">
              {['Pełny dostęp do bazy ofert', 'Nowe oferty na bieżąco', 'Filtrowanie i sortowanie', 'Wsparcie email'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-[#4A6741]">✓</span>{f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('miesiecznie')}
              disabled={!!loading || session.user.abonamentAktywny}
              className="w-full bg-[#4A6741] text-white py-3 rounded-[6px] font-semibold hover:bg-[#6B8F5E] transition-colors disabled:opacity-60"
            >
              {loading === 'miesiecznie' ? 'Przekierowuję...' : session.user.abonamentAktywny ? 'Aktywny' : 'Wybierz plan →'}
            </button>
          </div>

          {/* Roczny */}
          <div className="bg-white border-2 border-[#4A6741] rounded-xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.12)] relative">
            <span className="absolute -top-3 right-6 bg-[#4A6741] text-white text-xs px-3 py-1 rounded-full">
              Oszczędzasz 20%
            </span>
            <h2 className="text-xl font-bold text-[#1C1C1C] mb-1">Roczny</h2>
            <p className="text-4xl font-bold text-[#4A6741] mb-1">949 zł</p>
            <p className="text-[#9B9B9B] text-sm mb-6">/ rok (79 zł/mies.)</p>
            <ul className="space-y-2 text-sm text-[#6B6B6B] mb-8">
              {['Wszystko z planu miesięcznego', 'Priorytetowe powiadomienia o ofertach', 'Dostęp do ofert VIP', 'Wsparcie priorytetowe'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-[#4A6741]">✓</span>{f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('rocznie')}
              disabled={!!loading || session.user.abonamentAktywny}
              className="w-full bg-[#4A6741] text-white py-3 rounded-[6px] font-semibold hover:bg-[#6B8F5E] transition-colors disabled:opacity-60"
            >
              {loading === 'rocznie' ? 'Przekierowuję...' : session.user.abonamentAktywny ? 'Aktywny' : 'Wybierz plan →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
