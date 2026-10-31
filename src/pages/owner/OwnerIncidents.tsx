import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useIncidents, useReportIncident, useUpdateIncidentStatus } from '../../hooks/useIncidents';
import { formatDateTime } from '../../utils/formatters';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Upload,
  X,
  ShieldAlert,
  Clock,
  Eye,
} from 'lucide-react';
import { Incident, IncidentSeverity } from '../../types';

export const OwnerIncidents: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();
  const reportIncident = useReportIncident();
  const updateStatus = useUpdateIncidentStatus();

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Incident['type']>('damage');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [resourceId, setResourceId] = useState('res-101');
  const [againstUserId, setAgainstUserId] = useState('user-stu-3');
  const [description, setDescription] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  ]);

  // Review Drawer state
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');

  // Filtered incidents
  const filteredIncidents = (incidents || []).filter((inc) => {
    if (filterTab === 'open') return inc.status === 'open';
    if (filterTab === 'investigating') return inc.status === 'investigating';
    if (filterTab === 'resolved') return inc.status === 'resolved';
    return true;
  });

  const handleAddSampleEvidence = () => {
    const samples = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    ];
    setEvidencePhotos([...evidencePhotos, samples[evidencePhotos.length % samples.length]]);
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidencePhotos(evidencePhotos.filter((_, i) => i !== index));
  };

  const handleSubmitNewIncident = async () => {
    if (!title.trim() || !description.trim()) return;

    await reportIncident.mutateAsync({
      resourceId,
      againstUserId,
      type,
      severity,
      title,
      description,
      evidenceUrls: evidencePhotos,
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleOpenReview = (incident: Incident) => {
    setSelectedIncident(incident);
    setResolutionNote(incident.resolutionNotes || '');
    setIsReviewOpen(true);
  };

  const handleResolveIncident = async (newStatus: Incident['status']) => {
    if (!selectedIncident) return;
    await updateStatus.mutateAsync({
      id: selectedIncident.id,
      status: newStatus,
      resolutionNotes: resolutionNote || 'Resolved following custodian inspection and borrower agreement.',
      trustPenaltyApplied: newStatus === 'resolved' ? 0 : selectedIncident.trustPenaltyApplied,
    });
    setIsReviewOpen(false);
    setSelectedIncident(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Custodian Incident & Damage Desk"
        description="Log physical hardware defects, late return delays, or missing components with photographic evidence."
        tag="Custodian Accountability"
        actions={
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            File Incident Report
          </Button>
        }
      />

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-200/80 bg-rose-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Active Incidents
              </p>
              <h3 className="text-2xl font-bold text-rose-950 mt-1">
                {incidents?.filter((i) => i.status === 'open' || i.status === 'investigating').length || 2}
              </h3>
              <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                Requiring review or escalation
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200/80 bg-amber-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Under Admin Review
              </p>
              <h3 className="text-2xl font-bold text-amber-950 mt-1">
                {incidents?.filter((i) => i.status === 'investigating').length || 1}
              </h3>
              <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                Formal arbitration pending
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/80 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Resolved This Month
              </p>
              <h3 className="text-2xl font-bold text-emerald-950 mt-1">
                {incidents?.filter((i) => i.status === 'resolved').length || 1}
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Custody restored clean
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: 'All Incidents' },
          { key: 'open', label: 'Open' },
          { key: 'investigating', label: 'Investigating / Escalated' },
          { key: 'resolved', label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === tab.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logged Incident Docket</CardTitle>
          <p className="text-xs text-slate-500">
            Recorded infractions with attached photographic evidence and resolution notes
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Logged</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Loading incident records...
                  </TableCell>
                </TableRow>
              ) : filteredIncidents.length > 0 ? (
                filteredIncidents.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      <div>{inc.title}</div>
                      <span className="font-mono text-[10px] text-slate-400">{inc.id}</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {inc.resourceTitle}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {inc.type.replace('_', ' ')}
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
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(inc.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenReview(inc)}
                      >
                        Review Evidence
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-slate-400">
                    No incidents recorded in this category.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: FILE NEW INCIDENT REPORT ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File Custodian Incident Report"
        description="Document an accountability infraction or physical hardware defect with evidence."
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <Input
            label="Incident Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scratched lens coating or 45-minute unreported delay"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Infraction Category"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              options={[
                { value: 'damage', label: 'Physical Damage / Component Defect' },
                { value: 'late_return', label: 'Unreported Overdue Return Delay' },
                { value: 'missing_item', label: 'Missing Cable / Kit Accessory' },
                { value: 'cleanliness', label: 'Returned Dirty / Residue Present' },
                { value: 'unauthorized_use', label: 'Unauthorized Third-Party Use' },
              ]}
            />

            <Select
              label="Severity Level"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              options={[
                { value: 'low', label: 'Low - Minor Cosmetic Wear' },
                { value: 'medium', label: 'Medium - Operational Inconvenience' },
                { value: 'high', label: 'High - Hardware Defect / Part Replacement' },
                { value: 'critical', label: 'Critical - Unusable Asset / Total Loss' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Campus Asset"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              options={[
                { value: 'res-101', label: 'Sony FX3 Cinema Camera Kit' },
                { value: 'res-102', label: 'Bambu Lab X1-Carbon 3D Printer' },
                { value: 'res-104', label: 'VR & Spatial Computing Rig' },
                { value: 'res-107', label: '1GHz Digital Storage Oscilloscope' },
              ]}
            />

            <Input
              label="Offending Borrower Account"
              value={againstUserId}
              onChange={(e) => setAgainstUserId(e.target.value)}
              placeholder="e.g. user-stu-3 (Taylor Brooks)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description of Incident
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide exact facts, custodian observations, borrower statements, or witness details."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
              required
            />
          </div>

          {/* Photographic Evidence Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Attached Evidence Photos
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {evidencePhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group"
                >
                  <img src={photo} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSampleEvidence}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 flex flex-col items-center justify-center text-rose-600 transition-all text-center p-2"
              >
                <Upload className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-semibold">+ Photo</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={reportIncident.isPending}
              onClick={handleSubmitNewIncident}
              rightIcon={<AlertTriangle className="w-3.5 h-3.5" />}
            >
              Submit Incident Ticket
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: CUSTODIAN EVIDENCE REVIEW & ARBITRATION ── */}
      {selectedIncident && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={`Incident Review: ${selectedIncident.id}`}
          description="Review borrower statement, photographic evidence, and choose resolution course."
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedIncident.title}</span>
                <StatusBadge
                  status={
                    selectedIncident.status === 'resolved'
                      ? 'APPROVED'
                      : selectedIncident.status === 'investigating'
                      ? 'WAITLISTED'
                      : 'REJECTED'
                  }
                  label={selectedIncident.status.toUpperCase()}
                  size="sm"
                />
              </div>
              <p className="text-slate-600 leading-relaxed">{selectedIncident.description}</p>
              <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                <span>Asset: {selectedIncident.resourceTitle}</span>
                <span>•</span>
                <span>Reported by: {selectedIncident.reportedByName}</span>
              </div>
            </div>

            {/* Photographic Evidence Previews */}
            {selectedIncident.evidenceUrls && selectedIncident.evidenceUrls.length > 0 && (
              <div>
                <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider text-[11px]">
                  Photographic Evidence Exhibits
                </span>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedIncident.evidenceUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="w-48 h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 relative group"
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

            {/* Resolution Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custodian Resolution / Escalation Notes
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={2}
                placeholder="Enter resolution notes, terms of agreement, or reasons for escalating to Campus Admin..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReviewOpen(false)}
              >
                Close
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => handleResolveIncident('investigating')}
                >
                  Escalate to Admin
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleResolveIncident('resolved')}
                  rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Mark Resolved (Zero Penalty)
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
