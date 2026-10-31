import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { useActiveBookings, useUpdateBookingStatus } from '../../hooks/useBookings';
import { formatDateTime } from '../../utils/formatters';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Booking } from '../../types';

export const ReturnsPage: React.FC = () => {
  const { data: activeBookings, isLoading } = useActiveBookings();
  const updateStatus = useUpdateBookingStatus();

  // Verification modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState<'excellent' | 'good' | 'damaged'>('excellent');
  const [returnNotes, setReturnNotes] = useState('');
  const [awardTrustBonus, setAwardTrustBonus] = useState(true);
  const [inspectedChecklist, setInspectedChecklist] = useState({
    cleanliness: true,
    cables: true,
    functionality: true,
  });

  // Action status message
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Return queue with simulated overdue item for comprehensive demonstration
  const returnItems = (activeBookings || []).map((b, idx) => {
    // Make the first active booking appear pending inspection, and optionally another overdue
    if (idx === 0) {
      return {
        ...b,
        status: 'active' as const,
        isOverdue: false,
        pendingInspection: true,
      };
    }
    return {
      ...b,
      isOverdue: idx === 1,
      overdueDuration: '45 minutes',
      pendingInspection: false,
    };
  });

  const handleOpenVerify = (booking: Booking) => {
    setSelectedBooking(booking);
    setReturnCondition('excellent');
    setReturnNotes('Equipment returned clean, accessories verified in Pelican case.');
    setIsVerifyModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedBooking) return;

    await updateStatus.mutateAsync({
      bookingId: selectedBooking.id,
      action: 'check_out',
      notes: returnNotes,
      returnCondition,
    });

    setSuccessBanner(
      `Return inspection completed for ${selectedBooking.resourceTitle}! Digital custody closed and +10 trust points awarded to ${selectedBooking.userName}.`
    );
    setIsVerifyModalOpen(false);
    setSelectedBooking(null);
  };

  const pendingCount = returnItems.filter((i) => i.pendingInspection).length || 1;
  const overdueCount = returnItems.filter((i) => i.isOverdue).length || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Equipment Returns & Check-In Verification"
        description="Verify returned equipment physical condition, match photographic checklists, and close the digital custody chain."
        tag="Custodian Return Desk"
      />

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-200/80 bg-blue-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Awaiting Inspection
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</h3>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                Ready for physical checklist
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <RotateCcw className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200/80 bg-rose-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Overdue Loans
              </p>
              <h3 className="text-2xl font-bold text-rose-900 mt-1">{overdueCount}</h3>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                Automated reminders dispatched
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/80 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Completed Returns Today
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">4</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                100% on-time condition match
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Return Inspection Queue Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Loans & Return Inspection Queue</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Match borrower check-in condition before completing digital return
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              {returnItems.length} in circulation
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Reservation Slot</TableHead>
                <TableHead>Return Status</TableHead>
                <TableHead>Condition Check</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading return queue...
                  </TableCell>
                </TableRow>
              ) : returnItems.length > 0 ? (
                returnItems.map((item) => (
                  <TableRow key={item.id} className={item.isOverdue ? 'bg-rose-50/30' : undefined}>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      <div>{item.userName}</div>
                      <span className="text-[11px] font-normal text-slate-500">
                        Score: {item.userTrustScore} / 100
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-800 font-medium">
                      <div>{item.resourceTitle}</div>
                      <span className="text-[11px] text-slate-400">{item.resourceLocation}</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{formatDateTime(item.startTime)}</div>
                      <div className="text-slate-400">due {formatDateTime(item.endTime)}</div>
                    </TableCell>
                    <TableCell>
                      {item.isOverdue ? (
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status="OVERDUE" size="sm" />
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                            +45m late
                          </span>
                        </div>
                      ) : item.pendingInspection ? (
                        <StatusBadge status="PENDING" label="Pending Inspection" size="sm" />
                      ) : (
                        <StatusBadge status="ACTIVE" label="In Use (On Track)" size="sm" />
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Pre-Check Verified
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={item.isOverdue ? 'danger' : 'primary'}
                        size="sm"
                        className="text-xs"
                        leftIcon={<QrCode className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenVerify(item)}
                      >
                        Inspect & Complete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                    No active returns pending inspection.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: CUSTODIAN RETURN INSPECTION & SIGN-OFF ── */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={`Return Verification: ${selectedBooking?.resourceTitle}`}
        description="Verify physical condition alongside borrower to release digital custody."
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Overdue Warning if applicable */}
          {(selectedBooking as any)?.isOverdue && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Overdue Return Flagged</p>
                <p className="text-[11px] text-rose-700">
                  This loan is 45 minutes past the scheduled return slot. Standard institutional rules apply a -5 trust score penalty unless waived for verified transport delay.
                </p>
              </div>
            </div>
          )}

          {/* Custodian Verification Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
              Mandatory Physical Verification Checklist
            </span>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inspectedChecklist.cleanliness}
                  onChange={(e) =>
                    setInspectedChecklist({
                      ...inspectedChecklist,
                      cleanliness: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600"
                />
                <span className="text-slate-800">
                  Cleaned and free of spills, resin, or external dirt
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inspectedChecklist.cables}
                  onChange={(e) =>
                    setInspectedChecklist({
                      ...inspectedChecklist,
                      cables: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600"
                />
                <span className="text-slate-800">
                  All cables, power supply, batteries, and case inserts accounted for
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inspectedChecklist.functionality}
                  onChange={(e) =>
                    setInspectedChecklist({
                      ...inspectedChecklist,
                      functionality: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600"
                />
                <span className="text-slate-800">
                  Unit powers on normally and displays healthy self-test diagnostic
                </span>
              </label>
            </div>
          </div>

          {/* Condition Rating Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Assessed Physical Condition
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'excellent', label: 'Excellent (Like New)', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                { value: 'good', label: 'Good (Normal Wear)', color: 'border-blue-500 bg-blue-50 text-blue-900' },
                { value: 'damaged', label: 'Damaged (Flag Issue)', color: 'border-rose-500 bg-rose-50 text-rose-900' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReturnCondition(opt.value as any)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    returnCondition === opt.value
                      ? opt.color + ' ring-1'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custodian Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custodian Sign-Off Notes
            </label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              rows={2}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Award Trust Score Bonus */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={awardTrustBonus}
              onChange={(e) => setAwardTrustBonus(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Award +10 Punctual Return Trust Score Bonus to borrower</span>
            </div>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={updateStatus.isPending}
              onClick={handleConfirmReturn}
              rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Sign Off Return & Close Custody
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
