import { api } from './apiClient';
import {
  UserFairnessProfile,
  AllocationQueueItem,
  AllocationHistoryItem,
  FairnessFactor,
  ApiResponse,
} from '../types';

export const allocationService = {
  /**
   * Get fair allocation profile and trust standing for user
   */
  getUserFairnessProfile: async (userId?: string): Promise<UserFairnessProfile> => {
    try {
      const response = await api.get<ApiResponse<UserFairnessProfile>>(
        '/allocation/profile',
        { params: { userId } }
      );
      return response.data;
    } catch {
      return {
        userId: userId || 'user-stu-1',
        trustScore: 92,
        priorityTier: 'High',
        weeklyUsageHours: 6.5,
        maxWeeklyQuota: 20,
        successfulReturnsCount: 14,
        lateReturnsCount: 0,
        cancelledBookingsCount: 1,
        fairnessIndex: 94,
      };
    }
  },

  /**
   * Fetch transparent fairness scoring factors explaining the priority score
   */
  getFairnessFactors: async (): Promise<FairnessFactor[]> => {
    try {
      const response = await api.get<ApiResponse<FairnessFactor[]>>('/allocation/factors');
      return response.data;
    } catch {
      return [
        {
          factor: 'Low Recent Usage Bonus',
          impact: '+18 points',
          points: 18,
          type: 'positive',
          description:
            'You received higher priority because your recent resource usage (6.5 hrs) is well below the cohort cap (20 hrs). Anti-monopoly principle applied.',
        },
        {
          factor: 'Punctual Return Streak',
          impact: '+25 points',
          points: 25,
          type: 'positive',
          description:
            '14 consecutive on-time returns with zero damage or missing component reports over the past 90 days.',
        },
        {
          factor: 'Academic Capstone Project Priority',
          impact: '+15 points',
          points: 15,
          type: 'positive',
          description:
            'Senior thesis / capstone course affiliation verified with academic registry.',
        },
        {
          factor: 'Honest Condition Reporting',
          impact: '+10 points',
          points: 10,
          type: 'positive',
          description:
            'Custodian match rate of 98% on pre/post check-in condition checklists.',
        },
        {
          factor: 'Recent Slot Cancellation',
          impact: '-4 points',
          points: -4,
          type: 'negative',
          description:
            'One late slot cancellation on Oct 14 released under 3 hours before start time.',
        },
      ];
    }
  },

  /**
   * Fetch current waitlist / queue for heavily contested resources
   */
  getAllocationQueue: async (resourceId?: string): Promise<AllocationQueueItem[]> => {
    try {
      const response = await api.get<ApiResponse<AllocationQueueItem[]>>(
        '/allocation/queue',
        { params: { resourceId } }
      );
      return response.data;
    } catch {
      const allQueues: AllocationQueueItem[] = [
        {
          id: 'q-101',
          resourceId: 'res-101',
          resourceTitle: 'Sony FX3 Cinema Camera Kit',
          userId: 'user-stu-1',
          userName: 'Alex Rivera (You)',
          trustScore: 92,
          requestedSlot: { start: '2026-11-03T10:00:00Z', end: '2026-11-03T14:00:00Z' },
          priorityScore: 94.5,
          status: 'queued',
          position: 1,
          estimatedWaitTime: 'Guaranteed at next release (Est. 4h)',
        },
        {
          id: 'q-102',
          resourceId: 'res-101',
          resourceTitle: 'Sony FX3 Cinema Camera Kit',
          userId: 'user-stu-3',
          userName: 'Taylor Brooks',
          trustScore: 78,
          requestedSlot: { start: '2026-11-03T10:00:00Z', end: '2026-11-03T14:00:00Z' },
          priorityScore: 79.0,
          status: 'queued',
          position: 2,
          estimatedWaitTime: 'Pending primary return',
        },
        {
          id: 'q-104',
          resourceId: 'res-104',
          resourceTitle: 'VR & Spatial Computing Rig (Vision Pro + Quest 3)',
          userId: 'user-stu-1',
          userName: 'Alex Rivera (You)',
          trustScore: 92,
          requestedSlot: { start: '2026-11-04T13:00:00Z', end: '2026-11-04T16:00:00Z' },
          priorityScore: 93.0,
          status: 'queued',
          position: 1,
          estimatedWaitTime: 'Expected today at 16:00',
        },
        {
          id: 'q-105',
          resourceId: 'res-105',
          resourceTitle: 'High-Performance NVIDIA H100 GPU Compute Node',
          userId: 'user-stu-5',
          userName: 'Jordan Lee',
          trustScore: 84,
          requestedSlot: { start: '2026-11-02T12:00:00Z', end: '2026-11-02T18:00:00Z' },
          priorityScore: 87.2,
          status: 'queued',
          position: 1,
          estimatedWaitTime: 'Batch queue running',
        },
      ];

      if (resourceId) {
        return allQueues.filter((q) => q.resourceId === resourceId);
      }
      return allQueues;
    }
  },

  /**
   * Fetch transparent historical record of fair allocations
   */
  getAllocationHistory: async (): Promise<AllocationHistoryItem[]> => {
    try {
      const response = await api.get<ApiResponse<AllocationHistoryItem[]>>(
        '/allocation/history'
      );
      return response.data;
    } catch {
      return [
        {
          id: 'ah-1',
          resourceId: 'res-101',
          resourceTitle: 'Sony FX3 Cinema Camera Kit',
          requestDate: '2026-10-30T10:00:00Z',
          allocatedSlot: 'Nov 1, 10:00 AM – 2:00 PM',
          status: 'Allocated',
          fairnessScoreAtTime: 92.5,
          decisionReason: 'First-round grant: TrustScore 92 & 0 active loans in week.',
        },
        {
          id: 'ah-2',
          resourceId: 'res-102',
          resourceTitle: 'Bambu Lab X1-Carbon 3D Printer',
          requestDate: '2026-10-27T14:00:00Z',
          allocatedSlot: 'Oct 28, 9:00 AM – 12:00 PM',
          status: 'Allocated',
          fairnessScoreAtTime: 91.0,
          decisionReason: 'Automatic allocation: low contention slot, 100% punctuality streak.',
        },
        {
          id: 'ah-3',
          resourceId: 'res-104',
          resourceTitle: 'VR & Spatial Computing Rig',
          requestDate: '2026-10-22T08:00:00Z',
          allocatedSlot: 'Oct 23, 1:00 PM – 4:00 PM',
          status: 'Promoted',
          fairnessScoreAtTime: 89.0,
          decisionReason: 'Promoted from Waitlist #1 following competitor slot cancellation.',
        },
        {
          id: 'ah-4',
          resourceId: 'res-103',
          resourceTitle: 'Acoustic Soundstage Studio B',
          requestDate: '2026-10-14T11:00:00Z',
          allocatedSlot: 'Oct 15, 2:00 PM – 5:00 PM',
          status: 'Expired',
          fairnessScoreAtTime: 86.0,
          decisionReason: 'Booking not confirmed within 2-hour custodian acceptance window.',
        },
      ];
    }
  },
};
