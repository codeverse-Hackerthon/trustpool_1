export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'overdue';

export interface Booking {
  id: string;
  resourceId: string;
  resourceTitle: string;
  resourceCategory: string;
  resourceLocation: string;
  resourceImageUrl?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userTrustScore: number;
  ownerId: string;
  ownerName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  purpose: string;
  qrCodeData?: string; // QR code access token
  qrCodeUrl?: string; // Backend-generated QR image URL
  checkedInAt?: string;
  checkedOutAt?: string;
  returnCondition?: 'excellent' | 'good' | 'fair' | 'damaged';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  resourceId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  notes?: string;
}

export interface BookingActionPayload {
  bookingId: string;
  action: 'approve' | 'reject' | 'check_in' | 'check_out' | 'cancel';
  reason?: string;
  notes?: string;
  returnCondition?: 'excellent' | 'good' | 'fair' | 'damaged';
  qrToken?: string;
}
