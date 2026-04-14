import React from 'react';

type BadgeVariant = 'green' | 'orange' | 'red' | 'darkred' | 'grey' | 'blue';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-[#E8F0E4] text-[#4A6741]',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  darkred: 'bg-red-200 text-red-900',
  grey: 'bg-[#F0F0F0] text-[#6B6B6B]',
  blue: 'bg-blue-100 text-blue-700',
};

export function Badge({ variant = 'grey', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
