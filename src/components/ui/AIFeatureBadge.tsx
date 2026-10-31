import React from 'react';
import { Sparkles, Info } from 'lucide-react';

interface AIFeatureBadgeProps {
  label?: string;
  variant?: 'purple' | 'blue' | 'amber';
  size?: 'sm' | 'md';
  showDisclaimer?: boolean;
  className?: string;
}

export const AIFeatureBadge: React.FC<AIFeatureBadgeProps> = ({
  label = 'AI Assistant (Simulated Preview)',
  variant = 'purple',
  size = 'sm',
  showDisclaimer = false,
  className = '',
}) => {
  const variantStyles = {
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
  };

  const textSizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full border shadow-2xs uppercase tracking-wider ${variantStyles[variant]} ${textSizes[size]}`}
        title="Frontend heuristic simulation. Microservice integration required for live LLM production inference."
      >
        <Sparkles className="w-3 h-3 text-purple-600 animate-pulse" />
        <span>{label}</span>
      </span>

      {showDisclaimer && (
        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal normal-case">
          <Info className="w-3 h-3 text-slate-400 shrink-0" />
          Frontend simulation • Backend AI microservice integration required
        </span>
      )}
    </div>
  );
};
