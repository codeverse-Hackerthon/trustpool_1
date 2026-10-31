import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import { CreateBookingPayload, BookingActionPayload } from '../types';

export const BOOKING_KEYS = {
  all: ['bookings'] as const,
  my: () => ['bookings', 'my'] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
  ownerRequests: () => ['bookings', 'owner-requests'] as const,
  active: () => ['bookings', 'active'] as const,
  returns: () => ['bookings', 'returns'] as const,
};

export function useMyBookings() {
  return useQuery({
    queryKey: BOOKING_KEYS.my(),
    queryFn: () => bookingService.getMyBookings(),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: BOOKING_KEYS.detail(id),
    queryFn: () => bookingService.getBookingById(id),
    enabled: !!id,
  });
}

export function useOwnerRequests() {
  return useQuery({
    queryKey: BOOKING_KEYS.ownerRequests(),
    queryFn: () => bookingService.getOwnerRequests(),
  });
}

export function useActiveBookings() {
  return useQuery({
    queryKey: BOOKING_KEYS.active(),
    queryFn: () => bookingService.getActiveBookings(),
  });
}

export function usePendingReturns() {
  return useQuery({
    queryKey: BOOKING_KEYS.returns(),
    queryFn: () => bookingService.getPendingReturns(),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      bookingService.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingActionPayload) =>
      bookingService.updateBookingStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
}

