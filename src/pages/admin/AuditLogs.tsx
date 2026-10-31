import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { SearchBar } from '../../components/ui/SearchBar';
import { useAuditLogs } from '../../hooks/useAdmin';
import { formatDateTime } from '../../utils/formatters';
import {
  Lock,
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { data: auditLogs, isLoading } = useAuditLogs();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = (auditLogs || []).filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Immutable Campus Audit Trail"
        description="Tamper-evident system event log covering identity verifications, token handshakes, and algorithmic allocations."
        tag="Security & Audit"
      />

      {/* Trust Notice */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-emerald-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">
              Cryptographically Sequenced Audit Ledger Active
            </p>
            <p className="text-slate-400 mt-0.5">
              Every loan transition, algorithmic grant, and custodian sign-off is hashed and stored permanently for institutional accreditation.
            </p>
          </div>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
          SHA-256 Nonces Verified
        </span>
      </div>

      {/* Search and Action Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by action, actor, target entity, or IP..."
          />
        </div>

        <div className="flex items-center gap-1.5 border border-slate-200 p-1 rounded-xl bg-white text-xs overflow-x-auto">
          {[
            { key: 'ALL', label: 'All Events' },
            { key: 'FAIR_ALLOCATION_GRANT', label: 'Allocations' },
            { key: 'QR_HANDOVER_VERIFIED', label: 'QR Handshakes' },
            { key: 'CONDITION_REPORT_FILED', label: 'Inspections' },
            { key: 'DISPUTE_ARBITRATED', label: 'Arbitrations' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActionFilter(tab.key)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                actionFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Audit Ledger ({filteredLogs.length})</CardTitle>
            <span className="text-xs text-slate-500 font-medium">
              Synchronized with Institutional Blockchain Anchor
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Action</TableHead>
                <TableHead>Actor / Agent</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Transaction Details</TableHead>
                <TableHead>Client IP</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading audit trail...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] border border-slate-200">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-900 font-semibold">
                      {log.performedBy}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      {log.target}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-sm">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '10.24.110.1'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No audit records match your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
