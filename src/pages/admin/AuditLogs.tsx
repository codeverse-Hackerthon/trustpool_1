import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { SearchBar } from '../../components/ui/SearchBar';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuditLogs } from '../../hooks/useAdmin';
import { auditService, AuditRecord, AuditCategory, AuditEventType } from '../../services/auditService';
import { formatDateTime } from '../../utils/formatters';
import {
  Lock,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  ClipboardCheck,
  Scale,
  AlertTriangle,
  RotateCcw,
  Eye,
  Copy,
  Check,
  Shield,
  FileText,
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { data: rawAuditLogs, isLoading } = useAuditLogs();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory>('all');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const logs: AuditRecord[] = rawAuditLogs || auditService.getAuditLogs();
  const filteredLogs = auditService.filterAuditLogs(logs, search, categoryFilter);

  const handleOpenDetail = (record: AuditRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExport = (format: 'json' | 'csv') => {
    auditService.exportAuditLedger(filteredLogs, format);
  };

  // Helper for event badge color & icon
  const getEventBadge = (eventType: AuditEventType) => {
    switch (eventType) {
      case 'BOOKING_CREATED':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Creation',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'BOOKING_APPROVED':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Approval',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'BOOKING_REJECTED':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Rejection',
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'BOOKING_CANCELLED':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-slate-600" />,
          label: 'Cancellation',
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'FAIR_ALLOCATION_DECISION':
        return {
          icon: <Scale className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Allocation',
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'QR_CHECK_IN':
        return {
          icon: <QrCode className="w-3.5 h-3.5 text-indigo-600" />,
          label: 'Check-In',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'QR_CHECK_OUT':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />,
          label: 'Check-Out',
          className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case 'CONDITION_REPORT_SUBMITTED':
        return {
          icon: <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Inspection',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'RETURN_VERIFIED':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Return Verified',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'INCIDENT_UPDATED':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Arbitration',
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5 text-slate-600" />,
          label: 'System Log',
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Complete Campus Audit & Accountability Ledger"
        description="Immutable, cryptographically anchored audit record of bookings, approvals, fair allocations, QR check-ins/outs, condition reports, and incident arbitrations."
        tag="Institutional Governance"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-600" />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-blue-600" />}
              onClick={() => handleExport('json')}
            >
              Export JSON
            </Button>
          </div>
        }
      />

      {/* Trust Notice & Hash Verification Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white text-sm">
                Cryptographically Sequenced Accountability Ledger
              </p>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-slate-400 mt-0.5">
              Every booking creation, custodian sign-off, algorithmic priority calculation, and return verification is sealed with SHA-256 nonces for university audit accreditation.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 font-mono text-[11px] text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ledger Depth: <strong>{logs.length} Blocks</strong></span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by action, student, owner, asset, details or hash..."
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 border border-slate-200 p-1 rounded-xl bg-white text-xs overflow-x-auto shadow-2xs">
            {[
              { key: 'all', label: 'All Events' },
              { key: 'booking', label: 'Bookings & Approvals' },
              { key: 'allocation', label: 'Fair Allocations' },
              { key: 'qr_access', label: 'QR Handshakes' },
              { key: 'condition_return', label: 'Inspections & Returns' },
              { key: 'incident', label: 'Incident Desk' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCategoryFilter(tab.key as AuditCategory)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  categoryFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Audit Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Immutable Event Ledger ({filteredLogs.length})</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Displaying chronologically sequenced actions with verified actor identities
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              Synchronized Local Node
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Actor / Agent</TableHead>
                <TableHead>Target Resource / User</TableHead>
                <TableHead>Transaction Details</TableHead>
                <TableHead>Cryptographic Proof</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    <Clock className="w-5 h-5 mx-auto mb-2 animate-spin text-blue-600" />
                    <span>Loading tamper-evident ledger...</span>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const badge = getEventBadge(log.eventType);
                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Event Type */}
                      <TableCell>
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                          <div className="text-xs font-semibold text-slate-900 block truncate max-w-[170px]">
                            {log.actionTitle}
                          </div>
                        </div>
                      </TableCell>

                      {/* Actor */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {log.performedBy.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 leading-tight">
                              {log.performedBy.name}
                            </p>
                            <span className="text-[10px] text-slate-400 uppercase font-medium">
                              {log.performedBy.role}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Target */}
                      <TableCell>
                        <div className="text-xs font-medium text-slate-800 max-w-[180px] truncate">
                          {log.targetEntity}
                        </div>
                        {log.targetUser && (
                          <span className="text-[10px] text-blue-600 font-medium block">
                            👤 {log.targetUser.name}
                          </span>
                        )}
                      </TableCell>

                      {/* Details */}
                      <TableCell className="max-w-xs">
                        <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                          {log.details}
                        </p>
                        {log.metadata?.trustScoreDelta && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {log.metadata.trustScoreDelta}
                          </span>
                        )}
                      </TableCell>

                      {/* Crypto Hash */}
                      <TableCell>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200/80 w-fit">
                          <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{log.cryptoHash.slice(0, 8)}...{log.cryptoHash.slice(-6)}</span>
                        </div>
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenDetail(log)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    No audit records match the specified filters. Try selecting a different category or search term.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: COMPLETE EVENT AUDIT INSPECTION ── */}
      {selectedRecord && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Audit Record Breakdown: ${selectedRecord.id}`}
          description="Comprehensive cryptographic proof and institutional transaction metadata."
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Action Banner */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedRecord.actionTitle}</h4>
                  <span className="font-mono text-[10px] text-slate-500">
                    EVENT TYPE: {selectedRecord.eventType} • CATEGORY: {selectedRecord.category.toUpperCase()}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                VERIFIED ✓
              </span>
            </div>

            {/* Grid of Actors & Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Authorizing Actor
                </span>
                <p className="font-bold text-slate-900">{selectedRecord.performedBy.name}</p>
                <p className="text-slate-500 capitalize">
                  Role: {selectedRecord.performedBy.role} • ID: {selectedRecord.performedBy.id}
                </p>
                {selectedRecord.performedBy.department && (
                  <p className="text-[11px] text-slate-400">{selectedRecord.performedBy.department}</p>
                )}
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Target Entity / Borrower
                </span>
                <p className="font-bold text-slate-900">{selectedRecord.targetEntity}</p>
                {selectedRecord.targetUser ? (
                  <p className="text-slate-500 capitalize">
                    Borrower: {selectedRecord.targetUser.name} ({selectedRecord.targetUser.id})
                  </p>
                ) : (
                  <p className="text-slate-400">Institutional Shared Asset</p>
                )}
              </div>
            </div>

            {/* Transaction Full Details */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transaction Narrative
              </span>
              <p className="text-slate-700 leading-relaxed font-normal text-xs">
                {selectedRecord.details}
              </p>
            </div>

            {/* Metadata (if available) */}
            {selectedRecord.metadata && Object.keys(selectedRecord.metadata).length > 0 && (
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  State Mutation Metadata
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(selectedRecord.metadata).map(([key, val]) => (
                    <div key={key} className="bg-white p-2 rounded border border-slate-200/80">
                      <span className="text-slate-400 uppercase font-semibold text-[9px] block">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-medium text-slate-800">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cryptographic Proof Section */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  SHA-256 Cryptographic Block Seal
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyHash(selectedRecord.cryptoHash)}
                  className="text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-slate-300 break-all bg-black/40 p-2 rounded border border-white/10">
                {selectedRecord.cryptoHash}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Client Origin IP: {selectedRecord.ipAddress}</span>
                <span>Timestamp: {selectedRecord.timestamp}</span>
              </div>
            </div>

            {/* Close CTA */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close Audit Detail
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
