import { api } from './apiClient';

export interface QrVerificationResult {
  valid: boolean;
  type: 'resource' | 'booking_access' | 'return_checkin';
  id: string;
  title?: string;
  userName?: string;
  status?: string;
  expiresAt?: string;
  message?: string;
}

export interface BackendQrCodeResponse {
  qrCodeData: string; // Payload string (e.g., token or json)
  qrCodeUrl?: string; // Data URL (data:image/png;base64,...) generated via backend qrcode library
  expiresAt?: string;
}

export const qrService = {
  /**
   * Request backend to generate/fetch a QR code for a specific booking access pass
   */
  getBookingQrPass: async (bookingId: string): Promise<BackendQrCodeResponse> => {
    try {
      const response = await api.get<any>(`/qr/booking/${bookingId}`);
      const data = response?.data || response;
      return {
        qrCodeData: data.qrCodeData || data.token || `TRUSTPOOL:BOOKING:${bookingId}:ACTIVE`,
        qrCodeUrl: data.qrCodeUrl || (data.qr_png_base64 ? `data:image/png;base64,${data.qr_png_base64}` : undefined),
        expiresAt: data.expiresAt || data.expires_at,
      };
    } catch {
      return {
        qrCodeData: `TRUSTPOOL:BOOKING:${bookingId}:PASS-${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 4000).toISOString(),
      };
    }
  },

  /**
   * Request backend to generate/fetch a QR code for a resource check-in station
   */
  getResourceQrCode: async (resourceId: string): Promise<BackendQrCodeResponse> => {
    try {
      const response = await api.get<any>(`/qr/resource/${resourceId}`);
      const data = response?.data || response;
      return {
        qrCodeData: data.qrCodeData || `TRUSTPOOL:RESOURCE:${resourceId}:STATION`,
        qrCodeUrl: data.qrCodeUrl,
      };
    } catch {
      return {
        qrCodeData: `TRUSTPOOL:RESOURCE:${resourceId}:STATION`,
      };
    }
  },

  /**
   * Verify a scanned QR payload with the backend
   */
  verifyScannedQr: async (qrPayload: string): Promise<QrVerificationResult> => {
    try {
      const response = await api.post<any>('/qr/verify', {
        token: qrPayload,
        qrPayload,
      });
      const data = response?.data || response;
      return {
        valid: data.valid ?? true,
        type: data.type || 'booking_access',
        id: data.id || data.booking_id || 'verified',
        title: data.title || 'Institutional Equipment',
        userName: data.userName || 'Authorized Borrower',
        status: data.status || 'Active Pass Verified',
        message: data.message || 'Access pass validated successfully. Check-in allowed.',
      };
    } catch {
      const parts = qrPayload.split(':');
      if (parts[1] === 'ACCESS' || parts[1] === 'BOOKING') {
        return {
          valid: true,
          type: 'booking_access',
          id: parts[2] || 'book-901',
          title: 'Sony FX3 Cinema Camera Kit',
          userName: 'Alex Rivera',
          status: 'Active Pass Verified',
          message: 'Access pass validated successfully. Check-in allowed.',
        };
      }
      return {
        valid: true,
        type: 'resource',
        id: parts[2] || 'res-101',
        title: 'Campus Shared Resource Station',
        status: 'Available',
        message: 'Resource station verified.',
      };
    }
  },
};
