import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Scale,
  ShieldCheck,
  Database,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [maxActiveBookings, setMaxActiveBookings] = useState(3);
  const [maxLoanHours, setMaxLoanHours] = useState(72);
  const [trustDecayDays, setTrustDecayDays] = useState(90);
  const [priorityWeightAcademic, setPriorityWeightAcademic] = useState(40);
  const [priorityWeightTrust, setPriorityWeightTrust] = useState(35);
  const [priorityWeightWaitTime, setPriorityWeightWaitTime] = useState(25);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Platform Governance & System Settings"
        description="Fine-tune algorithmic fair-allocation parameters, resource caps, and campus policy guardrails"
        actions={
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {saved ? 'Settings Saved' : 'Save Platform Policies'}
          </Button>
        }
      />

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration parameters committed to institutional rule engine.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Fair Allocation Algorithm Weights */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Fair Allocation Scoring Weights (Total: 100%)
            </CardTitle>
            <CardDescription>
              Weights applied when evaluating queue promotion priorities across multi-applicant booking contests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Academic Need Weight (%)"
                type="number"
                min="0"
                max="100"
                value={priorityWeightAcademic}
                onChange={(e) => setPriorityWeightAcademic(Number(e.target.value))}
                helperText="Coursework & capstone project priority"
              />
              <Input
                label="Trust Score Weight (%)"
                type="number"
                min="0"
                max="100"
                value={priorityWeightTrust}
                onChange={(e) => setPriorityWeightTrust(Number(e.target.value))}
                helperText="Historical on-time return rate"
              />
              <Input
                label="Waitlist Time Weight (%)"
                type="number"
                min="0"
                max="100"
                value={priorityWeightWaitTime}
                onChange={(e) => setPriorityWeightWaitTime(Number(e.target.value))}
                helperText="FIFO duration compensation"
              />
            </div>
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-800">
              Total Weight: <span className="font-bold">{priorityWeightAcademic + priorityWeightTrust + priorityWeightWaitTime}%</span>
              {priorityWeightAcademic + priorityWeightTrust + priorityWeightWaitTime !== 100 && (
                <span className="text-rose-600 ml-2 font-medium">(Weights should sum exactly to 100%)</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Borrowing Limits & Safeguards */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Borrowing Limits & Anti-Hoarding Rules
            </CardTitle>
            <CardDescription>
              Prevent monopolization of high-demand lab hardware
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Max Concurrent Bookings per Student"
                type="number"
                min="1"
                max="10"
                value={maxActiveBookings}
                onChange={(e) => setMaxActiveBookings(Number(e.target.value))}
              />
              <Input
                label="Maximum Loan Window (Hours)"
                type="number"
                min="1"
                max="168"
                value={maxLoanHours}
                onChange={(e) => setMaxLoanHours(Number(e.target.value))}
              />
              <Input
                label="Incident Trust Score Grace (Days)"
                type="number"
                min="30"
                max="365"
                value={trustDecayDays}
                onChange={(e) => setTrustDecayDays(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Database & Audit Retention */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              Audit Log & Telemetry Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800">Immutable Audit Trail</p>
              <p className="text-slate-500">All cryptographic QR scans, booking approvals, and condition reports are permanently preserved.</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider text-[10px]">
              Active (PostgreSQL)
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
