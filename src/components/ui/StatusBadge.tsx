import React from 'react';
import { cn } from '../../utils/cn';

export type StatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITLISTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE'
  | string;

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showDot = true,
  className,
}) => {
  const normalized = status.toUpperCase().trim();

  // Consistent status token mapping adhering strictly to SaaS UI standards
  const styleConfig: Record<
    string,
    { bg: string; text: string; border: string; dot: string; defaultLabel: string }
  > = {
    PENDING: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200/90',
      dot: 'bg-amber-500',
      defaultLabel: 'Pending Review',
    },
    APPROVED: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200/90',
      dot: 'bg-sky-500',
      defaultLabel: 'Approved',
    },
    REJECTED: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200/90',
      dot: 'bg-rose-500',
      defaultLabel: 'Rejected',
    },
    WAITLISTED: {
      bg: 'bg-violet-50',
      text: 'text-violet-800',
      border: 'border-violet-200/90',
      dot: 'bg-violet-500',
      defaultLabel: 'Waitlisted',
    },
    ACTIVE: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200/90',
      dot: 'bg-emerald-500 animate-pulse',
      defaultLabel: 'Active / In Use',
    },
    COMPLETED: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300/80',
      dot: 'bg-slate-500',
      defaultLabel: 'Completed',
    },
    CANCELLED: {
      bg: 'bg-zinc-100',
      text: 'text-zinc-600',
      border: 'border-zinc-200',
      dot: 'bg-zinc-400',
      defaultLabel: 'Cancelled',
    },
    OVERDUE: {
      bg: 'bg-red-100/90',
      text: 'text-red-900',
      border: 'border-red-300',
      dot: 'bg-red-600 animate-ping',
      defaultLabel: 'Overdue Return',
    },
  };

  const currentStyle = styleConfig[normalized] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    defaultLabel: status,
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border tracking-wide uppercase font-semibold select-none',
        currentStyle.bg,
        currentStyle.text,
        currentStyle.border,
        sizes[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn('rounded-full shrink-0', currentStyle.dot, dotSizes[size])}
        />
      )}
      <span>{label || currentStyle.defaultLabel}</span>
    </span>
  );
};

