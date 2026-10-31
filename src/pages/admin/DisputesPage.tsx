import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useIncidents, useUpdateIncidentStatus } from '../../hooks/useIncidents';
import { aiIncidentService } from '../../services/aiService';
import { Incident } from '../../types';
import {
  Scale,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const DisputesPage: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();
  const updateIncidentStatus = useUpdateIncidentStatus();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolvedMessage, setResolvedMessage] = useState('');

  const selectedIncident = incidents?.find((i: Incident) => i.id === selectedIncidentId) || incidents?.[0];

  const handleResolve = async (action: 'dismiss' | 'action') => {
    if (!selectedIncident) return;
    try {
      setResolving(true);
      await updateIncidentStatus.mutateAsync({
        id: selectedIncident.id,
        status: 'resolved',
        resolutionNotes: resolutionNotes || `Case concluded: ${action === 'dismiss' ? 'Dismissed without penalty' : 'Warning issued; condition logged'}.`,
      });
      setResolvedMessage(`Incident ${selectedIncident.id} marked as resolved.`);
      setResolutionNotes('');
      setTimeout(() => setResolvedMessage(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setResolving(false);
    }
  };

  const aiSummary = selectedIncident ? aiIncidentService.summarizeIncident(selectedIncident) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Dispute Arbitration & Resolution Workspace"
        description="Impartial administrative review of condition discrepancies, late returns, and damage claims"
      />

      {resolvedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resolvedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 cols: Open Disputes List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pending Cases ({incidents?.length || 0})
          </h3>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading cases...</div>
          ) : !incidents || incidents.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No unresolved disputes or open claims.
              </CardContent>
            </Card>
          ) : (
            incidents.map((inc: Incident) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedIncident?.id === inc.id
                    ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{inc.id}</span>
                  <StatusBadge status={inc.status} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{inc.resourceTitle}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{inc.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                  <span>Reported by: {inc.reportedByName}</span>
                  <span>{new Date(inc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 7 cols: Case Review Panel */}
        <div className="lg:col-span-7 space-y-6">
          {selectedIncident ? (
            <>
              {/* Evidence & Case Overview Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Scale className="w-4 h-4 text-purple-600" />
                        Dispute Docket: {selectedIncident.id}
                      </CardTitle>
                      <CardDescription>
                        Resource: <span className="font-semibold text-slate-700">{selectedIncident.resourceTitle}</span>
                      </CardDescription>
                    </div>
                    <StatusBadge status={selectedIncident.severity} label={`Severity: ${selectedIncident.severity}`} size="sm" />
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Report Statement
                    </h5>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                      {selectedIncident.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Filing Party</span>
                      <span className="font-semibold text-slate-800">{selectedIncident.reportedByName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Associated Booking</span>
                      <span className="font-mono font-medium text-slate-800">{selectedIncident.bookingId || 'N/A'}</span>
                    </div>
                  </div>

                  {/* AI Advisory Synthesis Block */}
                  {aiSummary && (
                    <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>AI Advisory Synthesis (Non-Binding)</span>
                      </div>
                      <p className="text-purple-950 leading-relaxed">
                        {aiSummary.conciseSummary}
                      </p>
                      <div className="p-2.5 rounded-lg bg-white/80 border border-purple-100 text-[11px] text-purple-900">
                        <span className="font-bold">Suggested Action: </span>
                        {aiSummary.suggestedAdministrativeRuling.recommendedAction} ({aiSummary.suggestedAdministrativeRuling.justification})
                      </div>
                      <p className="text-[10px] text-purple-600 italic">
                        * Under platform bylaws, human administrators retain full discretionary authority over final rulings.
                      </p>
                    </div>
                  )}

                  {/* Resolution Input & Action Buttons */}
                  <div className="pt-2 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Arbitrator Official Notes & Findings
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Specify findings, condition assessment adjustments, or deposit release authorization..."
                      className="w-full min-h-[80px] p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve('dismiss')}
                        isLoading={resolving}
                      >
                        Dismiss Claim (No Penalty)
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleResolve('action')}
                        isLoading={resolving}
                      >
                        Issue Ruling & Conclude
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center text-xs text-slate-500">
                Select a dispute case from the list on the left to inspect evidence and enter arbitrator findings.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
