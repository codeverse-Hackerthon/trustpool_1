import { api } from './apiClient';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'booking' | 'alert' | 'trust' | 'return';
  read: boolean;
  rawType?: string;
}

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    try {
      const response = await api.get<any>('/notifications');
      const items = response?.data?.items || (Array.isArray(response?.data) ? response.data : []);

      return items.map((n: any) => {
        let type: AppNotification['type'] = 'alert';
        const t = (n.notification_type || '').toUpperCase();
        if (t.includes('BOOKING')) type = 'booking';
        else if (t.includes('RETURN')) type = 'return';
        else if (t.includes('VERIFICATION') || t.includes('TRUST')) type = 'trust';

        return {
          id: String(n.id),
          title: n.title,
          message: n.message,
          time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          type,
          read: Boolean(n.read || n.read_at),
          rawType: n.notification_type,
        };
      });
    } catch {
      return [
        {
          id: 'n1',
          title: 'Booking Approved',
          message: 'Sony FX3 Cinema Camera Kit is approved.',
          time: '15m ago',
          type: 'booking',
          read: false,
        },
        {
          id: 'n2',
          title: 'Return Inspection Verified',
          message: '3D Printer reservation completed on time. +2 Trust Points awarded!',
          time: '2h ago',
          type: 'trust',
          read: false,
        },
        {
          id: 'n3',
          title: 'Fair Allocation Standing',
          message: 'You have top priority standing in the waitlist.',
          time: '1d ago',
          type: 'alert',
          read: true,
        },
      ];
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<any>('/notifications/unread-count');
      return response?.data?.unread_count ?? 0;
    } catch {
      return 2;
    }
  },

  markRead: async (id: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // Continue locally
    }
  },

  markAllRead: async (): Promise<void> => {
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // Continue locally
    }
  },
};
