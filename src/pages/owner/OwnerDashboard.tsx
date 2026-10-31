import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { useAuth } from '../../hooks/useAuth';
import { useOwnerRequests, useActiveBookings, useUpdateBookingStatus } from '../../hooks/useBookings';
import { useResources } from '../../hooks/useResources';
import { formatDateTime } from '../../utils/formatters';
import {
  Layers,
  Inbox,
  Clock,
  RotateCcw,
  Check,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: requests, isLoading: requestsLoading } = useOwnerRequests();
  const { data: activeBookings, isLoading: activeLoading } = useActiveBookings();
  const { data: resources } = useResources();
  const updateStatus = useUpdateBookingStatus();

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const totalResources = resources?.length || 4;
  const pendingRequestsCount = requests?.length || 2;
  const activeBookingsCount = activeBookings?.length || 2;
  const returnsCount = 1; // 1 awaiting return inspection

  const handleQuickApprove = async (id: string, title: string) => {
    await updateStatus.mutateAsync({
      bookingId: id,
      action: 'approve',
    });
    setActionNotice(`Approved reservation for ${title}! Digital access pass emitted.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleQuickReject = async (id: string, title: string) => {
    await updateStatus.mutateAsync({
      bookingId: id,
      action: 'reject',
      reason: 'Slot conflict with scheduled lab maintenance.',
    });
    setActionNotice(`Reservation request rejected for ${title}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'Dr. Sarah Chen'}`}
        description="Oversee departmental shared assets, approve student reservations, and verify returned equipment condition."
        tag="Verified Facility Custodian"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/owner/resources/add">
              <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add New Resource
              </Button>
            </Link>
            <Link to="/owner/analytics">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<BarChart3 className="w-3.5 h-3.5" />}
              >
                Lab Analytics
              </Button>
            </Link>
          </div>
        }
      />

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 font-bold ml-2 hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Managed Assets */}
        <div
          onClick={() => navigate('/owner/resources')}
          className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Resources
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalResources} Assets</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Labs, Gear & Studios</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => navigate('/owner/requests')}
          className="rounded-xl border border-amber-200 bg-amber-50/20 p-5 flex items-center justify-between cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Pending Requests
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {pendingRequestsCount} Pending
            </h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
              Requires custodian review
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Active Bookings */}
        <div
          onClick={() => navigate('/owner/active-bookings')}
          className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Bookings
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {activeBookingsCount} Checked Out
            </h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Currently in use</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Returns Awaiting Verification */}
        <div
          onClick={() => navigate('/owner/returns')}
          className="rounded-xl border border-purple-200 bg-purple-50/20 p-5 flex items-center justify-between cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Returns Awaiting Check
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {returnsCount} Ready
            </h3>
            <p className="text-[11px] text-purple-700 font-medium mt-0.5">
              Verify condition photos
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
            <RotateCcw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Manage Inventory', desc: 'Add / Edit Resources', to: '/owner/resources', icon: Layers, color: 'text-blue-600 bg-blue-50' },
          { label: 'Review Requests', desc: 'Approve Borrower Slots', to: '/owner/requests', icon: Inbox, color: 'text-amber-600 bg-amber-50' },
          { label: 'Return Inspections', desc: 'Verify Return Checklist', to: '/owner/returns', icon: RotateCcw, color: 'text-purple-600 bg-purple-50' },
          { label: 'File Damage Incident', desc: 'Log Component Defects', to: '/owner/incidents', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
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

      {/* Main Grid: Pending Requests Table & Active Loans Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Booking Requests */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Awaiting Custodian Approval</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prioritized by TrustPool Fair Allocation Engine
                </p>
              </div>
              <Link to="/owner/requests">
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Requested Slot</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                        Loading requests...
                      </TableCell>
                    </TableRow>
                  ) : requests && requests.length > 0 ? (
                    requests.slice(0, 3).map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-semibold text-slate-900 text-xs">
                          <div>{req.userName}</div>
                          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Score: {req.userTrustScore} / 100
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700">
                          <div className="truncate max-w-[160px]">{req.resourceTitle}</div>
                          <span className="text-[10px] text-slate-400">
                            {req.purpose || 'Academic Capstone'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          <div>{formatDateTime(req.startTime)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-emerald-700 hover:bg-emerald-50 px-2 py-1"
                              onClick={() => handleQuickApprove(req.id, req.resourceTitle)}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-rose-700 hover:bg-rose-50 px-2 py-1"
                              onClick={() => handleQuickReject(req.id, req.resourceTitle)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                        No pending requests awaiting approval.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Circulation Radar */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Circulation Radar</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assets currently checked out on campus
                </p>
              </div>
              <Link to="/owner/active-bookings">
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {activeLoading ? (
                <div className="p-6 text-center text-slate-400 text-xs">Loading active...</div>
              ) : activeBookings && activeBookings.length > 0 ? (
                activeBookings.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {item.resourceTitle}
                      </span>
                      <StatusBadge status="ACTIVE" size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Borrower: {item.userName}</span>
                      <span className="text-emerald-700 font-medium">On Schedule</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Due: {formatDateTime(item.endTime)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  All equipment currently safely stationed in lab.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
