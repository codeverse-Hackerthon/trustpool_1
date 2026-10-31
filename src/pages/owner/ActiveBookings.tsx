import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { useActiveBookings } from '../../hooks/useBookings';
import { formatDateTime } from '../../utils/formatters';
import {
  RotateCcw,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const ActiveBookings: React.FC = () => {
  const { data: bookings, isLoading } = useActiveBookings();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Active Loans in Circulation"
        description="Live custody ledger of resources currently checked out to borrowers across campus."
        tag="Live Circulation"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/owner/returns">
              <Button size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Go to Returns Desk
              </Button>
            </Link>
            <Link to="/owner/incidents">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              >
                Log Incident
              </Button>
            </Link>
          </div>
        }
      />

      {/* Circulation Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Currently Checked-Out Inventory</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of active borrower custody and scheduled return windows
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
              {bookings?.length || 2} Active Loans
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Check-In & Due Time</TableHead>
                <TableHead>Condition Baseline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading active loans...
                  </TableCell>
                </TableRow>
              ) : bookings && bookings.length > 0 ? (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      <div>{b.userName}</div>
                      <span className="text-[11px] font-normal text-slate-500 block">
                        {b.userEmail || 'alex.rivera@university.edu'}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        Score: {b.userTrustScore} / 100
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-800 font-medium">
                      <div className="font-bold text-slate-900">{b.resourceTitle}</div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {b.resourceLocation}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>Checked in: {formatDateTime(b.startTime)}</div>
                      <div className="text-slate-900 font-bold mt-0.5">
                        Due: {formatDateTime(b.endTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Pre-Use Verified
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="ACTIVE" label="In Use" size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs"
                          leftIcon={<QrCode className="w-3.5 h-3.5" />}
                          onClick={() => navigate('/owner/returns')}
                        >
                          Verify Return
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No active equipment currently checked out.
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
