// Salary band distribution for attendee allocation
export interface SalaryBandDistribution {
  executive: number;
  senior: number;
  midLevel: number;
  entry: number;
}

// Meeting audit input from form (FR5-FR9)
export interface MeetingAuditInput {
  meetingCount: number;
  averageAttendees: number;
  averageDuration: number; // in minutes
  salaryDistribution: SalaryBandDistribution;
}

// Calculation result from API
export interface CalculationResult {
  meetingWaste: number;
  estimatedAlignmentTaxMin: number;
  estimatedAlignmentTaxMax: number;
  inputs: MeetingAuditInput;
  calculatedAt: string; // ISO 8601
}

// Store state shape
export interface CalculatorState {
  meetingData: MeetingAuditInput | null;
  results: CalculationResult | null;
  isCalculating: boolean;
}

// Store actions
export interface CalculatorActions {
  setMeetingData: (data: MeetingAuditInput | null) => void;
  setResults: (results: CalculationResult | null) => void;
  setIsCalculating: (loading: boolean) => void;
  clearSession: () => void;
}

// Combined store type
export type CalculatorStore = CalculatorState & CalculatorActions;
