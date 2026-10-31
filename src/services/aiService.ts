/**
 * TrustPool AI Feature Services (Frontend Simulation Layer)
 * 
 * IMPORTANT NOTICE:
 * These interfaces and simulation engines demonstrate frontend AI capabilities
 * including Natural Language Search, Smart Recommendations, Incident Summarization,
 * Eligibility Document Verification, and Unusual Usage Anomaly Detection.
 * 
 * All interfaces are clearly demarcated as "Simulated AI / Preview" until
 * integrated with backend LLM / OCR / Anomaly Detection microservices.
 */

import { Resource, Incident, Booking } from '../types';
import { mockResources } from '../data/mockResources';
import { api } from './apiClient';

export const AI_INTEGRATION_NOTICE = {
  badge: 'AI Feature (Simulated Preview)',
  disclaimer: 'Frontend heuristic simulation. Ready for backend LLM / Embedding / OCR microservice integration.',
  modelTarget: 'Gemini 1.5 Pro / GPT-4o / Institutional Embedding Pipeline',
};

// ============================================================================
// 1. NATURAL LANGUAGE RESOURCE SEARCH
// ============================================================================

export interface ParsedNLQuery {
  rawQuery: string;
  detectedCategory?: Resource['category'] | 'all';
  detectedLocation?: string;
  detectedTimeframe?: string;
  detectedKeywords: string[];
  maxTrustScoreNeeded?: number;
  confidenceScore: number; // 0 - 100
  aiExplanation: string;
}

export const aiSearchService = {
  /**
   * Parse natural language user prompt into structured search filters
   * Example: "Find a projector near my college for tomorrow."
   */
  parseNaturalLanguageQuery: (query: string): ParsedNLQuery => {
    const q = query.toLowerCase().trim();
    const keywords: string[] = [];
    let detectedCategory: Resource['category'] | 'all' = 'all';
    let detectedLocation: string | undefined = undefined;
    let detectedTimeframe: string | undefined = undefined;
    let maxTrustScoreNeeded: number | undefined = undefined;
    let confidenceScore = 88;

    // Category parsing heuristics
    if (q.includes('projector') || q.includes('display') || q.includes('screen')) {
      detectedCategory = 'equipment';
      keywords.push('projector', 'display');
    } else if (q.includes('camera') || q.includes('cinema') || q.includes('lens') || q.includes('audio') || q.includes('mic')) {
      detectedCategory = 'equipment';
      keywords.push('camera', 'video', 'production');
    } else if (q.includes('3d printer') || q.includes('printer') || q.includes('bambu') || q.includes('laser') || q.includes('gpu') || q.includes('compute')) {
      detectedCategory = 'lab';
      keywords.push('rapid prototyping', 'fabrication');
    } else if (q.includes('soundstage') || q.includes('podcast') || q.includes('studio') || q.includes('room') || q.includes('booth')) {
      detectedCategory = 'room';
      keywords.push('acoustic studio', 'sound recording');
    } else if (q.includes('hall') || q.includes('auditorium') || q.includes('pavilion') || q.includes('facility')) {
      detectedCategory = 'facility';
      keywords.push('multipurpose hall', 'gathering');
    }

    // Location parsing heuristics
    if (q.includes('media arts') || q.includes('cinema') || q.includes('art center')) {
      detectedLocation = 'Media Arts Center';
    } else if (q.includes('makerspace') || q.includes('innovation') || q.includes('hub') || q.includes('engineering')) {
      detectedLocation = 'Makerspace Innovation Hub';
    } else if (q.includes('student union') || q.includes('union') || q.includes('east campus')) {
      detectedLocation = 'Student Union';
    } else if (q.includes('college') || q.includes('campus') || q.includes('near')) {
      detectedLocation = 'Media Arts Center'; // closest central campus node
    }

    // Timeframe parsing
    if (q.includes('tomorrow')) {
      detectedTimeframe = 'Tomorrow (Next 24h)';
    } else if (q.includes('weekend') || q.includes('saturday') || q.includes('sunday')) {
      detectedTimeframe = 'Upcoming Weekend';
    } else if (q.includes('today') || q.includes('urgent') || q.includes('now')) {
      detectedTimeframe = 'Immediate / Today';
    } else {
      detectedTimeframe = 'Flexible Academic Window';
    }

    // Trust requirement inference
    if (q.includes('high precision') || q.includes('professional') || q.includes('cinema') || q.includes('expensive')) {
      maxTrustScoreNeeded = 90;
      confidenceScore = 95;
    } else {
      maxTrustScoreNeeded = 75;
    }

    // Extract additional semantic keywords
    const tokens = q.split(/\s+/).filter(w => !['find', 'a', 'near', 'my', 'for', 'the', 'in', 'and', 'with', 'to', 'of'].includes(w));
    tokens.forEach(t => {
      if (!keywords.includes(t)) keywords.push(t);
    });

    const aiExplanation = `Interpreted intent for "${query}": Identified category '${detectedCategory}', location affinity '${detectedLocation || 'Campus-wide'}', timing '${detectedTimeframe}'. Filtered against university inventory with standard academic safety checks.`;

    return {
      rawQuery: query,
      detectedCategory,
      detectedLocation,
      detectedTimeframe,
      detectedKeywords: keywords.slice(0, 5),
      maxTrustScoreNeeded,
      confidenceScore,
      aiExplanation,
    };
  },

  /**
   * Execute real backend natural-language search
   */
  executeBackendSearch: async (query: string): Promise<any> => {
    try {
      const res = await api.post<any>('/ai/search', { query });
      return res?.data?.data || res?.data || res;
    } catch (e) {
      console.warn('Backend AI search fallback to heuristics:', e);
      return null;
    }
  },
};

// ============================================================================
// 2. SMART RESOURCE RECOMMENDATIONS
// ============================================================================

export interface ResourceAlternative {
  resource: Resource;
  similarityScore: number; // 0 - 100%
  matchReason: string;
  advantages: string[];
  immediateAvailability: boolean;
}

export const aiRecommendationService = {
  /**
   * Find suitable alternatives when a requested resource is unavailable, in use, or contested
   */
  getSmartAlternatives: (targetResource: Resource, allResources: Resource[] = mockResources): ResourceAlternative[] => {
    return allResources
      .filter((r) => r.id !== targetResource.id)
      .map((candidate) => {
        let score = 50;
        const advantages: string[] = [];

        // Same category gives large boost
        if (candidate.category === targetResource.category) {
          score += 25;
          advantages.push(`Same equipment category: ${candidate.category.toUpperCase()}`);
        }

        // Available immediately gives boost
        if (candidate.status === 'available') {
          score += 15;
          advantages.push('Available immediately with zero queue');
        }

        // Lower or equal trust score requirement
        if (candidate.minTrustScore <= targetResource.minTrustScore) {
          score += 10;
          advantages.push(`Accessible at Trust Score ${candidate.minTrustScore} (Target was ${targetResource.minTrustScore})`);
        }

        // Location proximity
        if (candidate.location === targetResource.location) {
          score += 10;
          advantages.push(`Located in same facility: ${candidate.location}`);
        } else {
          advantages.push(`Located at ${candidate.location}`);
        }

        const similarityScore = Math.min(score, 98);
        const matchReason = candidate.status === 'available'
          ? `High-compatibility alternative available immediately in ${candidate.location}.`
          : `Comparable specifications and matching academic workload suitability.`;

        return {
          resource: candidate,
          similarityScore,
          matchReason,
          advantages: advantages.slice(0, 3),
          immediateAvailability: candidate.status === 'available',
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 3);
  },

  /**
   * Fetch recommendations directly from backend AI recommendation pipeline
   */
  fetchBackendRecommendations: async (preferences?: string, category?: string): Promise<any> => {
    try {
      const res = await api.get<any>('/ai/recommendations', { params: { preferences, category } });
      return res?.data?.data?.recommendations || res?.data?.recommendations || [];
    } catch (e) {
      console.warn('Backend AI recommendations fallback:', e);
      return [];
    }
  },
};

// ============================================================================
// 3. INCIDENT REPORT SUMMARIZATION
// ============================================================================

export interface IncidentAISummary {
  incidentId: string;
  conciseSummary: string;
  rootCauseCategory: 'Mechanical Defect' | 'Punctuality Overdue' | 'Cosmetic Wear' | 'Missing Accessory' | 'Operator Error';
  riskSeverityTier: 'Low' | 'Medium' | 'High' | 'Critical';
  photographicDiscrepancyNotes: string;
  suggestedAdministrativeRuling: {
    recommendedPenalty: number;
    recommendedAction: 'Dismiss & Exonerate' | 'Standard Penalty' | 'Conditional Warning' | 'Full Equipment Suspension';
    justification: string;
  };
  generatedAt: string;
}

export const aiIncidentService = {
  /**
   * Generate an automated concise summary and arbitration recommendations for incidents
   */
  summarizeIncident: (incident: Incident): IncidentAISummary => {
    let rootCause: IncidentAISummary['rootCauseCategory'] = 'Mechanical Defect';
    let riskTier: IncidentAISummary['riskSeverityTier'] = 'Medium';
    let penalty = 10;
    let action: IncidentAISummary['suggestedAdministrativeRuling']['recommendedAction'] = 'Standard Penalty';
    let justification = 'Evidence matches custodian report of condition degradation post-usage.';

    if (incident.type === 'late_return') {
      rootCause = 'Punctuality Overdue';
      riskTier = 'Low';
      penalty = 5;
      action = 'Conditional Warning';
      justification = 'Borrower demonstrated transit disruption. Punctuality record shows 14 prior on-time returns.';
    } else if (incident.severity === 'critical') {
      rootCause = 'Mechanical Defect';
      riskTier = 'Critical';
      penalty = 25;
      action = 'Full Equipment Suspension';
      justification = 'Severe structural impairment rendering hardware unserviceable for campus lab peers.';
    } else if (incident.type === 'damage') {
      rootCause = 'Mechanical Defect';
      riskTier = incident.severity === 'high' ? 'High' : 'Medium';
      penalty = incident.severity === 'high' ? 15 : 10;
      action = 'Standard Penalty';
      justification = 'Photographic evidence confirms discrepancies against checkout baseline condition.';
    }

    const conciseSummary = `Incident ${incident.id} involving "${incident.resourceTitle}" filed by ${incident.reportedByName} (${incident.reportedByRole.toUpperCase()}). ${incident.description.slice(0, 160)}${incident.description.length > 160 ? '...' : ''}`;

    const photographicDiscrepancyNotes = incident.evidenceUrls && incident.evidenceUrls.length > 0
      ? `AI optical review examined ${incident.evidenceUrls.length} photographic exhibits. Verified baseline condition delta with 94.2% feature discrepancy match.`
      : 'No supplementary photographic exhibits attached. Recommendation based on verified custodian baseline logs.';

    return {
      incidentId: incident.id,
      conciseSummary,
      rootCauseCategory: rootCause,
      riskSeverityTier: riskTier,
      photographicDiscrepancyNotes,
      suggestedAdministrativeRuling: {
        recommendedPenalty: penalty,
        recommendedAction: action,
        justification,
      },
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Request backend AI incident summary and advisory ruling
   */
  fetchBackendSummary: async (incidentId: string): Promise<any> => {
    try {
      const res = await api.post<any>(`/ai/incidents/${incidentId}/summarize`);
      return res?.data?.data || res?.data;
    } catch (e) {
      console.warn('Backend AI incident summary fallback:', e);
      return null;
    }
  },
};

// ============================================================================
// 4. ELIGIBILITY DOCUMENT ASSISTANCE
// ============================================================================

export interface DocumentExtractionResult {
  fileName: string;
  documentType: 'University Student ID' | 'Lab Safety Certification' | 'Equipment Operator Card' | 'Faculty Endorsement Letter';
  holderName: string;
  institutionalId: string;
  issuingAuthority: string;
  expiryDate: string;
  isExpired: boolean;
  confidenceScore: number;
  extractedFields: {
    label: string;
    value: string;
    verified: boolean;
  }[];
  overallVerificationStatus: 'verified' | 'pending_admin' | 'rejected';
  aiNotes: string;
}

export const aiDocumentService = {
  /**
   * Simulate AI document parsing and optical text extraction for eligibility verifications
   */
  processEligibilityDocument: async (file: File | { name: string; size: number }): Promise<DocumentExtractionResult> => {
    // Simulate brief asynchronous processing delay
    await new Promise((r) => setTimeout(r, 600));

    const fileNameLower = file.name.toLowerCase();
    let docType: DocumentExtractionResult['documentType'] = 'University Student ID';
    let institutionalId = 'STU-98214';
    let holderName = 'Alex Rivera';
    let authority = 'University Registrar & Academic Affairs';
    let expiry = '2027-06-30';
    let confidence = 98.4;

    if (fileNameLower.includes('safety') || fileNameLower.includes('lab') || fileNameLower.includes('cert')) {
      docType = 'Lab Safety Certification';
      authority = 'Department of Environmental Health & Safety (EHS)';
      institutionalId = 'EHS-CERT-4491';
      expiry = '2026-12-31';
      confidence = 96.8;
    } else if (fileNameLower.includes('camera') || fileNameLower.includes('media') || fileNameLower.includes('operator')) {
      docType = 'Equipment Operator Card';
      authority = 'Media Arts & Cinematography Equipment Guild';
      institutionalId = 'MAC-OP-772';
      expiry = '2027-01-15';
      confidence = 97.2;
    }

    return {
      fileName: file.name,
      documentType: docType,
      holderName,
      institutionalId,
      issuingAuthority: authority,
      expiryDate: expiry,
      isExpired: false,
      confidenceScore: confidence,
      extractedFields: [
        { label: 'Document Type', value: docType, verified: true },
        { label: 'Authorized Person', value: holderName, verified: true },
        { label: 'Institutional Identifier', value: institutionalId, verified: true },
        { label: 'Accreditation Authority', value: authority, verified: true },
        { label: 'Validity Expiration', value: expiry, verified: true },
      ],
      overallVerificationStatus: 'verified',
      aiNotes: `AI optical parser matched applicant identity against institutional active enrollment database. Document watermark integrity confirmed.`,
    };
  },
};

// ============================================================================
// 5. UNUSUAL USAGE DETECTION
// ============================================================================

export interface AnomalyReport {
  bookingId: string;
  isFlagged: boolean;
  anomalyScore: number; // 0 - 100
  flagType?: 'MULTI_SLOT_HOARDING' | 'OFF_CAMPUS_TRANSPORT' | 'RAPID_CANCELLATION' | 'TRUST_SCORE_VELOCITY' | 'UNAUTHORIZED_SUBLEASE';
  severity: 'low' | 'medium' | 'high';
  detectedPattern: string;
  aiExplanation: string;
  recommendedAction: string;
  status: 'pending_review' | 'dismissed' | 'actioned';
}

export const aiAnomalyService = {
  /**
   * Scan bookings for unusual access frequency, hoarding velocity, or boundary infractions
   */
  detectAnomalies: (bookings: Booking[]): AnomalyReport[] => {
    return bookings.map((b, idx) => {
      // Create interesting deterministic demonstration anomalies
      if (b.id === 'book-901' || idx === 0) {
        return {
          bookingId: b.id,
          isFlagged: true,
          anomalyScore: 84,
          flagType: 'MULTI_SLOT_HOARDING',
          severity: 'medium',
          detectedPattern: 'Consecutive High-Value Equipment Reservations (3 slots within 48h)',
          aiExplanation: `Student "${b.userName}" booked high-demand cinema kit for multiple consecutive periods. Frequency exceeds department average by 2.8x.`,
          recommendedAction: 'Verify Capstone course requirement or limit consecutive allocation to 1 per week.',
          status: 'pending_review',
        };
      }

      if (b.id === 'book-903' || idx === 2) {
        return {
          bookingId: b.id,
          isFlagged: true,
          anomalyScore: 72,
          flagType: 'OFF_CAMPUS_TRANSPORT',
          severity: 'low',
          detectedPattern: 'Extended Loan Window Crossing Standard Custody Hours',
          aiExplanation: `Booking window extends past standard laboratory check-in station hours. Requires custodian explicit overnight authorization seal.`,
          recommendedAction: 'Prompt owner for off-hours equipment access clearance token.',
          status: 'pending_review',
        };
      }

      return {
        bookingId: b.id,
        isFlagged: false,
        anomalyScore: 12,
        severity: 'low',
        detectedPattern: 'Standard Nominal Pattern',
        aiExplanation: 'Booking parameters fall strictly within normal statistical bounds for enrolled department cohort.',
        recommendedAction: 'No administrative intervention required.',
        status: 'dismissed',
      };
    });
  },

  /**
   * Request real backend AI anomaly and hoarding pattern analysis
   */
  analyzeUsageBackend: async (params?: { timeframeDays?: number }): Promise<any> => {
    try {
      const res = await api.post<any>('/ai/usage/analyze', {
        timeframe_days: params?.timeframeDays || 30,
      });
      return res?.data?.data || res?.data;
    } catch (e) {
      console.warn('Backend AI usage analysis fallback:', e);
      return null;
    }
  },
};
