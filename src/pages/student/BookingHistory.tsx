import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Modal } from '../../components/ui/Modal';
import { useMyBookings } from '../../hooks/useBookings';
import { formatDateTime } from '../../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';
import { Booking } from '../../types';

export const BookingHistory: React.FC = () => {
  const { data: bookings, isLoading } = useMyBookings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filter completed and past bookings
  const historicalBookings = (bookings || []).filter((b) => {
    const isPast = b.status === 'completed' || b.status === 'cancelled';
    const matchesFilter =
      statusFilter === 'all'
        ? isPast || b.status === 'active'
        : b.status === statusFilter;
    const matchesSearch =
      !search ||
      b.resourceTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      (b.notes && b.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Borrowing History & Return Ledger"
        description="Historical log of all previous institutional bookings, custodian condition sign-offs, and trust score performance."
        tag="Student Custody Ledger"
      />

      {/* Trust Performance Summary Banner */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">
              100% Punctual Return Streak (14 Consecutive Loans)
            </h4>
            <p className="text-emerald-700 mt-0.5">
              Punctual returns with clean condition audit seals award continuous TrustScore index bonuses (+2 to +5 points).
            </p>
          </div>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-lg bg-emerald-700 text-white font-mono font-bold text-xs shadow-2xs">
          Tier A Borrower
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search history by resource, booking reference, or custodian..."
          />
        </div>

        <div className="flex items-center gap-1.5 border border-slate-200 p-1 rounded-xl bg-white text-xs shadow-2xs">
          {[
            { key: 'all', label: 'All Past & Active' },
            { key: 'completed', label: 'Completed Loans' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
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

      {/* History Ledger Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historical Borrowing Ledger ({historicalBookings.length})</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently recorded return verification entries
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Verified Entries
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Resource & Facility</TableHead>
                <TableHead>Checkout Window</TableHead>
                <TableHead>Return Inspection</TableHead>
                <TableHead>Trust Impact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Inspection Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    <Clock className="w-4 h-4 mx-auto mb-1 animate-spin text-blue-600" />
                    Loading borrowing history...
                  </TableCell>
                </TableRow>
              ) : historicalBookings.length > 0 ? (
                historicalBookings.map((b) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-500 font-bold">
                      {b.id}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-slate-900">{b.resourceTitle}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {b.resourceLocation}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{formatDateTime(b.startTime)}</div>
                      <div className="text-[10px] text-slate-400">to {formatDateTime(b.endTime)}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {b.status === 'completed' ? (
                        <div>
                          <span className="font-bold text-emerald-700 capitalize">
                            {b.returnCondition || 'Excellent Condition'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Punctual Return ✓
                          </span>
                        </div>
                      ) : b.status === 'cancelled' ? (
                        <span className="text-slate-400 italic">No Custody Released</span>
                      ) : (
                        <span className="text-blue-600 font-medium">Currently In Custody</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {b.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          +2 Points
                        </span>
                      ) : b.status === 'cancelled' ? (
                        <span className="text-slate-400 text-[11px]">Neutral (0 pts)</span>
                      ) : (
                        <span className="text-blue-600 text-[11px] font-medium">Pending Return</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedBooking(b)}
                      >
                        Ledger Record
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No borrowing ledger records found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: CUSTODY & RETURN DETAILS ── */}
      {selectedBooking && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBooking(null)}
          title={`Borrowing Ledger Record: ${selectedBooking.id}`}
          description={`Verified custody log for ${selectedBooking.resourceTitle}.`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            {/* Header pill */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedBooking.resourceTitle}</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">{selectedBooking.resourceLocation}</p>
              </div>
              <StatusBadge status={selectedBooking.status} size="sm" />
            </div>

            {/* Custody timestamps */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Physical Custody Timeline
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Checked Out</span>
                  <span className="font-semibold text-slate-900">
                    {selectedBooking.checkedInAt ? formatDateTime(selectedBooking.checkedInAt) : formatDateTime(selectedBooking.startTime)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Returned At</span>
                  <span className="font-semibold text-slate-900">
                    {selectedBooking.checkedOutAt ? formatDateTime(selectedBooking.checkedOutAt) : (selectedBooking.status === 'completed' ? 'Punctual (On-Time)' : 'Active')}
                  </span>
                </div>
              </div>
            </div>

            {/* Custodian Verification Seal */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1.5">
              <div className="flex items-center justify-between text-emerald-950 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Custodian Sign-Off: {selectedBooking.ownerName}
                </span>
                <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  VERIFIED SEAL
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {selectedBooking.notes || 'Equipment returned clean, accessories verified, optical components inspected.'}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-800 font-semibold border-t border-emerald-200/60">
                <span>Condition: {selectedBooking.returnCondition || 'Excellent'}</span>
                <span>Trust Impact: +2 Points Awarded ✓</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => setSelectedBooking(null)}>
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
