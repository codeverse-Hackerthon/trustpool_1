import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ShieldCheck } from 'lucide-react';

export const BookingHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Borrowing History & Return Ledger"
        description="Historical log of all previous bookings, punctuality status, and trust impact."
        tag="Student Ledger"
      />

      <Card>
        <CardHeader>
          <CardTitle>Completed Loans</CardTitle>
          <p className="text-xs text-slate-500">
            Punctual returns contribute +1 to +3 trust score points per cycle
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Checked Out</TableHead>
                <TableHead>Returned At</TableHead>
                <TableHead>Return Condition</TableHead>
                <TableHead>Trust Impact</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs text-slate-500">book-902</TableCell>
                <TableCell className="font-semibold text-slate-900">
                  Precision Bambu Lab X1-Carbon 3D Printer
                </TableCell>
                <TableCell className="text-xs text-slate-600">Oct 28, 09:05 AM</TableCell>
                <TableCell className="text-xs text-slate-600">Oct 28, 11:55 AM (Punctual)</TableCell>
                <TableCell className="text-xs font-medium text-emerald-700">Excellent</TableCell>
                <TableCell className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+2 Points</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status="COMPLETED" size="sm" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
