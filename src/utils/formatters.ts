export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return 'Free';
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getTrustScoreBadge(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 85) {
    return {
      label: 'Trusted Tier (A+)',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
    };
  }
  if (score >= 65) {
    return {
      label: 'Standard Tier (B)',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
    };
  }
  return {
    label: 'Probation Tier (C)',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  };
}
