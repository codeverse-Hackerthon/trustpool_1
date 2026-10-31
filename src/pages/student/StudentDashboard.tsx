import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';

import { useAuth } from '../../hooks/useAuth';
import { useMyBookings } from '../../hooks/useBookings';
import { useResources } from '../../hooks/useResources';
import {
  ShieldCheck,
  CalendarCheck,
  QrCode,
  Search,
  Scale,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Bell,
  TrendingUp,
  ChevronRight,
  Zap,
  Star,
  BarChart3,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { Booking, Resource } from '../../types';

// ─── Mock notification data ───────────────────────────────────────────────────
const NOTIFICATIONS = [
  {
    id: 'n1',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    title: 'Booking Approved',
    body: 'Sony FX3 Cinema Camera Kit — Nov 1, 10:00 AM',
    timeAgo: '2h ago',
    read: false,
  },
  {
    id: 'n2',
    icon: TrendingUp,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    title: 'Trust Score Increased',
    body: 'Your score rose from 89 → 92 after on-time return.',
    timeAgo: '1d ago',
    read: false,
  },
  {
    id: 'n3',
    icon: Clock,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    title: 'Return Reminder',
    body: 'Sony FX3 due back by 2:00 PM tomorrow.',
    timeAgo: '1d ago',
    read: true,
  },
  {
    id: 'n4',
    icon: AlertTriangle,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    title: 'Waitlist Update',
    body: 'You moved to #1 on the VR & Spatial Computing Rig waitlist.',
    timeAgo: '2d ago',
    read: true,
  },
];

// ─── Helper: category pill ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  equipment: 'bg-blue-50 text-blue-700',
  lab: 'bg-violet-50 text-violet-700',
  room: 'bg-amber-50 text-amber-700',
  space: 'bg-emerald-50 text-emerald-700',
};

function CategoryPill({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {category}
    </span>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({ booking }: { booking: Booking }) {
  const navigate = useNavigate();
  const isActive = booking.status === 'active' || booking.status === 'approved';

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Resource image */}
      {booking.resourceImageUrl ? (
        <div className="h-36 w-full relative overflow-hidden bg-slate-100">
          <img
            src={booking.resourceImageUrl}
            alt={booking.resourceTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <CategoryPill category={booking.resourceCategory} />
          </div>
        </div>
      ) : (
        <div className="h-36 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <CalendarCheck className="w-10 h-10 text-slate-300" />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">
            {booking.resourceTitle}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {booking.resourceLocation}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-700">
              {formatDateTime(booking.startTime)}
            </p>
            <p className="text-[10px] text-slate-400">
              to {formatDateTime(booking.endTime)}
            </p>
          </div>
          <StatusBadge status={booking.status} size="sm" />
        </div>

        <div className="flex items-center gap-2 pt-1">
          {isActive && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<QrCode className="w-3.5 h-3.5" />}
              onClick={() => navigate('/student/qr-access')}
              className="flex-1 text-xs"
            >
              QR Pass
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/student/bookings')}
            className={isActive ? 'flex-none' : 'flex-1 text-xs'}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Resource recommendation card ─────────────────────────────────────────────
function ResourceCard({ resource }: { resource: Resource }) {
  const navigate = useNavigate();
  const statusMap: Record<string, 'ACTIVE' | 'COMPLETED' | 'PENDING'> = {
    available: 'ACTIVE',
    in_use: 'PENDING',
    maintenance: 'COMPLETED',
  };

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer flex-shrink-0 w-64 sm:w-auto"
      onClick={() => navigate(`/student/resources/${resource.id}`)}
    >
      <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
        <img
          src={resource.imageUrl}
          alt={resource.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <CategoryPill category={resource.category} />
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm line-clamp-1 leading-snug">
          {resource.title}
        </h4>
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {resource.location}
        </p>
        <div className="flex items-center justify-between pt-1">
          <StatusBadge status={statusMap[resource.status] ?? 'PENDING'} size="sm" />
          <span className="text-[10px] text-slate-400">
            Min score: {resource.minTrustScore}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings();
  const { data: resources } = useResources({ status: 'available', limit: 4 });
  const navigate = useNavigate();

  const [notificationsExpanded, setNotificationsExpanded] = useState(false);

  const trustScore = user?.trustScore ?? 92;
  const activeCount = bookings?.filter((b) => b.status === 'active' || b.status === 'approved').length ?? 1;
  const upcomingBookings = bookings?.filter(
    (b) => b.status === 'approved' || b.status === 'pending'
  ) ?? [];

  const eligibleResources = (resources ?? []).filter(
    (r) => r.status === 'available' && r.minTrustScore <= trustScore
  );

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  // Quota data
  const quotaUsed = 6.5;
  const quotaTotal = 20;
  const quotaPct = Math.round((quotaUsed / quotaTotal) * 100);

  // Fairness score
  const fairnessScore = 94;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'Alex'} 👋`}
        description="Your resource access hub — bookings, allocation, and check-in passes at a glance."
        tag="Student Dashboard"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/student/resources">
              <Button size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
                Discover Resources
              </Button>
            </Link>
            <Link to="/student/qr-access">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<QrCode className="w-3.5 h-3.5" />}
              >
                QR Access
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Bookings */}
        <div
          className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
          onClick={() => navigate('/student/bookings')}
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
              Active Bookings
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeCount}</p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">1 check-in today</p>
          </div>
        </div>

        {/* Upcoming */}
        <div
          className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
          onClick={() => navigate('/student/bookings')}
        >
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
              Upcoming
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{upcomingBookings.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Next: Nov 1</p>
          </div>
        </div>

        {/* Trust / Fair Access Score */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
              Trust Score
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {trustScore}
              <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Tier A • High Priority
            </p>
          </div>
        </div>

        {/* Weekly Quota */}
        <div
          className="rounded-xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-violet-300 hover:shadow-sm transition-all"
          onClick={() => navigate('/student/allocation')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-violet-50 text-violet-600">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Weekly Quota
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {quotaUsed}
            <span className="text-sm font-normal text-slate-400"> / {quotaTotal} hrs</span>
          </p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: `${quotaPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{quotaTotal - quotaUsed} hrs remaining</p>
        </div>
      </div>

      {/* ── Main grid: Upcoming Bookings + Fair Allocation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Bookings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Bookings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Approved slots with QR access passes
              </p>
            </div>
            <Link
              to="/student/bookings"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingBookings.slice(0, 4).map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming bookings"
              description="Browse available resources and make your first booking."
              actionLabel="Discover Resources"
              onAction={() => navigate('/student/resources')}
            />
          )}
        </div>

        {/* Right: Fair Allocation Status */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Fair Allocation Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your position in the fairness system</p>
          </div>

          {/* Fairness Score Card */}
          <Card>
            <CardContent className="p-5 space-y-4">
              {/* Score header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Fairness Score
                  </p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-3xl font-bold text-slate-900">{fairnessScore}</span>
                    <span className="text-sm text-slate-400 mb-0.5">/ 100</span>
                  </div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="#10b981" strokeWidth="3"
                      strokeDasharray={`${fairnessScore} ${100 - fairnessScore}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Priority Tier */}
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <Zap className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">Priority Tier: HIGH</p>
                  <p className="text-[10px] text-emerald-600">First allocation preference active</p>
                </div>
              </div>

              {/* Waitlist Positions */}
              <div>
                <p className="text-[11px] font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                  Waitlist Positions
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-violet-50 border border-violet-100">
                    <span className="text-xs text-violet-800 font-medium">VR & Spatial Rig</span>
                    <span className="text-xs font-bold text-violet-700">#1</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Soundstage Studio B</span>
                    <span className="text-xs font-bold text-slate-500">#3</span>
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Score Formula
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Trust Score', pct: 40, value: 92, color: 'bg-emerald-500' },
                    { label: 'Usage Balance', pct: 35, value: 88, color: 'bg-blue-500' },
                    { label: 'Urgency', pct: 25, value: 76, color: 'bg-amber-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[11px]">
                      <span className="w-24 text-slate-500 flex-shrink-0">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-slate-400 flex-shrink-0 w-7 text-right">
                        {item.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/student/allocation">
                <Button variant="outline" size="sm" className="w-full text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Full Allocation Details
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Usage Integrity Card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-800">Usage Integrity</p>
              </div>

              <div className="space-y-2.5">
                {/* Weekly quota */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Weekly Quota</span>
                    <span className="text-slate-900 font-bold">{quotaUsed} / {quotaTotal} hrs</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${quotaPct}%` }}
                    />
                  </div>
                </div>

                {/* Punctuality Streak */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-800">Punctuality Streak</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">14/14 on-time</span>
                </div>

                {/* Bonus */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">Low Usage Bonus</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700">Active ✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recommended Resources ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recommended Resources</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Available now and within your trust tier
            </p>
          </div>
          <Link
            to="/student/resources"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Browse All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {eligibleResources.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            {eligibleResources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No resources available"
            description="Check back soon or expand your trust score to access more resources."
          />
        )}
      </div>

      {/* ── Recent Notifications ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            <CardTitle>Recent Notifications</CardTitle>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsExpanded((prev) => !prev)}
            className="text-xs"
          >
            {notificationsExpanded ? 'Show Less' : 'Show All'}
          </Button>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {(notificationsExpanded ? NOTIFICATIONS : NOTIFICATIONS.slice(0, 3)).map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 ${
                  !n.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className={`p-2 rounded-lg ${n.iconBg} flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${n.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">{n.timeAgo}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              to: '/student/resources',
              icon: Search,
              iconBg: 'bg-blue-50',
              iconColor: 'text-blue-600',
              border: 'hover:border-blue-300',
              title: 'Discover Resources',
              desc: 'Browse available equipment, labs, and rooms across campus.',
            },
            {
              to: '/student/bookings',
              icon: CalendarCheck,
              iconBg: 'bg-emerald-50',
              iconColor: 'text-emerald-600',
              border: 'hover:border-emerald-300',
              title: 'My Bookings',
              desc: 'View booking history, active slots, and upcoming sessions.',
            },
            {
              to: '/student/qr-access',
              icon: QrCode,
              iconBg: 'bg-amber-50',
              iconColor: 'text-amber-600',
              border: 'hover:border-amber-300',
              title: 'QR Access Pass',
              desc: 'Generate or scan your QR code for resource check-in and return.',
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to}>
                <div
                  className={`rounded-xl border border-slate-200 bg-white p-5 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md ${action.border} group`}
                >
                  <div className={`p-3 rounded-xl ${action.iconBg} ${action.iconColor} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{action.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
