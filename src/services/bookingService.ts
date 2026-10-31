import { api } from './apiClient';
import {
  Booking,
  CreateBookingPayload,
  BookingActionPayload,
} from '../types';
import { mockBookings } from '../data/mockBookings';
import { mockResources } from '../data/mockResources';
import { auditService, AuditEventType } from './auditService';
import { mocksEnabled } from './config';

const normalizeBooking = (b: any): Booking => {
  const rawStatus = (b.status || b.status_raw || 'pending').toLowerCase();
  let status: Booking['status'] = 'pending';
  if (rawStatus === 'active') status = 'active';
  else if (rawStatus === 'approved') status = 'approved';
  else if (rawStatus === 'completed') status = 'completed';
  else if (rawStatus === 'cancelled') status = 'cancelled';
  else if (rawStatus === 'rejected') status = 'rejected';

  return {
    id: String(b.id),
    resourceId: String(b.resourceId || b.resource_id),
    resourceTitle: b.resourceTitle || 'Institutional Equipment',
    resourceCategory: b.resourceCategory || 'equipment',
    resourceLocation: b.resourceLocation || 'Main Campus',
    resourceImageUrl: b.resourceImageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    userId: String(b.userId || b.user_id),
    userName: b.userName || 'Alex Rivera',
    userEmail: b.userEmail || 'alex.rivera@university.edu',
    userTrustScore: b.userTrustScore || 92,
    ownerId: String(b.ownerId || b.owner_id || 'owner'),
    ownerName: b.ownerName || 'Dr. Sarah Chen',
    startTime: b.startTime || b.start_at || new Date().toISOString(),
    endTime: b.endTime || b.end_at || new Date(Date.now() + 7200000).toISOString(),
    status,
    purpose: b.purpose || 'Academic project reservation',
    notes: b.notes || b.owner_notes,
    qrCodeData: b.qrCodeData || `TRUSTPOOL:BOOKING:${b.id}:ACTIVE`,
    returnCondition: b.returnCondition || 'excellent',
    checkedInAt: b.checkedInAt || b.checked_in_at,
    checkedOutAt: b.checkedOutAt || b.checked_out_at,
    createdAt: b.createdAt || b.created_at || new Date().toISOString(),
    updatedAt: b.updatedAt || b.updated_at || new Date().toISOString(),
  };
};

export const bookingService = {
  /**
   * Fetch current user's bookings (Student view)
   */
  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<any>('/bookings/me');
      const list = response?.data || response;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeBooking);
      }
      return mockBookings;
    } catch {
      return [...mockBookings];
    }
  },

  /**
   * Fetch bookings by ID
   */
  getBookingById: async (id: string): Promise<Booking> => {
    try {
      const response = await api.get<any>(`/bookings/${id}`);
      const data = response?.data || response;
      if (data && data.id) {
        return normalizeBooking(data);
      }
      return mockBookings.find((b) => b.id === id) || mockBookings[0];
    } catch {
      return mockBookings.find((b) => b.id === id) || mockBookings[0];
    }
  },

  /**
   * Create a booking request
   */
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    try {
      const response = await api.post<any>('/bookings', {
        resource_id: payload.resourceId,
        start_at: payload.startTime,
        end_at: payload.endTime,
        purpose: payload.purpose || 'Campus laboratory session',
      });
      const data = response?.data || response;
      const newBooking = normalizeBooking(data);

      auditService.recordAuditEvent({
        eventType: 'BOOKING_CREATED',
        actionTitle: 'Reservation Created',
        category: 'booking',
        performedBy: {
          id: newBooking.userId,
          name: newBooking.userName,
          role: 'student',
        },
        targetEntity: `${newBooking.resourceTitle} (${newBooking.id})`,
        details: `Booking created for: "${newBooking.purpose}". Time slot: ${newBooking.startTime.slice(0, 10)}.`,
      });

      return newBooking;
    } catch (error) {
      if (!mocksEnabled) throw error;
      const res = mockResources.find((r) => r.id === payload.resourceId);
      const newBookingId = `book-${Date.now().toString().slice(-4)}`;
      const newBooking: Booking = {
        id: newBookingId,
        resourceId: payload.resourceId,
        resourceTitle: res?.title || 'Requested Resource',
        resourceCategory: res?.category || 'equipment',
        resourceLocation: res?.location || 'Main Campus',
        resourceImageUrl: res?.imageUrl,
        userId: 'user-stu-1',
        userName: 'Alex Rivera',
        userEmail: 'alex.rivera@university.edu',
        userTrustScore: 92,
        ownerId: res?.ownerId || 'user-own-1',
        ownerName: res?.ownerName || 'Dr. Sarah Chen',
        startTime: payload.startTime,
        endTime: payload.endTime,
        status: 'approved',
        purpose: payload.purpose,
        notes: payload.notes,
        qrCodeData: `TRUSTPOOL:ACCESS:${newBookingId}:TOKEN-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newBooking;
    }
  },

  /**
   * Update booking status (approve, reject, cancel, check-in, check-out)
   */
  updateBookingStatus: async (payload: BookingActionPayload): Promise<Booking> => {
    try {
      const response = await api.patch<any>(
        `/bookings/${payload.bookingId}/status`,
        {
          action: payload.action,
          notes: payload.notes,
          reason: payload.reason,
          returnCondition: payload.returnCondition,
        }
      );
      const data = response?.data || response;
      const updated = normalizeBooking(data);

      auditService.recordAuditEvent({
        eventType: (payload.action === 'approve'
          ? 'BOOKING_APPROVED'
          : payload.action === 'reject'
          ? 'BOOKING_REJECTED'
          : payload.action === 'check_in'
          ? 'QR_CHECK_IN'
          : 'RETURN_VERIFIED') as AuditEventType,
        actionTitle: `Booking ${payload.action}`,
        category: payload.action.includes('check') ? 'qr_access' : 'booking',
        performedBy: {
          id: 'authorized-actor',
          name: 'Custodian / User',
          role: 'owner',
        },
        targetEntity: `${updated.resourceTitle} (${updated.id})`,
        details: `Booking status transitioned to ${payload.action}.`,
      });

      return updated;
    } catch (error) {
      if (!mocksEnabled) throw error;
      const booking = mockBookings.find((b) => b.id === payload.bookingId) || mockBookings[0];
      return {
        ...booking,
        status: payload.action === 'approve' ? 'approved' : payload.action === 'reject' ? 'rejected' : payload.action === 'check_in' ? 'active' : 'completed',
      };
    }
  },

  /**
   * Fetch owner booking requests
   */
  getOwnerRequests: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<any>('/bookings/owner/pending');
      const list = response?.data || response;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeBooking);
      }
      return mockBookings.filter((b) => b.status === 'pending');
    } catch {
      return mockBookings.filter((b) => b.status === 'pending');
    }
  },

  /**
   * Fetch active bookings (for owner & monitoring)
   */
  getActiveBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<any>('/bookings/active');
      const list = response?.data || response;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeBooking);
      }
      return mockBookings.filter((b) => b.status === 'active' || b.status === 'approved');
    } catch {
      return mockBookings.filter((b) => b.status === 'active' || b.status === 'approved');
    }
  },

  /**
   * Fetch pending returns
   */
  getPendingReturns: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<any>('/bookings/owner/returns');
      const list = response?.data || response;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeBooking);
      }
      return mockBookings.filter((b) => b.status === 'active');
    } catch {
      return mockBookings.filter((b) => b.status === 'active');
    }
  },
};
