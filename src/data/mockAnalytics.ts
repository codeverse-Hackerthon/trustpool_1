import { DashboardAnalytics } from '../types';

export const mockAnalyticsData: DashboardAnalytics = {
  metrics: [
    { label: 'Active Bookings', value: '18', change: '+12%', isPositive: true, description: 'Currently utilized slots' },
    { label: 'Average Trust Score', value: '91.4', change: '+2.8%', isPositive: true, description: 'Across campus users' },
    { label: 'Resource Utilization', value: '84.2%', change: '+5.1%', isPositive: true, description: 'Peak efficiency rate' },
    { label: 'Fairness Index', value: '96/100', change: 'Optimal', isPositive: true, description: 'Balanced resource distribution' },
  ],
  utilizationByCategory: [
    { category: 'Equipment & Gear', totalBookings: 142, utilizationRate: 88, averageDurationHours: 3.5 },
    { category: 'Labs & Workshops', totalBookings: 96, utilizationRate: 79, averageDurationHours: 4.2 },
    { category: 'Study & Rooms', totalBookings: 184, utilizationRate: 92, averageDurationHours: 2.1 },
    { category: 'Event Spaces', totalBookings: 34, utilizationRate: 65, averageDurationHours: 5.0 },
    { category: 'Pro Facilities', totalBookings: 45, utilizationRate: 74, averageDurationHours: 3.8 },
  ],
  peakUsage: [
    { timeSlot: '08:00', bookingsCount: 12 },
    { timeSlot: '10:00', bookingsCount: 38 },
    { timeSlot: '12:00', bookingsCount: 54 },
    { timeSlot: '14:00', bookingsCount: 62 },
    { timeSlot: '16:00', bookingsCount: 49 },
    { timeSlot: '18:00', bookingsCount: 29 },
    { timeSlot: '20:00', bookingsCount: 14 },
  ],
  fairnessDistribution: [
    { tier: 'Trusted Tier (A+)', userCount: 420, percentage: 68 },
    { tier: 'Standard Tier (B)', userCount: 165, percentage: 27 },
    { tier: 'Probation Tier (C)', userCount: 31, percentage: 5 },
  ],
};
