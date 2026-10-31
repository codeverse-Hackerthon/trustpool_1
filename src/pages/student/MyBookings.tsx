import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useMyBookings } from '../../hooks/useBookings';
import { formatDateTime } from '../../utils/formatters';
import {
  QrCode,
  Search,
  Layers,
  MapPin,
  CalendarCheck,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';

export const MyBookings: React.FC = () => {
  const { data: bookings, isLoading } = useMyBookings();
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  const filteredBookings = (bookings || []).filter((b) => {
    if (filterTab === 'active') return b.status === 'active' || b.status === 'approved';
    if (filterTab === 'pending') return b.status === 'pending';
    if (filterTab === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings & Reservations"
        description="Track your reserved time slots, custodian approvals, QR check-in passes, and condition logs."
        tag="Student Reservations"
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
                Scan Access Pass
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: 'All Reservations' },
          { key: 'active', label: 'Active & Approved' },
          { key: 'pending', label: 'Pending Review' },
          { key: 'completed', label: 'Past & Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isActiveOrApproved = b.status === 'active' || b.status === 'approved';

            return (
              <Card key={b.id} className="overflow-hidden hover:border-slate-300 transition-all">
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {b.resourceImageUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={b.resourceImageUrl}
                          alt={b.resourceTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                        <Layers className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {b.id}
                        </span>
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{b.resourceTitle}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {b.resourceLocation}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateTime(b.startTime)} to {formatDateTime(b.endTime)}
                        </span>
                      </div>
                      {b.purpose && (
                        <p className="text-[11px] text-slate-600 italic">
                          Purpose: {b.purpose}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isActiveOrApproved && (
                      <Link to="/student/qr-access">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs"
                          leftIcon={<QrCode className="w-3.5 h-3.5" />}
                        >
                          QR Pass
                        </Button>
                      </Link>
                    )}
                    <Link to="/student/condition-reports">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        leftIcon={<ClipboardCheck className="w-3.5 h-3.5" />}
                      >
                        Condition Report
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No reservations found in this view"
          description="You don't have any reservations matching this filter. Browse campus resources and request access."
          actionLabel="Discover Resources"
          onAction={() => (window.location.href = '/student/resources')}
        />
      )}

      {/* Fairness Protocol reminder card */}
      <Card className="border-purple-200/80 bg-purple-50/20">
        <CardContent className="p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                Punctual returns boost your Fair Allocation priority
              </p>
              <p className="text-slate-600">
                Every on-time return verified by custodian checklist adds to your Tier A standing.
              </p>
            </div>
          </div>
          <Link to="/student/allocation">
            <Button variant="outline" size="sm" className="text-xs">
              View Allocation Index
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
