import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useResources } from '../../hooks/useResources';
import { Resource } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Save,
  ShieldAlert,
} from 'lucide-react';

interface DaySchedule {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DEFAULT_DAYS: DaySchedule[] = [
  { day: 'Monday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Tuesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Wednesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Thursday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Friday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'Saturday', isOpen: false, openTime: '10:00', closeTime: '14:00' },
  { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '14:00' },
];

export const OwnerAvailability: React.FC = () => {
  const { data: resources } = useResources();
  const [selectedResourceId, setSelectedResourceId] = useState(resources?.[0]?.id || 'all');
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_DAYS);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState('Scheduled quarterly sensor recalibration');
  const [saved, setSaved] = useState(false);

  const toggleDay = (index: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  const updateTime = (index: number, field: 'openTime' | 'closeTime', val: string) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: val } : d))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Operating Schedules & Availability Windows"
        description="Configure recurring weekly checkout hours, blackouts, and emergency maintenance holds"
        actions={
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {saved ? 'Schedule Saved' : 'Save Changes'}
          </Button>
        }
      />

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Availability matrix updated across the campus reservation calendar engine.</span>
        </div>
      )}

      {/* Target Resource Selector */}
      <Card className="border-slate-200">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Resource Scope</h4>
            <p className="text-xs text-slate-500">Apply rules to all custodial equipment or a specific lab resource</p>
          </div>
          <select
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Global (All Managed Resources)</option>
            {(resources || []).map((r: Resource) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Weekly Operating Hours Table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Standard Weekly Operating Windows
          </CardTitle>
          <CardDescription>
            Specify active checkout & return hours. Students cannot book windows outside of designated open hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {schedule.map((item, idx) => (
            <div
              key={item.day}
              className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="w-32 flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`day-${idx}`}
                  checked={item.isOpen}
                  onChange={() => toggleDay(idx)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`day-${idx}`}
                  className={`text-xs font-semibold cursor-pointer ${
                    item.isOpen ? 'text-slate-900' : 'text-slate-400 line-through'
                  }`}
                >
                  {item.day}
                </label>
              </div>

              {item.isOpen ? (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="time"
                      value={item.openTime}
                      onChange={(e) => updateTime(idx, 'openTime', e.target.value)}
                      className="p-1 rounded border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <span className="text-slate-400">to</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={item.closeTime}
                      onChange={(e) => updateTime(idx, 'closeTime', e.target.value)}
                      className="p-1 rounded border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-medium text-slate-400 italic">
                  Station Closed (No Checkouts)
                </span>
              )}

              <div className="hidden sm:block">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    item.isOpen
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {item.isOpen ? 'Active' : 'Blackout'}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Maintenance & Closure Hold */}
      <Card className="border-amber-200/80 bg-amber-50/20">
        <CardHeader className="pb-3 border-b border-amber-100">
          <CardTitle className="text-base text-amber-950 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Temporary Unavailability & Maintenance Hold
          </CardTitle>
          <CardDescription>
            Lock reservations temporarily for hardware servicing, calibration, or semester breaks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span>Enable Maintenance Hold on Selected Resource(s)</span>
          </label>

          {maintenanceMode && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-slate-700">
                Notice Displayed to Prospective Borrowers
              </label>
              <input
                type="text"
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
