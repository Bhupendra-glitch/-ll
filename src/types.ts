export type Language = 'en' | 'hi' | 'ta';

export interface UpiTransaction {
  id: string;
  timestamp: string;
  partyName: string;
  vpa: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  category: 'GIG_PAYOUT' | 'CUSTOMER_TIP' | 'FUEL_MAINTENANCE' | 'GROCERY' | 'RECHARGE' | 'CASH_WITHDRAWAL';
  platform?: 'Zomato' | 'Swiggy' | 'Zepto' | 'Dunzo' | 'Urban Company' | 'PhonePe QR' | 'Uber' | 'Blinkit' | 'Porter';
  status: 'SUCCESS' | 'BOUNCE';
}

export interface ShapFeature {
  id: string;
  name: string;
  vernacularName: {
    en: string;
    hi: string;
    ta: string;
  };
  impact: number; // e.g. +42 or -18
  type: 'positive' | 'negative';
  description: {
    en: string;
    hi: string;
    ta: string;
  };
  category: 'VELOCITY' | 'CONSISTENCY' | 'BOUNCE_RATE' | 'PLATFORM_DIVERSITY' | 'NET_MARGIN' | 'PEAK_VOLATILITY';
}

export interface ForecastDay {
  dayIndex: number;
  date: string;
  p10: number; // Pessimistic (monsoon/strike)
  p50: number; // Expected baseline
  p90: number; // Optimistic (weekend/festive surge)
  actualHistorical?: number;
  eventNote?: string;
}

export interface ForecastHorizon {
  periodDays: 30 | 60 | 90;
  totalP10: number;
  totalP50: number;
  totalP90: number;
  dailyTrend: ForecastDay[];
  surgeFactors: string[];
}

export interface MonteCarloPath {
  id: number;
  points: number[];
  isBreached: boolean;
}

export interface StressScenario {
  id: 'baseline' | 'monsoon_slump' | 'health_emergency' | 'festive_boom';
  name: {
    en: string;
    hi: string;
    ta: string;
  };
  incomeMultiplier: number;
  expenseShock: number;
  description: {
    en: string;
    hi: string;
    ta: string;
  };
}

export interface SimulationParams {
  principal: number; // ₹5,000 to ₹1,50,000
  tenureMonths: number; // 3 to 18
  frequency: 'daily' | 'weekly' | 'monthly';
  interestRateAnnual: number; // e.g. 12.5%
  stressScenario: StressScenario['id'];
}

export interface SimulationResult {
  emiAmount: number;
  totalRepayment: number;
  totalInterest: number;
  informalComparisonInterest: number; // Interest under 48% informal moneylender
  interestSaved: number;
  defaultProbability: number; // 0 to 100%
  cashflowBufferRemaining: number; // % of income remaining after EMI
  safeZone: 'OPTIMAL' | 'MODERATE' | 'CAUTION' | 'DANGER';
  safeZoneLabel: {
    en: string;
    hi: string;
    ta: string;
  };
  simulatedPaths: MonteCarloPath[];
  dailyP10Cashflow: number;
  dailyP50Cashflow: number;
  dailyP90Cashflow: number;
}

export interface LendingProduct {
  id: string;
  name: string;
  lenderName: string;
  type: 'SIDBI_MICRO' | 'MUDRA_SHISHU' | 'NBFC_GIG_FLEXI' | 'EV_BATTERY_LOAN';
  interestRateAnnual: number;
  maxAmount: number;
  minScore: number;
  repaymentMode: string;
  features: string[];
  instantApproval: boolean;
  partnerLogoBadge: string;
}

export interface DlpInspectionEntity {
  field: string;
  originalValue: string;
  redactedValue: string;
  infoType: 'INDIA_AADHAAR' | 'PHONE_NUMBER' | 'UPI_VPA' | 'BANK_ACCOUNT';
  status: 'MASKED_BY_DLP' | 'TOKENIZED_KMS';
}

export interface WorkerProfile {
  id: string;
  name: string;
  city: string;
  state: string;
  avatar: string;
  occupation: string;
  platforms: string[];
  vehicleType: string;
  monthlyAvgInflow: number;
  monthlyNetSurplus: number;
  dailyActiveDays: number;
  avgDailyOrders: number;
  upiTxCount: number;
  cashflowScore: number; // 300 - 900
  cibilComparison: 'NO_CIBIL_SCORE' | 'CIBIL_REJECTED';
  riskTier: 'PRIME_GIG' | 'NEAR_PRIME' | 'DEVELOPING';
  confidenceScore: number;
  shapFeatures: ShapFeature[];
  recentTransactions: UpiTransaction[];
  forecast30: ForecastHorizon;
  forecast60: ForecastHorizon;
  forecast90: ForecastHorizon;
  dlpEntities: DlpInspectionEntity[];
  matchedLoans: LendingProduct[];
  vernacularQuotes: {
    en: string;
    hi: string;
    ta: string;
  };
}
