/**
 * TrustPool Audit & Accountability Service
 * Complete immutable institutional ledger tracking all lifecycle transitions:
 * - Booking creation
 * - Approval and rejection
 * - Cancellation
 * - Fair allocation decisions
 * - QR check-in and check-out
 * - Condition reports
 * - Return verification
 * - Incident updates
 */

export type AuditEventType =
  | 'BOOKING_CREATED'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'FAIR_ALLOCATION_DECISION'
  | 'QR_CHECK_IN'
  | 'QR_CHECK_OUT'
  | 'CONDITION_REPORT_SUBMITTED'
  | 'RETURN_VERIFIED'
  | 'INCIDENT_UPDATED';

export type AuditCategory =
  | 'all'
  | 'booking'
  | 'allocation'
  | 'qr_access'
  | 'condition_return'
  | 'incident';

export interface AuditActor {
  id: string;
  name: string;
  role: 'student' | 'owner' | 'admin' | 'system';
  department?: string;
}

export interface AuditRecord {
  id: string;
  eventType: AuditEventType;
  actionTitle: string;
  category: Exclude<AuditCategory, 'all'>;
  performedBy: AuditActor;
  targetUser?: AuditActor;
  targetEntity: string; // e.g. Resource name or Booking ID
  details: string;
  timestamp: string;
  ipAddress: string;
  cryptoHash: string; // SHA-256 simulated blockchain proof
  metadata?: {
    trustScoreDelta?: string;
    conditionRating?: string;
    queuePosition?: number;
    inspectionMatches?: string;
    resolutionNotes?: string;
    reason?: string;
  };
}

const STORAGE_KEY = 'trustpool:audit_ledger_v2';

// Initial seed records covering every single required category
const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-101',
    eventType: 'BOOKING_CREATED',
    actionTitle: 'Reservation Created',
    category: 'booking',
    performedBy: {
      id: 'user-stu-1',
      name: 'Alex Rivera',
      role: 'student',
      department: 'Computer Science & Robotics',
    },
    targetEntity: 'High-Speed Sony FX3 Cinema Camera Kit',
    details: 'Initial reservation slot submitted for Senior Capstone Documentary project.',
    timestamp: '2026-10-30T10:00:00Z',
    ipAddress: '10.24.110.14',
    cryptoHash: '0x8f3c49a1d2e8b7c3f9104829aefb632190c13e45f9a2b8e4c1d2e8f9a0b1c2d3',
    metadata: {
      reason: 'Senior Capstone Film Project',
    },
  },
  {
    id: 'aud-102',
    eventType: 'FAIR_ALLOCATION_DECISION',
    actionTitle: 'Fair Allocation Engine Prioritization',
    category: 'allocation',
    performedBy: {
      id: 'system-alloc-v2',
      name: 'FairAlgorithm Engine v2.4',
      role: 'system',
    },
    targetUser: {
      id: 'user-stu-1',
      name: 'Alex Rivera',
      role: 'student',
    },
    targetEntity: 'High-Speed Sony FX3 Cinema Camera Kit',
    details: 'Algorithm awarded Priority Queue #1 (Score: 94.2) based on Academic Capstone urgency and zero recent cancellations.',
    timestamp: '2026-10-30T10:02:15Z',
    ipAddress: '10.24.110.1',
    cryptoHash: '0x3a9f82d1c4e7b0a8f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4',
    metadata: {
      queuePosition: 1,
      trustScoreDelta: 'Tier A Verified',
    },
  },
  {
    id: 'aud-103',
    eventType: 'BOOKING_APPROVED',
    actionTitle: 'Custodian Booking Approval',
    category: 'booking',
    performedBy: {
      id: 'user-own-1',
      name: 'Dr. Sarah Chen',
      role: 'owner',
      department: 'Advanced Prototyping & Physics Lab',
    },
    targetUser: {
      id: 'user-stu-1',
      name: 'Alex Rivera',
      role: 'student',
    },
    targetEntity: 'Booking book-901 (Sony FX3 Cinema Camera)',
    details: 'Custodian verified student lab certification and released cryptographic access token.',
    timestamp: '2026-10-30T11:30:00Z',
    ipAddress: '192.168.1.100',
    cryptoHash: '0x99e2f4a1b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1',
    metadata: {
      trustScoreDelta: 'Deposit Waived ($0.00)',
    },
  },
  {
    id: 'aud-104',
    eventType: 'CONDITION_REPORT_SUBMITTED',
    actionTitle: 'Pre-Use Baseline Inspection Filed',
    category: 'condition_return',
    performedBy: {
      id: 'user-stu-1',
      name: 'Alex Rivera',
      role: 'student',
    },
    targetEntity: 'Sony FX3 Cinema Camera Kit',
    details: 'Pre-use condition verification completed with 5-point checklist and 2 photographic exhibits at Studio 204.',
    timestamp: '2026-10-31T09:55:00Z',
    ipAddress: '10.24.110.14',
    cryptoHash: '0x17b3c9d8e2f1a0b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    metadata: {
      conditionRating: 'Excellent (Clean Sensor, 100% Batteries)',
      inspectionMatches: '5/5 Baseline Pass',
    },
  },
  {
    id: 'aud-105',
    eventType: 'QR_CHECK_IN',
    actionTitle: 'QR Handshake & Physical Check-In',
    category: 'qr_access',
    performedBy: {
      id: 'user-stu-1',
      name: 'Alex Rivera',
      role: 'student',
    },
    targetEntity: 'Studio 204 Custodian Station',
    details: 'Optical token TRUSTPOOL:ACCESS:book-901 authenticated. Physical custody clock started.',
    timestamp: '2026-10-31T10:05:00Z',
    ipAddress: '10.24.110.45',
    cryptoHash: '0x55a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    metadata: {
      trustScoreDelta: 'Active Custody Initiated',
    },
  },
  {
    id: 'aud-106',
    eventType: 'QR_CHECK_OUT',
    actionTitle: 'QR Digital Check-Out Recorded',
    category: 'qr_access',
    performedBy: {
      id: 'user-stu-1',
      name: 'Alex Rivera',
      role: 'student',
    },
    targetEntity: 'Precision Bambu Lab X1-Carbon 3D Printer',
    details: 'Digital return scan recorded at Makerspace station. Custody lock disengaged.',
    timestamp: '2026-10-28T11:55:00Z',
    ipAddress: '10.24.110.88',
    cryptoHash: '0x88f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    metadata: {
      trustScoreDelta: 'Returned 5m Ahead of Schedule (Punctual)',
    },
  },
  {
    id: 'aud-107',
    eventType: 'RETURN_VERIFIED',
    actionTitle: 'Return Inspection Verified & Score Bonus',
    category: 'condition_return',
    performedBy: {
      id: 'user-own-1',
      name: 'Dr. Sarah Chen',
      role: 'owner',
    },
    targetUser: {
      id: 'user-stu-1',
      name: 'Alex Rivera',
      role: 'student',
    },
    targetEntity: 'Bambu Lab X1-Carbon 3D Printer (book-902)',
    details: 'Owner confirmed zero PEI bed residue, nozzle purged. Custody officially terminated with trust bonus.',
    timestamp: '2026-10-28T12:00:00Z',
    ipAddress: '192.168.1.100',
    cryptoHash: '0x44d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
    metadata: {
      trustScoreDelta: '+2 Points Awarded',
      conditionRating: 'Mint Condition',
    },
  },
  {
    id: 'aud-108',
    eventType: 'BOOKING_REJECTED',
    actionTitle: 'Booking Request Declined',
    category: 'booking',
    performedBy: {
      id: 'user-own-2',
      name: 'Prof. Aris Thorne',
      role: 'owner',
    },
    targetUser: {
      id: 'user-stu-5',
      name: 'Devin Vance',
      role: 'student',
    },
    targetEntity: 'Confocal Fluorescence Microscope (book-882)',
    details: 'Declined due to prerequisite laser safety certificate expiration. Student notified with renewal instructions.',
    timestamp: '2026-10-27T14:20:00Z',
    ipAddress: '10.24.112.5',
    cryptoHash: '0x66c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5',
    metadata: {
      reason: 'Expired safety credentials (EHS-CERT-2025)',
    },
  },
  {
    id: 'aud-109',
    eventType: 'BOOKING_CANCELLED',
    actionTitle: 'Administrative Override Cancellation',
    category: 'booking',
    performedBy: {
      id: 'user-adm-1',
      name: 'Marcus Vance',
      role: 'admin',
    },
    targetUser: {
      id: 'user-stu-4',
      name: 'James Wilson',
      role: 'student',
    },
    targetEntity: 'Acoustic Soundstage Studio B (book-771)',
    details: 'Cancelled by campus administration for mandatory university fire marshal inspection.',
    timestamp: '2026-10-26T16:00:00Z',
    ipAddress: '192.168.1.1',
    cryptoHash: '0x77b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    metadata: {
      reason: 'Campus Facilities Safety Audit',
    },
  },
  {
    id: 'aud-110',
    eventType: 'INCIDENT_UPDATED',
    actionTitle: 'Dispute Arbitration Ruling Applied',
    category: 'incident',
    performedBy: {
      id: 'user-adm-1',
      name: 'Marcus Vance',
      role: 'admin',
    },
    targetUser: {
      id: 'user-stu-3',
      name: 'Taylor Brooks',
      role: 'student',
    },
    targetEntity: 'Incident inc-101 (Lens Mount Ring Defect)',
    details: 'Admin arbitration concluded. -10 TrustScore penalty applied following evidence examination.',
    timestamp: '2026-10-25T15:00:00Z',
    ipAddress: '192.168.1.1',
    cryptoHash: '0x22a1f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0',
    metadata: {
      trustScoreDelta: '-10 Points Deducted',
      resolutionNotes: 'Photographic delta confirmed post-loan damage.',
    },
  },
];

export const auditService = {
  /**
   * Get all audit records from storage
   */
  getAuditLogs: (): AuditRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return INITIAL_AUDIT_LOGS;
  },

  /**
   * Record a new immutable event in the audit trail
   */
  recordAuditEvent: (
    event: Omit<AuditRecord, 'id' | 'timestamp' | 'cryptoHash' | 'ipAddress'> & {
      ipAddress?: string;
    }
  ): AuditRecord => {
    const existing = auditService.getAuditLogs();
    const id = `aud-${Date.now().toString().slice(-5)}`;
    const timestamp = new Date().toISOString();
    const hexChars = '0123456789abcdef';
    let cryptoHash = '0x';
    for (let i = 0; i < 64; i++) {
      cryptoHash += hexChars[Math.floor(Math.random() * 16)];
    }

    const newRecord: AuditRecord = {
      ...event,
      id,
      timestamp,
      ipAddress: event.ipAddress || '10.24.110.1',
      cryptoHash,
    };

    const updated = [newRecord, ...existing];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return newRecord;
  },

  /**
   * Filter and search audit logs
   */
  filterAuditLogs: (
    logs: AuditRecord[],
    search: string,
    category: AuditCategory
  ): AuditRecord[] => {
    const q = search.toLowerCase().trim();
    return logs.filter((log) => {
      const matchesCategory =
        category === 'all' || log.category === category;

      const matchesSearch =
        !q ||
        log.actionTitle.toLowerCase().includes(q) ||
        log.eventType.toLowerCase().includes(q) ||
        log.performedBy.name.toLowerCase().includes(q) ||
        log.targetEntity.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.cryptoHash.toLowerCase().includes(q) ||
        (log.targetUser && log.targetUser.name.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  },

  /**
   * Export audit ledger as JSON or CSV
   */
  exportAuditLedger: (logs: AuditRecord[], format: 'json' | 'csv' = 'json'): void => {
    let content = '';
    let mimeType = 'application/json';
    let filename = `trustpool_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`;

    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
    } else {
      mimeType = 'text/csv';
      filename = `trustpool_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['ID', 'EventType', 'Action', 'Actor', 'ActorRole', 'TargetEntity', 'TargetUser', 'Details', 'Timestamp', 'IP', 'CryptoHash'];
      const rows = logs.map(l => [
        l.id,
        l.eventType,
        `"${l.actionTitle}"`,
        `"${l.performedBy.name}"`,
        l.performedBy.role,
        `"${l.targetEntity}"`,
        l.targetUser ? `"${l.targetUser.name}"` : '""',
        `"${l.details.replace(/"/g, '""')}"`,
        l.timestamp,
        l.ipAddress,
        l.cryptoHash,
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
