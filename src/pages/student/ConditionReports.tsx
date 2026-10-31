import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useConditionReports, useCreateConditionReport } from '../../hooks/useConditionReports';
import { formatDateTime } from '../../utils/formatters';
import {
  CheckCircle2,
  Plus,
  Upload,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Camera,
  X,
  FileCheck,
} from 'lucide-react';
import { ReportType } from '../../types';

export const ConditionReports: React.FC = () => {
  const { data: reports, isLoading } = useConditionReports();
  const createReport = useCreateConditionReport();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('pre_use');
  const [overallRating, setOverallRating] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'damaged'>('excellent');
  const [selectedResourceId, setSelectedResourceId] = useState('res-101');
  const [comments, setComments] = useState('');
  const [hasDamage, setHasDamage] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  ]);

  // Selected comparison pair
  const [comparisonBookingId, setComparisonBookingId] = useState('book-902');

  // Find pre and post reports for comparison
  const preReport = reports?.find((r) => r.bookingId === comparisonBookingId && r.type === 'pre_use') || reports?.find(r => r.type === 'pre_use');
  const postReport = reports?.find((r) => r.bookingId === comparisonBookingId && r.type === 'post_use') || reports?.find(r => r.type === 'post_use');

  // Simulated photo add
  const handleAddSamplePhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
    ];
    const nextPhoto = samples[uploadedPhotos.length % samples.length];
    setUploadedPhotos([...uploadedPhotos, nextPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  // Submit report
  const handleSubmitReport = async () => {
    await createReport.mutateAsync({
      bookingId: 'book-901',
      resourceId: selectedResourceId,
      type: reportType,
      overallRating,
      checklist: [
        { id: 'chk-1', label: 'Hardware clean and free of residue', checked: true },
        { id: 'chk-2', label: 'All power cables, covers, and accessories accounted for', checked: true },
        { id: 'chk-3', label: 'Unit boots up without error indicators', checked: true },
      ],
      comments: comments || 'Inspection completed according to campus protocol.',
      hasDamage,
      photoUrls: uploadedPhotos,
    });

    setIsModalOpen(false);
    setComments('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Resource Condition & Inspection Reports"
        description="Pre-use and post-use digital checklists with photographic verification to protect borrower integrity."
        tag="Peer Accountability"
        actions={
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            File Condition Report
          </Button>
        }
      />

      {/* Trust Notice Banner */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">
              Photographic Pre/Post Condition Protection Active
            </p>
            <p className="text-slate-600 mt-0.5">
              Taking 30 seconds to upload photographs upon pickup and return guarantees you will never be held liable for previous borrowers' defects.
            </p>
          </div>
        </div>
        <span className="shrink-0 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-[11px]">
          100% Custodian Match Rate
        </span>
      </div>

      {/* ── BEFORE VS AFTER COMPARISON WORKBENCH ── */}
      <Card className="border-slate-300 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <CardTitle>Before vs After Inspection Comparison</CardTitle>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side photographic audit between handover pickup and return check-out
              </p>
            </div>
            <div className="w-64">
              <Select
                value={comparisonBookingId}
                onChange={(e) => setComparisonBookingId(e.target.value)}
                options={[
                  { value: 'book-902', label: 'Bambu Lab 3D Printer (book-902)' },
                  { value: 'book-901', label: 'Sony FX3 Camera Kit (book-901)' },
                ]}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Visual Divider on Desktop */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 border border-slate-300 items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm z-10">
              VS
            </div>

            {/* Column 1: Before Use (Pre-Use Inspection) */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  Pre-Use Inspection (Before)
                </span>
                <span className="text-xs text-slate-500">
                  {preReport ? formatDateTime(preReport.createdAt) : 'Oct 28, 09:02 AM'}
                </span>
              </div>

              {/* Photo Viewport */}
              <div className="h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative">
                {preReport?.photoUrls?.[0] ? (
                  <img
                    src={preReport.photoUrls[0]}
                    alt="Pre-use condition"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                  Pickup Handover Photo
                </span>
              </div>

              {/* Condition & Rating */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Recorded Condition:</span>
                  <StatusBadge
                    status="APPROVED"
                    label={preReport?.overallRating.toUpperCase() || 'EXCELLENT'}
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Inspector:</span>
                  <span className="font-semibold text-slate-900">
                    {preReport?.userName || 'Alex Rivera (Borrower)'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200/80 text-slate-600 text-[11px] leading-relaxed">
                  "{preReport?.comments || 'Pristine condition upon collection.'}"
                </div>
              </div>
            </div>

            {/* Column 2: After Use (Post-Use Return Inspection) */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Post-Use Inspection (After)
                </span>
                <span className="text-xs text-slate-500">
                  {postReport ? formatDateTime(postReport.createdAt) : 'Oct 28, 11:58 AM'}
                </span>
              </div>

              {/* Photo Viewport */}
              <div className="h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative">
                {postReport?.photoUrls?.[0] ? (
                  <img
                    src={postReport.photoUrls[0]}
                    alt="Post-use return condition"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                  Return Dropoff Photo
                </span>
              </div>

              {/* Condition & Rating */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Return Condition:</span>
                  <StatusBadge
                    status="APPROVED"
                    label={postReport?.overallRating.toUpperCase() || 'EXCELLENT'}
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Verified By:</span>
                  <span className="font-semibold text-slate-900">
                    Dr. Sarah Chen (Custodian)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200/80 text-slate-600 text-[11px] leading-relaxed">
                  "{postReport?.comments || 'Resource returned in excellent clean order.'}"
                </div>
              </div>
            </div>
          </div>

          {/* Audit Verification Seal */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Custodian Audit Match:</strong> Zero new scratches or missing accessories detected. Digital custody closed with full TrustScore award.
              </span>
            </div>
            <span className="shrink-0 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +10 Trust Score Awarded ✓
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── HISTORICAL FILINGS TABLE ── */}
      <Card>
        <CardHeader>
          <CardTitle>All Filed Condition Reports</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of peer condition reports protecting borrowers against pre-existing defects
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Inspection Phase</TableHead>
                <TableHead>Physical Rating</TableHead>
                <TableHead>Defect Flag</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : reports && reports.length > 0 ? (
                reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {r.id}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      {r.resourceTitle}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          r.type === 'pre_use'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {r.type === 'pre_use' ? 'Pre-Use Check' : 'Post-Use Return'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status="APPROVED"
                        label={r.overallRating.toUpperCase()}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      {r.hasDamage ? (
                        <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Defect Noted
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No Defects
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(r.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setComparisonBookingId(r.bookingId)}
                      >
                        Compare
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-slate-400">
                    No condition reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: SUBMIT CONDITION REPORT ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Resource Condition Inspection"
        description="Record physical condition with photos to protect your chain of custody."
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Campus Resource"
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              options={[
                { value: 'res-101', label: 'Sony FX3 Cinema Camera Kit' },
                { value: 'res-102', label: 'Bambu Lab X1-Carbon 3D Printer' },
                { value: 'res-104', label: 'VR & Spatial Computing Rig' },
              ]}
            />
            <Select
              label="Inspection Phase"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              options={[
                { value: 'pre_use', label: 'Pre-Use (Handover Collection)' },
                { value: 'post_use', label: 'Post-Use (Return Dropoff)' },
              ]}
            />
            <Select
              label="Physical Condition Rating"
              value={overallRating}
              onChange={(e) => setOverallRating(e.target.value as any)}
              options={[
                { value: 'excellent', label: 'Excellent - Pristine / Like New' },
                { value: 'good', label: 'Good - Normal Minor Cosmetic Wear' },
                { value: 'fair', label: 'Fair - Operable with Scuffs' },
                { value: 'poor', label: 'Poor - Requires Maintenance' },
                { value: 'damaged', label: 'Damaged - Defect Present' },
              ]}
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Photographic Evidence
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {uploadedPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group"
                >
                  <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition-all text-center p-2"
              >
                <Upload className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-semibold">+ Photo</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Include clear photos of serial tags, lens glass, build plate, or connection ports.
            </p>
          </div>

          {/* Mandatory Checklist Items */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-900 block">Inspection Checklist Verification:</span>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span>Hardware is free of debris, dust, or sticky residues</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span>All cables, chargers, and kit accessories accounted for</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span>Powers on smoothly without warning lights</span>
            </label>
          </div>

          {/* Damage Flag Toggle */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={hasDamage}
              onChange={(e) => setHasDamage(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="font-semibold text-slate-900">
              Flag pre-existing physical damage or missing component
            </span>
          </label>

          <Input
            label="Comments / Inspection Notes"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="e.g. Lens front element pristine; battery was pre-charged to 100%."
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={createReport.isPending}
              onClick={handleSubmitReport}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Submit Condition Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
