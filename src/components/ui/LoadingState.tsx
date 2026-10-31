import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading TrustPool data...',
  className,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 space-y-3 min-h-[160px] text-slate-500',
        className
      )}
    >
      <Loader2
        className={cn('animate-spin text-slate-800', iconSizes[size])}
      />
      {message && (
        <p className="text-xs font-medium text-slate-500 tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
};

