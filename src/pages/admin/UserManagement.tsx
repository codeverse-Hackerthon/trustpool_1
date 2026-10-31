import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { SearchBar } from '../../components/ui/SearchBar';
import { Modal } from '../../components/ui/Modal';
import { useAllUsers, useVerifyUserMutation } from '../../hooks/useAdmin';
import {
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  CheckCircle2,
  Sliders,
  Eye,
} from 'lucide-react';
import { User } from '../../types';

export const UserManagement: React.FC = () => {
  const { data: users, isLoading } = useAllUsers();
  const verifyMutation = useVerifyUserMutation();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'owner' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [adjustedScore, setAdjustedScore] = useState<number>(90);
  const [scoreNote, setScoreNote] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredUsers = (users || []).filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase())) ||
      (u.institutionId && u.institutionId.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleOpenAudit = (u: User) => {
    setSelectedUser(u);
    setAdjustedScore(u.trustScore);
    setScoreNote('Manual adjustment per registrar enrollment standing.');
    setIsAuditModalOpen(true);
  };

  const handleToggleVerification = async (u: User) => {
    const newStatus = !u.isVerified;
    await verifyMutation.mutateAsync({
      userId: u.id,
      isVerified: newStatus,
    });
    setNotice(
      `Updated verification standing for ${u.name} to ${newStatus ? 'Verified ✓' : 'Unverified ✕'}.`
    );
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSaveScore = () => {
    if (!selectedUser) return;
    setNotice(`Updated TrustScore for ${selectedUser.name} to ${adjustedScore}/100.`);
    setIsAuditModalOpen(false);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Campus User & Identity Governance"
        description="Directory of verified student borrowers, facility custodians, and institutional administrators."
        tag="Trust Administration"
      />

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-emerald-700 font-bold ml-2 hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Role Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, department, or student ID..."
          />
        </div>

        <div className="flex items-center gap-1.5 border border-slate-200 p-1 rounded-xl bg-white text-xs">
          {[
            { key: 'all', label: 'All Roles' },
            { key: 'student', label: 'Students' },
            { key: 'owner', label: 'Custodians' },
            { key: 'admin', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                roleFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registered Campus Personas ({filteredUsers.length})</CardTitle>
            <span className="text-xs text-slate-500 font-medium">
              Synchronized with University Registrar
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Identity</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Department Affiliation</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Identity Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading directory...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isTierA = u.trustScore >= 85;
                  const isTierB = u.trustScore >= 70 && u.trustScore < 85;

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-semibold text-slate-900 text-xs">
                        <div>{u.name}</div>
                        <span className="text-[11px] font-normal text-slate-500 block">
                          {u.email}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {u.institutionId || 'STU-0000'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'owner'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                        {u.department || 'General Campus'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold text-xs ${
                              isTierA
                                ? 'text-emerald-700'
                                : isTierB
                                ? 'text-blue-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {u.trustScore} / 100
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isTierA
                                ? 'bg-emerald-50 text-emerald-800'
                                : isTierB
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {isTierA ? 'Tier A' : isTierB ? 'Tier B' : 'Tier C'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold">
                            <UserX className="w-3.5 h-3.5 text-amber-600" /> Pending Review
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs px-2"
                            onClick={() => handleOpenAudit(u)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Audit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs px-2 ${
                              u.isVerified ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                            }`}
                            onClick={() => handleToggleVerification(u)}
                          >
                            {u.isVerified ? 'Suspend' : 'Verify'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No users match your search or filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── MODAL: USER PROFILE & TRUST SCORE AUDIT ── */}
      {selectedUser && (
        <Modal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          title={`User Standing Audit: ${selectedUser.name}`}
          description="Examine institutional credentials, loan punctuality history, and manually calibrate TrustScore."
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedUser.name}</h4>
                  <p className="text-slate-500 text-[11px]">
                    {selectedUser.email} • {selectedUser.institutionId}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  {selectedUser.role}
                </span>
              </div>
              <div className="pt-1 text-slate-600">
                Department: <strong>{selectedUser.department}</strong>
              </div>
            </div>

            {/* TrustScore Calibration */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Calibrate Trust Standing</p>
                  <p className="text-[11px] text-slate-500">
                    Modifying this score directly shifts borrower priority in the Fair Allocation algorithm
                  </p>
                </div>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {adjustedScore} / 100
                </span>
              </div>

              <input
                type="range"
                min="30"
                max="100"
                value={adjustedScore}
                onChange={(e) => setAdjustedScore(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>30 (Probation / Restricted)</span>
                <span>70 (Standard Baseline)</span>
                <span>100 (Flawless Standing)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Administrative Score Adjustment
              </label>
              <textarea
                value={scoreNote}
                onChange={(e) => setScoreNote(e.target.value)}
                rows={2}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsAuditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveScore}
                rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Save Score Calibration
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
