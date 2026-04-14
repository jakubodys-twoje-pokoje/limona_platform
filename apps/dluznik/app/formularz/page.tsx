'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface FormState {
  typNieruchomosci: string;
  etapSprawy: string;
  kwotaZadluzenia: string;
  liczbaWierzycieli: string;
  typZobowiazan: string[];
  adresNieruchomosci: string;
  opisSytuacji: string;
}

const TOTAL_STEPS = 8;

export default function FormularzPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    typNieruchomosci: '',
    etapSprawy: '',
    kwotaZadluzenia: '',
    liczbaWierzycieli: '',
    typZobowiazan: [],
    adresNieruchomosci: '',
    opisSytuacji: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChoice(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as Step);
  }

  function toggleZobowiazanie(value: string) {
    setForm((prev) => ({
      ...prev,
      typZobowiazan: prev.typZobowiazan.includes(value)
        ? prev.typZobowiazan.filter((v) => v !== value)
        : [...prev.typZobowiazan, value],
    }));
    setError('');
  }

  function goBack() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  async function handleSubmit() {
    if (form.typZobowiazan.length === 0) {
      setError('Wybierz co najmniej jeden rodzaj zobowiązania.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/formularz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typNieruchomosci: form.typNieruchomosci,
          etapSprawy: form.etapSprawy,
          kwotaZadluzenia: form.kwotaZadluzenia,
          liczbaWierzycieli: form.liczbaWierzycieli,
          typZobowiazan: form.typZobowiazan,
          adresNieruchomosci: form.adresNieruchomosci || undefined,
          opisSytuacji: form.opisSytuacji || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Błąd serwera.');
      router.push(`/wynik/${json.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#D8D8D8] px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <span className="font-bold text-[#4A6741]">kluczdospokoju.pl</span>
          <span className="text-sm text-[#9B9B9B]">Krok {step} z {TOTAL_STEPS}</span>
        </div>
        {/* Progress bar */}
        <div className="max-w-xl mx-auto mt-3">
          <div className="h-2 bg-[#E8F0E4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4A6741] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-xl">

          {/* Krok 1 */}
          {step === 1 && (
            <StepCard title="Czy problem dotyczy nieruchomości?">
              <div className="flex flex-col gap-4">
                <OptionButton
                  onClick={() => setStep(2)}
                  label="Tak, mam zadłużoną nieruchomość"
                  icon="✅"
                />
                <div className="bg-[#FFF3CD] border border-yellow-300 rounded-xl p-4 text-center">
                  <p className="text-[#856404] font-medium">NIE — poza nieruchomościami</p>
                  <p className="text-[#856404] text-sm mt-1">
                    Niestety, na razie pomagamy tylko przy nieruchomościach.
                  </p>
                </div>
              </div>
            </StepCard>
          )}

          {/* Krok 2 */}
          {step === 2 && (
            <StepCard title="Jaki to rodzaj nieruchomości?">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'mieszkanie', label: 'Mieszkanie', icon: '🏢' },
                  { value: 'dom', label: 'Dom', icon: '🏠' },
                  { value: 'dzialka', label: 'Działka', icon: '🌿' },
                  { value: 'lokal', label: 'Lokal / Komercyjna', icon: '🏪' },
                ].map((opt) => (
                  <OptionButton
                    key={opt.value}
                    onClick={() => handleChoice('typNieruchomosci', opt.value)}
                    label={opt.label}
                    icon={opt.icon}
                    selected={form.typNieruchomosci === opt.value}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {/* Krok 3 */}
          {step === 3 && (
            <StepCard title="Na jakim etapie jest Twoja sprawa?">
              <div className="flex flex-col gap-4">
                {[
                  { value: 'bez_komornika', label: 'Jeszcze bez komornika', icon: '🟡' },
                  { value: 'jest_komornik', label: 'Jest komornik', icon: '🔴' },
                  { value: 'nie_wiem', label: 'Nie wiem / nie jestem pewien', icon: '❓' },
                ].map((opt) => (
                  <OptionButton
                    key={opt.value}
                    onClick={() => handleChoice('etapSprawy', opt.value)}
                    label={opt.label}
                    icon={opt.icon}
                    selected={form.etapSprawy === opt.value}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {/* Krok 4 */}
          {step === 4 && (
            <StepCard title="Przybliżona kwota zadłużenia?">
              <div className="flex flex-col gap-4">
                {[
                  { value: 'do_50k', label: 'Do 50 tys. zł', icon: '💰' },
                  { value: '50_200k', label: '50–200 tys. zł', icon: '💰💰' },
                  { value: '200_500k', label: '200–500 tys. zł', icon: '💰💰💰' },
                  { value: 'powyzej_500k', label: 'Powyżej 500 tys.', icon: '🔺' },
                  { value: 'nie_wiem', label: 'Nie wiem', icon: '❓' },
                ].map((opt) => (
                  <OptionButton
                    key={opt.value}
                    onClick={() => handleChoice('kwotaZadluzenia', opt.value)}
                    label={opt.label}
                    icon={opt.icon}
                    selected={form.kwotaZadluzenia === opt.value}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {/* Krok 5 */}
          {step === 5 && (
            <StepCard title="Ilu masz wierzycieli?">
              <div className="flex flex-col gap-4">
                {[
                  { value: '1', label: 'Jeden wierzyciel', icon: '1️⃣' },
                  { value: '2-3', label: '2–3 wierzycieli', icon: '2️⃣' },
                  { value: 'wiecej', label: 'Więcej niż 3', icon: '🔢' },
                ].map((opt) => (
                  <OptionButton
                    key={opt.value}
                    onClick={() => handleChoice('liczbaWierzycieli', opt.value)}
                    label={opt.label}
                    icon={opt.icon}
                    selected={form.liczbaWierzycieli === opt.value}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {/* Krok 6 */}
          {step === 6 && (
            <StepCard title="Jakiego rodzaju są zobowiązania? (możesz wybrać kilka)">
              <div className="flex flex-col gap-3">
                {[
                  { value: 'kredyt', label: 'Kredyt hipoteczny', icon: '🏦' },
                  { value: 'zalegloscii', label: 'Zaległości w opłatach', icon: '📄' },
                  { value: 'alimenty', label: 'Alimenty', icon: '👨‍👩‍👧' },
                  { value: 'inne', label: 'Inne', icon: '📝' },
                ].map((opt) => (
                  <CheckOption
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    icon={opt.icon}
                    checked={form.typZobowiazan.includes(opt.value)}
                    onChange={() => toggleZobowiazanie(opt.value)}
                  />
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={() => {
                    if (form.typZobowiazan.length === 0) {
                      setError('Wybierz co najmniej jeden rodzaj zobowiązania.');
                      return;
                    }
                    setStep(7);
                  }}
                  className="mt-4 bg-[#4A6741] text-white py-3 rounded-[6px] font-semibold hover:bg-[#6B8F5E] transition-colors"
                >
                  Dalej →
                </button>
              </div>
            </StepCard>
          )}

          {/* Krok 7 */}
          {step === 7 && (
            <StepCard title="Adres nieruchomości (opcjonalnie)">
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={form.adresNieruchomosci}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, adresNieruchomosci: e.target.value }))
                  }
                  placeholder="np. ul. Przykładowa 1, Warszawa"
                  className="border border-[#D8D8D8] rounded-lg px-4 py-3 text-[#1C1C1C] placeholder-[#9B9B9B] focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]"
                />
                <p className="text-sm text-[#9B9B9B]">
                  Podanie adresu pozwoli na dokładniejszą analizę. Nie jest wymagane.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(8)}
                    className="flex-1 bg-[#4A6741] text-white py-3 rounded-[6px] font-semibold hover:bg-[#6B8F5E] transition-colors"
                  >
                    Dalej →
                  </button>
                  <button
                    onClick={() => setStep(8)}
                    className="flex-1 border border-[#D8D8D8] text-[#6B6B6B] py-3 rounded-[6px] font-medium hover:bg-[#F0F0F0] transition-colors"
                  >
                    Pomiń
                  </button>
                </div>
              </div>
            </StepCard>
          )}

          {/* Krok 8 */}
          {step === 8 && (
            <StepCard title="Opisz swoją sytuację (opcjonalnie)">
              <div className="flex flex-col gap-4">
                <textarea
                  value={form.opisSytuacji}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, opisSytuacji: e.target.value }))
                  }
                  rows={5}
                  placeholder="Im więcej opiszesz, tym trafniejsza będzie analiza..."
                  className="border border-[#D8D8D8] rounded-lg px-4 py-3 text-[#1C1C1C] placeholder-[#9B9B9B] focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741] resize-none"
                  maxLength={2000}
                />
                <p className="text-sm text-[#9B9B9B] text-right">
                  {form.opisSytuacji.length}/2000
                </p>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-[#4A6741] text-white py-3 rounded-[6px] font-semibold hover:bg-[#6B8F5E] transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Obliczam...' : 'Zobacz wynik →'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 border border-[#D8D8D8] text-[#6B6B6B] py-3 rounded-[6px] font-medium hover:bg-[#F0F0F0] transition-colors disabled:opacity-60"
                  >
                    Pomiń i zobacz
                  </button>
                </div>
              </div>
            </StepCard>
          )}

          {/* Back button */}
          {step > 1 && step <= 8 && (
            <button
              onClick={goBack}
              className="mt-6 text-[#6B6B6B] text-sm hover:text-[#4A6741] transition-colors flex items-center gap-1"
            >
              ← Wróć
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#D8D8D8] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-8">
      <h2 className="text-xl font-bold text-[#1C1C1C] mb-6">{title}</h2>
      {children}
    </div>
  );
}

function OptionButton({
  onClick,
  label,
  icon,
  selected = false,
}: {
  onClick: () => void;
  label: string;
  icon: string;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 text-left font-medium transition-all ${
        selected
          ? 'border-[#4A6741] bg-[#E8F0E4] text-[#4A6741]'
          : 'border-[#D8D8D8] bg-white text-[#1C1C1C] hover:border-[#4A6741] hover:bg-[#F8F6F1]'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function CheckOption({
  value,
  label,
  icon,
  checked,
  onChange,
}: {
  value: string;
  label: string;
  icon: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all ${
        checked
          ? 'border-[#4A6741] bg-[#E8F0E4]'
          : 'border-[#D8D8D8] bg-white hover:border-[#4A6741]'
      }`}
    >
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        className="accent-[#4A6741] w-5 h-5"
      />
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-[#1C1C1C]">{label}</span>
    </label>
  );
}
