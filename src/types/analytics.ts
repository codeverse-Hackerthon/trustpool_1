export interface MetricStat {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  description?: string;
}

export interface ResourceUtilizationData {
  category: string;
  totalBookings: number;
  utilizationRate: number; // percentage
  averageDurationHours: number;
}

export interface PeakUsageData {
  timeSlot: string;
  bookingsCount: number;
}

export interface FairnessDistributionData {
  tier: string;
  userCount: number;
  percentage: number;
}

export interface DashboardAnalytics {
  metrics: MetricStat[];
  utilizationByCategory: ResourceUtilizationData[];
  peakUsage: PeakUsageData[];
  fairnessDistribution: FairnessDistributionData[];
}
