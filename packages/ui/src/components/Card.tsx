import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div className={`bg-white border border-[#D8D8D8] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}
