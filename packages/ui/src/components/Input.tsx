import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1C1C1C]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`border border-[#D8D8D8] rounded-lg px-4 py-3 text-[#1C1C1C] placeholder-[#9B9B9B] focus:outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741] transition-colors ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
