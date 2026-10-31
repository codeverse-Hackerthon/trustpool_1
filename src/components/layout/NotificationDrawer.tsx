import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'booking' | 'alert' | 'trust' | 'return';
  read: boolean;
}

export const NotificationDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Booking Approved',
      message: 'Sony FX3 Cinema Camera Kit is approved for Nov 1.',
      time: '15m ago',
      type: 'booking',
      read: false,
    },
    {
      id: 'n2',
      title: 'Return Reminder',
      message: '3D Printer reservation completed on time. +2 Trust Points awarded!',
      time: '2h ago',
      type: 'trust',
      read: false,
    },
    {
      id: 'n3',
      title: 'Fair Allocation Update',
      message: 'You have top priority standing in the Studio B waitlist.',
      time: '1d ago',
      type: 'alert',
      read: true,
    },
  ]);

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'trust':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'alert':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'return':
        return <AlertTriangle className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="relative" ref={drawerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 flex items-start gap-3 transition-colors ${
                  item.read ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="p-1.5 rounded-md bg-white border border-slate-200 shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-slate-900">
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
            <span className="text-[11px] text-slate-500">
              TrustPool Real-Time Notification Stream
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

