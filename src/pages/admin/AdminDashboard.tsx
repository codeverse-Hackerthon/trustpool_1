import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { useAuth } from '../../hooks/useAuth';
import { useAuditLogs } from '../../hooks/useAdmin';
import { useIncidents } from '../../hooks/useIncidents';
import { formatDateTime } from '../../utils/formatters';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ShieldCheck,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Layers,
  Gavel,
  BarChart3,
  Building,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: auditLogs, isLoading: logsLoading } = useAuditLogs();
  const { data: incidents } = useIncidents();

  const totalUsers = 616;
  const verifiedOwners = 42;
  const totalResources = 128;
  const activeBookings = 18;
  const openIncidents = incidents?.filter((i) => i.status !== 'resolved').length || 2;

  const bookingTrendData = [
    { day: 'Mon', volume: 14 },
    { day: 'Tue', volume: 22 },
    { day: 'Wed', volume: 34 },
    { day: 'Thu', volume: 38 },
    { day: 'Fri', volume: 28 },
    { day: 'Sat', volume: 16 },
    { day: 'Sun', volume: 10 },
  ];

  const categoryDistributionData = [
    { name: 'Equipment', count: 54 },
    { name: 'Labs', count: 38 },
    { name: 'Rooms', count: 26 },
    { name: 'Studios', count: 18 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Campus Trust Command — ${user?.name || 'Marcus Vance'}`}
        description="Campus-wide governance, algorithmic fairness parameters, custodian verifications, and audit trails."
        tag="Campus Administration"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/verification">
              <Button size="sm" leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
                Review Verifications
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<BarChart3 className="w-3.5 h-3.5 text-blue-600" />}
              >
                Analytics
              </Button>
            </Link>
          </div>
        }
      />

      {/* 5 Admin Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div
          onClick={() => navigate('/admin/users')}
          className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalUsers}</h3>
          <p className="text-[10px] text-slate-500 mt-1">420 Tier A • 165 Tier B</p>
        </div>

        {/* Verified Owners */}
        <div
          onClick={() => navigate('/admin/verification')}
          className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Verified Owners
            </span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{verifiedOwners}</h3>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">1 Pending Approval</p>
        </div>

        {/* Total Resources */}
        <div
          onClick={() => navigate('/admin/resources')}
          className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Resources
            </span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalResources}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Across 12 Departments</p>
        </div>

        {/* Active Bookings */}
        <div
          onClick={() => navigate('/admin/bookings')}
          className="rounded-xl border border-blue-200 bg-blue-50/20 p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Active Bookings
            </span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{activeBookings}</h3>
          <p className="text-[10px] text-blue-700 font-semibold mt-1">100% Verified Check-in</p>
        </div>

        {/* Open Incidents */}
        <div
          onClick={() => navigate('/admin/incidents')}
          className="rounded-xl border border-rose-200 bg-rose-50/20 p-4 cursor-pointer hover:border-rose-300 hover:shadow-sm transition-all col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Open Incidents
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="text-2xl font-bold text-rose-950">{openIncidents}</h3>
          <p className="text-[10px] text-rose-700 font-semibold mt-1">Pending Arbitration</p>
        </div>
      </div>

      {/* Admin Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'User Directory', desc: 'Trust Scores & Roles', to: '/admin/users', icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Owner Verification', desc: 'Faculty & Lab Approvals', to: '/admin/verification', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Resource Monitor', desc: 'Cross-Campus Assets', to: '/admin/resources', icon: Layers, color: 'text-purple-600 bg-purple-50' },
          { label: 'Dispute Arbitration', desc: 'Hearing & Penalty Desk', to: '/admin/incidents', icon: Gavel, color: 'text-rose-600 bg-rose-50' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to}>
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-3 group">
                <div className={`p-2.5 rounded-lg ${item.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Platform Analytics Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Booking Volume Trend */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Weekly Reservation Activity</CardTitle>
              <p className="text-[11px] text-slate-500">Loan demand and checkout volume by weekday</p>
            </div>
            <Link to="/admin/analytics" className="text-xs text-blue-600 hover:underline font-medium">
              Deep Analytics →
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Resource Inventory by Category</CardTitle>
              <p className="text-[11px] text-slate-500">Distribution of campus labs, equipment & spaces</p>
            </div>
            <Link to="/admin/resources" className="text-xs text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#14213D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Log Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Immutable Audit Ledger</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically timestamped record of administrative and algorithmic events
            </p>
          </div>
          <Link to="/admin/audit-logs">
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Full Audit Trail
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Action</TableHead>
                <TableHead>Actor / Agent</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Event Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                    Loading audit trail...
                  </TableCell>
                </TableRow>
              ) : auditLogs && auditLogs.length > 0 ? (
                auditLogs.slice(0, 4).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px]">
                        {log.actionTitle || log.eventType}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-900 font-semibold">
                      {log.performedBy.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {log.targetEntity}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-sm truncate">
                      {log.details}
                    </TableCell>

                    <TableCell className="text-xs text-slate-400">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                    No recent audit events.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
