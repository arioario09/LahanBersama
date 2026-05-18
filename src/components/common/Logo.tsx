import { Leaf } from 'lucide-react';
import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: string;
}

export default function Logo({ className = "w-10 h-10", iconSize = "h-6 w-6" }: LogoProps) {
  return (
    <div className={`${className} bg-mint rounded-2xl flex items-center justify-center shadow-lg shadow-teal/20`}>
      <Leaf className={`${iconSize} text-white fill-white/20`} />
    </div>
  );
}
