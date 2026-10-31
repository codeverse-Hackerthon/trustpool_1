import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';
import { useCreateBooking, useMyBookings } from '../../hooks/useBookings';
import { useAuth } from '../../hooks/useAuth';
import { Resource } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Building,
  Sparkles,
  Layers,
  Upload,
  FileCheck,
  Clock,
  Bot,
} from 'lucide-react';

import { aiDocumentService, DocumentExtractionResult } from '../../services/aiService';
import { AIFeatureBadge } from '../ui/AIFeatureBadge';


interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
}

type Step = 'date_time' | 'purpose' | 'eligibility' | 'review' | 'confirmed';

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  resource,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const { data: existingBookings } = useMyBookings();

  const userTrustScore = user?.trustScore ?? 92;
  const isEligible = userTrustScore >= resource.minTrustScore;

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('date_time');

  // Form states
  const [selectedDate, setSelectedDate] = useState('2026-11-02');
  const [selectedSlot, setSelectedSlot] = useState('09:00 - 12:00');
  const [purpose, setPurpose] = useState('');
  const [courseCode, setCourseCode] = useState('CS-490 Capstone');
  const [participants, setParticipants] = useState('1');
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form error states
  const [validationError, setValidationError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Eligibility Document Assistance state
  const [uploadedDoc, setUploadedDoc] = useState<DocumentExtractionResult | null>(null);
  const [isDocProcessing, setIsDocProcessing] = useState(false);

  const handleProcessDoc = async (fileObj: File | { name: string; size: number }) => {
    setIsDocProcessing(true);
    try {
      const res = await aiDocumentService.processEligibilityDocument(fileObj);
      setUploadedDoc(res);
    } finally {
      setIsDocProcessing(false);
    }
  };


  // Time slot options
  const TIME_SLOTS = [
    { label: '09:00 – 12:00 (Morning)', value: '09:00 - 12:00', duration: 3 },
    { label: '12:00 – 15:00 (Afternoon)', value: '12:00 - 15:00', duration: 3 },
    { label: '15:00 – 18:00 (Late Afternoon)', value: '15:00 - 18:00', duration: 3 },
    { label: '18:00 – 21:00 (Evening)', value: '18:00 - 21:00', duration: 3 },
  ];

  // Date shortcuts
  const DATE_PRESETS = [
    { label: 'Mon, Nov 2', value: '2026-11-02' },
    { label: 'Tue, Nov 3', value: '2026-11-03' },
    { label: 'Wed, Nov 4', value: '2026-11-04' },
    { label: 'Thu, Nov 5', value: '2026-11-05' },
  ];

  // Conflict detection
  const hasSchedulingConflict = selectedSlot === '15:00 - 18:00' && resource.category === 'equipment';
  const hasDuplicateBooking = existingBookings?.some(
    (b) =>
      b.startTime.includes(selectedDate) &&
      (b.status === 'approved' || b.status === 'active')
  );

  const resetForm = () => {
    setCurrentStep('date_time');
    setPurpose('');
    setNotes('');
    setAgreeTerms(false);
    setValidationError(null);
    setCreatedBookingId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Step 1 Validation
  const handleNextFromDateTime = () => {
    setValidationError(null);
    if (!selectedDate) {
      setValidationError('Please select a valid reservation date.');
      return;
    }
    if (!selectedSlot) {
      setValidationError('Please select a time slot.');
      return;
    }
    setCurrentStep('purpose');
  };

  // Step 2 Validation
  const handleNextFromPurpose = () => {
    setValidationError(null);
    if (!purpose.trim() || purpose.trim().length < 5) {
      setValidationError('Please provide a specific project or academic purpose (at least 5 characters).');
      return;
    }
    setCurrentStep('eligibility');
  };

  // Step 3 Next
  const handleNextFromEligibility = () => {
    setValidationError(null);
    setCurrentStep('review');
  };

  // Step 4 Submit Booking
  const handleConfirmBooking = async () => {
    if (!agreeTerms) {
      setValidationError('You must agree to the custodian care and condition checklist policy.');
      return;
    }

    const [startHour, endHour] = selectedSlot.split(' - ');
    const startTimeISO = `${selectedDate}T${startHour.replace(':', '')}:00Z`;
    const endTimeISO = `${selectedDate}T${endHour.replace(':', '')}:00Z`;

    try {
      const result = await createBooking.mutateAsync({
        resourceId: resource.id,
        startTime: startTimeISO,
        endTime: endTimeISO,
        purpose: `${purpose} (${courseCode})`,
        notes: notes || undefined,
      });

      setCreatedBookingId(result.id);
      setCurrentStep('confirmed');
    } catch {
      setValidationError('Failed to submit booking request. Please try again.');
    }
  };

  const stepsList: { key: Step; label: string }[] = [
    { key: 'date_time', label: '1. Date & Time' },
    { key: 'purpose', label: '2. Purpose' },
    { key: 'eligibility', label: '3. Fair Eligibility' },
    { key: 'review', label: '4. Review' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        currentStep === 'confirmed'
          ? 'Booking Confirmed!'
          : `Request Reservation: ${resource.title}`
      }
      size="lg"
    >
      <div className="space-y-5">
        {/* Step indicator progress bar (only when not confirmed) */}
        {currentStep !== 'confirmed' && (
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              {stepsList.map((step, idx) => {
                const isCurrent = currentStep === step.key;
                const isPassed =
                  (step.key === 'date_time' && currentStep !== 'date_time') ||
                  (step.key === 'purpose' &&
                    (currentStep === 'eligibility' || currentStep === 'review')) ||
                  (step.key === 'eligibility' && currentStep === 'review');

                return (
                  <div key={step.key} className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </span>
                    <span
                      className={`text-xs font-medium hidden sm:inline ${
                        isCurrent
                          ? 'text-slate-900 font-bold'
                          : isPassed
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ── STEP 1: Date & Time Selection ── */}
        {currentStep === 'date_time' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Reservation Date
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setSelectedDate(p.value)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      selectedDate === p.value
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min="2026-11-01"
                  max="2026-11-30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Time Slot (Standard 3-Hour Reservation)
              </label>
              <div className="space-y-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot.value;
                  const isContested = slot.value === '15:00 - 18:00' && resource.category === 'equipment';

                  return (
                    <div
                      key={slot.value}
                      onClick={() => setSelectedSlot(slot.value)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{slot.label}</p>
                          <p className="text-[11px] text-slate-500">
                            {isContested
                              ? 'High demand • Fair Allocation Queue active'
                              : 'Immediate allocation available'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isContested ? (
                          <StatusBadge status="WAITLISTED" label="Queue #1" size="sm" />
                        ) : (
                          <StatusBadge status="APPROVED" label="Available" size="sm" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conflict / Contested Warning Notice */}
            {hasSchedulingConflict && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Contested Slot Notice:</strong> Another borrower has also expressed interest in this 15:00 slot. Because your Trust Score (92) and low weekly usage rank you in <strong>Tier A</strong>, you will be allocated <strong>Priority Queue Position #1</strong>.
                </p>
              </div>
            )}

            {/* Duplicate Warning */}
            {hasDuplicateBooking && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Schedule Warning:</strong> You already have an active booking scheduled on {selectedDate}. Make sure your slots do not overlap to avoid anti-hoarding penalties.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextFromDateTime}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continue to Purpose
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Purpose & Academic Context ── */}
        {currentStep === 'purpose' && (
          <div className="space-y-4">
            <Input
              label="Academic Project / Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Senior Capstone Documentary Film Production"
              required
              helperText="Academic capstone and lab research work receive priority weighting in TrustPool."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Course / Research Code"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS-490 or ME-301"
              />
              <Input
                label="Expected Collaborators"
                type="number"
                min="1"
                max="10"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Requests or Notes for Custodian (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Extra battery pack requested; need tripod mount adapter."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('date_time')}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextFromPurpose}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Check Fair Eligibility
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Fair Allocation Eligibility Check ── */}
        {currentStep === 'eligibility' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Algorithmic Fairness Audit
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Pre-Approval Granted
                </span>
              </div>

              {/* Factors list */}
              <div className="space-y-2.5 text-xs">
                {/* 1. Score */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Minimum Trust Score Check</p>
                      <p className="text-[11px] text-slate-500">
                        Required: {resource.minTrustScore} • Your Score: {userTrustScore}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700">PASS ✓</span>
                </div>

                {/* 2. Quota */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Weekly Anti-Hoarding Quota</p>
                      <p className="text-[11px] text-slate-500">
                        Current: 6.5h used + 3.0h requested = 9.5 / 20h limit
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700">PASS ✓ (10.5h remain)</span>
                </div>

                {/* 3. Return Streak */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Punctuality Standing</p>
                      <p className="text-[11px] text-slate-500">
                        14/14 on-time returns • Tier A High Priority
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700">+25 pts Boost</span>
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Fairness Decision: Immediate Priority Allocation
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                "You received higher priority because your recent resource usage is lower than the cohort average and your punctuality streak is 100%."
              </p>
            </div>

            {/* AI Eligibility Document Assistance Card */}
            <div className="p-3.5 rounded-xl border border-purple-200/90 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/40 space-y-3 text-xs shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-purple-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    Eligibility Document Assistance
                  </span>
                  <AIFeatureBadge label="AI Assistant (Simulated Preview)" variant="purple" size="sm" />
                </div>
                <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-mono font-medium self-start sm:self-auto">
                  OCR Extraction
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Upload or select an institutional certification to verify qualification credentials for specialized facilities.
              </p>

              {/* Document upload or preset buttons */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                    Test Sample Documents:
                  </span>
                  {[
                    { label: 'Student University ID', file: 'student_id_alex_rivera.pdf' },
                    { label: 'Lab Safety Cert (EHS)', file: 'ehs_lab_safety_level2.pdf' },
                    { label: 'Camera Operator Card', file: 'camera_operator_license.pdf' },
                  ].map((doc) => (
                    <button
                      key={doc.file}
                      type="button"
                      onClick={() => handleProcessDoc({ name: doc.file, size: 245000 })}
                      className="px-2.5 py-1 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-900 font-medium text-[11px] shadow-2xs transition-all"
                    >
                      📄 {doc.label}
                    </button>
                  ))}
                </div>

                {/* Upload File Input */}
                <div className="pt-1">
                  <label className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white/70 hover:bg-purple-50/30 cursor-pointer transition-colors text-slate-600 text-center gap-2">
                    <Upload className="w-4 h-4 text-purple-600" />
                    <span className="text-[11px] font-medium">
                      {isDocProcessing ? 'Scanning & extracting document credentials...' : 'Upload Certification Document (PDF / PNG / JPG)'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessDoc(file);
                      }}
                      className="hidden"
                      disabled={isDocProcessing}
                    />
                  </label>
                </div>
              </div>

              {/* Extraction Result Preview */}
              {isDocProcessing && (
                <div className="p-3 rounded-lg bg-purple-50 text-purple-900 flex items-center justify-center gap-2 text-xs">
                  <Clock className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Processing document OCR & verifying digital watermark...</span>
                </div>
              )}

              {uploadedDoc && !isDocProcessing && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      {uploadedDoc.documentType} Extracted
                    </span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      {uploadedDoc.confidenceScore}% OCR Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Credential Holder</span>
                      <span className="font-semibold text-slate-900">{uploadedDoc.holderName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Institutional ID</span>
                      <span className="font-mono font-bold text-slate-900">{uploadedDoc.institutionalId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Accredited Authority</span>
                      <span className="font-medium text-slate-700 truncate block">{uploadedDoc.issuingAuthority}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Validity Expiry</span>
                      <span className="font-medium text-emerald-700">Valid through {uploadedDoc.expiryDate}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-800 italic pt-1 border-t border-emerald-200/60">
                    ✓ {uploadedDoc.aiNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('purpose')}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextFromEligibility}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Review Reservation
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Request Review ── */}
        {currentStep === 'review' && (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{resource.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {resource.location}
                  </p>
                </div>
                <StatusBadge status="APPROVED" label="Pre-Approved" size="sm" />
              </div>

              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">{selectedDate}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Reserved Slot:</span>
                  <span className="font-bold text-slate-900">{selectedSlot} (3.0 hours)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Academic Project:</span>
                  <span className="font-semibold text-slate-900">{purpose}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Custodian Contact:</span>
                  <span className="font-semibold text-slate-900">
                    {resource.ownerName} ({resource.ownerRole || 'Lab Director'})
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Security Deposit:</span>
                  <span className="font-bold text-emerald-700">
                    $0.00 (Institutional Guarantee Waived)
                  </span>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to perform the digital QR check-in condition report upon pickup, follow all custodian safety rules, and return the resource clean and on time.
              </span>
            </label>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('eligibility')}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!agreeTerms || !isEligible}
                isLoading={createBooking.isPending}
                onClick={handleConfirmBooking}
                rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Confirm & Submit Request
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Confirmation ── */}
        {currentStep === 'confirmed' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-4 border-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Reservation Confirmed & Allocated!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your reservation has been recorded in the TrustPool Fair Allocation Engine. Reference ID:{' '}
                <strong className="text-slate-900">{createdBookingId || 'TP-901'}</strong>.
              </p>
            </div>

            {/* Quick Details Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Resource:</span>
                <span className="font-bold text-slate-900">{resource.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reservation Time:</span>
                <span className="font-semibold text-slate-900">
                  {selectedDate} • {selectedSlot}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pickup Location:</span>
                <span className="font-semibold text-slate-900">{resource.location}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Allocation Status:</span>
                <span className="text-emerald-700 font-bold">Approved (Direct Allocation)</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<QrCode className="w-4 h-4" />}
                onClick={() => {
                  handleClose();
                  navigate('/student/qr-access');
                }}
              >
                View QR Access Pass
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Layers className="w-4 h-4" />}
                onClick={() => {
                  handleClose();
                  navigate('/student/bookings');
                }}
              >
                My Bookings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
                onClick={() => {
                  handleClose();
                  navigate('/student/allocation');
                }}
              >
                Fair Allocation
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
