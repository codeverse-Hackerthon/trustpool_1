import { api } from './apiClient';
import {
  Booking,
  CreateBookingPayload,
  BookingActionPayload,
  ApiResponse,
} from '../types';
import { mockBookings } from '../data/mockBookings';
import { mockResources } from '../data/mockResources';

let localBookings: Booking[] = [...mockBookings];

export const bookingService = {
  /**
   * Fetch current user's bookings (Student view)
   */
  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>('/bookings/my');
      return response.data;
    } catch {
      return localBookings;
    }
  },

  /**
   * Fetch bookings by ID
   */
  getBookingById: async (id: string): Promise<Booking> => {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
      return response.data;
    } catch {
      return localBookings.find((b) => b.id === id) || localBookings[0];
    }
  },

  /**
   * Create a booking request
   */
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    try {
      const response = await api.post<ApiResponse<Booking>>('/bookings', payload);
      return response.data;
    } catch {
      const res = mockResources.find((r) => r.id === payload.resourceId);
      const newBooking: Booking = {
        id: `book-${Date.now().toString().slice(-4)}`,
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
        status: 'approved', // Auto-approved for high trust score
        purpose: payload.purpose,
        notes: payload.notes,
        qrCodeData: `TRUSTPOOL:ACCESS:book-${Date.now()}:TOKEN-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localBookings = [newBooking, ...localBookings];
      return newBooking;
    }
  },

  /**
   * Update booking status (approve, reject, cancel, check-in, check-out)
   */
  updateBookingStatus: async (payload: BookingActionPayload): Promise<Booking> => {
    try {
      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${payload.bookingId}/status`,
        payload
      );
      return response.data;
    } catch {
      const booking =
        mockBookings.find((b) => b.id === payload.bookingId) || mockBookings[0];
      let newStatus: Booking['status'] = booking.status;
      if (payload.action === 'approve') newStatus = 'approved';
      if (payload.action === 'reject') newStatus = 'rejected';
      if (payload.action === 'check_in') newStatus = 'active';
      if (payload.action === 'check_out') newStatus = 'completed';
      if (payload.action === 'cancel') newStatus = 'cancelled';

      return {
        ...booking,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch owner booking requests
   */
  getOwnerRequests: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>('/owner/bookings/requests');
      return response.data;
    } catch {
      return mockBookings.filter((b) => b.status === 'pending');
    }
  },

  /**
   * Fetch active bookings (for owner & monitoring)
   */
  getActiveBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>('/bookings/active');
      return response.data;
    } catch {
      return mockBookings.filter((b) => b.status === 'active' || b.status === 'approved');
    }
  },

  /**
   * Fetch pending returns
   */
  getPendingReturns: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>('/owner/returns');
      return response.data;
    } catch {
      return mockBookings.filter((b) => b.status === 'active');
    }
  },
};
