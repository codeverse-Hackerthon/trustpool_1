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
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Bot,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { Booking } from '../../types';
import { aiAnomalyService, AnomalyReport } from '../../services/aiService';
import { AIFeatureBadge } from '../../components/ui/AIFeatureBadge';

export const BookingMonitoring: React.FC = () => {
  const { data: bookings, isLoading } = useMyBookings();
  const updateStatus = useUpdateBookingStatus();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [overrideReason, setOverrideReason] = useState('Administrative intervention for campus safety inspection.');
  const [notice, setNotice] = useState<string | null>(null);

  // AI Anomaly Detection states
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyReport | null>(null);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const [dismissedFlags, setDismissedFlags] = useState<string[]>([]);

  // Compute anomalies for all bookings
  const anomalyReports = aiAnomalyService.detectAnomalies(bookings || []);
  const anomalyMap = React.useMemo(() => {
    const map: Record<string, AnomalyReport> = {};
    anomalyReports.forEach((a) => {
      map[a.bookingId] = a;
    });
    return map;
  }, [anomalyReports]);

  const activeFlaggedCount = anomalyReports.filter(
    (a) => a.isFlagged && !dismissedFlags.includes(a.bookingId)
  ).length;

  const filteredBookings = (bookings || []).filter((b) => {
    if (statusFilter === 'anomalies') {
      const a = anomalyMap[b.id];
      if (!a?.isFlagged || dismissedFlags.includes(b.id)) return false;
    } else if (statusFilter !== 'all' && b.status !== statusFilter) {
      return false;
    }

    const matchesSearch =
      !search ||
      b.resourceTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.userName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleDismissFlag = (bookingId: string) => {
    setDismissedFlags([...dismissedFlags, bookingId]);
    setIsAnomalyModalOpen(false);
    setSelectedAnomaly(null);
    setNotice(`AI anomaly flag dismissed for booking ${bookingId}.`);
    setTimeout(() => setNotice(null), 4000);
  };


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

      {/* AI Anomaly Radar Banner */}
      <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-rose-50/40 p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-600 text-white shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>AI Unusual Usage & Hoarding Radar</span>
                <AIFeatureBadge label="AI Anomaly Radar (Simulated Preview)" variant="amber" size="sm" />
              </h3>
              <p className="text-[11px] text-slate-600">
                Statistical heuristic model scans reservation velocity, off-hours transit risks, and multi-slot hoarding spikes.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded font-mono font-bold self-start sm:self-auto">
            {activeFlaggedCount} Anomalies Flagged
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {activeFlaggedCount > 0
                ? `${activeFlaggedCount} reservations flagged for potential quota hoarding or extended off-hours custody risk.`
                : 'All campus reservations currently conform to normal department usage thresholds.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'anomalies' ? 'all' : 'anomalies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                statusFilter === 'anomalies'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100/60'
              }`}
            >
              {statusFilter === 'anomalies' ? '✓ Showing Flagged Only' : 'Filter Anomaly Flagged'}
            </button>
          </div>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by student, asset name, or booking reference..."
          />
        </div>

        <div className="flex items-center gap-1.5 border border-slate-200 p-1 rounded-xl bg-white text-xs overflow-x-auto shadow-2xs">
          {[
            { key: 'all', label: 'All Statuses' },
            { key: 'anomalies', label: `⚠️ AI Flagged (${activeFlaggedCount})` },
            { key: 'active', label: 'Active Loans' },
            { key: 'approved', label: 'Approved' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
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
                <TableHead>Status & AI Radar</TableHead>
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
                filteredBookings.map((b) => {
                  const anomaly = anomalyMap[b.id];
                  const isFlagged = anomaly?.isFlagged && !dismissedFlags.includes(b.id);

                  return (
                    <TableRow key={b.id} className={isFlagged ? 'bg-amber-50/40' : undefined}>
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
                        <div className="space-y-1">
                          <StatusBadge status={b.status} size="sm" />
                          {isFlagged && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAnomaly(anomaly);
                                setIsAnomalyModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors shadow-2xs"
                              title="Click to inspect unusual usage pattern"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              <span>Anomaly: {anomaly.anomalyScore}/100</span>
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isFlagged && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-amber-800 border-amber-300 hover:bg-amber-50"
                              leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setSelectedAnomaly(anomaly);
                                setIsAnomalyModalOpen(true);
                              }}
                            >
                              Review Anomaly
                            </Button>
                          )}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* ── MODAL: AI UNUSUAL USAGE ANOMALY INSPECTION ── */}
      {selectedAnomaly && (
        <Modal
          isOpen={isAnomalyModalOpen}
          onClose={() => setIsAnomalyModalOpen(false)}
          title={`AI Anomaly Pattern Evaluation: Booking ${selectedAnomaly.bookingId}`}
          description="Detailed heuristic behavioral analysis of unusual access velocity or custody deviation."
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-amber-950 text-sm">{selectedAnomaly.detectedPattern}</span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-200/80 text-amber-950">
                  Anomaly Score: {selectedAnomaly.anomalyScore}/100 ({selectedAnomaly.severity.toUpperCase()} RISK)
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed font-normal">
                {selectedAnomaly.aiExplanation}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recommended Administrative Action
              </span>
              <p className="text-slate-800 font-semibold leading-relaxed">
                💡 {selectedAnomaly.recommendedAction}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 text-[11px] text-purple-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>AI Disclaimer:</strong> Heuristic rule simulation based on historical department reservation velocity. Microservice integration required for neural pattern inference.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnomalyModalOpen(false)}
              >
                Close
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-700 border-slate-300 hover:bg-slate-50"
                  onClick={() => handleDismissFlag(selectedAnomaly.bookingId)}
                >
                  Dismiss Flag (False Positive)
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const b = bookings?.find((x) => x.id === selectedAnomaly.bookingId);
                    if (b) {
                      setIsAnomalyModalOpen(false);
                      setCancelTarget(b);
                    }
                  }}
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                >
                  Override Cancel Booking
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}


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
