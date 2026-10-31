import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load information',
  message = 'There was an issue communicating with the TrustPool server.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-rose-200 bg-rose-50/50 p-6 flex flex-col sm:flex-row items-start gap-4',
        className
      )}
    >
      <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 border border-rose-200">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
        <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
        {onRetry && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="bg-white hover:bg-rose-50 border-rose-300 text-rose-800"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

