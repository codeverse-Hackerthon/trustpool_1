import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Scale,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const FAIRNESS_OUTCOMES_DATA = [
  { name: 'Direct Priority Grant (Tier A)', value: 74, color: '#10b981' }, // emerald-500
  { name: 'Low Weekly Usage Boost', value: 18, color: '#3b82f6' }, // blue-500
  { name: 'Contested Queue Resolved', value: 8, color: '#8b5cf6' }, // violet-500
];

const DEPARTMENT_UTILIZATION_DATA = [
  { dept: 'Media Arts', utilization: 88, activeLoans: 42 },
  { dept: 'Robotics & CS', utilization: 92, activeLoans: 58 },
  { dept: 'Engineering', utilization: 84, activeLoans: 36 },
  { dept: 'BioSciences', utilization: 79, activeLoans: 28 },
  { dept: 'Student Commons', utilization: 65, activeLoans: 20 },
];

const PEAK_HOURLY_DATA = [
  { time: '08:00', load: 14 },
  { time: '10:00', load: 45 },
  { time: '12:00', load: 68 },
  { time: '14:00', load: 82 },
  { time: '16:00', load: 74 },
  { time: '18:00', load: 52 },
  { time: '20:00', load: 26 },
  { time: '22:00', load: 12 },
];

export const AdminAnalytics: React.FC = () => {
  const { data: analytics } = useAnalytics('admin');
  const fairnessDistribution = analytics?.fairnessDistribution || [
    { tier: 'Trusted Standing (Tier A)', userCount: 420, percentage: 68 },
    { tier: 'Standard Standing (Tier B)', userCount: 165, percentage: 27 },
    { tier: 'Probation Standing (Tier C)', userCount: 31, percentage: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Institutional Analytics & Algorithmic Fairness"
        description="Campus-wide governance intelligence: anti-hoarding coefficients, peak demand hours, and trust tier representation."
        tag="Campus Administration"
      />

      {/* Top Admin KPIs Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-purple-200/80 bg-purple-50/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-purple-700 text-xs">
              <span className="font-semibold uppercase tracking-wider">Fairness Index</span>
              <Scale className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">96 / 100</p>
            <p className="text-[11px] text-purple-700 font-semibold">Optimal Distribution</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/80 bg-emerald-50/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 text-xs">
              <span className="font-semibold uppercase tracking-wider">Avg Campus Trust</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">91.4</p>
            <p className="text-[11px] text-emerald-600 font-semibold">+2.8% this semester</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200/80 bg-blue-50/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-blue-700 text-xs">
              <span className="font-semibold uppercase tracking-wider">Active Borrowers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">616</p>
            <p className="text-[11px] text-blue-600 font-semibold">Across 8 colleges</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider">Dispute Resolution</span>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">94.8%</p>
            <p className="text-[11px] text-slate-500">Under 24h turnaround</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: 2 Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Campus-Wide Peak Demand Hours (AreaChart) */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Peak Demand & Contention Curve</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Concurrent active checkout volume across campus facilities
            </p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PEAK_HOURLY_DATA}>
                <defs>
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#loadGrad)"
                  name="Active Loans"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Resource Utilization by Department (BarChart) */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization by Academic College (%)</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Cross-departmental asset efficiency ratings
            </p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_UTILIZATION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar
                  dataKey="utilization"
                  fill="#0f172a"
                  radius={[6, 6, 0, 0]}
                  name="Utilization %"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Grid: 2 Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Fair Allocation Outcomes (PieChart) */}
        <Card>
          <CardHeader>
            <CardTitle>Fair Allocation System Resolution Outcomes</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of how the algorithm distributed contested slot requests
            </p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={FAIRNESS_OUTCOMES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {FAIRNESS_OUTCOMES_DATA.map((entry, index) => (
                    <Cell key={`cell-outcome-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Trust Score Cohort Distribution (BarChart) */}
        <Card>
          <CardHeader>
            <CardTitle>Campus Trust Standing Cohort Representation</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Borrower population segmented by TrustScore tiers
            </p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fairnessDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tier" tick={{ fontSize: 9.5, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar
                  dataKey="userCount"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                  name="Borrower Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
