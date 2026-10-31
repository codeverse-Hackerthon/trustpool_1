import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { SearchBar } from '../../components/ui/SearchBar';
import { Modal } from '../../components/ui/Modal';
import { useMyBookings, useUpdateBookingStatus } from '../../hooks/useBookings';
import { formatDateTime } from '../../utils/formatters';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Booking } from '../../types';

export const BookingMonitoring: React.FC = () => {
  const { data: bookings, isLoading } = useMyBookings();
  const updateStatus = useUpdateBookingStatus();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [overrideReason, setOverrideReason] = useState('Administrative intervention for campus safety inspection.');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredBookings = (bookings || []).filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      !search ||
      b.resourceTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.userName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    await updateStatus.mutateAsync({
      bookingId: cancelTarget.id,
      action: 'cancel',
      reason: overrideReason,
    });

    setNotice(`Reservation ${cancelTarget.id} was cancelled by administrative override.`);
    setCancelTarget(null);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Global Booking Monitoring & Oversight"
        description="Real-time institutional oversight over active loans, pickup transitions, and return compliance."
        tag="Custody Surveillance"
      />

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-blue-700 font-bold ml-2 hover:text-blue-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by student, asset name, or booking reference..."
          />
        </div>

        <div className="flex items-center gap-1.5 border border-slate-200 p-1 rounded-xl bg-white text-xs">
          {[
            { key: 'all', label: 'All Statuses' },
            { key: 'active', label: 'Active Loans' },
            { key: 'approved', label: 'Approved' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Master Booking Stream Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Reservations Stream ({filteredBookings.length})</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Full chain-of-custody tracking across all campus academic facilities
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              Audited in Real-Time
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Asset Title</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Department Custodian</TableHead>
                <TableHead>Reservation Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Administrative Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Loading reservations stream...
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs text-slate-500 font-bold">
                      {b.id}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      <div>{b.resourceTitle}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {b.resourceLocation}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      <div>{b.userName}</div>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Score: {b.userTrustScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {b.ownerName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{formatDateTime(b.startTime)}</div>
                      <div className="text-slate-400">to {formatDateTime(b.endTime)}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      {b.status !== 'completed' && b.status !== 'cancelled' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => setCancelTarget(b)}
                        >
                          Force Cancel
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Archived</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No reservations match the specified filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: ADMINISTRATIVE FORCE CANCEL ── */}
      {cancelTarget && (
        <Modal
          isOpen={true}
          onClose={() => setCancelTarget(null)}
          title={`Administrative Cancel Override: ${cancelTarget.id}`}
          description={`Revoke reservation for ${cancelTarget.userName} on ${cancelTarget.resourceTitle}.`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <p className="font-bold">Notice to Borrower & Custodian</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Cancelling this booking immediately releases the slot back to the Fair Allocation Queue.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Justification
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCancelTarget(null)}>
                Dismiss
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancel}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Execute Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
