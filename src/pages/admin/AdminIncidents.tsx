import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { useIncidents, useUpdateIncidentStatus } from '../../hooks/useIncidents';
import { formatDateTime } from '../../utils/formatters';
import {
  ShieldAlert,
  Gavel,
  CheckCircle2,
  Scale,
  Eye,
  Bot,
} from 'lucide-react';

import { Incident } from '../../types';
import { aiIncidentService } from '../../services/aiService';
import { AIFeatureBadge } from '../../components/ui/AIFeatureBadge';


export const AdminIncidents: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();
  const updateStatus = useUpdateIncidentStatus();

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDocketOpen, setIsDocketOpen] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState<number>(10);
  const [arbitrationNotes, setArbitrationNotes] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const handleOpenDocket = (incident: Incident) => {
    setSelectedIncident(incident);
    setPenaltyPoints(incident.trustPenaltyApplied || 10);
    setArbitrationNotes(
      incident.resolutionNotes ||
        'Institutional review concluded. Defect verified against pre-use photographic baseline.'
    );
    setIsDocketOpen(true);
  };

  const handleApplyRuling = async (
    status: Incident['status'],
    appliedPenalty: number,
    rulingSummary: string
  ) => {
    if (!selectedIncident) return;

    await updateStatus.mutateAsync({
      id: selectedIncident.id,
      status,
      resolutionNotes: `${rulingSummary}: ${arbitrationNotes}`,
      trustPenaltyApplied: appliedPenalty,
    });

    setFeedbackSuccess(
      `Arbitration docket ${selectedIncident.id} closed. Ruling dispatched to borrower and custodian.`
    );
    setIsDocketOpen(false);
    setSelectedIncident(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dispute Arbitration & Accountability Desk"
        description="Review escalated hardware incidents, borrower appeals, and adjust Trust Score accountability penalties."
        tag="Campus Administration"
      />

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-200/80 bg-rose-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Pending Docket Reviews
              </p>
              <h3 className="text-2xl font-bold text-rose-950 mt-1">
                {incidents?.filter((i) => i.status === 'investigating' || i.status === 'open').length || 2}
              </h3>
              <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                Escalated by lab custodians
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
              <Gavel className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/80 bg-purple-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Dispute Appeals Active
              </p>
              <h3 className="text-2xl font-bold text-purple-950 mt-1">1</h3>
              <p className="text-[11px] text-purple-700 font-medium mt-0.5">
                Photographic baseline contested
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
              <Scale className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/80 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Arbitrated Closures
              </p>
              <h3 className="text-2xl font-bold text-emerald-950 mt-1">14</h3>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Average resolution: &lt; 24h
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Notification */}
      {feedbackSuccess && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Campus Incident Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campus Incident Arbitration Docket</CardTitle>
          <p className="text-xs text-slate-500">
            Formal disputes requiring institutional administrative arbitration
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Docket ID</TableHead>
                <TableHead>Incident Summary</TableHead>
                <TableHead>Asset Involved</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Arbitration Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Loading dockets...
                  </TableCell>
                </TableRow>
              ) : incidents && incidents.length > 0 ? (
                incidents.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {inc.id}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      <div>{inc.title}</div>
                      <span className="text-[11px] font-normal text-slate-500">
                        {formatDateTime(inc.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {inc.resourceTitle}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{inc.reportedByName}</div>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {inc.reportedByRole}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inc.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : inc.severity === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          inc.status === 'resolved'
                            ? 'APPROVED'
                            : inc.status === 'investigating'
                            ? 'WAITLISTED'
                            : 'REJECTED'
                        }
                        label={inc.status.toUpperCase()}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenDocket(inc)}
                      >
                        Review Docket
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-slate-400">
                    No open arbitration dockets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: ADMIN ARBITRATION BENCH ── */}
      {selectedIncident && (
        <Modal
          isOpen={isDocketOpen}
          onClose={() => setIsDocketOpen(false)}
          title={`Administrative Arbitration: ${selectedIncident.id}`}
          description="Evaluate custodian evidence vs borrower defense and issue an institutional ruling."
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Incident Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedIncident.title}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {selectedIncident.resourceTitle}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedIncident.description}
              </p>
            </div>

            {/* AI Executive Summarization Panel */}
            {(() => {
              const aiSummary = aiIncidentService.summarizeIncident(selectedIncident);
              return (
                <div className="p-3.5 rounded-xl border border-purple-200/90 bg-gradient-to-br from-purple-50/60 to-indigo-50/40 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-900 text-xs">
                        AI Incident Summary & Arbitration Assistant
                      </span>
                      <AIFeatureBadge label="AI Summary (Simulated Preview)" variant="purple" size="sm" />
                    </div>
                    <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold">
                      NLP Dispute Analysis
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {aiSummary.conciseSummary}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-white/80 p-2 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block font-semibold uppercase">Root Cause</span>
                      <span className="font-bold text-slate-800">{aiSummary.rootCauseCategory}</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block font-semibold uppercase">Risk Severity</span>
                      <span className="font-bold text-rose-700">{aiSummary.riskSeverityTier}</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-purple-100 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block font-semibold uppercase">Suggested Ruling</span>
                      <span className="font-bold text-purple-800">
                        -{aiSummary.suggestedAdministrativeRuling.recommendedPenalty} pts ({aiSummary.suggestedAdministrativeRuling.recommendedAction})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-purple-100/60">
                    <span className="text-[10px] text-slate-500 italic">
                      🔍 {aiSummary.photographicDiscrepancyNotes}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPenaltyPoints(aiSummary.suggestedAdministrativeRuling.recommendedPenalty);
                        setArbitrationNotes(aiSummary.suggestedAdministrativeRuling.justification);
                      }}
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shrink-0 shadow-2xs self-end sm:self-auto"
                    >
                      Apply AI Recommendation
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Evidence Exhibits View */}

            {selectedIncident.evidenceUrls && selectedIncident.evidenceUrls.length > 0 && (
              <div>
                <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider text-[11px]">
                  Submitted Evidence Photos
                </span>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedIncident.evidenceUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="w-48 h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 relative"
                    >
                      <img src={url} alt={`Exhibit ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                        Exhibit #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Penalty Adjustment */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Trust Score Adjustment Penalty</p>
                  <p className="text-slate-500 text-[11px]">
                    Penalty points deducted from borrower's permanent TrustScore index
                  </p>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-rose-700 text-sm">
                  <span>-{penaltyPoints} pts</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={penaltyPoints}
                onChange={(e) => setPenaltyPoints(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 pts (Full Amnesty)</span>
                <span>10 pts (Standard)</span>
                <span>30 pts (Severe / Revocation)</span>
              </div>
            </div>

            {/* Arbitration Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Formal Administrative Ruling Justification
              </label>
              <textarea
                value={arbitrationNotes}
                onChange={(e) => setArbitrationNotes(e.target.value)}
                rows={2}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            {/* Ruling Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDocketOpen(false)}
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  onClick={() =>
                    handleApplyRuling('resolved', 0, 'Dismissed / Borrower Exonerated')
                  }
                  leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                >
                  Dismiss / Exonerate
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    handleApplyRuling('resolved', penaltyPoints, 'Penalty Applied')
                  }
                  leftIcon={<Gavel className="w-3.5 h-3.5" />}
                >
                  Apply Penalty & Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
