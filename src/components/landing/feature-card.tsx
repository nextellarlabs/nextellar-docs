'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  children,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center',
        'w-full h-95 md:h-105 lg:h-112.5 xl:h-125',
        'bg-white dark:bg-black',
        'border border-[rgba(0,0,0,0.4)] dark:border-[rgba(255,255,255,0.2)]',
        className
      )}
    >
      {/* SVG Illustration Area */}
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>

      {/* Text Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 pb-8 md:pb-12 lg:pb-16 flex flex-col items-center gap-3 md:gap-4">
        <h3 className="font-medium text-lg md:text-xl lg:text-2xl text-black dark:text-white text-center">
          {title}
        </h3>
        <p className="text-sm lg:text-base leading-5.5 text-black dark:text-white text-center">
          {description}
        </p>
      </div>
    </div>
  );
}
