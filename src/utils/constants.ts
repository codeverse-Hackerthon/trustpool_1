export const APP_CONFIG = {
  name: 'TrustPool',
  tagline: 'Trusted & Fair Shared-Resource Platform',
  version: '1.0.0',
};

export const RESOURCE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'equipment', label: 'Equipment & Gear' },
  { value: 'room', label: 'Study & Meeting Rooms' },
  { value: 'lab', label: 'Laboratories & Research' },
  { value: 'event_space', label: 'Event Spaces' },
  { value: 'facility', label: 'Professional Facilities' },
] as const;

export const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  approved: { label: 'Approved', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  active: { label: 'Active (In Use)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  completed: { label: 'Completed & Returned', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
  rejected: { label: 'Rejected', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
  overdue: { label: 'Overdue Return', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};
