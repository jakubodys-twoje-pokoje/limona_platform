import React from 'react';
import type { PoziomRyzyka, KolorRyzyka } from '@limona/types';

interface RiskBarProps {
  poziom: PoziomRyzyka;
  procent: number;
  kolor: KolorRyzyka;
}

const colorMap: Record<KolorRyzyka, { bar: string; text: string; bg: string }> = {
  green: { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  orange: { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  red: { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  darkred: { bar: 'bg-red-800', text: 'text-red-900', bg: 'bg-red-100' },
};

const labelMap: Record<PoziomRyzyka, string> = {
  niski: 'Niskie ryzyko',
  sredni: 'Średnie ryzyko',
  wysoki: 'Wysokie ryzyko',
  krytyczny: 'Ryzyko krytyczne',
};

export function RiskBar({ poziom, procent, kolor }: RiskBarProps) {
  const colors = colorMap[kolor];
  return (
    <div className={`rounded-xl p-6 ${colors.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-[#1C1C1C]">Poziom ryzyka Twojej sytuacji</span>
        <span className={`font-bold text-lg ${colors.text}`}>{labelMap[poziom]}</span>
      </div>
      <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-1000`}
          style={{ width: `${procent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-[#9B9B9B]">
        <span>Niskie</span>
        <span>Krytyczne</span>
      </div>
    </div>
  );
}
