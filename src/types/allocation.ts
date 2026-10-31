export interface FairAllocationRule {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface UserFairnessProfile {
  userId: string;
  trustScore: number;
  priorityTier: 'High' | 'Standard' | 'Restricted';
  weeklyUsageHours: number;
  maxWeeklyQuota: number;
  successfulReturnsCount: number;
  lateReturnsCount: number;
  cancelledBookingsCount: number;
  fairnessIndex: number; // 0 - 100
}

export interface AllocationQueueItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  userId: string;
  userName: string;
  trustScore: number;
  requestedSlot: {
    start: string;
    end: string;
  };
  priorityScore: number;
  status: 'queued' | 'allocated' | 'bumped' | 'expired';
  position: number;
  estimatedWaitTime?: string;
}

export interface FairnessFactor {
  factor: string;
  impact: string;
  points: number;
  type: 'positive' | 'neutral' | 'negative';
  description: string;
}

export interface AllocationHistoryItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  requestDate: string;
  allocatedSlot: string;
  status: 'Allocated' | 'Waitlisted' | 'Promoted' | 'Expired';
  fairnessScoreAtTime: number;
  decisionReason: string;
}
