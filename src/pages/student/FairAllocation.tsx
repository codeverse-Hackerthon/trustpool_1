import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import {
  useUserFairnessProfile,
  useFairnessFactors,
  useAllocationQueue,
  useAllocationHistory,
} from '../../hooks/useAllocation';
import {
  Scale,
  ShieldCheck,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  RefreshCw,
} from 'lucide-react';

export const FairAllocation: React.FC = () => {
  const { data: profile, isLoading: profileLoading } = useUserFairnessProfile();
  const { data: factors, isLoading: factorsLoading } = useFairnessFactors();
  const { data: queueItems, isLoading: queueLoading } = useAllocationQueue();
  const { data: historyItems, isLoading: historyLoading } = useAllocationHistory();

  // Local state for queue cancel feedback
  const [removedQueueId, setRemovedQueueId] = useState<string | null>(null);
  const [urgencyBoostedId, setUrgencyBoostedId] = useState<string | null>(null);

  // Interactive What-If Simulator state
  const [simUsageHours, setSimUsageHours] = useState<number>(6.5);
  const [simPunctualityStreak, setSimPunctualityStreak] = useState<number>(14);

  // Compute simulated fairness score
  const simScore = Math.min(
    100,
    Math.max(
      40,
      Math.round(
        92 - (simUsageHours > 10 ? (simUsageHours - 10) * 2.5 : -(10 - simUsageHours) * 1.2) +
          (simPunctualityStreak >= 10 ? 6 : -8)
      )
    )
  );

  const trustScore = profile?.trustScore ?? 92;
  const fairnessIndex = profile?.fairnessIndex ?? 94;
  const weeklyUsage = profile?.weeklyUsageHours ?? 6.5;
  const maxQuota = profile?.maxWeeklyQuota ?? 20;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Fair Allocation Engine"
        description="Transparent algorithmic queuing and anti-hoarding fairness metrics for campus shared resources."
        tag="TrustPool Fairness Protocol"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/student/resources">
              <Button size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
                Discover Resources
              </Button>
            </Link>
            <Link to="/student/bookings">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Layers className="w-3.5 h-3.5" />}
              >
                My Bookings
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Fairness Standing KPIs Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fair Access Score */}
        <Card className="border-purple-200/80 bg-gradient-to-br from-white to-purple-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Fair Access Score
              </p>
              <div className="flex items-end gap-1.5 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {profileLoading ? '...' : fairnessIndex}
                </span>
                <span className="text-xs text-slate-500 mb-1">/ 100</span>
              </div>
              <p className="text-[11px] text-purple-700 font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Tier A • High Priority
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
              <Scale className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Standing */}
        <Card className="border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Eligibility Standing
              </p>
              <div className="text-xl font-bold text-slate-900 mt-1">Verified Active</div>
              <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Trust Score: {trustScore} / 100
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Anti-Hoarding Quota */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Weekly Quota Used
              </p>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-900">{weeklyUsage}</span>
                <span className="text-xs text-slate-500 mb-0.5">/ {maxQuota} hrs</span>
              </div>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">
                Low Usage Bonus Active (+18 pts)
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Punctual Return Streak */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Punctuality Streak
              </p>
              <div className="text-2xl font-bold text-slate-900 mt-1">100%</div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                14/14 on-time returns
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Transparent Decision Factors + Queue Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transparent Fairness Factors (Core Feature) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <CardTitle>Transparent Priority Explanations</CardTitle>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    TrustPool discloses every factor contributing to your allocation ranking
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  Total: {fairnessIndex} pts
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {factorsLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Loading algorithmic breakdown...
                </div>
              ) : (
                factors?.map((f, i) => (
                  <div key={i} className="p-4 flex items-start gap-3.5 hover:bg-slate-50/80 transition-colors">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        f.type === 'positive'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : f.type === 'negative'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {f.type === 'positive' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{f.factor}</h4>
                        <span
                          className={`text-xs font-mono font-bold ${
                            f.type === 'positive'
                              ? 'text-emerald-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {f.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Allocation Formula Architecture Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <CardTitle>How the Fairness Algorithm Operates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Unlike traditional first-come, first-served queues that favor fast-clicking scripts or hoarders, TrustPool runs an automated, multi-attribute fairness algorithm:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">
                    40% Trust Score
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Verified condition reports, honest damage logs, and custodian endorsements.
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">
                    35% Usage Balance
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Students with fewer weekly hours receive automatic boosts to prevent monopolies.
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">
                    25% Academic Need
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Verified course capstones or grant milestone dates receive prioritized scheduling.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Contested Waitlists & What-If Simulator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Contested Resource Waitlists */}
          <Card>
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contested Resource Waitlists</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time queue standings for high-demand assets
                  </p>
                </div>
                <StatusBadge status="WAITLISTED" size="sm" />
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {queueLoading ? (
                <div className="p-6 text-center text-slate-400 text-xs">Loading waitlist...</div>
              ) : queueItems && queueItems.length > 0 ? (
                queueItems
                  .filter((q) => q.id !== removedQueueId)
                  .map((q) => {
                    const isYou = q.userName.includes('(You)');
                    const isBoosted = urgencyBoostedId === q.id;

                    return (
                      <div key={q.id} className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              Queue Position #{q.position}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 mt-1">
                              {q.resourceTitle}
                            </h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {isBoosted ? '97.5' : q.priorityScore} pts
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Holder:</span>
                            <span className="font-semibold text-slate-700">{q.userName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Forecast:</span>
                            <span className="text-emerald-700 font-medium">
                              {q.estimatedWaitTime || 'Est. 3-4 hours'}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Queue Actions */}
                        {isYou && (
                          <div className="flex items-center gap-2 pt-1">
                            {!isBoosted ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[11px] flex-1"
                                onClick={() => setUrgencyBoostedId(q.id)}
                              >
                                Boost with Capstone
                              </Button>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded flex-1 text-center">
                                ✓ Capstone Urgency Boosted (+3 pts)
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[11px] text-rose-600 hover:text-rose-700"
                              onClick={() => setRemovedQueueId(q.id)}
                            >
                              Leave
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No active waitlists currently.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Fairness "What-If" Simulator */}
          <Card className="border-slate-300 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <CardTitle>Fairness Simulator</CardTitle>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Interactive Transparency
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                See how adjusting your weekly usage and punctuality alters your priority rank
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Slider 1: Hours */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Simulated Weekly Usage:</span>
                  <span className="font-bold text-slate-900">{simUsageHours} hours</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={simUsageHours}
                  onChange={(e) => setSimUsageHours(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0h (Max Bonus)</span>
                  <span>10h (Balanced)</span>
                  <span>20h+ (Throttled)</span>
                </div>
              </div>

              {/* Slider 2: Punctuality Streak */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">On-Time Return Streak:</span>
                  <span className="font-bold text-slate-900">{simPunctualityStreak} loans</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={simPunctualityStreak}
                  onChange={(e) => setSimPunctualityStreak(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Resulting simulated score */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Projected Fairness Score</p>
                  <p className="text-[11px] text-slate-500">
                    {simScore >= 90
                      ? 'Tier A • First Priority Selection'
                      : simScore >= 75
                      ? 'Tier B • Standard Allocation'
                      : 'Tier C • Restricted Contention'}
                  </p>
                </div>
                <div className="text-2xl font-black text-blue-600 font-mono">
                  {simScore}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSimUsageHours(6.5);
                  setSimPunctualityStreak(14);
                }}
              >
                Reset to Current Standing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Allocation History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historical Allocation Decisions</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of algorithmically resolved reservation requests
              </p>
            </div>
            <Link to="/student/bookings">
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Active Bookings
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Allocated Slot</TableHead>
                <TableHead>Fairness Score at Request</TableHead>
                <TableHead>Outcome Status</TableHead>
                <TableHead>Algorithm Decision Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                    Loading allocation history...
                  </TableCell>
                </TableRow>
              ) : historyItems && historyItems.length > 0 ? (
                historyItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      {item.resourceTitle}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {item.allocatedSlot}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-slate-700">
                      {item.fairnessScoreAtTime.toFixed(1)} / 100
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          item.status === 'Allocated' || item.status === 'Promoted'
                            ? 'APPROVED'
                            : item.status === 'Waitlisted'
                            ? 'WAITLISTED'
                            : 'CANCELLED'
                        }
                        label={item.status}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-xs">
                      {item.decisionReason}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                    No allocation records found.
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
