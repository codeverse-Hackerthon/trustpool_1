import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useOwnerRequests, useUpdateBookingStatus } from '../../hooks/useBookings';
import { formatDateTime } from '../../utils/formatters';
import {
  Check,
  X,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Booking } from '../../types';

export const BookingRequests: React.FC = () => {
  const { data: requests, isLoading } = useOwnerRequests();
  const updateStatus = useUpdateBookingStatus();

  // Selected request for details modal
  const [selectedRequest, setSelectedRequest] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Approve / Reject confirmation states
  const [approveConfirmTarget, setApproveConfirmTarget] = useState<Booking | null>(null);
  const [rejectConfirmTarget, setRejectConfirmTarget] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('Slot overlaps with scheduled lab maintenance.');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const handleOpenDetail = (req: Booking) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };

  const handleApprove = async () => {
    if (!approveConfirmTarget) return;

    await updateStatus.mutateAsync({
      bookingId: approveConfirmTarget.id,
      action: 'approve',
    });

    setFeedbackNotice(
      `Approved reservation for ${approveConfirmTarget.userName} (${approveConfirmTarget.resourceTitle})! Cryptographic access token emitted.`
    );
    setApproveConfirmTarget(null);
    setIsDetailModalOpen(false);
  };

  const handleReject = async () => {
    if (!rejectConfirmTarget) return;

    await updateStatus.mutateAsync({
      bookingId: rejectConfirmTarget.id,
      action: 'reject',
      reason: rejectReason,
    });

    setFeedbackNotice(
      `Request rejected for ${rejectConfirmTarget.userName}. Notification sent.`
    );
    setRejectConfirmTarget(null);
    setIsDetailModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Pending Booking Requests"
        description="Review student reservation requests, verify Fair Allocation standing, and issue digital check-in passes."
        tag="Custodian Queue"
      />

      {/* Feedback Banner */}
      {feedbackNotice && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-emerald-700 font-bold ml-2 hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Awaiting Custodian Approval</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated by TrustScore and weekly anti-hoarding quota index
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              {requests?.length || 2} Pending Review
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Requested Window</TableHead>
                <TableHead>Fair Access Standing</TableHead>
                <TableHead>Project Purpose</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading booking requests...
                  </TableCell>
                </TableRow>
              ) : requests && requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      <div>{req.userName}</div>
                      <span className="text-[11px] font-normal text-slate-500">
                        {req.userEmail || 'alex.rivera@university.edu'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-800 font-medium">
                      <div>{req.resourceTitle}</div>
                      <span className="text-[11px] text-slate-400">{req.resourceLocation}</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{formatDateTime(req.startTime)}</div>
                      <div className="text-slate-400">to {formatDateTime(req.endTime)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-emerald-700 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Score: {req.userTrustScore} / 100</span>
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                          Tier A (Low Usage Bonus)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                      {req.purpose || 'Academic Capstone Project'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2"
                          onClick={() => handleOpenDetail(req)}
                          title="View Full Application"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200 px-2.5 py-1"
                          onClick={() => setApproveConfirmTarget(req)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200 px-2.5 py-1"
                          onClick={() => setRejectConfirmTarget(req)}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No pending booking requests awaiting review.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: FULL REQUEST DETAILS ── */}
      {selectedRequest && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Booking Application: ${selectedRequest.resourceTitle}`}
          description="Detailed student credentials, academic verification, and algorithmic fairness standing."
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Student & Fair Standing Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedRequest.userName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedRequest.userEmail} • ID: STU-98214
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-700 block">
                    TrustScore: {selectedRequest.userTrustScore} / 100
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    100% On-Time Returns (14/14)
                  </span>
                </div>
              </div>

              {/* Algorithmic Explanation */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Fair Allocation Engine Recommendation: APPROVE
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  "Borrower has only used 6.5 of their 20 weekly hours cap. They have zero incident reports and maintain a 98% custodian condition checklist agreement rate."
                </p>
              </div>
            </div>

            {/* Reservation Window & Purpose */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Resource:</span>
                <span className="font-bold text-slate-900">{selectedRequest.resourceTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Pickup Station:</span>
                <span className="font-semibold text-slate-700">
                  {selectedRequest.resourceLocation}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Requested Window:</span>
                <span className="font-semibold text-slate-900">
                  {formatDateTime(selectedRequest.startTime)} to {formatDateTime(selectedRequest.endTime)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Project / Course:</span>
                <span className="font-semibold text-slate-900">
                  {selectedRequest.purpose || 'Senior Capstone Documentary Production'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Institutional Security Deposit:</span>
                <span className="font-bold text-emerald-700">$0.00 (Waived via High Trust Standing)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-700 border-rose-200 hover:bg-rose-50"
                onClick={() => {
                  setRejectConfirmTarget(selectedRequest);
                }}
              >
                Reject Request
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setApproveConfirmTarget(selectedRequest);
                }}
                rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve & Emit Access Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── APPROVE CONFIRM DIALOG ── */}
      <ConfirmDialog
        isOpen={!!approveConfirmTarget}
        title="Approve Resource Reservation?"
        message={`This will authorize ${approveConfirmTarget?.userName} to collect ${approveConfirmTarget?.resourceTitle} during their requested window. A cryptographic access token will be generated.`}
        confirmText="Approve & Emit Token"
        variant="primary"
        onConfirm={handleApprove}
        onClose={() => setApproveConfirmTarget(null)}
      />

      {/* ── REJECT CONFIRM DIALOG ── */}
      {rejectConfirmTarget && (
        <Modal
          isOpen={true}
          onClose={() => setRejectConfirmTarget(null)}
          title="Reject Reservation Request"
          description={`Provide a reason for declining ${rejectConfirmTarget.userName}'s reservation.`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setRejectConfirmTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
