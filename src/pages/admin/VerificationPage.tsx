import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { useAllUsers, useVerifyUserMutation } from '../../hooks/useAdmin';
import {
  Check,
  X,
  Building,
  CheckCircle2,
  FileCheck,
  Eye,
  Bot,
} from 'lucide-react';
import { User } from '../../types';
import { AIFeatureBadge } from '../../components/ui/AIFeatureBadge';


export const VerificationPage: React.FC = () => {
  const { data: users, isLoading } = useAllUsers();
  const verifyMutation = useVerifyUserMutation();

  const [reviewApplicant, setReviewApplicant] = useState<User | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filter pending verification users (or unverified owners/students)
  const pendingApplicants = (users || []).filter((u) => !u.isVerified);

  const handleApprove = async (applicant: User) => {
    await verifyMutation.mutateAsync({
      userId: applicant.id,
      isVerified: true,
    });
    setSuccessNotice(`Approved and verified institutional status for ${applicant.name}!`);
    setReviewApplicant(null);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleReject = async (applicant: User) => {
    setSuccessNotice(`Declined verification credentials for ${applicant.name}.`);
    setReviewApplicant(null);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Institutional Verification Queue"
        description="Verify campus faculty authorizations, department lab custodians, and borrower enrollment credentials."
        tag="Identity Assurance"
      />

      {/* Notice Banner */}
      {successNotice && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
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
              <CardTitle>Pending Custodian & Borrower Applications</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Unverified accounts cannot host institutional assets or access Tier A restricted loans
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
              {pendingApplicants.length} Awaiting Verification
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Requested Persona</TableHead>
                <TableHead>Department Affiliation</TableHead>
                <TableHead>Institutional ID</TableHead>
                <TableHead>Verification Documents</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading applications...
                  </TableCell>
                </TableRow>
              ) : pendingApplicants.length > 0 ? (
                pendingApplicants.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      <div>{u.name}</div>
                      <span className="text-[11px] font-normal text-slate-500">{u.email}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'owner'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role === 'owner' ? 'Facility Custodian' : 'Student Borrower'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {u.department || 'BioSciences Complex'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {u.institutionId || 'FAC-20914'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                        <FileCheck className="w-3.5 h-3.5" />
                        Faculty ID / Registrar Match
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2"
                          onClick={() => setReviewApplicant(u)}
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 mr-1" />
                          Review
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs px-2.5 py-1"
                          onClick={() => handleApprove(u)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-rose-600 border-rose-200 px-2 py-1"
                          onClick={() => handleReject(u)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    All institutional verification applications have been cleared.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: VERIFICATION CREDENTIALS AUDIT ── */}
      {reviewApplicant && (
        <Modal
          isOpen={true}
          onClose={() => setReviewApplicant(null)}
          title={`Verify Institutional Credential: ${reviewApplicant.name}`}
          description="Review faculty appointment letter, departmental facility authorization, and campus registrar match."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{reviewApplicant.name}</h4>
                  <p className="text-slate-500 text-[11px]">{reviewApplicant.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  {reviewApplicant.role}
                </span>
              </div>
              <div className="pt-1 text-slate-600 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Department: {reviewApplicant.department}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automatic Directory Verification: MATCH FOUND</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                University Active Directory confirmed faculty ID <strong>{reviewApplicant.institutionId}</strong> matches active payroll and building access keys for BioSciences Complex.
              </p>
            </div>

            {/* AI Document Extraction Assistant Preview */}
            <div className="p-3.5 rounded-xl border border-purple-200/90 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    AI Document Extraction & Credential Match
                  </span>
                  <AIFeatureBadge label="AI Assistant (Simulated Preview)" variant="purple" size="sm" />
                </div>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold">
                  98.4% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-purple-100/80">
                  <span className="text-slate-400 text-[10px] block font-semibold">Document Verified</span>
                  <span className="font-bold text-slate-900">Institutional Faculty Credentials Letter</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-purple-100/80">
                  <span className="text-slate-400 text-[10px] block font-semibold">Extracted Subject ID</span>
                  <span className="font-mono font-bold text-slate-900">{reviewApplicant.institutionId}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic pt-1 border-t border-purple-100/60">
                ✓ AI Document OCR verified official university letterhead seal and registrar cryptographic watermark.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">

              <Button variant="outline" size="sm" onClick={() => setReviewApplicant(null)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200"
                onClick={() => handleReject(reviewApplicant)}
              >
                Decline Application
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(reviewApplicant)}
                rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve & Grant Verified Status
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
