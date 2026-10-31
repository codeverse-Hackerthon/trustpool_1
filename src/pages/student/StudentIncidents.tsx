import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useIncidents, useReportIncident } from '../../hooks/useIncidents';
import { useMyBookings } from '../../hooks/useBookings';
import { Incident, Booking, IncidentSeverity } from '../../types';
import {
  AlertTriangle,
  Upload,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export const StudentIncidents: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();
  const reportIncidentMutation = useReportIncident();
  const { data: bookings } = useMyBookings();

  const [showForm, setShowForm] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [type, setType] = useState<Incident['type']>('damage');
  const [severity] = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setSubmitting(true);
      const selectedBooking = bookings?.find((b: Booking) => b.id === bookingId);
      const resourceId = selectedBooking?.resourceId || 'res-1';

      await reportIncidentMutation.mutateAsync({
        bookingId: bookingId || undefined,
        resourceId,
        type,
        severity,
        title: `Observation on ${selectedBooking?.resourceTitle || 'Resource'}`,
        description,
      });

      setSubmitted(true);
      setShowForm(false);
      setDescription('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const bookingOptions = (bookings || []).map((b: Booking) => ({
    value: b.id,
    label: `${b.resourceTitle} (${new Date(b.startTime).toLocaleDateString()})`,
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Incident Assistance & Support"
        description="Transparent resolution center for equipment malfunction, damage reporting, and return discrepancies"
        actions={
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowForm(!showForm)}
            leftIcon={showForm ? undefined : <Plus className="w-4 h-4" />}
          >
            {showForm ? 'Cancel Report' : 'Report an Issue'}
          </Button>
        }
      />

      {submitted && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your incident report has been registered and routed to the equipment custodian for non-adversarial review.</span>
        </div>
      )}

      {/* Incident Submission Modal/Card */}
      {showForm && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="bg-blue-50/40 border-b border-blue-100 pb-3">
            <CardTitle className="text-base text-blue-900">File Incident Observation</CardTitle>
            <CardDescription>
              Promptly recording anomalies protects your Trust Score and alerts lab managers to repair needs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Associated Reservation (Optional)"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  options={[{ value: '', label: 'General / No specific booking' }, ...bookingOptions]}
                />

                <Select
                  label="Incident Category"
                  value={type}
                  onChange={(e) => setType(e.target.value as Incident['type'])}
                  options={[
                    { value: 'damage', label: 'Equipment Damage / Wear' },
                    { value: 'late_return', label: 'Unforeseen Return Delay' },
                    { value: 'missing_item', label: 'Missing Cable / Accessory' },
                    { value: 'other', label: 'Other Operational Issue' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Detailed Description & Context
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what occurred, any physical faults noticed, or unexpected malfunctions during your loan window..."
                  className="w-full min-h-[100px] p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              {/* Evidence Upload Placeholder */}
              <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-700">Attach Photographic Evidence (Optional)</p>
                <p className="text-[11px] text-slate-400">PNG, JPG up to 10MB to document baseline condition</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  isLoading={submitting}
                >
                  Submit Incident Report
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Incident History List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Your Incident History</h3>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading incident records...</div>
        ) : !incidents || incidents.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-10">
              <EmptyState
                icon={<ShieldCheck className="w-10 h-10 text-emerald-500" />}
                title="Zero Incidents on File"
                description="Your borrowing record is clean. Prompt returns and careful usage keep your trust rating at peak standing."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {incidents.map((inc: Incident) => (
              <Card key={inc.id} className="border-slate-200 hover:border-slate-300 transition-all">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{inc.resourceTitle}</h4>
                        <StatusBadge status={inc.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{inc.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="capitalize">{inc.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(inc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Investigation
                    </span>
                    <span className="text-xs font-medium text-slate-800">
                      {inc.status === 'resolved' ? 'Resolution Complete' : 'Under Custodian Review'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
