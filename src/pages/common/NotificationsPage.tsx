import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { notificationService, AppNotification } from '../../services/notificationService';
import {
  Bell,
  CalendarCheck,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Check,
  Clock,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'booking' | 'incident'>('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'booking') return n.type === 'booking';
    if (activeFilter === 'incident') return n.type === 'alert';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    if (type === 'booking') {
      return <CalendarCheck className="w-5 h-5 text-blue-600" />;
    }
    if (type === 'return') {
      return <RotateCcw className="w-5 h-5 text-amber-600" />;
    }
    if (type === 'trust') {
      return <ShieldCheck className="w-5 h-5 text-purple-600" />;
    }
    return <AlertTriangle className="w-5 h-5 text-rose-600" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Notification Center"
        description="Live updates on booking approvals, waitlist promotions, returns, and incident reviews"
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Mark all as read
            </Button>
          )
        }
      />

      {/* Filter Tabs & Unread Badge Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#14213D] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Updates ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'unread'
                ? 'bg-[#14213D] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveFilter('booking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'booking'
                ? 'bg-[#14213D] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveFilter('incident')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'incident'
                ? 'bg-[#14213D] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Alerts & Incidents
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-time WebSocket connection active</span>
        </div>
      </div>

      {/* Notifications List */}
      <Card className="border-slate-200">
        <CardContent className="p-0 divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={<Bell className="w-10 h-10 text-slate-300" />}
                title="No notifications in this view"
                description="You're completely up to date with your reservations and shared resource activities."
              />
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  n.read ? 'bg-white hover:bg-slate-50/60' : 'bg-blue-50/40 hover:bg-blue-50/70'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-semibold ${n.read ? 'text-slate-800' : 'text-slate-900 font-bold'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="capitalize">{n.type} notification</span>
                  </div>
                </div>

                {!n.read && (
                  <div className="shrink-0 self-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block shadow-xs" title="Unread" />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
