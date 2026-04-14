import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-[#6B6B6B]">{label}</span>
          <span className="text-sm font-medium text-[#1C1C1C]">{clamped}%</span>
        </div>
      )}
      <div className="h-2 bg-[#E8F0E4] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4A6741] rounded-full transition-all duration-700"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
