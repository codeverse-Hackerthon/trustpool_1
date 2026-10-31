import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
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
  TrendingUp,
  RotateCcw,
  Clock,
  Sparkles,
} from 'lucide-react';

const CATEGORY_PIE_DATA = [
  { name: 'Equipment & Cinema', value: 45, color: '#0284c7' }, // sky-600
  { name: 'Labs & 3D Printers', value: 30, color: '#7c3aed' }, // violet-600
  { name: 'Soundstages & Rooms', value: 15, color: '#d97706' }, // amber-600
  { name: 'Spatial Rig & VR', value: 10, color: '#059669' }, // emerald-600
];

const RETURN_CONDITION_DATA = [
  { name: 'Excellent (Like New)', value: 82, color: '#10b981' },
  { name: 'Good (Minor Wear)', value: 14, color: '#3b82f6' },
  { name: 'Flagged / Cleaned', value: 4, color: '#f59e0b' },
];

const WEEKLY_TREND_DATA = [
  { day: 'Mon', hoursUtilized: 18.5, bookings: 6 },
  { day: 'Tue', hoursUtilized: 22.0, bookings: 8 },
  { day: 'Wed', hoursUtilized: 28.5, bookings: 11 },
  { day: 'Thu', hoursUtilized: 31.0, bookings: 13 },
  { day: 'Fri', hoursUtilized: 26.0, bookings: 10 },
  { day: 'Sat', hoursUtilized: 14.0, bookings: 4 },
  { day: 'Sun', hoursUtilized: 9.5, bookings: 3 },
];

export const OwnerAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Custodian Analytics & Asset Utilization"
        description="Comprehensive metrics on departmental asset wear, weekly utilization trends, and return punctuality."
        tag="Custodian Intelligence"
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200/80 bg-blue-50/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider">Utilization Rate</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">84.2%</p>
            <p className="text-[11px] text-blue-600 font-semibold">+5.1% vs last month</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/80 bg-emerald-50/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider">On-Time Returns</span>
              <RotateCcw className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">98.5%</p>
            <p className="text-[11px] text-emerald-600 font-semibold">142/144 loans punctual</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider">Avg Loan Duration</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">3.4 hrs</p>
            <p className="text-[11px] text-slate-500">Within standard 4h block</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200/80 bg-purple-50/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-purple-700 text-xs">
              <span className="font-semibold uppercase tracking-wider">Fair Allocations</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">100%</p>
            <p className="text-[11px] text-purple-700 font-semibold">Zero hoarded assets</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: 2 Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekly Utilization Trend (AreaChart) */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization Trends (Hours per Day)</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregate active loan hours across departmental equipment
            </p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_TREND_DATA}>
                <defs>
                  <linearGradient id="utilizationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="h" />
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
                  dataKey="hoursUtilized"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#utilizationGrad)"
                  name="Hours Utilized"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Daily Booking Volume (BarChart) */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Activity by Day</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Total number of discrete student loans completed per day
            </p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
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
                  dataKey="bookings"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  name="Loans Processed"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Grid: 2 Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Resource Category Distribution (PieChart) */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Category Distribution</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion of total loan volume by departmental asset family
            </p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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

        {/* Chart 4: Return Condition Breakdown (PieChart) */}
        <Card>
          <CardHeader>
            <CardTitle>Return Condition Verification Breakdown</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit results verified by physical custodian checklist
            </p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RETURN_CONDITION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {RETURN_CONDITION_DATA.map((entry, index) => (
                    <Cell key={`cell-cond-${index}`} fill={entry.color} />
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
      </div>
    </div>
  );
};
